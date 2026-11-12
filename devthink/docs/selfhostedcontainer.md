# Self hosted container walkthrough

This walkthrough runs the devthink self hosting container end to end on one machine: the multi stage image build with its build checks, the three surfaces the runtime image exposes (the static site, the socket relay speaking the servercontract and the mcp server listener), the pairing of the extension and the site through the relay, and the operator choices (the binds, the ports, the paths and the idle window) that stay environment variables the whole way. No vendor endpoint, no download url and no telemetry frame exists anywhere in the image; the operator pulls the image from the registry they choose and runs it at the address they choose.

## 1. Build the image with the build checks

The image build is multi stage, so the validation chain runs before the lean runtime ships:

```shell
docker build -f containerfile -t devthink:selfhosted .
```

The builder stage installs the pinned toolchain from the checked-in package metadata (no corepack, the exact npm and pnpm versions verified), runs `pnpm validate`, the cli manifest check, the cjs require check, the headless smoke over the example fixture, the native smoke against a fake host process and the firefox prep check. An image whose build checks fail never ships: the docker build exits nonzero. The runtime stage then copies only the static site, the cli bundle, the relay bundle and the self hosting runner onto the plain node base and runs its own `--check` boot (every surface answers before the image completes).

## 2. Run the container with the operator chosen environment

```shell
docker run --rm -p 8080:8080 -e DEVTHINK_HTTP_PORT=8080 -e DEVTHINK_RELAY_PATH=/relay -e DEVTHINK_MCP_BIND=127.0.0.1 -e DEVTHINK_MCP_PORT=7436 devthink:selfhosted
```

The environment variables are the whole configuration surface: `DEVTHINK_HTTP_BIND` and `DEVTHINK_HTTP_PORT` bind the http listener (the static site and the relay upgrade ride it), `DEVTHINK_RELAY_PATH` names the websocket path the relay answers, `DEVTHINK_MCP_BIND`, `DEVTHINK_MCP_PORT` and `DEVTHINK_MCP_PATH` bind the mcp server listener — the documented default keeps the mcp listener loopback only (`127.0.0.1`), and widening the bind to the container network is the operator's explicit choice. `DEVTHINK_RELAY_IDLE_MS` sets the idle sweep window (a connection quiet past the window leaves; an absent window never expires a connection). The health endpoint answers `GET /healthz` with the live surface report, and the healthcheck probes it.

## 3. Open the static site and read the relay contract

Browsing `http://127.0.0.1:8080/` serves the hashed chatbridge assets with their immutable cache headers (the `_headers` map the build emits). The site page asks for the relay url and the pairing code — nothing connects before the operator types both.

## 4. Pair the extension side

In the extension options, set the server url to `ws://127.0.0.1:8080/relay` (or the wss url of the relay once tls terminates in front of it) and mint the pairing code. The extension side opens the socket, sends the `sessioncreate` frame of the servercontract with the pairing code, and the relay answers with the session id and the frame token. The pairing code stays pending for its lifetime and one redemption only.

## 5. Pair the site side and watch the events route

The site page redeems the same pairing code through the `sessionjoin` frame; the relay issues the site member its own token, and from then on every `eventpost` frame routes between the two members while both sides ack. The raw frame tokens live only in the memory-only issuance map inside the relay state — no log, no audit record and no persistence carries them, and a rejoin rotates the token and revokes the previous one.

## 6. Reach the mcp server listener

The mcp listener answers the streamable http transport on its own bind: an mcp client posts json rpc frames to `http://127.0.0.1:7436/mcp` (inside the container network). The listener stays loopback by default; a remote client requires the operator to widen the bind and terminate tls in front of it, and the remote gates of the mcp server mode (the pairing handshake, the token scopes and the approval holds) apply unchanged.

## 7. Verify the artifacts the release publishes for the channel

The release publishes the image with the version tag beside the stable channel alias and the three digest files (`extension-container.txt`, `extension-container.digest`, `extension-container.json`): pin the exact image by digest (`docker run ghcr.io/wenathlan/extension@sha256:<digest>`) and the rollback path stays the immutable tags of the previous releases. The sbom, the checksums file and the artifact manifest of the release document the full set beside it.
