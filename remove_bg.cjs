const Jimp = require('jimp');
const fs = require('fs');

async function removeWhiteBg() {
  try {
    const inputPath = 'public/logo.png';
    const outputPath = 'public/logo_transparent.png';
    
    // Check if jimp loaded the image
    const image = await Jimp.read(inputPath);
    
    // Loop through all pixels
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      // Get RGB values
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // If the pixel is white or almost white (threshold > 240)
      if (r > 240 && g > 240 && b > 240) {
        // Set alpha channel to 0 (transparent)
        this.bitmap.data[idx + 3] = 0;
      }
    });

    await image.writeAsync(outputPath);
    console.log('Successfully created transparent logo at', outputPath);
    
    // Replace the original with the transparent one and dist copy
    fs.copyFileSync(outputPath, inputPath);
    fs.copyFileSync(outputPath, 'dist/logo.png');
    console.log('Copied to public/logo.png and dist/logo.png');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

removeWhiteBg();
