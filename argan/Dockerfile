# argan 2.0.47 — THE SITE CONTAINER FILE
#
# The family container doctrine in the site shape: one versioned static
# container per site home. argan is the DNS and gateway library; the
# zero-build site ships exactly the files the folder tracks and the
# container serves them unprivileged. The version rides the ARG the
# metadata lockstep stamps and the OCI labels declare — the registry lanes
# pass it at build time, nothing is hardcoded beside the stamp.

FROM nginxinc/nginx-unprivileged:1.29-alpine

ARG ARGAN_VERSION=2.0.47

LABEL org.opencontainers.image.title="argan" \
      org.opencontainers.image.description="argan — the DNS and gateway library; zones, records, dnssec and handshake." \
      org.opencontainers.image.version="${ARGAN_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/argan"

COPY site/ /usr/share/nginx/html/

# the unprivileged image answers 8080; the 404 document the site ships rides
# the document root the default server config already wires as the fallback.
EXPOSE 8080
