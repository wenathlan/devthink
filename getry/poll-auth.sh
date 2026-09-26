#!/usr/bin/env bash
# poll-auth.sh — device flow poller (aguarda autorização do usuário)
J=/home/z/my-project/.device-flow-current.json
T=/home/z/my-project/.github-token
S=/home/z/my-project/.auth-status
[ -f "$T" ] && { echo "AUTHORIZED" > "$S"; exit 0; }
INTERVAL=$(python3 -c "import json; print(json.load(open('$J')).get('interval',5))" 2>/dev/null || echo 5)
DEVICE_CODE=$(python3 -c "import json; print(json.load(open('$J'))['device_code'])" 2>/dev/null)
for i in $(seq 1 200); do
  [ -f "$T" ] && { echo "AUTHORIZED" > "$S"; exit 0; }
  RESP=$(curl -s --max-time 30 -X POST https://github.com/login/oauth/access_token -H "Accept: application/json" -d "client_id=178c6fc778ccc68e1d6a&device_code=${DEVICE_CODE}&grant_type=urn:ietf:params:oauth:grant-type:device_code")
  GOT=$(echo "$RESP" | python3 -c "import json,sys; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
  ERR=$(echo "$RESP" | python3 -c "import json,sys; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
  if [ -n "$GOT" ]; then echo "$GOT" > "$T"; chmod 600 "$T"; echo "AUTHORIZED" > "$S"; echo "$(date '+%H:%M:%S') TOKEN SALVO" >> /home/z/my-project/poll-auth.log; exit 0; fi
  if [ "$ERR" = "authorization_pending" ]; then sleep "$INTERVAL"; continue; fi
  if [ "$ERR" = "slow_down" ]; then sleep "$((INTERVAL+5))"; continue; fi
  if [ "$ERR" = "expired_token" ] || [ "$ERR" = "unsupported_grant_type" ]; then echo "FAILED:$ERR" > "$S"; exit 1; fi
  sleep "$INTERVAL"
done
echo "FAILED:timeout" > "$S"
