import { describe, expect, it } from "vitest";
import {
  agentbudgetcheck,
  agenteventof,
  agentheartbeat,
  agentruncontext,
  assignrole,
  killall,
  opentabagent,
  pauseone,
  recordagentusage,
  registeragent,
  resumeone,
  roledefaults,
  scopegate,
  spawn,
  stopone,
  swarmoverview,
  swarmstateof,
  disarmkillswitch,
} from "../agent.js";
import {
  sendmessage,
  receivemessages,
  mailboxof,
  roleaddress,
  unreadcount,
  broadcastrecipient,
  resolverecipients,
} from "../agent.js";
import type { agentidentity, agentmailbox, agentscope, agentusage } from "../types.js";
import { emptyqueue, enqueue } from "../swarm.js";

const now = 1_800_000_000_000;

/** Builds one agent identity fixture with every value user chosen. */
function agent(over: Partial<agentidentity> = {}): agentidentity {
  return {
    id: "a1",
    name: "Scout",
    role: "worker",
    depth: 0,
    state: "active",
    registeredat: now,
    heartbeatat: now,
    ...over,
  };
}

/** Builds one mailbox fixture of one agent. */
function mailbox(agentid: string): agentmailbox {
  return { agentid, inbox: [], outbox: [], unread: 0 };
}

describe("multiagent registration and roles", () => {
  it("registers one agent identity bound to a tab with the user chosen name", () => {
    const agents = registeragent({ agents: [], id: "a1", name: "Scout", tabid: 7, now });
    expect(agents).toHaveLength(1);
    expect(agents[0]?.name).toBe("Scout");
    expect(agents[0]?.tabid).toBe(7);
    expect(agents[0]?.role).toBe("worker");
    expect(agents[0]?.state).toBe("active");
    expect(agents[0]?.depth).toBe(0);
  });

  it("refuses an agent registration without the user chosen name", () => {
    expect(() => registeragent({ agents: [], id: "a1", name: "  ", now })).toThrow(/name/i);
  });

  it("attaches a role with its documented defaults and keeps custom roles", () => {
    const withrole = assignrole({ agents: [agent()], agentid: "a1", role: "planner", now });
    expect(withrole[0]?.role).toBe("planner");
    expect(roledefaults("planner").toolnamespaces).toEqual(["workflow", "memory", "system"]);
    expect(roledefaults("observer").toolnamespaces).toEqual(["memory", "system"]);
    expect(roledefaults("auditor").toolnamespaces).toEqual(["browser", "workflow", "memory", "system"]);
    expect(roledefaults("auditor").description).toMatch(/auditor/);
    expect(roledefaults("critic").toolnamespaces).toEqual(["workflow", "memory", "system"]);
    expect(roledefaults("critic").description).toMatch(/read only/i);
    expect(roledefaults("verifier").toolnamespaces).toEqual(["browser", "memory", "system"]);
    expect(roledefaults("verifier").description).toMatch(/read side/i);
  });

  it("binds one agent to one tab session and refuses a tab that already holds a live agent", () => {
    const one = registeragent({ agents: [], id: "a1", name: "Scout", tabid: 3, now });
    const bound = opentabagent({ agents: one, agentid: "a1", tabid: 3, sessionid: "session1", now });
    expect(bound[0]?.sessionid).toBe("session1");
    const two = registeragent({ agents: bound, id: "a2", name: "Scribe", now });
    expect(() => opentabagent({ agents: two, agentid: "a2", tabid: 3, now })).toThrow(/one tab binds one agent/i);
    const stopped = stopone({ agents: two, agentid: "a1", now });
    const rebound = opentabagent({ agents: stopped, agentid: "a2", tabid: 3, now });
    expect(rebound.find((entry) => entry.id === "a2")?.tabid).toBe(3);
  });
});

describe("multiagent sub agents and depth limits", () => {
  it("spawns a sub agent under a spawn request with the parent and the depth", () => {
    const spawned = spawn({
      agents: [agent()],
      request: { parentid: "a1", role: "planner", task: "Draft the extraction plan", depth: 1 },
      limit: { maxdepth: 2 },
      id: "a2",
      now,
    });
    expect(spawned).toHaveLength(2);
    expect(spawned[0]?.parentid).toBe("a1");
    expect(spawned[0]?.depth).toBe(1);
    expect(spawned[0]?.name).toBe("Scout sub 1");
    expect(spawned[0]?.role).toBe("planner");
  });

  it("refuses the recursion past the configured depth limit", () => {
    const child = spawn({
      agents: [agent()],
      request: { parentid: "a1", role: "worker", task: "First", depth: 1 },
      limit: { maxdepth: 3 },
      id: "a2",
      now,
    });
    expect(() =>
      spawn({
        agents: child,
        request: { parentid: "a2", role: "worker", task: "Too deep", depth: 2 },
        limit: { maxdepth: 1 },
        id: "a3",
        now,
      }),
    ).toThrow(/depth limit/i);
    const grandchild = spawn({
      agents: child,
      request: { parentid: "a2", role: "worker", task: "Second", depth: 2 },
      limit: { maxdepth: 3 },
      id: "a3",
      now,
    });
    expect(() =>
      spawn({
        agents: grandchild,
        request: { parentid: "a3", role: "worker", task: "Too deep", depth: 3 },
        limit: { maxdepth: 2 },
        id: "a4",
        now,
      }),
    ).toThrow(/depth limit/i);
  });

  it("refuses a spawn whose depth does not sit exactly one level under the parent", () => {
    expect(() =>
      spawn({
        agents: [agent()],
        request: { parentid: "a1", role: "worker", task: "Skipped level", depth: 2 },
        limit: {},
        id: "a2",
        now,
      }),
    ).toThrow(/one level under/i);
    expect(() =>
      spawn({
        agents: [agent({ id: "other" })],
        request: { parentid: "missing", role: "worker", task: "No parent", depth: 1 },
        limit: {},
        id: "a2",
        now,
      }),
    ).toThrow(/not registered/i);
  });

  it("keeps spawning unbounded when no depth limit is configured", () => {
    const child = spawn({
      agents: [agent()],
      request: { parentid: "a1", role: "worker", task: "First", depth: 1 },
      limit: {},
      id: "a2",
      now,
    });
    const grandchild = spawn({
      agents: child,
      request: { parentid: "a2", role: "worker", task: "Second", depth: 2 },
      limit: {},
      id: "a3",
      now,
    });
    expect(grandchild).toHaveLength(3);
    expect(grandchild[0]?.depth).toBe(2);
  });
});

describe("multiagent lifecycle isolation", () => {
  it("pauses one agent without stopping the others", () => {
    const agents = [agent({ id: "a1", name: "Scout" }), agent({ id: "a2", name: "Scribe" })];
    const paused = pauseone({ agents, agentid: "a1", now });
    expect(paused.find((entry) => entry.id === "a1")?.state).toBe("paused");
    expect(paused.find((entry) => entry.id === "a2")?.state).toBe("active");
    const resumed = resumeone({ agents: paused, agentid: "a1", now });
    expect(resumed.find((entry) => entry.id === "a1")?.state).toBe("active");
    expect(() => resumeone({ agents: resumed, agentid: "a2", now })).toThrow(/not paused/i);
  });

  it("triggers the killswitch and cancels every agent at once", () => {
    const agents = [agent({ id: "a1", name: "Scout" }), agent({ id: "a2", name: "Scribe", state: "paused" })];
    const outcome = killall({ agents, reason: "The user halted the swarm.", now });
    expect(outcome.agents.every((entry) => entry.state === "stopped")).toBe(true);
    expect(outcome.killswitch.engaged).toBe(true);
    expect(outcome.killswitch.reason).toBe("The user halted the swarm.");
    const disarmed = disarmkillswitch(now);
    expect(disarmed.engaged).toBe(false);
  });

  it("refreshes the heartbeat of one agent", () => {
    const later = now + 5_000;
    const beat = agentheartbeat({ agents: [agent()], agentid: "a1", now: later });
    expect(beat[0]?.heartbeatat).toBe(later);
  });
});

describe("multiagent budgets and scopes", () => {
  it("halts one agent when its budget ceiling is reached and never halts without ceilings", () => {
    const withbudget = agent({ budget: { agentid: "a1", maxtokens: 1000, maxsteps: 5, configuredat: now } });
    const usage: agentusage = { agentid: "a1", tokens: 1200, cost: 0, steps: 3, updatedat: now };
    expect(agentbudgetcheck({ agent: withbudget, usage })).toMatchObject({ halted: true });
    expect(agentbudgetcheck({ agent: withbudget, usage: { ...usage, tokens: 900, steps: 6 } }).halted).toBe(true);
    expect(agentbudgetcheck({ agent: withbudget, usage: { ...usage, tokens: 900, steps: 3 } }).halted).toBe(false);
    expect(agentbudgetcheck({ agent: agent(), usage })).toMatchObject({ halted: false });
    expect(agentbudgetcheck({ agent: withbudget, usage: undefined })).toMatchObject({ halted: false });
  });

  it("refuses tools and origins outside the granted scope while an absent scope stays unbounded", () => {
    const scope: agentscope = { agentid: "a1", origins: ["https://example.com"], toolnamespaces: ["memory", "system"] };
    expect(scopegate({ scope, origin: "https://example.com", namespace: "memory" })).toMatchObject({ allowed: true });
    expect(scopegate({ scope, origin: "https://other.example" })).toMatchObject({ allowed: false });
    expect(scopegate({ scope, namespace: "browser" })).toMatchObject({ allowed: false });
    expect(scopegate({ scope: undefined, origin: "https://any.example", namespace: "browser" })).toMatchObject({
      allowed: true,
    });
    const open: agentscope = { agentid: "a2", origins: [], toolnamespaces: [] };
    expect(scopegate({ scope: open, origin: "https://any.example", namespace: "browser" })).toMatchObject({
      allowed: true,
    });
  });

  it("accumulates the per agent usage against the budget", () => {
    const first = recordagentusage({ usage: undefined, agentid: "a1", tokens: 100, cost: 0.5, steps: 1, now });
    const second = recordagentusage({ usage: first, agentid: "a1", tokens: 50, steps: 1, now: now + 1 });
    expect(second).toEqual({ agentid: "a1", tokens: 150, cost: 0.5, steps: 2, updatedat: now + 1 });
  });

  it("builds the per agent run context on the workflow engine records", () => {
    const context = agentruncontext({
      agent: agent(),
      task: { id: "t1", lane: "extraction", priority: 2, payload: "Read the table", state: "queued", enqueuedat: now },
      now,
    });
    expect(context.agentid).toBe("a1");
    expect(context.taskid).toBe("t1");
    expect(context.run.id).toBe("a1:t1");
    expect(context.run.state).toBe("pending");
  });
});

describe("multiagent mailboxes", () => {
  const scout = agent({ id: "a1", name: "Scout" });
  const scribe = agent({ id: "a2", name: "Scribe", role: "planner" });
  const watcher = agent({ id: "a3", name: "Watcher", role: "observer" });
  const agents = [scout, scribe, watcher];

  it("delivers a direct message to one recipient inbox with the unread counter", () => {
    const delivered = sendmessage({
      mailboxes: [mailbox("a1"), mailbox("a2"), mailbox("a3")],
      agents,
      id: "m1",
      senderid: "a1",
      recipient: "a2",
      routing: "direct",
      payload: "The table is ready.",
      now,
    });
    const box = mailboxof(delivered, "a2");
    expect(box.inbox).toHaveLength(1);
    expect(box.inbox[0]?.senderid).toBe("a1");
    expect(box.unread).toBe(1);
    expect(mailboxof(delivered, "a1").outbox).toHaveLength(1);
    expect(mailboxof(delivered, "a3").inbox).toHaveLength(0);
  });

  it("delivers a broadcast to every agent but the sender", () => {
    const delivered = sendmessage({
      mailboxes: [mailbox("a1"), mailbox("a2"), mailbox("a3")],
      agents,
      id: "m2",
      senderid: "a1",
      recipient: broadcastrecipient,
      routing: "broadcast",
      payload: "Status check.",
      now,
    });
    expect(mailboxof(delivered, "a2").inbox).toHaveLength(1);
    expect(mailboxof(delivered, "a3").inbox).toHaveLength(1);
    expect(mailboxof(delivered, "a1").inbox).toHaveLength(0);
    expect(unreadcount(delivered, "a3")).toBe(1);
  });

  it("routes a role addressed message to every live agent of the role", () => {
    expect(roleaddress(agents, "planner")).toEqual(["a2"]);
    expect(roleaddress(agents, "observer")).toEqual(["a3"]);
    const delivered = sendmessage({
      mailboxes: [mailbox("a1"), mailbox("a2"), mailbox("a3")],
      agents,
      id: "m3",
      senderid: "a1",
      recipient: "observer",
      routing: "role",
      payload: "Watch the banner.",
      now,
    });
    expect(mailboxof(delivered, "a3").inbox).toHaveLength(1);
    expect(mailboxof(delivered, "a2").inbox).toHaveLength(0);
    expect(resolverecipients({ agents, senderid: "a1", recipient: "observer", routing: "role" })).toEqual(["a3"]);
  });

  it("refuses a direct message to an unknown recipient or to the sender itself", () => {
    expect(() =>
      sendmessage({
        mailboxes: [],
        agents,
        id: "m4",
        senderid: "a1",
        recipient: "missing",
        routing: "direct",
        payload: "Hello?",
        now,
      }),
    ).toThrow(/not registered/i);
    expect(() =>
      sendmessage({
        mailboxes: [],
        agents,
        id: "m5",
        senderid: "a1",
        recipient: "a1",
        routing: "direct",
        payload: "Note to self.",
        now,
      }),
    ).toThrow(/own sender/i);
    expect(() =>
      sendmessage({
        mailboxes: [],
        agents,
        id: "m6",
        senderid: "a1",
        recipient: "a2",
        routing: "direct",
        payload: "  ",
        now,
      }),
    ).toThrow(/payload/i);
  });

  it("drains one inbox with ack tracking and resets the unread counter", () => {
    const delivered = sendmessage({
      mailboxes: [mailbox("a2")],
      agents,
      id: "m7",
      senderid: "a1",
      recipient: "a2",
      routing: "direct",
      payload: "First.",
      now,
    });
    const second = sendmessage({
      mailboxes: delivered,
      agents,
      id: "m8",
      senderid: "a1",
      recipient: "a2",
      routing: "direct",
      payload: "Second.",
      now: now + 1,
    });
    const drained = receivemessages({ mailboxes: second, agentid: "a2", now: now + 2 });
    expect(drained.messages.map((message) => message.payload)).toEqual(["First.", "Second."]);
    expect(drained.messages.every((message) => message.readat === now + 2)).toBe(true);
    expect(mailboxof(drained.mailboxes, "a2").unread).toBe(0);
  });
});

describe("multiagent overview and events", () => {
  it("returns the swarm at a glance with agents, tasks and messages", () => {
    const agents = [agent({ id: "a1" }), agent({ id: "a2", state: "paused" })];
    const queue = enqueue({
      queue: emptyqueue({ lanes: ["extraction"] }),
      id: "t1",
      lane: "extraction",
      priority: 1,
      payload: "Read the table",
      now,
    });
    const mailboxes = sendmessage({
      mailboxes: [mailbox("a1"), mailbox("a2")],
      agents,
      id: "m1",
      senderid: "a1",
      recipient: "a2",
      routing: "direct",
      payload: "Hi.",
      now,
    });
    const overview = swarmoverview({ agents, queue, mailboxes });
    expect(overview).toMatchObject({
      agents: 2,
      active: 1,
      paused: 1,
      tasks: 1,
      queued: 1,
      claimed: 0,
      messages: 1,
      unread: 1,
    });
  });

  it("builds the agent lifecycle events and the swarm state snapshot", () => {
    const event = agenteventof({
      id: "e1",
      kind: "claimed",
      agentid: "a1",
      taskid: "t1",
      summary: "The agent claimed the task.",
      now,
    });
    expect(event).toMatchObject({ kind: "claimed", agentid: "a1", taskid: "t1" });
    const snapshot = swarmstateof({
      agents: [agent()],
      queue: emptyqueue(),
      mailboxes: [],
      killswitch: { engaged: false },
    });
    expect(snapshot.agents).toHaveLength(1);
    expect(snapshot.queue.items).toHaveLength(0);
    expect(snapshot.killswitch.engaged).toBe(false);
  });
});
