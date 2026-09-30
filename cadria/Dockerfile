# cadria 2.0.46 — THE SITE CONTAINER FILE
#
# The family container doctrine in the site shape: one versioned static
# container per site home. cadria is the video and image player, editor and
# studio; the zero-build site ships exactly the files the folder tracks and
# the container serves them unprivileged. The version rides the ARG the
# metadata lockstep stamps and the OCI labels declare — the registry lanes
# pass it at build time, nothing is hardcoded beside the stamp.

FROM nginxinc/nginx-unprivileged:1.29-alpine

ARG CADRIA_VERSION=2.0.46

LABEL org.opencontainers.image.title="cadria" \
      org.opencontainers.image.description="cadria — the video and image player, editor and studio; the versawase engine home." \
      org.opencontainers.image.version="${CADRIA_VERSION}" \
      org.opencontainers.image.licenses="GPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/wenathlan/devthink" \
      org.opencontainers.image.documentation="https://github.com/wenathlan/devthink/tree/main/cadria"

COPY site/ /usr/share/nginx/html/

# the unprivileged image answers 8080; the 404 document the site ships rides
# the document root the default server config already wires as the fallback.
EXPOSE 8080
