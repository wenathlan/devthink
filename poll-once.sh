#!/bin/bash
# poll-once.sh — single device-flow poll cycle; captures token instantly on authorization
STATUS_FILE=/home/z/my-project/.auth-status
TOKEN_FILE=/home/z/my-project/.github-token
DEVICE_FILE=/home/z/my-project/.device-flow-current.json
LOG=/home/z/my-project/poll-auth.log
if [ -f "$TOKEN_FILE" ]; then echo "AUTHORIZED"; exit 0; fi
if [ ! -f "$DEVICE_FILE" ]; then echo "NODEVICE"; exit 1; fi
DEVICE_CODE=$(python3 -c "import json;print(json.load(open('$DEVICE_FILE'))['device_code'])" 2>/dev/null)
USER_CODE=$(python3 -c "import json;print(json.load(open('$DEVICE_FILE'))['user_code'])" 2>/dev/null)
[ -z "$DEVICE_CODE" ] && { echo "NODEVICE"; exit 1; }
POLL=$(curl -s --max-time 30 -X POST https://github.com/login/oauth/access_token -H "Accept: application/json" -d "client_id=178c6fc778ccc68e1d6a&device_code=${DEVICE_CODE}&grant_type=urn:ietf:params:oauth:grant-type:device_code")
ERROR=$(echo "$POLL" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if [ -z "$ERROR" ]; then
  TOKEN=$(echo "$POLL" | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
  if [ -n "$TOKEN" ]; then
    echo "$TOKEN" > "$TOKEN_FILE"; chmod 600 "$TOKEN_FILE"
    echo "AUTHORIZED" > "$STATUS_FILE"
    echo "$(date '+%H:%M:%S') TOKEN CAPTURADO (${#TOKEN} chars)" >> "$LOG"
    echo "AUTHORIZED_TOKEN"
    exit 0
  fi
fi
echo "PENDING|${USER_CODE}|$(date +%s)" > "$STATUS_FILE"
echo "PENDING ${USER_CODE} (${ERROR:-waiting})"
