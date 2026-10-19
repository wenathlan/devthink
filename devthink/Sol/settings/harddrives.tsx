/**
 * harddrives.tsx — the drives card of the settings app, beside the anchor:
 * the os treats databases as hard drives, so this surface lists the drives
 * of this machine (the owner partitions of the local store), mounts a new
 * one and reopens the old ones. Opening a drive reloads the app — the meta
 * identity of the store points at the mounted owner and every surface
 * rehydrates from it. Every drive row carries the disk-shaped fluent glyph
 * (the hd icon law: pertinent fluent icons on the drives surface), the
 * mounted one reading strong ink over the idle slate.
 */

import {AddRegular, DeleteRegular, HardDriveRegular } from "@fluentui/react-icons";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { browserStoreSummary } from "../../db";
import { DRIVES_KEY, drives, type HardDrive, newdrive, opendrive } from "../../harddrives.ts";

export { DRIVES_KEY };

/** The drives card: the mounted drive, the shelf of this machine and the
 * new-drive action. */
export function HardDrives() {
  const [, navigate] = useLocation();
  const [active, setActive] = useState<HardDrive>();
  const [list, setList] = useState<HardDrive[]>([]);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof browserStoreSummary>>>();
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    void drives()
      .then((state) => {
        setActive(state.active);
        setList(state.list);
      })
      .catch(() => undefined);
    void browserStoreSummary(false)
      .then(setSummary)
      .catch(() => undefined);
  }, []);

  useEffect(refresh, [refresh]);

  async function mount(driveId: string) {
    setBusy(true);
    try {
      await opendrive(driveId);
      // the store rehydrates from the mounted owner: a fresh boot reads it
      window.location.reload();
    } catch {
      toast.error("The drive could not be mounted.");
      setBusy(false);
    }
  }

  async function create() {
    setBusy(true);
    try {
      const drive = await newdrive(label);
      setLabel("");
      setActive(drive);
      const state = await drives();
      setList(state.list);
      toast(`New drive mounted: ${drive.label}. It starts empty.`);
      navigate("/panel");
      window.location.reload();
    } catch {
      toast.error("The new drive could not be created on this machine.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="dtw-card">
      <h2 className="dtw-cardtitle">
        <HardDriveRegular fontSize={15} aria-hidden="true" />
        Drives
      </h2>
      {active ? (
        <>
          <div className="dtw-settings__kv">
            <span className="dtw-settings__kvkey">mounted</span>
            <span className="dtw-settings__kvvalue">{active.label}</span>
          </div>
          <div className="dtw-settings__kv">
            <span className="dtw-settings__kvkey">owner</span>
            <span className="dtw-settings__kvvalue">{active.id}</span>
          </div>
          {summary ? (
            <div className="dtw-settings__kv">
              <span className="dtw-settings__kvkey">records</span>
              <span className="dtw-settings__kvvalue">
                {summary.workspaces} workspaces, {summary.sessions} sessions, {summary.messages} messages
              </span>
            </div>
          ) : null}
        </>
      ) : (
        <p className="dtw-copy">Reading the drives of this machine…</p>
      )}

      {list.length > 1 ? (
        <>
          <p className="dtw-cardtitle">On this machine</p>
          <div className="dtw-rows">
            {list.map((drive) => (
              <div className="dtw-row" key={drive.id}>
                <span className="dtw-settings__driveicon" data-mounted={drive.id === active?.id ? "true" : undefined}>
                  <HardDriveRegular fontSize={16} aria-hidden="true" />
                </span>
                <span>
                  <strong>{drive.label}</strong>
                  <small>
                    {" "}
                    — {drive.id === active?.id ? "mounted" : `${drive.createdAt.slice(0, 10)} — unmounted`}
                  </small>
                </span>
                {drive.id === active?.id ? null : (
                  <button
                    type="button"
                    className="dtw-btn"
                    disabled={busy}
                    onClick={() => void mount(drive.id)}
                    aria-label={`Open ${drive.label}`}
                  >
                    Open
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : null}

      <div className="dtw-actions">
        <input
          className="dtw-input"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Name the new drive (HD 2)"
          maxLength={24}
          aria-label="New drive name"
        />
        <button type="button" className="dtw-btn dtw-btn--primary" disabled={busy} onClick={() => void create()}>
          <AddRegular fontSize={14} aria-hidden="true" />
          New HD
        </button>
      </div>
      <p className="dtw-note">
        A new HD is a new database partition: it starts empty and the previous drive stays on this machine — open it
        again any time. <DeleteRegular fontSize={11} aria-hidden="true" /> never deletes a drive.
      </p>
    </section>
  );
}
