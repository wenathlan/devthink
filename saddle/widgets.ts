/**
 * widgets.ts — the universal widget surface of saddle: every widget of the
 * sol/widgets folder answers from this one module at the app root, so the
 * pages import their components from a single place and the barrel lives
 * exactly once (here) instead of repeating across every page — the
 * components stay complete independent files inside the sol/widgets folder.
 */
export { default as ComputeBootladder } from "./sol/widgets/ComputeBootladder.tsx";
export { default as ComputeModalitycatalog } from "./sol/widgets/ComputeModalitycatalog.tsx";
export { default as ApiBadge } from "./sol/widgets/ConsoleApibadge.tsx";
export { default as ConsoleEdgelaw } from "./sol/widgets/ConsoleEdgelaw.tsx";
export * from "./sol/widgets/ConsoleEventstimeline.tsx";
export { default as EventsTimeline } from "./sol/widgets/ConsoleEventstimeline.tsx";
export { default as SnapshotControls } from "./sol/widgets/ConsoleSnapshotcontrols.tsx";
export * from "./sol/widgets/ConsoleSpecpanel.tsx";
export { default as SpecPanel } from "./sol/widgets/ConsoleSpecpanel.tsx";
export * from "./sol/widgets/ConsoleTerminal.tsx";
export { default as Terminal } from "./sol/widgets/ConsoleTerminal.tsx";
export * from "./sol/widgets/DashboardAccountpanel.tsx";
export { default as AccountPanel } from "./sol/widgets/DashboardAccountpanel.tsx";
export { default as AdminPanel } from "./sol/widgets/DashboardAdminpanel.tsx";
export { default as AuditLog } from "./sol/widgets/DashboardAuditlog.tsx";
export { default as CreateSandboxForm } from "./sol/widgets/DashboardCreatesandboxform.tsx";
export { default as DashboardEventstimeline } from "./sol/widgets/DashboardEventstimeline.tsx";
export { default as GlobalSandboxesTable } from "./sol/widgets/DashboardGlobalsandboxestable.tsx";
export { default as MeshNodesTable } from "./sol/widgets/DashboardMeshnodestable.tsx";
export { default as SandboxList } from "./sol/widgets/DashboardSandboxlist.tsx";
export { default as UsersTable } from "./sol/widgets/DashboardUserstable.tsx";
export * from "./sol/widgets/HomeEntrygate.tsx";
export { default as HomeEntrygate } from "./sol/widgets/HomeEntrygate.tsx";
export { default as MetricStrip } from "./sol/widgets/HomeMetricstrip.tsx";
export { default as RuntimeDiagram } from "./sol/widgets/HomeRuntimediagram.tsx";
export * from "./sol/widgets/LoginForm.tsx";
export { default as LoginForm } from "./sol/widgets/LoginForm.tsx";
export { default as PasswordConfirm } from "./sol/widgets/RegisterPasswordconfirm.tsx";
export * from "./sol/widgets/RegisterPasswordmeter.tsx";
export { default as PasswordMeter } from "./sol/widgets/RegisterPasswordmeter.tsx";
export * from "./sol/widgets/RegisterUsernamerules.tsx";
export { default as UsernameRules } from "./sol/widgets/RegisterUsernamerules.tsx";
