"""
Generate duanfu main poster v2 — 1:1 square, extreme experimental.
"""
import requests, json, os, sys

API_URL = "https://www.hotapi.top/v1/images/generations"
API_KEY = os.environ.get('GPT_IMAGE_API_KEY', '')
if not API_KEY:
    sys.exit('ERROR: GPT_IMAGE_API_KEY environment variable is not set.')
OUTPUT_DIR = "public/images"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "端浮-主海报-v2.png")

PROMPT = """An extreme experimental graphic art poster, 1:1 square format,
archival off-white paper (#F0EDE5) with visible tooth and fiber.

ART STYLE:
Postmodern Swiss deconstruction. RISOgraph misregistration. Glitch typography.
Brutalist concrete poetry. Wolfgang Weingart meets Peter Saville meets
experimental Japanese flyer design. NOT minimalist. NOT clean. NOT safe.

DOMINANT ELEMENT:
A massive black rectangular void occupies the upper-left 40% of the composition —
dense ink coverage with rough torn-paper edges on two sides,
as if a photograph was ripped away leaving only the black backing sheet.

CUTTING THROUGH THE VOID:
Three thin luminous lines — one terracotta (#B85C38), one deep violet (#2E1065),
one steel blue (#5C8DB0) — slice diagonally across the black void at a 38-degree angle,
emerging from darkness into the empty off-white space below.
The lines are razor-sharp, 1px weight, perfectly straight, like laser beams.

TYPOGRAPHY TREATMENT:
The word "DUANFU" appears TWICE in radically different states:
- Once in the black void: bold expanded sans-serif, letterspaced to breaking point,
  printed in gloss black ink so it only catches light at certain angles — nearly invisible,
  a secret hidden in darkness.
- Once in the open space below: fractured vertically, each letter shifted up/down
  by 2-4mm from baseline alignment, as if the word is seismically shaking apart.
  Only the letterforms D, U, A, N, F, U are visible — no Chinese, no subtitle.

SCANLINE FIELD:
The bottom third of the composition is a dense field of horizontal scanlines
at three different frequencies stacked vertically — fast/thin, medium, slow/thick —
creating a rhythmic texture like corrupted broadcast test patterns.
A single scanline breaks into vertical noise halfway across, glitching into static.

REGISTRATION ERROR:
The entire black void block is offset 4mm to the right of where it should be,
leaving a raw unpainted 4mm strip along its left edge — a deliberate RISO misregistration.
One of the colored diagonal lines (the violet one) has a faint ghost duplicate 2mm above it,
printed in 30% opacity, as if the paper shifted during a second press run.

EDGE TREATMENT:
A 1px pure black hairline border frames the entire square, but it breaks open
at the bottom-right corner — a 6mm gap — as if the frame could not contain the composition.
The border resumes after the gap, slightly misaligned by 1px.

MATERIAL TEXTURE:
Visible paper grain. Slight ink starvation in the black void — not perfectly solid,
patches where the paper shows through. The colored lines have the slight irregular
density of actual RISO ink. One faint fingerprint smudge near the bottom edge.

Color palette ONLY: #0D0D0D black, #F0EDE5 off-white, #B85C38 terracotta,
#2E1065 deep violet, #5C8DB0 steel blue.

No photorealistic images. No 3D renders. No gradients. No shadows.
No rounded corners. No centered symmetrical layouts.
Pure experimental graphic design as fine art.
Gallery exhibition poster. Museum collection quality. 330dpi."""

print("Generating duanfu main poster v2 (2048x2048)...")
print(f"Prompt: {len(PROMPT)} chars")

resp = requests.post(
    API_URL,
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-image-2",
        "prompt": PROMPT,
        "size": "2048x2048",
        "n": 1,
        "response_format": "url"
    },
    timeout=300
)

print(f"Status: {resp.status_code}")

if resp.status_code == 200:
    data = resp.json()
    if "data" in data and len(data["data"]) > 0:
        img_url = data["data"][0].get("url", "")
        print(f"URL: {img_url}")

        img_resp = requests.get(img_url, timeout=60)
        if img_resp.status_code == 200:
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            with open(OUTPUT_FILE, "wb") as f:
                f.write(img_resp.content)
            kb = len(img_resp.content) / 1024
            print(f"Saved: {OUTPUT_FILE} ({kb:.0f} KB)")
        else:
            print(f"Download failed: {img_resp.status_code}")
    else:
        print(f"No data in response")
else:
    print(f"Error {resp.status_code}: {resp.text[:500]}")
