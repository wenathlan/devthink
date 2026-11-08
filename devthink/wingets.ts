/**
 * wingets.ts — the universal winget surface of devthink, seated at the root
 * beside the sol theme folder (the family law: every .ts logic file lives
 * at the app root, only .tsx components live inside sol): every winget of
 * the sol/wingets folder answers from this one module, so the pages import
 * their components from a single place and every component file carries a
 * dot-free PascalCase name that says exactly what it renders —
 * the components stay complete independent files inside the theme.
 */
export * from "./sol/wingets/AboutFamily.tsx";
export * from "./sol/wingets/AboutHero.tsx";
export * from "./sol/wingets/AboutTimeline.tsx";
export * from "./sol/wingets/AudioMusicengine.tsx";
export * from "./sol/wingets/AudioMusictracks.tsx";
export * from "./sol/wingets/AuthLockface.tsx";
export * from "./sol/wingets/AuthPowermenu.tsx";
export * from "./sol/wingets/AuthProviderrow.tsx";
export * from "./sol/wingets/AuthSignin.tsx";
export * from "./sol/wingets/AuthStatusline.tsx";
export * from "./sol/wingets/CalculatorDisplay.tsx";
export * from "./sol/wingets/CalculatorHistory.tsx";
export * from "./sol/wingets/CalculatorKeypad.tsx";
export { default as ChatBody } from "./sol/wingets/ChatBody.tsx";
export * from "./sol/wingets/ChatCanvaspane.tsx";
export * from "./sol/wingets/ChatComposer.tsx";
export * from "./sol/wingets/ChatMarkdown.tsx";
export * from "./sol/wingets/ChatSandboxpane.tsx";
export * from "./sol/wingets/ChatSessionpanel.tsx";
export * from "./sol/wingets/ChatSidebar.tsx";
export * from "./sol/wingets/ChatSolboticon.tsx";
export * from "./sol/wingets/ChatTurn.tsx";
export * from "./sol/wingets/ChatWelcome.tsx";
export { default as ConsoleGraphview } from "./sol/wingets/ConsoleGraphview.tsx";
export * from "./sol/wingets/ConsoleGraphview.tsx";
export * from "./sol/wingets/ConsoleReference.tsx";
export { default as Terminal } from "./sol/wingets/ConsoleTerminal.tsx";
export * from "./sol/wingets/ConsoleTerminal.tsx";
export * from "./sol/wingets/Constructionface.tsx";
export * from "./sol/wingets/Controlshell.tsx";
/* the ink terminal ui never rides the web barrel: the CLI entry imports it
 * directly (devthink.ts), and the browser bundle would otherwise link the
 * terminal renderer into the page graph — the one interface law keeps the
 * terminal variant on its own build lane. */
export * from "./sol/wingets/DocsCard.tsx";
export * from "./sol/wingets/DocsModules.tsx";
export * from "./sol/wingets/DocsNav.tsx";
export * from "./sol/wingets/ExploreDownloadrail.tsx";
export * from "./sol/wingets/ExploreLaunchdeck.tsx";
export * from "./sol/wingets/ExploreSections.tsx";
export * from "./sol/wingets/ExploreSidebar.tsx";
export * from "./sol/wingets/ExploreWaves.tsx";
export * from "./sol/wingets/ExploreWindowchrome.tsx";
export * from "./sol/wingets/FilesFoldericons.tsx";
export * from "./sol/wingets/GamesList.tsx";
export * from "./sol/wingets/GamesNav.tsx";
export * from "./sol/wingets/HistoryLadder.tsx";
export * from "./sol/wingets/Imageengine.tsx";
export * from "./sol/wingets/Imagestills.tsx";
export { default as Boot } from "./sol/wingets/IntroBoot.tsx";
export { default as Saas } from "./sol/wingets/IntroSaas.tsx";
export * from "./sol/wingets/IntroSaaskit.tsx";
export * from "./sol/wingets/IntroSaasrails.tsx";
export * from "./sol/wingets/IntroSaassections.tsx";
export * from "./sol/wingets/IntroShaderhero.tsx";
export * from "./sol/wingets/OnboardingSteps.tsx";
export * from "./sol/wingets/PanelBoot.tsx";
export * from "./sol/wingets/PanelDesktop.tsx";
export * from "./sol/wingets/PanelDesktoplock.tsx";
export * from "./sol/wingets/PanelDesktopmenu.tsx";
export * from "./sol/wingets/PanelLogo.tsx";
export * from "./sol/wingets/PanelPalette.tsx";
export * from "./sol/wingets/PanelTabs.tsx";
export * from "./sol/wingets/PanelWindowframe.tsx";
export * from "./sol/wingets/PanelWorkspace.tsx";
export * from "./sol/wingets/ProjectsRows.tsx";
export * from "./sol/wingets/ProvidersCard.tsx";
export * from "./sol/wingets/ProvidersList.tsx";
export * from "./sol/wingets/SettingsAbout.tsx";
export * from "./sol/wingets/SettingsAccentrow.tsx";
export * from "./sol/wingets/SettingsAccountscategory.tsx";
export * from "./sol/wingets/SettingsAutomationmcp.tsx";
export * from "./sol/wingets/SettingsBackgroundpicker.tsx";
export * from "./sol/wingets/SettingsComponentoptions.tsx";
export * from "./sol/wingets/SettingsGatewaycard.tsx";
export * from "./sol/wingets/SettingsGatewaypairing.tsx";
export * from "./sol/wingets/SettingsHarddrives.tsx";
export * from "./sol/wingets/SettingsIdentity.tsx";
export * from "./sol/wingets/SettingsLanguagecard.tsx";
export * from "./sol/wingets/SettingsNav.tsx";
export * from "./sol/wingets/SettingsNavbarposition.tsx";
export * from "./sol/wingets/SettingsPairing.tsx";
export * from "./sol/wingets/SettingsPersonalization.tsx";
export * from "./sol/wingets/SettingsRow.tsx";
export * from "./Settingstypes.ts";
export * from "./sol/wingets/ShellAlttabswitcher.tsx";
export * from "./sol/wingets/ShellAppicons.tsx";
export * from "./sol/wingets/ShellApptile.tsx";
export * from "./sol/wingets/ShellAutomationnote.tsx";
export { default as ShellAvatar } from "./sol/wingets/ShellAvatar.tsx";
export * from "./sol/wingets/ShellAvatar.tsx";
export { default as ShellBanner } from "./sol/wingets/ShellBanner.tsx";
export * from "./sol/wingets/ShellBanner.tsx";
export { default as ShellChip } from "./sol/wingets/ShellChip.tsx";
export * from "./sol/wingets/ShellChip.tsx";
export * from "./sol/wingets/Shellchrome.tsx";
export { default as ShellConn } from "./sol/wingets/ShellConn.tsx";
export * from "./sol/wingets/ShellConn.tsx";
export * from "./sol/wingets/ShellDockmagnify.tsx";
export { default as ShellDot } from "./sol/wingets/ShellDot.tsx";
export * from "./sol/wingets/ShellDot.tsx";
export * from "./sol/wingets/ShellFamilyframe.tsx";
export * from "./sol/wingets/ShellInstitutionalchrome.tsx";
export * from "./sol/wingets/ShellJumpmenu.tsx";
export { default as ShellKbd } from "./sol/wingets/ShellKbd.tsx";
export * from "./sol/wingets/ShellKbd.tsx";
export * from "./sol/wingets/ShellRoutesurface.tsx";
export { default as ShellSegmented } from "./sol/wingets/ShellSegmented.tsx";
export * from "./sol/wingets/ShellSegmented.tsx";
export * from "./sol/wingets/ShellTrayflyouts.tsx";
export * from "./sol/wingets/TermsLegalkit.tsx";
export * from "./sol/wingets/UsageMeasures.tsx";
export * from "./sol/wingets/VideoAssets.tsx";
export * from "./sol/wingets/VideoEngine.tsx";
export * from "./sol/wingets/VideoPlayer.tsx";
