#!/usr/bin/env python3
"""Download real fashion photos for products 16-35 via Unsplash search."""

import json
import os
import time
import urllib.parse
import urllib.request

ASSETS = os.path.join(os.path.dirname(__file__), "..", "assets")

PRODUCTS = {
    16: "red wrap dress fashion",
    17: "teal jumpsuit women",
    18: "amber knit cardigan",
    19: "purple velvet blazer women",
    20: "yellow linen shirt fashion",
    21: "blue maxi dress ocean",
    22: "pink ruffle blouse top",
    23: "green cargo pants fashion",
    24: "black silk cami top",
    25: "peach pleated skirt",
    26: "ivory cable knit sweater",
    27: "copper satin slip dress",
    28: "jade green wrap blouse",
    29: "lilac tiered dress",
    30: "beige linen shorts women",
    31: "red knit polo shirt",
    32: "white puffer vest fashion",
    33: "brown wide leg trousers",
    34: "fuchsia pink silk top",
    35: "olive green utility jacket",
}


def search_photo(query):
    url = "https://unsplash.com/napi/search/photos?" + urllib.parse.urlencode({
        "query": query, "per_page": 1, "page": 1
    })
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.loads(r.read())
    results = data.get("results", [])
    if not results:
        raise ValueError(f"No results for: {query}")
    return results[0]["urls"]["regular"]


def download_url(url, dest):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    with open(dest, "wb") as f:
        f.write(data)
    return len(data)


if __name__ == "__main__":
    os.makedirs(ASSETS, exist_ok=True)
    for pid, query in PRODUCTS.items():
        dest = os.path.join(ASSETS, f"product-{pid:03d}.jpg")
        try:
            url = search_photo(query)
            size = download_url(url, dest)
            print(f"✓ product-{pid:03d}.jpg ({size//1024}KB) — {query}")
            time.sleep(0.4)
        except Exception as e:
            print(f"✗ product-{pid:03d}.jpg: {e}")
