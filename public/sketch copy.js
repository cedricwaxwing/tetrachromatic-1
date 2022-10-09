// GLOBALS

let seed = [
  fxrand(),
  fxrand(),
  fxrand(),
  fxrand(),
]
let images = [];
let image_seeds = [];
let noise, imageSize;
let palette_seed, colors;
let ditherOp, ditherOpIndex, errorType, errorMappedVals;
let begin, end, renderTime;
let errorTypes = 5;
let ditherOps = [
  "*",
  "/",
  "<<",
  ">>",
  "&&",
  "||"
];
const canvasSize = 1500;

function preload() {
  begin = millis();
  // ----  LOAD ASSETS ---- //
  
  // ----  SEEDS ---- //

  // Palette
  palette_seed = int(map(seed[1], 0, 1, 0, palettes.length-1))
  colors = palettes[palette_seed].colors

  // Images
  imageSize = map(seed[0], 0, 1, canvasSize, canvasSize*1.4)
  const assetAmounts = [
    12,
    18,
    18,
    2,
  ]
  assetAmounts.map((amount, i) => {
    let image_seed = int(map(seed[i], 0, 1, 1, assetAmounts[i]))
    image_seeds.push(image_seed);
    if(i < 3) {
      images[i] = loadImage(`gan/${i+1}/${image_seed}.jpeg`)
    } else {
      noise = loadImage(`noise/${int(map(seed[3], 0, 1, 1, assetAmounts[3]))}.png`)
    }
  })

  // Dither
  errorType = round(map(seed[0], 0, 1, 0, errorTypes-1));
  errorMappedVals = {
    "set-1":  map(seed[0], 0, 1, 1, 100),
    "3-1": map(seed[1], 0, 1, 0, 3),
    "3-2": map(seed[2], 0, 1, 16, 48),
  }

  const fxhashFeatures = {
    "Palette": palettes[palette_seed].name,
    "Dither": `•${errorType}• •${ditherOps[int(map(seed[0], 0, 1, 0, ditherOps.length))]}• •${ditherOps[int(map(seed[1], 0, 1, 0, ditherOps.length))]}• •${ditherOps[int(map(seed[2], 0, 1, 0, ditherOps.length))]}•`,
    "Bio": image_seeds[0],
    "Glyptik": image_seeds[1],
    "Ortho": image_seeds[2],
  }
  window.$fxhashFeatures = fxhashFeatures;

  console.log(fxhashFeatures)
  begin = millis();
}

function setup() {
  pixelDensity(2);
  colorMode(RGB)
  background("white");
  createCanvas(canvasSize, canvasSize);

  images.map((img, i) => {
    if(i > 0) {
      ditherOpIndex = ditherOps[int(map(seed[i], 0, 1, 0, ditherOps.length))]
      dither(img, 1, round(map(fxrand(), 0, 1, 0, errorTypes)));
    }
    addContrast(230, img)
    if(i <= images.length-2) {
      gradientMap(colors, img);
    }
    if(i > 0) {
      blendMode(i < images.length % 2 ? EXCLUSION : OVERLAY);
    }
    tint(255, map(i, 0, images.length, 120, 180));
    image(img, 0, 0, imageSize, imageSize);
  })
  
  addContrast(100);
  addNoise();
  document.body.classList.add("loaded");
  document.querySelector(".logo-wrapper").classList.add("fadeOut");
  document.querySelector(".p5Canvas").classList.add("fadeIn");
  end = millis();
  renderTime = (end - begin) / 1000;
  console.log(renderTime)
  fxpreview();
}

function imageIndex(img, x, y) {
  return 4 * (x + y * img.width);
}

function getColorAtindex(img, x, y) {
  let idx = imageIndex(img, x, y);
  let pix = img.pixels;
  let red = pix[idx];
  let green = pix[idx + 1];
  let blue = pix[idx + 2];
  let alpha = pix[idx + 3];
  return color(red, green, blue, alpha);
}

function setColorAtIndex(img, x, y, clr) {
  let idx = imageIndex(img, x, y);

  let pix = img.pixels;
  pix[idx] = red(clr);
  pix[idx + 1] = green(clr);
  pix[idx + 2] = blue(clr);
  pix[idx + 3] = alpha(clr);
}

// Finds the closest step for a given value
// The step 0 is always included, so the number of steps
// is actually steps + 1
function closestStep(max, steps, value) {
  return round(steps * value / 255) * floor(255 / steps);
}

function dither(img, steps, errType) {
  img.loadPixels();

  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      let clr = getColorAtindex(img, x, y);
      let oldR = red(clr);
      let oldG = green(clr);
      let oldB = blue(clr);
      let newR = closestStep(255, steps, oldR);
      let newG = closestStep(255, steps, oldG);
      let newB = closestStep(255, steps, oldB);

      let newClr = color(newR, newG, newB);
      setColorAtIndex(img, x, y, newClr);

      let errR = oldR - newR;
      let errG = oldG - newG;
      let errB = oldB - newB;

      distributeError(img, x, y, errR, errG, errB, errType);
    }
  }

  img.updatePixels();
}

function distributeError(img, x, y, errR, errG, errB, errType) {
  if (errType) {
    errorType = errType;
  }

  switch (errorType) {
    case 0:
      addError(img, 7 / 16.0, x + 1, y, errR, errG, errB);
      addError(img, 3 / 16.0, x - 1, y + 1, errR, errG, errB);
      addError(img, 5 / 16.0, x, y + 1, errR, errG, errB);
      addError(img, 1 / 16.0, x + 1, y + 1, errR, errG, errB);
    case 1: 
      addError(img, 16.0, x + 1, y, errR, errG, errB);
      addError(img, 17.0, x - 1, y + 1, errR, errG, errB);
      addError(img, 13.0 , x, y + 1, errR, errG, errB);
      addError(img, 0.1 / 16.0, x + 1, y + 1, errR, errG, errB);
    case 2: 
      addError(img, 1 / 16.0, x + 145, y, errR, errG, errB);
      addError(img, randOperation(7, 16), x - 1, y + 1, errR, errG, errB);
      addError(img, 22.0 , x, y + 1, errR, errG, errB);
      addError(img, 0.1 / 16.0, x + 1, y + 1, errR, errG, errB);
    case 3: 
      addError(img, 1 / 16.0, x, y + errorMappedVals["3-1"], errR, errG, errB);
      addError(img, 7 / 16.0, x - 1, y + 145, errR, errG, errB);
      addError(img, randOperation(errorMappedVals["3-2"], 16) , x, y + 1, errR, errG, errB);
      addError(img, 0.1 / 16.0, x + 1, y + 3, errR, errG, errB);
    case 4:
      addError(img, 6, x + (x < errorMappedVals["3-1"] ? randOperation(6,y/8) : randOperation(24,y/5)), y, errR, errG, errB);
      addError(img, 3 / 16.0, x - 1, y + 1, errR, errG, errB);
      addError(img, -5, x, y + (y > errorMappedVals["3-2"] ? 120+x/3 : errorMappedVals["3-2"]+x/50), errR, errG, errB);
      addError(img, 1 / 16.0, x + 1, y + 1, errR, errG, errB);
  }
}

function addError(img, factor, x, y, errR, errG, errB) {
  if (x < 0 || x >= img.width || y < 0 || y >= img.height) return;
  let clr = getColorAtindex(img, x, y);
  let r = red(clr);
  let g = green(clr);
  let b = blue(clr);
  r += -1.5;
  b += .5;
  g += 3;
  clr.setRed(r + errR * factor);
  clr.setGreen(g + errG * factor);
  clr.setBlue(b + errB * factor);

  setColorAtIndex(img, x, y, clr);
}

function randOperation(a, b) {
  switch (ditherOpIndex) {
    case 0: return ditherOp = a << b;
    case 1: return ditherOp = a >> b;
    case 2: return ditherOp = a / b;
    case 3: return ditherOp = a * b;
    case 4: return ditherOp = a - b;
    case 5: return ditherOp = a + b;
    case 6: return ditherOp = a && b;
  }
}

function gradientMap(palette, img) {
  if(!img) {
    img = get();
    image(get(), 0, 0);
  }
  img.loadPixels();
  for (let x = 0; x < img.width; x +=1) {
    for (let y = 0; y < img.height * 4; y +=1) {
      let index = (x + y * img.width) * 4;

      
      let b = (img.pixels[index + 0] + img.pixels[index + 1] + img.pixels[index + 2]) / 3;
      
      let nR = palette[int(map(b, 0, 255, 0, palette.length-1))][0];
      let nG = palette[int(map(b, 0, 255, 0, palette.length-1))][1];
      let nB = palette[int(map(b, 0, 255, 0, palette.length-1))][2];
      
      img.pixels[index + 0] = nR;
      img.pixels[index + 1] = nG;
      img.pixels[index + 2] = nB;
      
    }
  }
 img.updatePixels();
}

function addContrast(contrast, img) {
  if(!img) {
    img = get();
  }
  img.loadPixels();
  for (let x = 0; x < img.width; x +=1) {
    for (let y = 0; y < img.height; y +=1) {
      let c = img.get(x,y);
      let factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
      let nR = constrain(factor*(red(c)-128) + 128, 0, 255);
      let nG = constrain(factor*(green(c)-128) + 128, 0, 255);
      let nB = constrain(factor*(blue(c)-128) + 128, 0, 255);
      
      let nC = color(nR,nG,nB);
      img.set(x,y,nC);
    }
  }
  img.updatePixels();
}

function addNoise() {
  noiseGfx = createGraphics(canvasSize, canvasSize);
  noiseGfx.pixelDensity(1);
  noiseGfx.image(noise, 0, 0, canvasSize, canvasSize)
  gradientMap(colors, noiseGfx)
  tint(255, map(seed[2], 0, 1, 110, 180));
  blendMode(HARD_LIGHT);
  image(noiseGfx, 0, 0, canvasSize, canvasSize)
}

function keyPressed(){
  if (key === 's'){
    saveCanvas(`${fxhash}.jpg`);
  }
}