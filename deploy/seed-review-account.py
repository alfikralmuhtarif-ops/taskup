"""Creates (or refills) the Apple review account on a running TaskUp API.

Apple's reviewer gets one phone number and one fixed code, so the account behind them
has to exist and has to have something in it — an empty app invites a "cannot locate
the features described" rejection.

Run it against production AFTER the fixed-code bypass is live:

    REVIEW_PHONE=+9665XXXXXXXX REVIEW_CODE=XXXXXX \
        python3 -I deploy/seed-review-account.py https://api.taskupapp.net

It signs in exactly the way the reviewer will (request OTP, verify with the fixed code),
so a successful run is itself proof the credentials work. It is idempotent: it skips any
project, task or note whose title is already there, so running it twice adds nothing.
"""
import json
import os
import ssl
import sys
import urllib.error
import urllib.request

# Supplied at run time, never committed: together these are a working sign-in for a
# live account for as long as the fixed-code bypass is switched on.
#
#   REVIEW_PHONE=+9665XXXXXXXX REVIEW_CODE=XXXXXX python3 -I deploy/seed-review-account.py
#
_PHONE_E164 = os.environ.get("REVIEW_PHONE", "")
CODE = os.environ.get("REVIEW_CODE", "")
NAME = os.environ.get("REVIEW_NAME", "Apple Review")
# /auth/otp/request wants the dialling code and the local part separately, and a country
# code is not always three digits — so it is split on the configured prefix rather than
# at a fixed offset.
COUNTRY = os.environ.get("REVIEW_COUNTRY", "+966")
if not _PHONE_E164.startswith("+") or not CODE:
    sys.exit("Set REVIEW_PHONE (E.164, e.g. +9665XXXXXXXX) and REVIEW_CODE in the environment.")
PHONE_LOCAL = _PHONE_E164[len(COUNTRY):] if _PHONE_E164.startswith(COUNTRY) else _PHONE_E164.lstrip("+")

BASE = sys.argv[1].rstrip("/") if len(sys.argv) > 1 else "https://api.taskupapp.net"
TOKEN = None


def _tls_context():
    """A context that can actually verify api.taskupapp.net.

    A python.org build on macOS ships no root certificates and does not read the system
    keychain, so the default context fails every HTTPS call with CERTIFICATE_VERIFY_FAILED
    until someone runs "Install Certificates.command". certifi, when present, carries the
    roots itself. Verification is never turned off: this script sends a credential.
    """
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


CONTEXT = _tls_context()


def call(method, path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{BASE}{path}", data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if TOKEN:
        req.add_header("Authorization", f"Bearer {TOKEN}")
    try:
        kwargs = {"timeout": 30}
        if BASE.startswith("https://"):
            kwargs["context"] = CONTEXT
        with urllib.request.urlopen(req, **kwargs) as r:
            raw = r.read().decode()
            return json.loads(raw) if raw.strip() else None
    except urllib.error.HTTPError as e:
        detail = e.read().decode()[:300]
        raise SystemExit(f"\n{method} {path} failed: HTTP {e.code}\n{detail}\n")
    except urllib.error.URLError as e:
        raise SystemExit(
            f"\n{method} {path} could not connect: {e.reason}\n"
            "If this is a TLS certificate error, run: python3 -m pip install certifi\n")


print(f"API: {BASE}")
print(f"signing in as {COUNTRY}{PHONE_LOCAL} with the fixed code")
req = call("POST", "/auth/otp/request", {"countryCode": COUNTRY, "phone": PHONE_LOCAL, "isLogin": False})
auth = call("POST", "/auth/otp/verify", {"requestId": req["requestId"], "code": CODE})
TOKEN = auth["accessToken"]
print(f"  signed in — {'new account' if auth['isNewUser'] else 'existing account'}")

me = call("GET", "/users/me")
if me.get("name") != NAME:
    me = call("PATCH", "/users/me", {"name": NAME})
print(f"  name: {me['name']}")

existing_projects = {p["name"]: p["id"] for p in call("GET", "/projects")}
PROJECTS = [
    ("Q1 Product Launch", "Everything that has to ship before the February release.", "#2185C7"),
    ("Office Move", "Relocating the team to the new floor.", "#10B981"),
]
project_ids = {}
for name, description, color in PROJECTS:
    if name in existing_projects:
        project_ids[name] = existing_projects[name]
        print(f"  project kept: {name}")
    else:
        created = call("POST", "/projects", {"name": name, "description": description, "color": color})
        project_ids[name] = created["id"]
        print(f"  project created: {name}")

# (title, project, final status) — a mix so the Home tabs, the project progress bars and
# the task report all have something real to show.
TASKS = [
    ("Review the checkout screens", "Q1 Product Launch", "InProgress"),
    ("Approve the launch copy", "Q1 Product Launch", "Done"),
    ("Ship the payment integration", "Q1 Product Launch", "NotStarted"),
    ("Finalise the pricing page", "Q1 Product Launch", "Done"),
    ("Book the moving company", "Office Move", "Done"),
    ("Order desks and chairs", "Office Move", "InProgress"),
    ("Hand back the old keys", "Office Move", "NotStarted"),
    ("Plan the welcome lunch", None, "NotStarted"),
]
existing_tasks = {t["title"] for t in call("GET", "/tasks")}
for title, project, status in TASKS:
    if title in existing_tasks:
        print(f"  task kept: {title}")
        continue
    body = {"title": title}
    if project:
        body["projectId"] = project_ids[project]
    task = call("POST", "/tasks", body)
    if status != "NotStarted":
        call("POST", f"/tasks/{task['id']}/status", {"status": status})
    call("POST", f"/tasks/{task['id']}/updates", {"text": f"Set to {status} while preparing the review account."})
    print(f"  task created: {title} ({status})")

NOTES = [
    ("Launch checklist", "Screens signed off, copy approved, payments still open."),
    ("Move-in notes", "Keys on the 3rd of the month; parking passes arrive the week before."),
]
existing_notes = {n["title"] for n in call("GET", "/notes")}
for title, content in NOTES:
    if title in existing_notes:
        print(f"  note kept: {title}")
        continue
    call("POST", "/notes", {"title": title, "content": content})
    print(f"  note created: {title}")

print("\nreview account ready")
print(f"  User name: {COUNTRY}{PHONE_LOCAL}")
print(f"  Password:  {CODE}")
