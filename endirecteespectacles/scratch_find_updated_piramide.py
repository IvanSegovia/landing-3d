import os, time, glob
from PIL import Image

search_dirs = [
    r"C:\Users\segol\.gemini\antigravity-ide\brain\d32cfde2-2302-41d3-b6b7-fd39df1fed44\.tempmediaStorage",
    r"C:\Users\segol\.gemini\antigravity-ide\brain\d32cfde2-2302-41d3-b6b7-fd39df1fed44",
    r"c:\Users\segol\Desktop\endirecteespectacles\images\old_web",
    r"c:\Users\segol\Desktop\endirecteespectacles\images",
    r"C:\Users\segol\AppData\Local\Temp"
]

now = time.time()
found_images = []

for sdir in search_dirs:
    if os.path.exists(sdir):
        for root, dirs, files in os.walk(sdir):
            for f in files:
                if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                    full_path = os.path.join(root, f)
                    try:
                        mtime = os.path.getmtime(full_path)
                        if now - mtime < 1800: # last 30 min
                            with Image.open(full_path) as img:
                                found_images.append((mtime, full_path, img.size))
                    except Exception:
                        pass

found_images.sort(key=lambda x: x[0], reverse=True)

print(f"Found {len(found_images)} recent images:")
for mtime, path, size in found_images[:20]:
    print(f"[{time.ctime(mtime)}] {size} -> {path}")
