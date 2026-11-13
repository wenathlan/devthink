# Browser Agent Baseline

This record preserves public, source-attributed product claims. It does not infer hidden behavior from a marketing listing and does not authorize code reuse.

| Source | Publicly stated capabilities | Design implication for Devthink |
| --- | --- | --- |
| Manus AI Browser Operator | Explicit session authorization, operation in the user-assigned tab, instant stop by closing that tab, and use of logged-in browser context without sharing passwords. | Devthink will use a session-bound, active-tab bridge with a visible stop control and explicit consent at session start. |
| Kimi WebBridge | AI agents can open pages, click, fill forms, extract information, automate web tasks, and clean up task-tab groups. | Devthink will separate observation, interaction, extraction and tab lifecycle into independently permissioned tool groups. |
| Nanobrowser | Open-source Chrome extension with a side panel, multi-agent task workflow, local-browser execution, conversation history and configurable model providers. | Devthink will adopt a clean-room tool protocol with a local-first adapter, pluggable endpoint configuration and explicit task state. |
| Automa | Block-based workflows, form filling, screenshots, scraping, scheduling and workflow sharing; source includes a commercial license. | Devthink may learn the feature category, but will not copy Automa code, interface or workflow data because its repository license is not a permissive reuse license. |
| Ui.Vision RPA | Macro recording, local replay, form filling, scraping, OCR/image recognition, command-line control and optional desktop bridge. | Devthink will keep browser operations separate from any future native host bridge, with user-installed host permission and distinct consent. |
| BrowserAgent | Private, local AI agents can run inside the browser and execute user-created agent workflows without cloud API costs. | Devthink will keep a local-only mode that can run deterministic, reviewed tool sequences without an external endpoint. |
| WebDex.dev | A Chrome side panel for page understanding, summaries, research, form assistance, extraction, reports and workflow automation. | Devthink will group these user-facing capabilities into reviewable tool bundles, with page reading distinct from form-writing and execution. |

The sources demonstrate recurring patterns: a visible in-browser control surface, local or user-controlled execution context, structured task state, scoped tab operations and a deliberate boundary between browser and desktop automation. The feature catalog will classify these as patterns rather than copied implementations.

## References

[1]: https://chromewebstore.google.com/detail/manus-ai-browser-operator/cecngibhkljoiafhjfmcgbmikfogdiko "Manus AI Browser Operator — Chrome Web Store"
[2]: https://chromewebstore.google.com/detail/kimi-webbridge/fldmhceldgbpfpkbgopacenieobmligc "Kimi WebBridge — Chrome Web Store"
[3]: https://github.com/nanobrowser/nanobrowser "nanobrowser/nanobrowser"
[4]: https://github.com/automaapp/automa "automaapp/automa"
[5]: https://addons.mozilla.org/en-US/firefox/addon/rpa/ "Ui.Vision — Firefox Browser Add-ons"
[6]: https://chromewebstore.google.com/detail/browseragent-ai-agents-in/jphkkablogbfneefecondchaafbdaomc "BrowserAgent — Chrome Web Store"
[7]: https://chromewebstore.google.com/detail/webdexdev-ai-browser-agen/celalggclffbgnloepbfadhjhmchikoh "WebDex.dev — Chrome Web Store"
