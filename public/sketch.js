let seed1 = fxrand();
let seed2 = fxrand();
let seed3 = fxrand();
let l1 = [];
let l2 = [];
let l3 = [];
let l4 = [];
let images = [];
let img1, img2, img3, img4, noise;
let palette_seed, colors;
let ditherOp, ditherOpIndex, errorType, errorMappedVals;
let errorTypes = 4;
let ditherOps = [
  "<<",
  ">>",
  "/",
  "*",
  "-",
  "+",
  "&&"
];
let cOff1, cOff2;

const canvasSize = 1500;
let imageSize;

const assetAmounts = {
  l1: 7,
  l2: 8,
  l3: 5,
  l4: 3,
}

const palettes = [
  // 0
  { name: "photosynthesis",
    colors: [[6,62,14], [17,94,54], [64,154,105], [0,200,160], [240,255,0], [249,255,157]],
  },
  // 1
  { name: "bioluminescence",
    colors: [[28,6,62], [162,0,255], [86,17,190], [104,254,38], [0,255,144], [157,254,255]],
  },
  // 2
  { name: "burning jungle",
    colors: [[12,71,103],[86,110,61],[250,121,33],[254,153,32],[185,164,76]],
  },
  // 3
  { name: "lascaux",
    colors: [[63,94,97], [111,54,36], [229,177,129], [244,185,178], [218,237,189]],
  },
  // 4
  { name: "cloudy sea",
    colors: [[20,42,78],[80,95,140],[105,135,201],[192,169,176],[218,226,235]],
  },
  // 5
  { name: "autumn rain",
    colors: [[61,123,123],[117,72,94],[203,144,77],[223,204,116],[195,233,145]],
  },
  // 6
  { name: "neopolitan",
    colors: [[54,55,50],[102,195,255],[83,216,251],[212,175,185],[220,225,233]],
  },
  // 7
  { name: "dusk",
    colors: [[14,17,22],[55,74,103],[97,98,131],[158,123,155],[203,156,242]],
  },
]

function preload() {
  // ----  LOAD ASSETS ---- //
  for (i = 1; i <= assetAmounts.l1; i++) {
    l1[i] = loadImage(`gan/1/${i}.jpeg`)
  }
  for (i = 1; i <= assetAmounts.l2; i++) {
    l2[i] = loadImage(`gan/2/${i}.jpeg`)
  }
  for (i = 1; i <= assetAmounts.l3; i++) {
    l3[i] = loadImage(`gan/3/${i}.jpeg`)
  }
  for (i = 1; i <= assetAmounts.l4; i++) {
    l4[i] = loadImage(`gan/plants/${i}.jpeg`)
  }
  noise = loadImage(`noise.png`);
  
  // ----  SEEDS ---- //

  // Palette
  palette_seed = int(map(seed2, 0, 1, 0, palettes.length-1))
  colors = palettes[palette_seed].colors

  // Images
  l1_seed = int(map(seed1, 0, 1, 1, assetAmounts.l1))
  l2_seed = int(map(seed1, 0, 1, 1, assetAmounts.l2))
  l3_seed = int(map(seed1, 0, 1, 1, assetAmounts.l3))
  l4_seed = int(map(seed1, 0, 1, 1, assetAmounts.l4))
  img1 = l1[l1_seed];
  img2 = l2[l2_seed];
  img3 = l3[l3_seed];
  img4 = l4[l4_seed];
  images = [
    img1,
    img2,
    img3,
    img4
  ];
  imageSize = map(seed1, 0, 1, canvasSize, canvasSize*1.1)

  // Dither
  ditherOpIndex = round(map(seed1, 0, 1, 0, ditherOps.length))
  cOff1 = seed1;
  cOff2 = cOff1*2
  errorType = round(map(seed1, 0, 1, 0, errorTypes-1));
  errorMappedVals = {
    "3-1": map(seed2, 0, 1, 0, 3),
    "3-2": map(seed3, 0, 1, 16, 48),
  }

  console.log({
    palette: palettes[palette_seed].name,
    images: [l1_seed, l2_seed, l3_seed, l4_seed],
    ditherOp: ditherOps[ditherOpIndex],
    errorType: errorType,
    seed1: seed1,
    seed2: seed2,
    seed3: seed3,
  })
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

function setup() {
  pixelDensity(2);
  colorMode(RGB)
  background("white");
  createCanvas(canvasSize, canvasSize);

  images.map((img, i) => {
    // addThresholdTexture(img);
    dither(img, 1, i % 2 ? 3 : 2);
    addContrast(180, img)
    gradientMap(colors, img);
    if(i !== 0) {
      // blendMode(i < images.length % 2 ? EXCLUSION : OVERLAY);
      blendMode(OVERLAY);
    }
    tint(255, map(i, 0, images.length-1, 160, 220));
    image(img, 0, 0, canvasSize, canvasSize);
  })

  addNoise();
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

function addThresholdTexture(img) {
  const ths = createGraphics(canvasSize, canvasSize);
  ths.pixelDensity(1);
  ths.image(img, 0, 0, canvasSize, canvasSize);
  ths.filter(THRESHOLD, 0.1);
  image(ths, 0, 0, canvasSize);
}

function addNoise() {
  noiseGfx = createGraphics(canvasSize, canvasSize);
  noiseGfx.pixelDensity(1);
  noiseGfx.image(noise, 0, 0, canvasSize, canvasSize)
  dither(noiseGfx, 1, 0)
  gradientMap(colors, noiseGfx)
  tint(255, map(seed3, 0, 1, 110, 180));
  blendMode(HARD_LIGHT);
  image(noiseGfx, 0, 0, canvasSize, canvasSize)
}

function keyPressed(){
  if (key === 's'){
    saveCanvas(`${fxhash}.jpg`);
  }
}