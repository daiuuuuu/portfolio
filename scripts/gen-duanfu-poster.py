"""
Generate the duanfu main poster via hotapi.top (gpt-image-2).
"""
import requests, json, time, sys, os

API_URL = "https://www.hotapi.top/v1/images/generations"
API_KEY = os.environ.get('GPT_IMAGE_API_KEY', '')
if not API_KEY:
    sys.exit('ERROR: GPT_IMAGE_API_KEY environment variable is not set.')
OUTPUT_DIR = "public/images"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "端浮-主海报-raw.png")

PROMPT = """An extreme avant-garde experimental art poster, 16:10 landscape aspect ratio,
off-white textured paper background (#F0EDE5) with subtle grain and slight ink-bleed imperfections.

Style references: Wolfgang Weingart's typographic experiments, RISOgraph print aesthetic,
deconstructed Swiss design, brutalist graphics, Cranbrook Academy postmodernism,
David Carson's Ray Gun magazine fragmentation, glitch art, CRT monitor corruption.

COMPOSITION:
The letter "D" — representing both "DUANFU" and "DESIGN" — is fractured into four jagged
geometric shards that drift apart like tectonic plates across the composition.
Shard 1 (upper left, 35% of letter): pure black (#0D0D0D), crisp sharp edges.
Shard 2 (upper right, 25%): terracotta orange (#B85C38), slightly rotated clockwise 8 degrees.
Shard 3 (lower right, 25%): deep violet (#2E1065), offset downward as if sinking.
Shard 4 (lower left, 15%): steel blue (#5C8DB0), intentionally misaligned by a visible gap.

BACKGROUND:
Horizontal scanlines at varying density cover the entire background — some bands compressed
into near-solid black bars (3-5 scanlines merged), others stretched to thin whispers,
creating a rhythm like corrupted CRT display data. The scanlines are not uniform:
they glitch, break mid-line, and restart at different frequencies.

A single razor-thin 1px pure black vertical rule bisects the composition off-center
at approximately 62% from the left edge. It is perfectly straight and unbroken —
the ONLY element obeying grid discipline in an otherwise chaotic composition.

MICRO ELEMENTS:
Tiny deconstructed Chinese character radicals (扌, 孚, 米, 女) float at the composition edges
at barely-legible 3-4pt scale, as if the poster is mid-render and the typesetting engine
is still processing. Some radicals appear halved or misregistered by 2-3mm offset.

TYPOGRAPHY:
"DUANFU TECH" in JetBrains Mono style monospaced type at the very bottom right corner,
small (approximately 3% of poster height), pushed against the edge,
understated as if an afterthought rather than a title.

TEXTURE & MATERIALITY:
RISO-print layered aesthetic — one color layer deliberately offset by 2-3mm from registration,
creating a faint ghost edge on the colored shards. Slight paper fiber texture visible.
Ink density varies across the scanlines: some are crisp, others slightly starved.
No gradients, no 3D rendering, no photorealistic elements, no shadows, no rounded corners.

Color palette (only these colors): #0D0D0D black, #F0EDE5 off-white, #B85C38 terracotta,
#2E1065 deep violet, #5C8DB0 steel blue.

Contemporary experimental graphic design, museum exhibition poster quality,
330dpi print resolution, no text other than what is specified."""

print("Generating duanfu main poster...")
print(f"Prompt length: {len(PROMPT)} chars")
print("-" * 60)

resp = requests.post(
    API_URL,
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "gpt-image-2",
        "prompt": PROMPT,
        "size": "2048x1280",
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
        revised = data["data"][0].get("revised_prompt", "")
        print(f"Image URL: {img_url}")
        print(f"Revised prompt length: {len(revised)} chars")

        # Download
        print("Downloading image...")
        img_resp = requests.get(img_url, timeout=60)
        if img_resp.status_code == 200:
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            with open(OUTPUT_FILE, "wb") as f:
                f.write(img_resp.content)
            size_kb = len(img_resp.content) / 1024
            print(f"Saved: {OUTPUT_FILE} ({size_kb:.0f} KB)")
        else:
            print(f"Download failed: {img_resp.status_code}")
    else:
        print(f"No image data. Response keys: {list(data.keys())}")
        if "data" in data:
            print(f"data type: {type(data['data'])}, len: {len(data['data'])}")
else:
    print(f"Error: {resp.text[:800]}")
