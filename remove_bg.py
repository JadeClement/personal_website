#!/usr/bin/env python3
"""Remove backgrounds from IMG_*.jpg icon images and save as PNG."""
import io
import os
from pathlib import Path

# Use project-local cache so rembg can write model files
BASE_DIR = Path(__file__).parent
os.environ.setdefault("U2NET_HOME", str(BASE_DIR / ".u2net_cache"))

from rembg import remove
from PIL import Image

IDENTITIES = ['student', 'developer', 'triathlete', 'creator', 'adventurer']

def main():
    for identity in IDENTITIES:
        input_path = BASE_DIR / f"IMG_{identity}.jpg"
        output_path = BASE_DIR / f"icon_{identity}.png"
        
        if not input_path.exists():
            print(f"Skipping {input_path} - not found")
            continue
            
        print(f"Processing {identity}...")
        with open(input_path, "rb") as f:
            input_data = f.read()
        
        output_data = remove(input_data)
        
        # Open as PIL to ensure proper PNG with transparency
        img = Image.open(io.BytesIO(output_data))
        img.save(output_path, "PNG")
        print(f"  Saved {output_path}")

if __name__ == "__main__":
    main()
