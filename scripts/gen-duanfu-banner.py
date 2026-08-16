"""Generate duanfu philosophy banner — ultra-wide, unconventional."""
import requests, os, sys

API_URL = "https://www.hotapi.top/v1/images/generations"
API_KEY = os.environ.get('GPT_IMAGE_API_KEY', '')
if not API_KEY:
    sys.exit('ERROR: GPT_IMAGE_API_KEY environment variable is not set.')
OUTPUT = "public/images/端浮-横幅海报.png"

PROMPT = """An extreme ultra-wide panoramic graphic art poster,
very wide and short — like a architectural frieze or a cinema banner.

Pure off-white paper (#F0EDE5) background with subtle grain.

CONCEPT: "STRUCTURE IS BRAND" visualized as a continuous horizontal rhythm —
order as a visual frequency, systems as a waveform.

COMPOSITION — LEFT TO RIGHT:
The poster reads like a timeline or a musical score, left to right:

LEFT EDGE: A single solid black (#0D0D0D) vertical bar, 8px wide,
running the full height. A starting marker.

NEXT ZONE (20% of width): A dense field of vertical black rules at increasing
frequency — starting with wide gaps, progressively compressing toward the center.
Like a spectrogram building toward a climax. The rules are precise 1px lines,
geometric, architectural.

CENTER ZONE (30% of width): The compression reaches maximum density then
releases into a single massive black rectangular block — spanning 15% of the
total poster width, solid black, full height. Inside this black mass,
three thin luminous horizontal lines cut through at equal vertical spacing:
terracotta (#B85C38) at top, steel blue (#5C8DB0) at middle,
deep violet (#2E1065) at bottom. They glow faintly against the black —
signal cutting through noise.

RIGHT ZONE (35% of width): The black block ends abruptly at a 1px vertical rule.
Beyond it, the vertical rules resume but now DECOMPRESSING — starting dense,
gradually spacing out, mirroring the left zone in reverse. The rhythm unwinds
back to silence. The final 5% of the right edge is empty off-white paper.

TOP EDGE MARKER: A continuous 1px black horizontal rule runs the full width
at exactly 15% from the top. It breaks only once — directly above the
central black block, where it is replaced by a small violet (#2E1065) dot.

BOTTOM TEXT: At the extreme bottom-right, aligned to the edge, tiny monospaced
lettering reads "STRUCTURE IS BRAND" in barely-visible 6pt weight,
like a blueprint annotation.

The entire composition is contained — no border this time, just the image
floating in space. The feeling: a seismograph of order. A blueprint of rhythm.
A frieze on a modernist building.

No photorealistic images. No 3D. No gradients. No shadows. No rounded corners.
Color palette ONLY: #0D0D0D, #F0EDE5, #B85C38, #2E1065, #5C8DB0.
Architectural gallery installation. 330dpi."""

print("Generating duanfu banner poster...")
resp = requests.post(
    API_URL,
    headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
    json={"model": "gpt-image-2", "prompt": PROMPT, "size": "2048x512", "n": 1, "response_format": "url"},
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
