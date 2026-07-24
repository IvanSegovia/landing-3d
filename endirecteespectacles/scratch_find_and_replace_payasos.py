import os
import glob
from PIL import Image, ImageEnhance, ImageFilter
import shutil

media_dir = r"C:\Users\segol\.gemini\antigravity-ide\brain\d32cfde2-2302-41d3-b6b7-fd39df1fed44\.tempmediaStorage"
files = glob.glob(os.path.join(media_dir, "*"))

if not files:
    print("No files found in tempmediaStorage, checking brain root")
    media_dir = r"C:\Users\segol\.gemini\antigravity-ide\brain\d32cfde2-2302-41d3-b6b7-fd39df1fed44"
    files = glob.glob(os.path.join(media_dir, "*.png")) + glob.glob(os.path.join(media_dir, "*.jpg"))

# Sort by modification time descending
files.sort(key=os.path.getmtime, reverse=True)
print("Latest files:", files[:5])

latest_img_path = files[0]
print("Using latest image:", latest_img_path)

dst_path = r"c:\Users\segol\Desktop\endirecteespectacles\images\old_web\payasos.png"

# Process and enhance image with PIL
with Image.open(latest_img_path) as img:
    img = img.convert('RGB')
    
    # 1. Resize/Upscale if needed
    w, h = img.size
    if w < 1000:
        scale = 1000 / w
        new_w = 1000
        new_h = int(h * scale)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 2. Sharpen and contrast enhance
    img_sharpened = img.filter(ImageFilter.DETAIL)
    
    enhancer_contrast = ImageEnhance.Contrast(img_sharpened)
    img_contrast = enhancer_contrast.enhance(1.12)
    
    enhancer_color = ImageEnhance.Color(img_contrast)
    img_vibrant = enhancer_color.enhance(1.1)
    
    enhancer_sharpness = ImageEnhance.Sharpness(img_vibrant)
    img_final = enhancer_sharpness.enhance(1.2)
    
    img_final.save(dst_path, 'PNG', optimize=True)
    print("Successfully replaced and enhanced payasos.png at", dst_path, "Size:", img_final.size)
