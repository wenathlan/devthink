# authentication.sh — autenticação GitHub unificada (device flow + watchdog + renovação)
# União dos scripts de autenticação do corpus: pede código de dispositivo,
# aguarda autorização do dono, salva token com permissão restrita e renova
# o código enquanto expira. Não repete o questionamento após autorização.
set -u

STATUS_FILE=/home/z/my-project/.auth-status
TOKEN_FILE=/home/z/my-project/.github-token
DEVICE_FILE=/home/z/my-project/.device-flow-current.json
LOG=/home/z/my-project/poll-auth.log
CLIENT_ID=178c6fc778ccc68e1d6a
SCOPES="repo,workflow,write:packages,read:packages,delete:packages,admin:org,read:org,write:org,admin:public_key,write:public_key,read:public_key,gist,notifications,user,read:user,user:email,delete_repo,codespace,project,read:project,write:discussion,read:discussion,repo:status,repo:invite"

log() { echo "$(date '+%H:%M:%S') $1" >> "$LOG"; }

# Já autorizado: watchdog não re-polla (regra: não re-questionar pós-autorização)
if [ -f "$TOKEN_FILE" ]; then
  echo "AUTHORIZED" > "$STATUS_FILE"
  log "authentication: token já presente, saindo"
  exit 0
fi

poll_code() {
  local DEVICE_CODE="$1" USER_CODE="$2" EXPIRES="$3" INTERVAL="$4"
  echo "PENDING|${USER_CODE}|$(date +%s)" > "$STATUS_FILE"
  log "polling ${USER_CODE} (${EXPIRES}s)"
  local START=$(date +%s)
  while [ $(( $(date +%s) - START )) -lt "$EXPIRES" ]; do
    sleep "$INTERVAL"
    POLL=$(curl -s --max-time 30 -X POST https://github.com/login/oauth/access_token \
      -H "Accept: application/json" \
      -d "client_id=${CLIENT_ID}&device_code=${DEVICE_CODE}&grant_type=urn:ietf:params:oauth:grant-type:device_code")
    ERROR=$(echo "$POLL" | python3 -c "import sys,json;print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
    if [ "$ERROR" = "authorization_pending" ]; then continue; fi
    if [ "$ERROR" = "slow_down" ]; then sleep 5; continue; fi
    if [ -z "$ERROR" ]; then
      TOKEN=$(echo "$POLL" | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
      if [ -n "$TOKEN" ]; then
        echo "$TOKEN" > "$TOKEN_FILE"
        chmod 600 "$TOKEN_FILE"
        echo "AUTHORIZED|${USER_CODE}|$(date +%s)" > "$STATUS_FILE"
        log "AUTHORIZED via ${USER_CODE} — token salvo com permissão 600"
        exit 0
      fi
    fi
    break
  done
  log "código ${USER_CODE} expirou/failed"
}

# Fase 1: se existe device code vivo (de lançamento anterior), pola ele primeiro
if [ -f "$DEVICE_FILE" ]; then
  python3 - << 'PYEOF' > /home/z/my-project/.poll-plan.txt
import json
try:
    d = json.load(open('/home/z/my-project/.device-flow-current.json'))
    print(f"{d['device_code']}|{d['user_code']}|{max(60, min(d.get('expires_in',900), 900))}|{d.get('interval',5)}")
except Exception:
    pass
PYEOF
  while IFS='|' read -r DC UC EX IN; do
    [ -n "$DC" ] && poll_code "$DC" "$UC" "$EX" "$IN"
  done < /home/z/my-project/.poll-plan.txt
fi

# Fase 2: laço de renovação — gera código novo enquanto não autorizar
RENEW=0
while [ "$RENEW" -lt 300 ]; do
  [ -f "$TOKEN_FILE" ] && { echo "AUTHORIZED" > "$STATUS_FILE"; exit 0; }
  RESP=$(curl -s --max-time 30 -X POST https://github.com/login/device/code \
    -H "Accept: application/json" \
    -d "client_id=${CLIENT_ID}&scope=${SCOPES}")
  echo "$RESP" > "$DEVICE_FILE"
  DEVICE_CODE=$(echo "$RESP" | python3 -c "import sys,json;print(json.load(sys.stdin).get('device_code',''))" 2>/dev/null)
  USER_CODE=$(echo "$RESP" | python3 -c "import sys,json;print(json.load(sys.stdin).get('user_code',''))" 2>/dev/null)
  EXPIRES=$(echo "$RESP" | python3 -c "import sys,json;print(json.load(sys.stdin).get('expires_in',900))" 2>/dev/null)
  INTERVAL=$(echo "$RESP" | python3 -c "import sys,json;print(json.load(sys.stdin).get('interval',5))" 2>/dev/null)
  log "RENOVOU->${USER_CODE} (abra github.com/login/device e digite o código)"
  if [ -n "$DEVICE_CODE" ]; then
    poll_code "$DEVICE_CODE" "$USER_CODE" "$EXPIRES" "$INTERVAL"
  fi
  RENEW=$((RENEW+1))
  sleep 2
done
echo "FAILED:timeout" > "$STATUS_FILE"
log "authentication: timeout após 300 renovações"
exit 1





