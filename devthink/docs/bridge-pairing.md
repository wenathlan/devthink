# Bridge pairing walkthrough

1. Open the extension options and find the Site bridge section.
2. Type the relay url — wss, always the operator's choice; the scheme, host and port shape validate before saving, and an empty value disables the bridge completely.
3. Tick the consent box for the first socket connection (the bridge consent gate asks before any socket opens).
4. Press Mint pairing code: the code appears with its expiry countdown (the documented five minutes unless the operator configured another lifetime).
5. Open the static site (any static host or a local file), type the same relay url and the pairing code, and press Pair and connect — the site sessionjoins the extension session through the code.
6. Send the task text from the site chat: the extension receives the chat event, proposes the plan as a review card, and the site's decision returns to the extension review gate.
7. Revoke all sessions with one click whenever the pairing should end; the kill switch disables the socket and the pairing instantly.
