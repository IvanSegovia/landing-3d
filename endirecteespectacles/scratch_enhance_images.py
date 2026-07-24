import os
from PIL import Image, ImageEnhance, ImageFilter

input_dir = 'images/old_web'
output_dir = 'images/old_web_enhanced'
os.makedirs(output_dir, exist_ok=True)

for fname in os.listdir(input_dir):
    if fname.endswith(('.jpg', '.png', '.jpeg')):
        in_path = os.path.join(input_dir, fname)
        out_path = os.path.join(output_dir, fname)
        try:
            with Image.open(in_path) as img:
                img = img.convert('RGB')
                
                # 1. Upscale if small (minimum width 800px)
                w, h = img.size
                if w < 800:
                    scale = 800 / w
                    new_w = 800
                    new_h = int(h * scale)
                    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
                # 2. Apply Sharpen filter to recover edge details
                img_sharpened = img.filter(ImageFilter.DETAIL)
                
                # 3. Enhance Contrast & Color Saturation slightly
                enhancer_contrast = ImageEnhance.Contrast(img_sharpened)
                img_contrast = enhancer_contrast.enhance(1.15)
                
                enhancer_color = ImageEnhance.Color(img_contrast)
                img_vibrant = enhancer_color.enhance(1.12)
                
                enhancer_sharpness = ImageEnhance.Sharpness(img_vibrant)
                img_final = enhancer_sharpness.enhance(1.2)
                
                img_final.save(out_path, 'JPEG', quality=92, optimize=True)
                print(f"Enhanced {fname} -> {img_final.size}")
        except Exception as e:
            print(f"Failed {fname}: {e}")
