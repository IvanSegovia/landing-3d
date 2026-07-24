import os, glob
from PIL import Image

folder = r"c:\Users\segol\Desktop\endirecteespectacles\images\old_web"
files = glob.glob(os.path.join(folder, "*"))

print(f"Files in {folder}:")
for f in files:
    try:
        with Image.open(f) as img:
            print(f"- {os.path.basename(f)}: size {img.size}")
    except Exception as e:
        print(f"- {os.path.basename(f)}: not image ({e})")
