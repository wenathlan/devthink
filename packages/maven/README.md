# DevThink Java Adapter

This package provides a minimal Java adapter for starting a **user-owned local** DevThink binary. It does not embed credentials, proxy browser traffic, capture sessions, or call provider APIs directly.

Set `DEVTHINK_BIN` when the executable is not available as `devthink` on the system path. Use `DevThink.command(...)` to inspect the exact process invocation or `DevThink.start(...)` to start it.
