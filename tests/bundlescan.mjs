/** The shared bundle scanner of the build and the vitest naming checks: one scanner strips the non code spans of a bundle and one predicate reads the underscored identifiers the platform and the bundler own, so the build gate and the test suite grade identical text. */

/** Strips the non code spans of one bundle — the string, template, comment and regex literals — so the naming check reads declared identifiers only; a small scanner walks the bundle once because a plain quote strip would mispair the quotes the regex literals carry. */
export function stripstrings(content) {
  let out = "";
  let index = 0;
  let lastword = "";
  const regexposition = () => lastword === "" || /^[({[,;:!&|?+\-*/%~^=<>]$/.test(lastword) || ["return", "typeof", "instanceof", "case", "delete", "void", "new", "do", "else", "in", "of", "throw", "yield", "await"].includes(lastword);
  while (index < content.length) {
    const char = content[index];
    const next = content[index + 1];
    if (char === "/" && next === "/") { while (index < content.length && content[index] !== "\n") index += 1; continue; }
    if (char === "/" && next === "*") { index += 2; while (index < content.length && !(content[index] === "*" && content[index + 1] === "/")) index += 1; index += 2; continue; }
    if (char === '"' || char === "'") {
      const quote = char; index += 1;
      while (index < content.length && content[index] !== quote) { if (content[index] === "\\") index += 1; index += 1; }
      index += 1; out += " \"\" "; lastword = '"'; continue;
    }
    if (char === "`") {
      index += 1;
      while (index < content.length && content[index] !== "`") {
        if (content[index] === "\\") { index += 2; continue; }
        if (content[index] === "$" && content[index + 1] === "{") {
          let depth = 1; index += 2;
          while (index < content.length && depth > 0) {
            if (content[index] === "{") depth += 1;
            else if (content[index] === "}") depth -= 1;
            else if (content[index] === '"' || content[index] === "'" || content[index] === "`") { const inner = content[index]; index += 1; while (index < content.length && content[index] !== inner) { if (content[index] === "\\") index += 1; index += 1; } }
            index += 1;
          }
          continue;
        }
        index += 1;
      }
      index += 1; out += " \"\" "; lastword = '"'; continue;
    }
    if (char === "/" && regexposition()) {
      index += 1;
      let inclazz = false;
      let closed = false;
      while (index < content.length) {
        const regexchar = content[index];
        if (regexchar === "\\") { index += 2; continue; }
        if (regexchar === "\n") break;
        if (regexchar === "[") inclazz = true;
        else if (regexchar === "]") inclazz = false;
        else if (regexchar === "/" && !inclazz) { closed = true; break; }
        index += 1;
      }
      if (closed) {
        index += 1;
        while (index < content.length && /[a-z]/i.test(content[index])) index += 1;
        out += " // "; lastword = "/"; continue;
      }
      out += "/"; lastword = "/"; index += 1; continue;
    }
    if (/\s/.test(char)) { index += 1; if (out.length > 0 && out[out.length - 1] !== " ") out += " "; continue; }
    if (/[A-Za-z0-9_$]/.test(char)) {
      let word = "";
      while (index < content.length && /[A-Za-z0-9_$]/.test(content[index])) { word += content[index]; index += 1; }
      lastword = word;
      out += word;
      continue;
    }
    lastword = char;
    out += char;
    index += 1;
  }
  return out;
}

/** The platform constants of the ecmascript standard library and the esbuild module namespace artifacts the naming check allowlists: their underscored names belong to the platform and the bundler, never to the review. The grand merge folded the maene lineage beside the extension lineage: its reviewed vocabulary declares its catalog constants and environment keys in the screaming snake case its module boundaries speak (ANTIGRAVITY_*, GEMINI_*, MODEL_*, QUOTA_*, ...), so every all caps identifier joins the platform names the check owns while a lowercase snake case name still fails the gate. */
export function platformnames(name) {
  return ["MAX_SAFE_INTEGER", "MIN_SAFE_INTEGER", "POSITIVE_INFINITY", "NEGATIVE_INFINITY"].includes(name) || /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/.test(name) || name.endsWith("_exports") || name.endsWith("_default") || wireformatnames(name);
}

/** The external wire format field names stay allowlisted beside the platform constants because their names belong to the protocol they speak, not to the review: the chrome native messaging manifest declares its allowed_origins key in the snake case the browser demands, and the 1.1.86 cross browser manifest overlays carry the snake case field names (browser_specific_settings, strict_min_version, default_popup, default_icon, default_path, default_title, host_permissions, optional_permissions, web_accessible_resources, content_security_policy, extension_pages, manifest_version, service_worker, open_in_tab, chrome_url_overrides, optional_host_permissions, browser_specific_settings) the webextension manifest v3 protocol speaks. */
export function wireformatnames(name) {
  return ["allowed_origins", "browser_specific_settings", "strict_min_version", "default_popup", "default_icon", "default_path", "default_title", "host_permissions", "optional_permissions", "web_accessible_resources", "content_security_policy", "extension_pages", "manifest_version", "service_worker", "side_panel", "open_in_tab", "chrome_url_overrides", "optional_host_permissions"].includes(name) || maeneconfigfields(name) || gatewaywirefields(name);
}

/** The wire format field names of the gateway and maene provider protocols of the grand merge: the OpenAI-compatible, Anthropic and Gemini request and response envelopes (reasoning_content, finish_reason, max_tokens, prompt_tokens, the tool call shapes), the OAuth token exchange of the maene lineage (grant_type, access_token, code_challenge), the sqlite column names of the gateway persistence (chat_id, session_id, created_at, init_database) and the provider environment keys (api_key, https_proxy) — the names belong to the protocols, the databases and the environments they speak, never to the reviewed identifier vocabulary. */
export function gatewaywirefields(name) {
  return ["init_database", "chat_id", "session_id", "api_key", "reasoning_content", "finish_reason", "max_tokens", "enable_thinking", "owned_by", "max_context_length", "max_output_tokens", "supports_thinking", "supports_streaming", "supports_tools", "supports_vision", "prompt_tokens", "completion_tokens", "total_tokens", "stop_reason", "input_tokens", "output_tokens", "created_at", "tag_name", "redirect_uri", "response_type", "access_type", "grant_type", "error_description", "access_token", "expires_at", "expires_in", "refresh_token", "code_challenge", "code_challenge_method", "user_email", "expiry_date", "project_id", "oauth_client_key", "last_refresh", "email_address", "input_schema", "parameters_json", "image_url", "tool_name", "tool_call_id", "tool_calls", "tool_use_id", "thinking_level", "top_p", "top_k", "quota_soft_threshold_percent", "quota_hard_threshold_percent", "quota_source", "quota_dual_enabled", "quota_cache_ttl_ms_default", "project_fallback", "darwin_arm64", "darwin_x64", "linux_x64", "win32_x64", "linux_amd64", "function_call", "tool_use", "grounding_metadata", "usage_metadata", "reasoning_content_signature", "thinking_signature", "stop_sequence", "content_block", "partial_json", "thought_signature", "completion_tokens_details", "reasoning_tokens", "delta_content", "redacted_thinking", "is_error", "grounding_chunks", "https_proxy", "http_proxy", "all_proxy", "no_proxy", "reset_at", "claude_tool_hardening", "keep_thinking", "quiet_mode", "anthropic_version", "oauth_identity", "inject_antigravity_provider", "disabled_providers"].includes(name);
}

/** The wire format field names of the maene lineage's antigravity.json configuration the naming check allowlists: the keys belong to the config file format the maene surface reads and writes (the observer schema freezes them), never to the reviewed identifier vocabulary, so the lowercase snake case keys of the wire format join the webextension field names above while an identifier the code declares still fails the gate. */
export function maeneconfigfields(name) {
  return ["refresh_interval_minutes", "cache_ttl_minutes", "soft_threshold", "hard_threshold", "dual_pool", "version_fallback", "min_supported", "user_agent", "strip_user_project_header", "fingerprint_jitter", "pid_offset", "log_file", "retain_days", "max_bytes", "tui_buffer_lines", "redact_secrets", "url_context", "include_grounding_metadata", "cli_first", "pid_offset_enabled", "quota_refresh_interval_minutes", "rotation_strategy", "account_rotation", "debug_enabled", "google_search_enabled", "google_search", "fallback_project_id", "default_model", "search_model", "client_id", "client_secret", "accounts_file", "models_allowlist", "strip_user_project", "soft_quota_threshold_percent", "quota_fallback", "soft_quota_cache_ttl_minutes", "version_cache_ttl", "gemini_cli", "cloud_companion", "stream_generate", "toast_scope"].includes(name);
}

/** Reads the underscored identifiers of one bundle the naming check refuses: the reviewed vocabulary declares no underscored name, so a bundle that grows one carries an unreviewed dependency. */
export function underscorednames(content) {
  return (content.match(/\b[A-Za-z][A-Za-z0-9]*_[A-Za-z0-9][A-Za-z0-9_]*\b/g) ?? []).filter(name => !platformnames(name));
}
