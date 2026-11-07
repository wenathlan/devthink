#!/bin/bash
# sync-head.sh — the real-time post-auth sync the PR22 law charges:
# the instant the polar poller captures the token, this watcher verifies it
# against the github api, seats it into gh + the git credential chain, and
# pushes the local main (the resync heal) so the remote HEAD answers the
# local environment again. Everything lives in $ROOT, never /tmp.
ROOT="/home/z/my-project"
TOKEN_FILE="$ROOT/.github-token"
LOG="$ROOT/sync-head.log"

log() { printf '%s %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >> "$LOG"; }

log "watcher armed — waiting for the polar capture"
for i in $(seq 1 2160); do   # up to 6h, 10s cadence
  if [ -s "$TOKEN_FILE" ]; then
    TOKEN=$(cat "$TOKEN_FILE")
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" https://api.github.com/user)
    if [ "$CODE" = "200" ]; then
      log "*** TOKEN VERIFIED (api 200) — seating credentials and pushing ***"
      printf '%s' "$TOKEN" | gh auth login --hostname github.com --with-token >> "$LOG" 2>&1
      gh auth setup-git >> "$LOG" 2>&1
      cd "$ROOT" || exit 1
      git fetch origin >> "$LOG" 2>&1 && log "fetch ok: $(git rev-parse --short origin/main)"
      AHEAD=$(git rev-list --count origin/main..main 2>/dev/null)
      BEHIND=$(git rev-list --count main..origin/main 2>/dev/null)
      log "divergence — ahead: $AHEAD behind: $BEHIND"
      if [ "$BEHIND" = "0" ] && [ "$AHEAD" != "0" ]; then
        if git push origin main >> "$LOG" 2>&1; then
          log "*** PUSHED — remote HEAD now $(git rev-parse --short origin/main), the sync is complete ***"
        else
          log "push failed — see git output above"
        fi
      elif [ "$BEHIND" != "0" ]; then
        log "origin moved again ($BEHIND new) — rebase needed before push, leaving the tree to the operator lanes"
      else
        log "already in sync — nothing to push"
      fi
      exit 0
    else
      log "token present but api answers $CODE (attempt $i) — waiting for a live one"
    fi
  fi
  sleep 10
done
log "6h window closed without a verified token"
exit 1
