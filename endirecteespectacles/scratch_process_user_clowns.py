import os
from PIL import Image, ImageEnhance, ImageFilter

src = r"C:\Users\segol\.gemini\antigravity-ide\brain\d32cfde2-2302-41d3-b6b7-fd39df1fed44\media__1784732870428.jpg"
dst = r"c:\Users\segol\Desktop\endirecteespectacles\images\old_web\payasos.png"

with Image.open(src) as img:
    img = img.convert('RGB')
    
    # 1. Upscale to 1200px width for high quality display
    w, h = img.size
    scale = 1200 / w
    new_w = 1200
    new_h = int(h * scale)
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    # 2. Sharpening and detail boost
    img_sharpened = img.filter(ImageFilter.DETAIL)
    
    enhancer_contrast = ImageEnhance.Contrast(img_sharpened)
    img_contrast = enhancer_contrast.enhance(1.12)
    
    enhancer_color = ImageEnhance.Color(img_contrast)
    img_vibrant = enhancer_color.enhance(1.1)
    
    enhancer_sharpness = ImageEnhance.Sharpness(img_vibrant)
    img_final = enhancer_sharpness.enhance(1.25)
    
    img_final.save(dst, 'PNG', optimize=True)
    print(f"Successfully processed user clown photo {src} -> {dst} ({img_final.size})")
