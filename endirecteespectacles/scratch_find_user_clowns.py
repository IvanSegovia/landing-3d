import os, time
from PIL import Image

search_dirs = [
    r"C:\Users\segol\AppData\Local\Temp",
    r"C:\Users\segol\.gemini",
    r"C:\Users\segol\Desktop\endirecteespectacles"
]

now = time.time()
found_images = []

for sdir in search_dirs:
    for root, dirs, files in os.walk(sdir):
        for f in files:
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                full_path = os.path.join(root, f)
                try:
                    mtime = os.path.getmtime(full_path)
                    # Check files modified in the last 15 minutes
                    if now - mtime < 900:
                        with Image.open(full_path) as img:
                            found_images.append((mtime, full_path, img.size))
                except Exception as e:
                    pass

found_images.sort(key=lambda x: x[0], reverse=True)

print(f"Found {len(found_images)} recent images:")
for mtime, path, size in found_images[:15]:
    print(f"[{time.ctime(mtime)}] {size} -> {path}")
