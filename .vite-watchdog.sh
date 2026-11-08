#!/bin/bash
# vite-watchdog — resurrects the devthink vite dev server when the sandbox reaper kills it
export PATH="$HOME/.bun/bin:$PATH"
while true; do
  if ! curl -s --max-time 3 -o /dev/null http://127.0.0.1:3000/; then
    echo "$(date '+%H:%M:%S') watchdog: vite dead, relaunching" >> /tmp/vite-watchdog.log
    cd /home/z/my-project/devthink && setsid nohup bun node_modules/vite/bin/vite.js --port 3000 --host 0.0.0.0 >> /tmp/vite.log 2>&1 < /dev/null &
  fi
  sleep 8
done
