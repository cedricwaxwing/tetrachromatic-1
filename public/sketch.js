let seed = [
  fxrand(),
  fxrand(),
  fxrand(),
  fxrand(),
]
let images = [];
let image_seeds = [];
let noise;
let imageSize, imageOffset;
let palette_seed, colors;
let ditherOp, ditherOpIndex, errorType, errorMappedVals;
let begin, end, imageLoad, renderTime;
let errorTypes = 5;
let error_seeds = [];
let op_seeds = [];
let ditherOps = [
  "*",
  "/",
  "<<",
  ">>",
  "&&",
  "||"
];
const CANVAS_SIZE = 1500;

function preload() {
  begin = millis();

  // Palette
  palette_seed = int(map(seed[1], 0, 1, 0, palettes.length-1))
  colors = palettes[palette_seed].colors

  // Images
  const assetAmounts = [
    12,
    18,
    18,
    1,
  ]
  assetAmounts.map((amount, i) => {
    let image_seed = int(map(seed[i], 0, 1, 1, assetAmounts[i]))
    image_seeds.push(image_seed);
    if(i < 3) {
      images[i] = loadImage(`gan/${i+1}/${image_seed}.jpeg`)
    } else {
      noise = loadImage(`noise/${image_seed}.png`)
    }
  })

  // Dither
  errorMappedVals = {
    "set-1":  map(seed[0], 0, 1, 1, 100),
    "3-1": map(seed[1], 0, 1, 0, 3),
    "3-2": map(seed[2], 0, 1, 16, 48),
  }
  images.map((_, i) => {
    error_seeds[i] = round(map(fxrand(), 0, 1, 0, errorTypes))
    op_seeds[i] = int(map(fxrand(), 0, 1, 0, ditherOps.length))
  })

  const fxhashFeatures = {
    "Palette": palettes[palette_seed].name,
    "Dither": `•${error_seeds[1]}•${ditherOps[op_seeds[1]]}• •${error_seeds[2]}•${ditherOps[op_seeds[2]]}•`,
    "Bio": image_seeds[0],
    "Glyptik": image_seeds[1],
    "Ortho": image_seeds[2],
    "Electromagentism": image_seeds[3],
  }
  window.$fxhashFeatures = fxhashFeatures;

  console.log(fxhashFeatures)
}

function setup() {
  pixelDensity(2);
  colorMode(RGB)
  background("white");
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  images.map((img, i) => {
    applyFilters(img, i);
  })
  render();
}

function applyFilters(img, i) {
  if(i > 0) {
    dither(img, 1, error_seeds[i], op_seeds[i]);
  }
  addContrast(305, img)
  if(i <= images.length-2) {
    gradientMap(colors, img);
  }
  if(i > 0) {
    // blendMode(OVERLAY);
    blendMode(i < images.length % 2 ? ADD : OVERLAY);
  }
  tint(255, map(i, 0, images.length, 120, 180));
  imageSize = map(seed[i], 0, 1, CANVAS_SIZE, CANVAS_SIZE*1.8)
  imageOffset = seed[i] * -(imageSize - CANVAS_SIZE)
  image(img, imageOffset, imageOffset, imageSize, imageSize);
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

function render() {
  addContrast(50)
  addNoise();
  document.body.classList.add("loaded");
  document.querySelector(".logo-wrapper").classList.add("fadeOut");
  document.querySelector(".p5Canvas").classList.add("fadeIn");
  end = millis();
  renderTime = (end - begin) / 1000;
  console.log(renderTime)
  fxpreview();
}

function addNoise() {
  blendMode(HARD_LIGHT);
  noiseGfx = createGraphics(CANVAS_SIZE, CANVAS_SIZE);
  noiseGfx.pixelDensity(1);
  noiseGfx.image(noise, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
  // gradientMap(colors, noiseGfx)
  tint(255, map(seed[2], 0, 1, 70, 150));
  image(noiseGfx, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
}