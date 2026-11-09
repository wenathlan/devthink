/**
 * wingets.ts — the universal winget surface of saddle: every winget of the
 * sol/wingets folder answers from this one module at the app root, so the
 * pages import their components from a single place and the dotted winget
 * file name lives exactly once (here) instead of repeating across every
 * page — the components stay complete independent files inside the
 * sol/wingets folder.
 */
export { default as ComputeBootladder } from "./sol/wingets/ComputeBootladder.tsx";
export { default as ComputeModalitycatalog } from "./sol/wingets/ComputeModalitycatalog.tsx";
export { default as ApiBadge } from "./sol/wingets/ConsoleApibadge.tsx";
export { default as ConsoleEdgelaw } from "./sol/wingets/ConsoleEdgelaw.tsx";
export * from "./sol/wingets/ConsoleEventstimeline.tsx";
export { default as EventsTimeline } from "./sol/wingets/ConsoleEventstimeline.tsx";
export { default as SnapshotControls } from "./sol/wingets/ConsoleSnapshotcontrols.tsx";
export * from "./sol/wingets/ConsoleSpecpanel.tsx";
export { default as SpecPanel } from "./sol/wingets/ConsoleSpecpanel.tsx";
export * from "./sol/wingets/ConsoleTerminal.tsx";
export { default as Terminal } from "./sol/wingets/ConsoleTerminal.tsx";
export * from "./sol/wingets/DashboardAccountpanel.tsx";
export { default as AccountPanel } from "./sol/wingets/DashboardAccountpanel.tsx";
export { default as AdminPanel } from "./sol/wingets/DashboardAdminpanel.tsx";
export { default as AuditLog } from "./sol/wingets/DashboardAuditlog.tsx";
export { default as CreateSandboxForm } from "./sol/wingets/DashboardCreatesandboxform.tsx";
export { default as DashboardEventstimeline } from "./sol/wingets/DashboardEventstimeline.tsx";
export { default as GlobalSandboxesTable } from "./sol/wingets/DashboardGlobalsandboxestable.tsx";
export { default as MeshNodesTable } from "./sol/wingets/DashboardMeshnodestable.tsx";
export { default as SandboxList } from "./sol/wingets/DashboardSandboxlist.tsx";
export { default as UsersTable } from "./sol/wingets/DashboardUserstable.tsx";
export * from "./sol/wingets/HomeEntrygate.tsx";
export { default as HomeEntrygate } from "./sol/wingets/HomeEntrygate.tsx";
export { default as MetricStrip } from "./sol/wingets/HomeMetricstrip.tsx";
export { default as RuntimeDiagram } from "./sol/wingets/HomeRuntimediagram.tsx";
export * from "./sol/wingets/LoginForm.tsx";
export { default as LoginForm } from "./sol/wingets/LoginForm.tsx";
export { default as PasswordConfirm } from "./sol/wingets/RegisterPasswordconfirm.tsx";
export * from "./sol/wingets/RegisterPasswordmeter.tsx";
export { default as PasswordMeter } from "./sol/wingets/RegisterPasswordmeter.tsx";
export * from "./sol/wingets/RegisterUsernamerules.tsx";
export { default as UsernameRules } from "./sol/wingets/RegisterUsernamerules.tsx";
