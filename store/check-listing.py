"""Checks every store field in listing.md against the limit the console enforces.

The consoles count characters, not bytes, and silently truncate or refuse on paste —
easier to catch here than after a rejected submission. Run it after any edit:

    python3 store/check-listing.py
"""
import pathlib
import re
import sys
import unicodedata

LISTING = pathlib.Path(__file__).with_name("listing.md")

# (heading fragment, limit) — the fenced block that follows the heading is the field.
LIMITS = [
    ("الاسم · Name", 30),
    ("العنوان الفرعي · Subtitle", 30),
    ("الكلمات المفتاحية · Keywords", 100),
    ("النص الترويجي · Promotional Text", 170),
    ("الوصف · Description", 4000),
    ("اسم التطبيق · App name", 30),
    ("الوصف المختصر · Short description", 80),
    ("الوصف الكامل · Full description", 4000),
]


def fields(text: str) -> dict[str, str]:
    """Every '### heading' followed by the first fenced block under it."""
    found = {}
    for match in re.finditer(r"^### (.+?)$\n+```\n(.*?)\n```", text, re.S | re.M):
        found[match.group(1).strip()] = match.group(2)
    return found


def suspicious_scripts(value: str) -> set[str]:
    """Arabic text that picked up a stray glyph from another script — a typo that is
    almost invisible in a proportional font but very visible in a store listing."""
    out = set()
    for ch in value:
        if ch.isspace() or not ch.isalpha():
            continue
        name = unicodedata.name(ch, "")
        script = name.split(" ")[0]
        if script not in {"ARABIC", "LATIN", "DIGIT"}:
            out.add(f"{script}: {ch!r}")
    return out


def main() -> int:
    text = LISTING.read_text(encoding="utf-8")
    found = fields(text)
    failures = 0

    for fragment, limit in LIMITS:
        key = next((k for k in found if fragment in k), None)
        if key is None:
            print(f"MISSING  {fragment}")
            failures += 1
            continue
        value = found[key]
        length = len(value)
        status = "ok " if length <= limit else "OVER"
        if length > limit:
            failures += 1
        print(f"{status} {length:>5}/{limit:<5} {fragment}")

    # The whole file, not only the fenced fields: a stray glyph in a table is just as
    # wrong, and one did slip in (a Tamil "ர" inside an Arabic word) where it was
    # invisible at normal size.
    for odd in sorted(suspicious_scripts(text)):
        print(f"STRAY CHARACTER — {odd}")
        failures += 1

    # A keyword list with spaces wastes characters Apple counts.
    key = next((k for k in found if "Keywords" in k), None)
    if key and " " in found[key]:
        print("NOTE: Apple counts the spaces in the keyword list; drop them.")
        failures += 1

    print("\nall good" if failures == 0 else f"\n{failures} problem(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
