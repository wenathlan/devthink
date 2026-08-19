# DevThink Ruby Adapter

This gem builds explicit process arguments for a **user-owned local** DevThink binary. It neither stores provider credentials nor makes remote provider calls.

Set `DEVTHINK_BIN` when the executable is not available as `devthink` on the system path. `DevThink.command(...)` returns the shell-free arguments and `DevThink.start(...)` starts the process.
