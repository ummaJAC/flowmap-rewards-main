import os
import re
from rembg import remove
from PIL import Image

brains_dir = r"C:\Users\knayx\.gemini\antigravity\brain\11a1aead-94fc-4627-b4a8-d47c359256cd"
out_dir = r"C:\Users\knayx\Downloads\flowmap-rewards-main\flowmap-rewards-main\public\models"

os.makedirs(out_dir, exist_ok=True)

for filename in os.listdir(brains_dir):
    if filename.startswith("model_") and filename.endswith(".png"):
        match = re.match(r"^model_([a-z]+)_", filename)
        if match:
            category = match.group(1)
            inp_path = os.path.join(brains_dir, filename)
            out_path = os.path.join(out_dir, f"{category}.png")
            
            print(f"Processing {category} with rembg...")
            try:
                img = Image.open(inp_path)
                # Remove background with rembg
                output = remove(img)
                output.save(out_path)
                print(f"✅ Saved clean version of {category}.png")
            except Exception as e:
                print(f"❌ Failed to process {filename}: {e}")

print("All done!")
