#!/usr/bin/env python3
"""
gh auth — the one gh authentication helper for the gateway repository.

The three former variations (daemon, pexpect, pty) were the same
context — spawn `gh auth login --web`, auto-answer the interactive
prompts, keep the process alive while the user authorizes the device
flow on github.com — so they are embedded here as selectable modes of
a single file (one variation per context).

Modes (--mode):
  daemon   default. double-forks to fully detach from any controlling
           terminal / parent session, then spawns gh with a stdin pipe
           that is held open by a writer subprocess (so gh never sees
           EOF). gh's output is logged to /tmp/gh-auth.log.
  pexpect  spawns gh via pexpect, answers the interactive prompts
           automatically (git-credential Y, Press Enter) and keeps
           polling until auth completes or the deadline elapses.
  pty      spawns gh in a pseudo-terminal, watches the byte stream and
           pushes the same answers. stays in the foreground.

Common behavior:
  - unlimited scopes (admin-grade) so the automation never blocks.
  - unlimited capture/login window: the watchdog deadline is 24h (the
    device code expiry is the real ceiling; gh renews the flow itself).
  - output (including the one-time device code) goes to /tmp/gh-auth.log
    and errors to /tmp/gh-daemon.err.
"""

import argparse
import os
import select
import subprocess
import sys
import time

GH = "/home/z/my-project/.local/bin/gh"
LOG = "/tmp/gh-auth.log"
ERR = "/tmp/gh-daemon.err"

SCOPES = ",".join([
    "admin:enterprise", "admin:org", "admin:public_key", "admin:repo_hook",
    "admin:org_hook", "admin:gpg_key", "repo", "workflow", "write:packages",
    "delete:packages", "gist", "notifications", "user", "user:email",
    "write:discussion", "codespace", "read:enterprise", "read:org",
    "read:public_key", "read:repo_hook", "read:user", "read:discussion",
    "project", "delete_repo",
])

CMD = [
    GH, "auth", "login",
    "--hostname", "github.com",
    "--git-protocol", "https",
    "--web",
    "--scopes", SCOPES,
]

# 24h watchdog — the capture and login windows are effectively
# unlimited; gh's own device-code expiry is the real ceiling.
DEADLINE_S = 24 * 60 * 60


def gh_env():
    env = os.environ.copy()
    env["BROWSER"] = "/bin/true"
    env["GH_DEBUG"] = "api"
    env["PATH"] = "/home/z/my-project/.local/bin:" + env.get("PATH", "")
    return env


# ---------------------------------------------------------------- daemon

def daemonize():
    """Standard double-fork daemon pattern."""
    pid = os.fork()
    if pid > 0:
        os._exit(0)  # parent exits immediately
    os.setsid()  # first child becomes session leader (no controlling tty)
    pid = os.fork()
    if pid > 0:
        os._exit(0)  # first child exits, grandchild is the daemon


def run_daemon():
    daemonize()

    # Reopen stdin/stdout/stderr to /dev/null (detached)
    devnull_fd = os.open("/dev/null", os.O_RDWR)
    os.dup2(devnull_fd, 0)
    os.dup2(devnull_fd, 1)
    os.dup2(devnull_fd, 2)

    errf = open(ERR, "ab", buffering=0)
    try:
        # A pipe held open by a writer subprocess: gh's stdin is the
        # read end; the writer writes nothing and just holds the write
        # end open for the deadline window.
        r_fd, w_fd = os.pipe()
        writer_pid = os.fork()
        if writer_pid == 0:
            os.close(r_fd)
            try:
                while True:
                    time.sleep(3600)
            except Exception:
                pass
            os._exit(0)

        os.close(w_fd)
        logf = open(LOG, "wb", buffering=0)
        proc = subprocess.Popen(
            CMD,
            stdin=r_fd,
            stdout=logf,
            stderr=subprocess.STDOUT,
            env=gh_env(),
            start_new_session=True,
            close_fds=True,
        )
        os.close(r_fd)
        errf.write(("daemon: spawned gh pid=%d writer pid=%d\n" % (proc.pid, writer_pid)).encode())
        rc = proc.wait()
        errf.write(("daemon: gh exited rc=%d\n" % rc).encode())
        try:
            os.kill(writer_pid, 15)
        except Exception:
            pass
    except Exception as e:
        errf.write(("daemon: exception %r\n" % e).encode())
    finally:
        try:
            errf.close()
        except Exception:
            pass


# --------------------------------------------------------------- pexpect

def run_pexpect():
    try:
        import pexpect
    except ImportError:
        sys.stderr.write("pexpect mode requires the pexpect package\n")
        sys.exit(1)

    logf = open(LOG, "wb", buffering=0)
    child = pexpect.spawn(
        " ".join(CMD),
        env=gh_env(),
        encoding=None,  # bytes mode
        timeout=None,
        echo=False,
    )
    child.logfile_read = logf

    patterns = [
        pexpect.EOF,
        pexpect.TIMEOUT,
        rb"Authenticate Git with your GitHub credentials\?",
        rb"Press Enter to open",
        rb"Open this URL to continue",
        rb"Authentication successful",
        rb"Logged in as",
        rb"error:",
        rb"fatal:",
    ]

    deadline = time.time() + DEADLINE_S
    while True:
        if time.time() > deadline:
            logf.write(b"\n[watchdog] deadline reached\n")
            try:
                child.terminate(force=True)
            except Exception:
                pass
            break
        try:
            idx = child.expect(patterns, timeout=10)
        except Exception as e:
            logf.write(("\n[pexpect ending: %r]\n" % e).encode())
            break
        if idx == 0:
            logf.write(b"\n[gh exited (EOF)]\n")
            break
        if idx == 1:
            continue  # timeout — gh is polling, keep waiting
        matched = patterns[idx]
        if matched == rb"Authenticate Git with your GitHub credentials\?":
            logf.write(b"\n[auto] answering Y to git-credential prompt\n")
            child.sendline("Y")
        elif matched in (rb"Press Enter to open", rb"Open this URL to continue"):
            logf.write(b"\n[auto] sending Enter (BROWSER=true)\n")
            child.sendline("")
        elif matched in (rb"Authentication successful", rb"Logged in as"):
            logf.write(b"\n[auth complete]\n")
            try:
                child.expect(pexpect.EOF, timeout=10)
            except Exception:
                pass
            break
        # error:/fatal: — keep polling briefly, gh may recover

    try:
        child.close(force=False)
    except Exception:
        pass
    logf.write(b"\n[pexpect mode exiting]\n")


# -------------------------------------------------------------------- pty

def run_pty():
    import errno
    import pty

    logf = open(LOG, "wb", buffering=0)
    pid, master_fd = pty.fork()
    if pid == 0:
        try:
            os.execvpe(CMD[0], CMD, gh_env())
        except Exception as e:
            sys.stderr.write("exec failed: %s\n" % e)
            os._exit(127)

    buf = bytearray()
    sent_y = False
    sent_enter = False
    start = time.time()
    while True:
        if time.time() - start > DEADLINE_S:
            logf.write(b"\n[watchdog] deadline reached, exiting\n")
            try:
                os.kill(pid, 15)
            except Exception:
                pass
            break
        try:
            r, _, _ = select.select([master_fd], [], [], 5.0)
        except OSError as e:
            if e.args[0] == errno.EINTR:
                continue
            break
        if master_fd in r:
            try:
                data = os.read(master_fd, 4096)
            except OSError:
                data = b""
            if not data:
                break  # child closed stdout / exited
            logf.write(data)
            logf.flush()
            buf.extend(data)
            if len(buf) > 8192:  # keep the matching window bounded
                del buf[: len(buf) - 8192]
            decoded = bytes(buf).decode("utf-8", errors="replace")
            if not sent_y and "Authenticate Git with your GitHub credentials?" in decoded:
                try:
                    os.write(master_fd, b"Y\n")
                    sent_y = True
                except OSError:
                    pass
            if not sent_enter and (
                "Press Enter to open" in decoded or "open this url" in decoded.lower()
            ):
                try:
                    os.write(master_fd, b"\n")
                    sent_enter = True
                except OSError:
                    pass
        try:
            wpid, status = os.waitpid(pid, os.WNOHANG)
            if wpid != 0:
                try:
                    while True:
                        r, _, _ = select.select([master_fd], [], [], 0.5)
                        if master_fd in r:
                            data = os.read(master_fd, 4096)
                            if not data:
                                break
                            logf.write(data)
                            logf.flush()
                        else:
                            break
                except OSError:
                    pass
                logf.write(("\n[child exited status=%d]\n" % status).encode())
                break
        except ChildProcessError:
            break
    try:
        os.close(master_fd)
    except OSError:
        pass
    logf.close()


# ------------------------------------------------------------------- main

def main():
    parser = argparse.ArgumentParser(description="gh auth login helper (one file, three modes)")
    parser.add_argument(
        "--mode",
        choices=["daemon", "pexpect", "pty"],
        default="daemon",
        help="spawn strategy (default: daemon)",
    )
    args = parser.parse_args()
    if args.mode == "pexpect":
        run_pexpect()
    elif args.mode == "pty":
        run_pty()
    else:
        run_daemon()


if __name__ == "__main__":
    main()
