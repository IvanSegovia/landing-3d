import os
import urllib.request
import re

os.makedirs('images/old_web', exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
}

image_urls = set()

for fname in os.listdir('scraped_site'):
    path = os.path.join('scraped_site', fname)
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        # Find all images references in src="..." or src='...'
        found = re.findall(r'images/[a-zA-Z0-9_\-]+\.(?:jpg|png|gif|jpeg)', content, re.IGNORECASE)
        for img in found:
            url = 'https://endirecteespectacles.com/' + img
            image_urls.add(url)

print('Found image URLs:', image_urls)

downloaded = []
for url in sorted(image_urls):
    fname = url.split('/')[-1]
    dest = os.path.join('images/old_web', fname)
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            with open(dest, 'wb') as f:
                f.write(data)
            print(f'Successfully downloaded {fname} ({len(data)} bytes)')
            downloaded.append(fname)
    except Exception as e:
        print(f'Failed downloading {url}: {e}')

print('Downloaded total:', len(downloaded))
