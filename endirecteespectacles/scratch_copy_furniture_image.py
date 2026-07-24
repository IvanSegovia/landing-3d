import shutil

src = r"C:\Users\segol\.gemini\antigravity-ide\brain\d32cfde2-2302-41d3-b6b7-fd39df1fed44\sillas_plastico_mesas_plegables_1784732025546.png"
dst = r"c:\Users\segol\Desktop\endirecteespectacles\images\old_web\mesas_sillas.jpg"

shutil.copy(src, dst)
print("Copied plastic chairs and folding tables image to", dst)
