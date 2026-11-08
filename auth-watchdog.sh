# auth-watchdog.sh — supervisiona o authentication.sh: relança se morrer antes do token
# Padrão do corpus original (watchdog + poller separados). Sai quando o token existe.
while true; do
  if [ -f /home/z/my-project/.github-token ]; then
    echo "$(date '+%H:%M:%S') watchdog: token presente, saindo" >> /home/z/my-project/poll-auth.log
    exit 0
  fi
  if ! pgrep -f "bash authentication.sh" > /dev/null; then
    echo "$(date '+%H:%M:%S') watchdog: poller morto, relançando" >> /home/z/my-project/poll-auth.log
    cd /home/z/my-project && setsid nohup bash authentication.sh >> /home/z/my-project/poll-auth.log 2>&1 < /dev/null &
  fi
  sleep 20
done



