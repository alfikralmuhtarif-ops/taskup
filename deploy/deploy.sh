#!/usr/bin/env bash
#
# TaskUp — first-time backend deployment on a fresh Ubuntu VPS.
#
#   sudo bash deploy/deploy.sh
#
# Idempotent: safe to re-run. It never overwrites an existing .env, so your secrets
# and therefore your encrypted data survive a second run.
#
# What it does, in order:
#   1. Checks the machine and installs Docker if missing
#   2. Generates secrets into .env (on this server — they never leave it)
#   3. Starts Postgres, applies migrations, starts the API behind HTTP-only nginx
#   4. Obtains a Let's Encrypt certificate and switches nginx to HTTPS
#   5. Verifies, and sets up nightly backups and certificate renewal
set -euo pipefail

API_DOMAIN="${API_DOMAIN:-api.taskupapp.net}"
PROJECT_DIR="${PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
CERT_EMAIL="${CERT_EMAIL:-}"

c()  { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
ok() { printf '    \033[0;32m✓\033[0m %s\n' "$*"; }
no() { printf '    \033[0;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

cd "$PROJECT_DIR"

# ── 1. Preflight ─────────────────────────────────────────────────────────────
c "Checking the machine"
[ "$(id -u)" -eq 0 ] || no "Run with sudo."
[ -f docker-compose.yml ] || no "docker-compose.yml not found — is $PROJECT_DIR the project root?"

FREE_GB=$(df -BG --output=avail / | tail -1 | tr -dc '0-9')
[ "$FREE_GB" -ge 6 ] || no "Only ${FREE_GB}GB free on /. The build needs ~6GB; free space first."
ok "${FREE_GB}GB disk free"

RAM_MB=$(free -m | awk '/^Mem:/{print $2}')
ok "${RAM_MB}MB RAM"
SWAP_MB=$(free -m | awk '/^Swap:/{print $2}')
ok "${SWAP_MB}MB swap"
# Some providers ship a swap partition rather than /swapfile, so test the actual
# total: keying off the file alone would stack a second swapfile on top of it.
if [ "$RAM_MB" -lt 3500 ] && [ "$SWAP_MB" -lt 2000 ]; then
  # A .NET build on a 2GB box is killed by the OOM reaper partway through, which
  # looks like a mysterious "exit code 137" rather than an out-of-memory error.
  c "Adding 2GB of swap (build headroom)"
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  ok "swap enabled"
fi

# ── 2. Docker ────────────────────────────────────────────────────────────────
if ! command -v docker >/dev/null 2>&1; then
  c "Installing Docker"
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl >/dev/null
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >/dev/null
  systemctl enable --now docker
fi
docker compose version >/dev/null 2>&1 || no "docker compose plugin missing."
ok "$(docker --version)"

# ── 3. Secrets ───────────────────────────────────────────────────────────────
# Generated here, on this machine. They are never printed in full and never leave
# the server. ENCRYPTION_KEY_V1 in particular is unrecoverable: if you lose it,
# every stored phone number, message and note becomes permanently unreadable.
if [ -f .env ]; then
  c "Keeping the existing .env"
  ok "untouched — re-running never rotates your keys"
else
  c "Generating secrets into .env"
  umask 077
  cat > .env <<ENV
POSTGRES_DB=taskup
POSTGRES_USER=taskup
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '/+=' | head -c 40)
JWT_SIGNING_KEY=$(openssl rand -base64 48)
ENCRYPTION_KEY_V1=$(openssl rand -base64 32)
ADMIN_BOOTSTRAP_SECRET=$(openssl rand -base64 24)
VITE_API_URL=https://$API_DOMAIN
ENV
  chmod 600 .env
  ok ".env written (mode 600)"
  printf '\n    \033[1;33mBACK UP THIS FILE NOW, somewhere other than this server:\033[0m\n'
  printf '        %s/.env\n' "$PROJECT_DIR"
  printf '    Losing ENCRYPTION_KEY_V1 permanently destroys your encrypted data.\n\n'
fi

# ── 4. Build and start the backend behind HTTP-only nginx ────────────────────
c "Selecting the bootstrap (HTTP-only) nginx config"
mkdir -p deploy/nginx/active deploy/certbot-webroot deploy/letsencrypt
cp deploy/nginx/available/bootstrap.conf deploy/nginx/active/default.conf
ok "nginx will start without needing a certificate"

c "Building images and starting the stack (first build takes several minutes)"
docker compose up -d --build db migrate api proxy
ok "containers up"

c "Waiting for the API to answer"
for i in $(seq 1 60); do
  code=$(curl -s -o /dev/null -w '%{http_code}' -m 5 "http://127.0.0.1/tasks" || true)
  # 401 is success here: the endpoint requires auth, so the request reached the API.
  if [ "$code" = "401" ]; then ok "API responding through nginx (HTTP 401 as expected)"; break; fi
  [ "$i" = "60" ] && { docker compose logs --tail 40 api; no "API did not come up — logs above."; }
  sleep 3
done

# ── 5. TLS ───────────────────────────────────────────────────────────────────
c "Checking DNS for $API_DOMAIN"
RESOLVED=$(getent hosts "$API_DOMAIN" | awk '{print $1}' | head -1 || true)
PUBLIC_IP=$(curl -s -m 10 https://api.ipify.org || true)
if [ -z "$RESOLVED" ]; then
  printf '    \033[1;33mNo DNS record yet.\033[0m Point %s at %s, then re-run this script.\n' "$API_DOMAIN" "${PUBLIC_IP:-this server}"
  printf '    The backend is already serving over plain HTTP in the meantime.\n'
  exit 0
fi
ok "$API_DOMAIN resolves to $RESOLVED (this server: ${PUBLIC_IP:-unknown})"
[ "$RESOLVED" = "$PUBLIC_IP" ] || printf '    \033[1;33mWarning:\033[0m DNS points elsewhere; issuance will fail unless traffic reaches here.\n'

if [ -f "deploy/letsencrypt/live/$API_DOMAIN/fullchain.pem" ]; then
  c "Certificate already present"
else
  [ -n "$CERT_EMAIL" ] || no "Set CERT_EMAIL first, e.g.  sudo CERT_EMAIL=you@example.com bash deploy/deploy.sh
    Issuing a certificate accepts the Let's Encrypt Subscriber Agreement
    (https://letsencrypt.org/repository/) in your name — that is why this is not defaulted."
  c "Requesting a certificate for $API_DOMAIN"
  docker run --rm \
    -v "$PROJECT_DIR/deploy/letsencrypt:/etc/letsencrypt" \
    -v "$PROJECT_DIR/deploy/certbot-webroot:/var/www/certbot" \
    certbot/certbot certonly --webroot -w /var/www/certbot \
      -d "$API_DOMAIN" --email "$CERT_EMAIL" --agree-tos --no-eff-email --non-interactive \
    || no "Issuance failed — check that $API_DOMAIN reaches this server on port 80."
  ok "certificate issued"
fi

c "Switching nginx to HTTPS"
# api-tls.conf serves only the API vhost; add spa-tls.conf later, once the frontends
# are built with:  docker compose --profile frontend up --build web
cp deploy/nginx/available/api-tls.conf deploy/nginx/active/default.conf
docker compose exec -T proxy nginx -t || no "nginx rejected the TLS config; bootstrap config is still active."
docker compose restart proxy
ok "HTTPS active"

# ── 6. Verify ────────────────────────────────────────────────────────────────
c "Verifying"
sleep 3
HTTPS_CODE=$(curl -s -o /dev/null -w '%{http_code}' -m 10 "https://$API_DOMAIN/tasks" || true)
[ "$HTTPS_CODE" = "401" ] && ok "https://$API_DOMAIN answers (401 = up, auth required)" \
                          || printf '    \033[1;33mUnexpected status %s\033[0m — check: docker compose logs proxy api\n' "$HTTPS_CODE"

REDIR=$(curl -s -o /dev/null -w '%{http_code}' -m 10 "http://$API_DOMAIN/tasks" || true)
[ "$REDIR" = "301" ] && ok "HTTP redirects to HTTPS" || printf '    HTTP returned %s\n' "$REDIR"

# ── 7. Scheduled jobs ────────────────────────────────────────────────────────
c "Scheduling renewal and backups"
install -m 0755 deploy/backup.sh /usr/local/bin/taskup-backup
cat > /etc/cron.d/taskup <<CRON
# Certificate renewal (Let's Encrypt certs last 90 days; renew is a no-op until due)
17 4 * * * root docker run --rm -v $PROJECT_DIR/deploy/letsencrypt:/etc/letsencrypt -v $PROJECT_DIR/deploy/certbot-webroot:/var/www/certbot certbot/certbot renew --webroot -w /var/www/certbot --quiet && docker compose -f $PROJECT_DIR/docker-compose.yml restart proxy
# Nightly database + uploads backup, kept 14 days
15 3 * * * root PROJECT_DIR=$PROJECT_DIR /usr/local/bin/taskup-backup >> /var/log/taskup-backup.log 2>&1
CRON
ok "cron installed"

c "Done"
cat <<DONE
    API:            https://$API_DOMAIN
    Logs:           docker compose -f $PROJECT_DIR/docker-compose.yml logs -f api
    Status:         docker compose -f $PROJECT_DIR/docker-compose.yml ps

    Two things still need you:
      1. Back up $PROJECT_DIR/.env off this server. Without ENCRYPTION_KEY_V1 the
         data is unrecoverable — no support path, no reset.
      2. OTP codes are still only written to the API log; no SMS provider is wired,
         so no real user can register yet. Read one with:
           docker compose -f $PROJECT_DIR/docker-compose.yml logs api | grep 'SMS ->'
DONE
