import os, glob
from PIL import Image

media_dir = r"C:\Users\segol\.gemini\antigravity-ide\brain\d32cfde2-2302-41d3-b6b7-fd39df1fed44\.tempmediaStorage"
files = glob.glob(os.path.join(media_dir, "*"))

for f in sorted(files, key=os.path.getmtime, reverse=True):
    try:
        with Image.open(f) as img:
            print(f"File: {os.path.basename(f)} - Size: {img.size} - Mtime: {os.path.getmtime(f)}")
    except Exception as e:
        pass
