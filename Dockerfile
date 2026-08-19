ARG BUN_IMAGE=oven/bun:1-alpine

FROM ${BUN_IMAGE} AS build
WORKDIR /build
COPY . .
RUN bun build ./devthink.ts --compile --minify --target=bun-linux-x64 --outfile /out/devthink

FROM alpine:3.22
ARG DEVTHINK_VERSION=development
LABEL org.opencontainers.image.title="DevThink" \
      org.opencontainers.image.description="Provider-neutral AI development CLI" \
      org.opencontainers.image.version="${DEVTHINK_VERSION}" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink"
RUN addgroup -S devthink && adduser -S devthink -G devthink
COPY --from=build /out/devthink /usr/local/bin/devthink
USER devthink
ENTRYPOINT ["/usr/local/bin/devthink"]
CMD ["--help"]
