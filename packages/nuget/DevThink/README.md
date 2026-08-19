# DevThink .NET Adapter

This package creates explicit, shell-free process invocations for a **user-owned local** DevThink binary. It does not store provider credentials or make remote provider calls.

Set `DEVTHINK_BIN` when the executable is not available as `devthink` on the system path. Use `DevThinkCli.StartInfo(...)` to inspect the invocation or `DevThinkCli.Start(...)` to run it.
