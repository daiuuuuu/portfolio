"""Generate duanfu sub poster — 3:4 portrait, 1536x2048."""
import requests, os, sys

API_URL = "https://www.hotapi.top/v1/images/generations"
API_KEY = os.environ.get('GPT_IMAGE_API_KEY', '')
if not API_KEY:
    sys.exit('ERROR: GPT_IMAGE_API_KEY environment variable is not set.')
OUTPUT = "public/images/端浮-副海报.png"

PROMPT = """An extreme experimental graphic art poster, 3:4 portrait format,
pure off-white paper (#F0EDE5) with visible grain texture.

ART STYLE: postmodern Swiss deconstruction, RISOgraph print aesthetic,
architectural brutalism meets glitch typography. Companion piece to a
square-format poster featuring a torn black void with colored diagonal lines.

COMPOSITION — VERTICAL STACK:
The poster is divided into three horizontal bands of unequal height:

TOP BAND (50% of height): A dense field of black horizontal scanlines at
four different frequencies, stacked from thinnest (top) to thickest (bottom).
The scanlines do not run perfectly edge-to-edge — they fracture at irregular
intervals, creating vertical gaps where the off-white paper shows through.
These gaps form a subtle suggestion of architectural columns or data bars.

MIDDLE BAND (25%): Empty off-white space with a single element —
three thin 1px horizontal rules in terracotta (#B85C38), deep violet (#2E1065),
and steel blue (#5C8DB0), spaced 8px apart, running from the left edge
to approximately 70% across. They stop abruptly — not faded, just cut.
Below them, tiny monospaced text reading "SCHEMA" in barely-visible
4pt lettering, aligned to the end of the colored rules.

BOTTOM BAND (25%): A solid black rectangle occupying the bottom-left 40%
of this band's width, with a rough torn-paper top edge. From this black mass,
the same three colored lines from the middle band emerge upward at a 38-degree
diagonal — terracotta, violet, blue — but now they are luminous against the black,
like fiber optic filaments escaping a dark substrate. A single deep violet
(#2E1065) square (approximately 6% of poster width) sits isolated in the
bottom-right corner, perfectly aligned to the bottom edge.

The entire poster is framed by a 1px black hairline border that deliberately
breaks open at the top-left corner — a 4mm gap — then resumes.

No photorealistic images. No 3D. No gradients. No shadows. No rounded corners.
Color palette ONLY: #0D0D0D, #F0EDE5, #B85C38, #2E1065, #5C8DB0.
Museum exhibition poster. 330dpi."""

print("Generating duanfu sub poster (1536x2048)...")
resp = requests.post(
    API_URL,
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={"model": "gpt-image-2", "prompt": PROMPT, "size": "1536x2048", "n": 1, "response_format": "url"},
    timeout=300
)

print(f"Status: {resp.status_code}")
if resp.status_code == 200:
    data = resp.json()
    if "data" in data and len(data["data"]) > 0:
        url = data["data"][0].get("url", "")
        print(f"URL: {url}")
        img = requests.get(url, timeout=60)
        if img.status_code == 200:
            os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
            with open(OUTPUT, "wb") as f:
                f.write(img.content)
            print(f"Saved: {OUTPUT} ({len(img.content)/1024:.0f} KB)")
        else:
            print(f"Download failed: {img.status_code}")
else:
    print(f"Error: {resp.text[:500]}")
