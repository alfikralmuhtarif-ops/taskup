#!/bin/bash
# Deploys the notification-language fix and switches on the Apple review account.
#
# Run it from this Mac; it does everything over SSH. It is idempotent: running it twice
# changes nothing the second time.
#
#   bash deploy/apply-review-account.sh
#
# What it does, in order:
#   1. prints the ENCRYPTION_KEY_V1 fingerprint — must read 31f199dce08d3027
#   2. copies the changed backend sources to /opt/taskup/backend
#   3. sets OTP_FIXED_CODE / OTP_FIXED_CODE_PHONES in /opt/taskup/.env, after backing it up
#   4. rebuilds and restarts only the api container
#   5. prints the fingerprint again, and checks the API is answering
#
# The fixed code applies to the one listed number and nothing else; every other phone
# still gets a real random code over SMS. The API refuses to start if the code is set
# without the phone list, so the two always travel together.
set -euo pipefail

HOST=root@130.94.120.128
KEY=~/.ssh/taskup_vps
REPO="$(cd "$(dirname "$0")/.." && pwd)"

# The reviewer's number and fixed code are a working credential pair for a live
# account while the bypass is on, so they are supplied at run time and never written
# into the repository:
#
#   REVIEW_PHONE=+9665XXXXXXXX REVIEW_CODE=XXXXXX bash deploy/apply-review-account.sh
#
REVIEW_PHONE="${REVIEW_PHONE:-}"
REVIEW_CODE="${REVIEW_CODE:-}"
[ -n "$REVIEW_PHONE" ] && [ -n "$REVIEW_CODE" ] || {
  echo "Set REVIEW_PHONE (E.164, e.g. +9665XXXXXXXX) and REVIEW_CODE (6 digits) in the environment." >&2
  exit 2
}

fingerprint() {
  ssh -i "$KEY" "$HOST" \
    'echo "$(grep -E "^ENCRYPTION_KEY_V1=" /opt/taskup/.env | head -1 | cut -d= -f2-)" | sha256sum | cut -c1-16'
}

echo "== 1. encryption key before (expect 31f199dce08d3027) =="
BEFORE="$(fingerprint)"
echo "$BEFORE"
[ "$BEFORE" = "31f199dce08d3027" ] || { echo "STOP: the encryption key is not what it was. Change nothing."; exit 1; }

echo "== 2. syncing backend sources =="
rsync -az --itemize-changes -e "ssh -i $KEY" --exclude 'bin/' --exclude 'obj/' \
  "$REPO/backend/" "$HOST:/opt/taskup/backend/"

echo "== 3. setting the review account variables =="
ssh -i "$KEY" "$HOST" "cd /opt/taskup && cp .env .env.backup-\$(date +%F-%H%M) && python3 - <<'PY'
import pathlib
p = pathlib.Path('/opt/taskup/.env')
want = {'OTP_FIXED_CODE': '$REVIEW_CODE', 'OTP_FIXED_CODE_PHONES': '$REVIEW_PHONE'}
seen, out = set(), []
for line in p.read_text().splitlines():
    key = line.split('=', 1)[0] if '=' in line else None
    if key in want:
        out.append(f'{key}={want[key]}'); seen.add(key)
    else:
        out.append(line)
out += [f'{k}={v}' for k, v in want.items() if k not in seen]
p.write_text('\n'.join(out) + '\n')
PY
grep -oE '^(OTP_FIXED_CODE|OTP_FIXED_CODE_PHONES)=' .env"

echo "== 4. rebuilding the api container =="
ssh -i "$KEY" "$HOST" 'cd /opt/taskup && docker compose up -d --build api && sleep 12 && docker compose ps --format "{{.Name}} {{.Status}}"'

echo "== 5. checks =="
AFTER="$(fingerprint)"
echo "encryption key after: $AFTER"
[ "$AFTER" = "$BEFORE" ] || { echo "STOP: the encryption key changed during the deploy."; exit 1; }

# Warning level, so it is in the logs every boot: the bypass names the numbers it covers.
ssh -i "$KEY" "$HOST" 'docker compose -f /opt/taskup/docker-compose.yml logs api --tail 200 | grep -i "AUTH BYPASS\|SMS delivery" || true'

echo -n "api.taskupapp.net answers: "
curl -s -o /dev/null -w '%{http_code}\n' https://api.taskupapp.net/tasks

echo "== 6. seeding the reviewer's account =="
# Signs in exactly the way the reviewer will and fills the account, so a clean run here
# is itself the proof that the credentials work. Idempotent — safe to re-run.
python3 -I "$REPO/deploy/seed-review-account.py" https://api.taskupapp.net

echo
echo "Give Apple, under App Review Information:"
echo "  User name: $REVIEW_PHONE"
echo "  Password:  $REVIEW_CODE"
