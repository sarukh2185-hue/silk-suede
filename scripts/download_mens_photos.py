#!/usr/bin/env python3
"""Download gents clothing photos from Wikimedia Commons.

The site uses local JPG files under assets/. This script replaces those files
with external menswear/clothing images and normalizes them to the dimensions
expected by the layout.
"""

import io
import json
import os
import time
import urllib.parse
import urllib.request

from PIL import Image, ImageOps

ASSETS = os.path.join(os.path.dirname(__file__), "..", "assets")
COMMONS_API = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "LuxeLaneImageFetcher/1.0 (local website image replacement)"

# filename -> (search query, output size, search offset for variety)
IMAGES = {
    "hero.jpg": ("menswear fashion suit male model", (1600, 2000), 0),
    "product-01.jpg": ("men black blazer suit fashion", (900, 1125), 0),
    "product-02.jpg": ("men dress shirt fashion", (900, 1125), 1),
    "product-03.jpg": ("men sweater knitwear fashion", (900, 1125), 0),
    "product-04.jpg": ("men trousers pants fashion", (900, 1125), 1),
    "product-05.jpg": ("men linen shirt clothing", (900, 1125), 0),
    "product-06.jpg": ("men chino pants clothing", (900, 1125), 0),
    "product-07.jpg": ("men turtleneck sweater fashion", (900, 1125), 1),
    "product-08.jpg": ("men scarf accessory fashion", (900, 1125), 0),
    "product-09.jpg": ("men overcoat fashion", (900, 1125), 1),
    "product-10.jpg": ("men jacket fashion", (900, 1125), 0),
    "product-11.jpg": ("men jeans denim fashion", (900, 1125), 1),
    "product-12.jpg": ("men evening blazer suit", (900, 1125), 0),
    "product-13.jpg": ("men overshirt fashion", (900, 1125), 1),
    "product-14.jpg": ("men wool coat fashion", (900, 1125), 0),
    "product-15.jpg": ("men tie pocket square fashion", (900, 1125), 1),
    "product-016.jpg": ("men suede jacket fashion", (900, 1125), 0),
    "product-017.jpg": ("men coordinated outfit fashion", (900, 1125), 1),
    "product-018.jpg": ("men cardigan sweater fashion", (900, 1125), 0),
    "product-019.jpg": ("men velvet blazer fashion", (900, 1125), 1),
    "product-020.jpg": ("men beige linen shirt fashion", (900, 1125), 0),
    "product-021.jpg": ("men black overcoat fashion", (900, 1125), 1),
    "product-022.jpg": ("men knit polo shirt fashion", (900, 1125), 0),
    "product-023.jpg": ("men cargo pants fashion", (900, 1125), 1),
    "product-024.jpg": ("men black dress shirt fashion", (900, 1125), 0),
    "product-025.jpg": ("men beige trousers fashion", (900, 1125), 1),
    "product-026.jpg": ("men cable knit sweater fashion", (900, 1125), 0),
    "product-027.jpg": ("men satin shirt fashion", (900, 1125), 1),
    "product-028.jpg": ("men cream linen shirt fashion", (900, 1125), 0),
    "product-029.jpg": ("men double breasted coat fashion", (900, 1125), 1),
    "product-030.jpg": ("men linen shorts fashion", (900, 1125), 0),
    "product-031.jpg": ("men polo shirt fashion", (900, 1125), 1),
    "product-032.jpg": ("men puffer vest fashion", (900, 1125), 0),
    "product-033.jpg": ("men wide leg trousers fashion", (900, 1125), 1),
    "product-034.jpg": ("men formal shirt fashion", (900, 1125), 0),
    "product-035.jpg": ("men utility jacket fashion", (900, 1125), 1),
}


def request_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=25) as response:
        return json.loads(response.read())


def search_photo(query, offset, width):
    params = {
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrnamespace": "6",
        "gsrlimit": "12",
        "gsroffset": str(offset),
        "gsrsearch": f"filetype:bitmap {query}",
        "prop": "imageinfo",
        "iiprop": "url|mime|size",
        "iiurlwidth": str(width),
    }
    data = request_json(COMMONS_API + "?" + urllib.parse.urlencode(params))
    pages = data.get("query", {}).get("pages", {})
    for page in sorted(pages.values(), key=lambda item: item.get("index", 0)):
        info = (page.get("imageinfo") or [{}])[0]
        if info.get("mime") not in {"image/jpeg", "image/png"}:
            continue
        if info.get("width", 0) < 500 or info.get("height", 0) < 500:
            continue
        return info.get("thumburl") or info.get("url"), page.get("title", query)
    raise ValueError(f"No usable image for: {query}")


def download_image(url):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=35) as response:
        data = response.read()
    if len(data) < 8000:
        raise ValueError("Response too small to be a valid image")
    return Image.open(io.BytesIO(data)).convert("RGB")


def save_cover(image, dest, size):
    image = ImageOps.exif_transpose(image)
    image = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.35))
    image.save(dest, "JPEG", quality=88, optimize=True, progressive=True)


if __name__ == "__main__":
    os.makedirs(ASSETS, exist_ok=True)
    ok, fail = 0, 0
    for filename, (query, size, offset) in IMAGES.items():
        dest = os.path.join(ASSETS, filename)
        try:
            url, title = search_photo(query, offset, size[0])
            image = download_image(url)
            save_cover(image, dest, size)
            print(f"OK {filename} - {title}")
            ok += 1
            time.sleep(0.4)
        except Exception as exc:
            print(f"FAIL {filename}: {exc}")
            fail += 1
    print(f"\nDone: {ok} ok, {fail} failed")
