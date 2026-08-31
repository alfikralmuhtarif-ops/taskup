#!/usr/bin/env bash
# Nightly backup: database dump + uploaded files, kept for 14 days.
#
#   sudo cp deploy/backup.sh /usr/local/bin/taskup-backup && sudo chmod +x /usr/local/bin/taskup-backup
#   sudo crontab -e   →   15 3 * * * /usr/local/bin/taskup-backup >> /var/log/taskup-backup.log 2>&1
#
# A backup on the same server is not a backup — it dies with the machine. Copy
# $DEST off-box (object storage, another host) and, at least once, restore it
# somewhere and confirm you can log in. An untested backup is a guess.
set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/taskup}"
DEST="${DEST:-/var/backups/taskup}"
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"

cd "$PROJECT_DIR"
set -a; . ./.env; set +a
mkdir -p "$DEST"

echo "[$(date -Is)] dumping database"
docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom \
  > "$DEST/db-$STAMP.dump"

echo "[$(date -Is)] archiving uploads"
docker run --rm -v taskup_uploads:/data:ro -v "$DEST":/out alpine \
  tar czf "/out/uploads-$STAMP.tar.gz" -C /data .

find "$DEST" -type f -mtime "+$KEEP_DAYS" -delete
echo "[$(date -Is)] done: $(ls -lh "$DEST/db-$STAMP.dump" | awk '{print $5}')"

# NOTE: this does NOT back up ENCRYPTION_KEY_V1, which lives only in .env. Without
# that key the dump above is undecryptable for phone numbers, message text and note
# bodies. Store the key separately, somewhere you would still have after losing this
# server — a password manager, not a file next to the backups.
