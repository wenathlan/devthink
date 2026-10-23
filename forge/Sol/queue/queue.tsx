/**
 * queue page anchor — layer 3 of the anchor architecture.
 * The file carrying the folder's own name is the path manager of the page:
 * it mounts the page and is consumed only by the theme anchor (Sol/Sol.tsx).
 *
 * QueueList — the execution queue of the floor: runs enter with a priority
 * (express → normal → batch), keep their arrival order inside the lane and
 * leave through the head. The page drives the REAL queue engine (queue.ts):
 * enqueue, serve next, cancel, reseed — every number tabular, the empty
 * state honest. The rehearsal queue is seeded and says so.
 */

import {
  AddRegular,
  ArrowRotateCounterclockwiseRegular,
  DismissRegular,
  ListRegular,
  PlayFilled,
} from "@fluentui/react-icons";
import { useMemo, useState } from "react";
import {
  cancel as cancelItem,
  depthByPriority,
  dequeue,
  enqueue,
  nextUp,
  PRIORITY_RANK,
  QUEUE_PRIORITIES,
  type QueueItem,
  type QueuePriority,
  queueDepth,
  queueFromSeed,
  queueOrder,
} from "../../queue.ts";
import { modes as RUNNER_MODES, type RunnerMode } from "../../runner.ts";
import { EmptyState } from "../components/shell.emptystate.tsx";

/** the seed of the rehearsal queue (shown on the page, pinned by the tests) */
export const QUEUE_SEED = 731004;

/** one lane counter of the summary. */
function Lane({ lane, depth }: { lane: QueuePriority; depth: number }) {
  return (
    <span className="fq-lane" data-lane={lane}>
      <span className="fq-lane__name">{lane}</span>
      <span className="fq-lane__depth">{depth}</span>
    </span>
  );
}

/** the priority picker chips of the enqueue form. */
function PriorityChips({ value, onPick }: { value: QueuePriority; onPick: (priority: QueuePriority) => void }) {
  return (
    <fieldset className="fq-chips" aria-label="priority of the new run">
      <legend className="fq-chips__legend">priority</legend>
      {QUEUE_PRIORITIES.map((priority) => (
        <button
          key={priority}
          type="button"
          className="fq-chip"
          aria-pressed={priority === value}
          onClick={() => onPick(priority)}
        >
          {priority}
        </button>
      ))}
    </fieldset>
  );
}

/** the runner-mode picker chips of the enqueue form. */
function ModeChips({ value, onPick }: { value: RunnerMode; onPick: (mode: RunnerMode) => void }) {
  return (
    <fieldset className="fq-chips" aria-label="runner mode of the new run">
      <legend className="fq-chips__legend">runner mode</legend>
      {RUNNER_MODES.map((mode) => (
        <button key={mode} type="button" className="fq-chip" aria-pressed={mode === value} onClick={() => onPick(mode)}>
          {mode}
        </button>
      ))}
    </fieldset>
  );
}

/** one row of the serving order. */
function QueueRow({ item, position, onCancel }: { item: QueueItem; position: number; onCancel: (id: string) => void }) {
  return (
    <article className="fq-row" data-priority={item.priority}>
      <span className="fq-row__pos">{String(position + 1).padStart(2, "0")}</span>
      <div className="fq-row__main">
        <h3 className="fq-row__label">{item.label}</h3>
        <p className="fq-row__meta">
          {item.mode} · seq {item.seq}
        </p>
      </div>
      <span className="fq-row__priority">{item.priority}</span>
      <span className="fq-row__eta">ahead: {position}</span>
      <button
        type="button"
        className="fq-row__cancel"
        aria-label={`cancel ${item.label}`}
        onClick={() => onCancel(item.id)}
      >
        <DismissRegular fontSize={14} aria-hidden="true" />
        cancel
      </button>
    </article>
  );
}

/** The queue page: the serving order of the floor. */
export default function QueueList() {
  const [queue, setQueue] = useState<QueueItem[]>(() => queueFromSeed(QUEUE_SEED, 7));
  const [label, setLabel] = useState("");
  const [priority, setPriority] = useState<QueuePriority>("normal");
  const [mode, setMode] = useState<RunnerMode>(RUNNER_MODES[0]);
  const [served, setServed] = useState<QueueItem | undefined>(undefined);

  const order = useMemo(() => queueOrder(queue), [queue]);
  const lanes = useMemo(() => depthByPriority(queue), [queue]);
  const head = useMemo(() => nextUp(queue), [queue]);

  /** serves the head of the order through the real engine */
  function serveNext() {
    const answer = dequeue(queue);
    setQueue(answer.queue);
    setServed(answer.item);
  }

  /** enqueues the drafted run through the real engine (a draft label falls
   * back to the honest default — the queue never invents a name) */
  function addRun(event: React.FormEvent) {
    event.preventDefault();
    const clean = label.trim() || "unnamed run";
    setQueue(
      enqueue(queue, {
        id: `q-${Date.now().toString(36)}-${queueDepth(queue) + 1}`,
        label: clean,
        mode,
        priority,
        enqueuedAt: 0,
      }),
    );
    setLabel("");
  }

  return (
    <main className="shell fq-page">
      <header className="pagehead">
        <p className="pagehead__eyebrow">queue · the serving order</p>
        <h1 className="pagehead__title">Execution queue</h1>
        <p className="pagehead__lede">
          Runs wait in three priority lanes — express cuts ahead, batch rides last, FIFO inside the lane. A seeded
          rehearsal (seed {QUEUE_SEED}) fills the order; the engine under the buttons is the real queue logic.
        </p>
        <div className="pagehead__actions">
          <button type="button" className="btn" onClick={serveNext}>
            <PlayFilled fontSize={14} aria-hidden="true" />
            serve next
          </button>
          <button type="button" className="btn secondary" onClick={() => setQueue(queueFromSeed(QUEUE_SEED, 7))}>
            <ArrowRotateCounterclockwiseRegular fontSize={14} aria-hidden="true" />
            reseed the rehearsal
          </button>
        </div>
      </header>

      <section className="fq-summary" aria-label="the queue summary">
        <div className="fq-summary__cell">
          <p className="fq-summary__label">
            <ListRegular fontSize={13} aria-hidden="true" />
            depth
          </p>
          <p className="fq-summary__value">{queueDepth(queue)}</p>
        </div>
        <div className="fq-summary__cell fq-summary__cell--wide">
          <p className="fq-summary__label">lanes</p>
          <p className="fq-summary__value fq-summary__lanes">
            {QUEUE_PRIORITIES.map((lane) => (
              <Lane key={lane} lane={lane} depth={lanes[lane]} />
            ))}
          </p>
        </div>
        <div className="fq-summary__cell">
          <p className="fq-summary__label">head of the order</p>
          <p className="fq-summary__value fq-summary__head">{head ? head.label : "—"}</p>
        </div>
        <div className="fq-summary__cell">
          <p className="fq-summary__label">last served</p>
          <p className="fq-summary__value fq-summary__head">{served ? served.label : "nothing yet"}</p>
        </div>
      </section>

      <form className="fq-form" onSubmit={addRun} aria-label="enqueue a run">
        <p className="fq-form__head">
          <AddRegular fontSize={13} aria-hidden="true" />
          enqueue a run
        </p>
        <div className="fq-form__field">
          <input
            className="fq-form__input"
            type="text"
            value={label}
            maxLength={64}
            placeholder="label the run — e.g. build the family site"
            aria-label="label of the run to enqueue"
            onChange={(event) => setLabel(event.target.value)}
          />
          <button type="submit" className="btn">
            queue it
          </button>
        </div>
        <div className="fq-form__chips">
          <PriorityChips value={priority} onPick={setPriority} />
          <ModeChips value={mode} onPick={setMode} />
        </div>
      </form>

      {order.length === 0 ? (
        <EmptyState
          icon={ListRegular}
          title="the queue is empty"
          line="The floor has nothing waiting — enqueue a run or reseed the rehearsal queue."
          action={
            <button type="button" className="btn secondary" onClick={() => setQueue(queueFromSeed(QUEUE_SEED, 7))}>
              seed the rehearsal queue
            </button>
          }
        />
      ) : (
        <section className="fq-order" aria-label="the serving order">
          <div className="fq-order__head" aria-hidden="true">
            <span>pos</span>
            <span>run</span>
            <span>priority</span>
            <span>wait</span>
            <span />
          </div>
          {order.map((item, index) => (
            <QueueRow key={item.id} item={item} position={index} onCancel={(id) => setQueue(cancelItem(queue, id))} />
          ))}
        </section>
      )}

      <p className="fr-footnote">
        the serving rank is fixed: {QUEUE_PRIORITIES.map((lane) => `${lane} = ${PRIORITY_RANK[lane]}`).join(" · ")} —
        lower serves first, arrival order breaks the ties.
      </p>
    </main>
  );
}
