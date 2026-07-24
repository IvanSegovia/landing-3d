import os
import shutil
from PIL import Image

src = r"C:\Users\segol\Desktop\endirecteespectacles\images\old_web_enhanced\discomovil_piramide.png"
dst_jpg = r"c:\Users\segol\Desktop\endirecteespectacles\images\old_web\discomovil_piramide.jpg"
dst_png = r"c:\Users\segol\Desktop\endirecteespectacles\images\old_web\discomovil_piramide.png"

if os.path.exists(src):
    with Image.open(src) as img:
        img = img.convert('RGB')
        img.save(dst_jpg, 'JPEG', quality=95)
        img.save(dst_png, 'PNG', optimize=True)
        print(f"Successfully copied enhanced image ({img.size}) from {src} to {dst_jpg} and {dst_png}")
else:
    print(f"Error: {src} does not exist!")
