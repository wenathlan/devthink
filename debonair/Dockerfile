# debonair 2.0.46 — THE SITE CONTAINER FILE
#
# The family container doctrine in the site shape: one versioned static
# container per site home. debonair is the audio and DAW app; the zero-build
# site ships exactly the files the folder tracks and the container serves
# them unprivileged. The version rides the ARG the metadata lockstep stamps
# and the OCI labels declare — the registry lanes pass it at build time,
# nothing is hardcoded beside the stamp.

FROM nginxinc/nginx-unprivileged:1.29-alpine

ARG DEBONAIR_VERSION=2.0.46

LABEL org.opencontainers.image.title="debonair" \
      org.opencontainers.image.description="debonair — the audio and DAW app; the katexis engine home." \
      org.opencontainers.image.version="${DEBONAIR_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/debonair"

COPY site/ /usr/share/nginx/html/

# the unprivileged image answers 8080; the 404 document the site ships rides
# the document root the default server config already wires as the fallback.
EXPOSE 8080
