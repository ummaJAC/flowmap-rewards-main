const fs = require("fs");
const path = require("path");
const Jimp = require("jimp");

const brainsDir = "C:/Users/knayx/.gemini/antigravity/brain/11a1aead-94fc-4627-b4a8-d47c359256cd";
const outDir = "C:/Users/knayx/Downloads/flowmap-rewards-main/flowmap-rewards-main/public/models";

// Ensure outDir exists
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function processModels() {
  const files = fs.readdirSync(brainsDir);
  
  // Find all generated model images
  const modelFiles = files.filter(f => f.startsWith("model_") && f.endsWith(".png"));
  
  console.log(`Found ${modelFiles.length} models to process...`);

  for (const filename of modelFiles) {
    try {
      // e.g. "model_restaurant_123456.png" -> "restaurant"
      const match = filename.match(/^model_([a-z]+)_/);
      if (!match) continue;
      
      const category = match[1];
      const imgPath = path.join(brainsDir, filename);
      const outPath = path.join(outDir, `${category}.png`);
      
      console.log(`Processing ${category} -> ${outPath}`);
      
      const image = await Jimp.read(imgPath);
      
      // Breadth-First Search (BFS) Flood Fill to remove background contiguously
      const width = image.bitmap.width;
      const height = image.bitmap.height;
      const visited = new Uint8Array(width * height);
      const queue = [{x: 0, y: 0}];
      
      // Mark starting pixel as visited
      visited[0] = 1;
      
      while (queue.length > 0) {
        const {x, y} = queue.shift();
        const idx = (width * y + x) << 2; // match image.getPixelIndex
        
        const r = image.bitmap.data[idx];
        const g = image.bitmap.data[idx+1];
        const b = image.bitmap.data[idx+2];
        
        // Background condition: brightness > 215 and grayscale (shadows/white)
        const isBright = r > 210 && g > 210 && b > 210;
        const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
        const isGrey = maxDiff < 30;
        
        if (isBright && isGrey) {
          // Erase the pixel
          image.bitmap.data[idx+3] = 0;
          
          // Add neighbors to queue if not visited
          const neighbors = [
            {nx: x+1, ny: y}, {nx: x-1, ny: y},
            {nx: x, ny: y+1}, {nx: x, ny: y-1}
          ];
          
          for (const n of neighbors) {
            if (n.nx >= 0 && n.nx < width && n.ny >= 0 && n.ny < height) {
              const vIdx = n.ny * width + n.nx;
              if (visited[vIdx] === 0) {
                visited[vIdx] = 1;
                queue.push(n);
              }
            }
          }
        }
      }
      
      await image.writeAsync(outPath);
      console.log(`✅ Saved ${category}.png`);
      
    } catch (e) {
      console.error(`❌ Failed on ${filename}:`, e.message);
    }
  }
}

processModels().then(() => console.log("Done."));
