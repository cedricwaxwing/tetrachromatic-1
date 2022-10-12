let noise, imageSize, imageRatio, imageRotation, imageOffset, flipX, flipY, palette_seed, colors, errorSize, opType, begin, end, renderTime;
let images = [];
let image_seeds = [];
let blends = [];
let blend_seeds = [];
let error_seeds = [];
let op_seeds = [];
let ditherOps = [
  "*",
  "%",
  "<<",
  ">>",
  "&&",
  "||",
];
const assetAmounts = [
  12,
  18,
  21,
  2
]
const CANVAS_SIZE = 1500;

function preload() {
  // begin = millis();

  // Palette
  palette_seed = int(map(fxrand(), 0, 1, 0, palettes.length-1))
  colors = palettes[palette_seed].colors

  // Images
  blends = [OVERLAY, SOFT_LIGHT, HARD_LIGHT, MULTIPLY];
  assetAmounts.map((amount, i) => {
    const image_seed = int(map(fxrand(), 0, 1, 1, amount))
    const blend_seed = round(map(fxrand(), 0, 1, 0, blends.length-1))
    image_seeds.push(image_seed);
    blend_seeds.push(blend_seed);

    if(i !== assetAmounts.length-1) {
      images[i] = loadImage(`gan/${i+1}/${image_seed}.jpeg`)
    } else {
      noise = loadImage(`noise/${image_seed}.png`)
    }
  })

  // Dither
  images.map((_, i) => {
    error_seeds[i] = round(map(fxrand(), 0, 1, 0, 3))
    op_seeds[i] = int(map(fxrand(), 0, 1, 0, ditherOps.length))
  })

  const fxhashFeatures = {
    "Palette": palettes[palette_seed].name,
    "Dither": `${error_seeds[0]}${ditherOps[op_seeds[0]]}•${error_seeds[1]}${ditherOps[op_seeds[1]]}•${error_seeds[2]}${ditherOps[op_seeds[2]]}`,
    "Bio": `${image_seeds[0]}•${blends[blend_seeds[0]].charAt(0).toUpperCase()}`,
    "Glyptik": `${image_seeds[1]}•${blends[blend_seeds[1]].charAt(0).toUpperCase()}`,
    "Ortho": `${image_seeds[2]}•${blends[blend_seeds[2]].charAt(0).toUpperCase()}`,
    "Electromagentism": image_seeds[3],
  }
  window.$fxhashFeatures = fxhashFeatures;

  console.log(fxhashFeatures)
}

function setup() {
  pixelDensity(2);
  colorMode(RGB)
  angleMode(DEGREES);
  imageMode(CENTER);
  rectMode(CENTER);
  createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  translate(CANVAS_SIZE/2, CANVAS_SIZE/2)
  images.map((img, i) => {
    applyFilters(img, i);
  })
  addBorder();
  render();
}

function applyFilters(img, i) {
  push();
  errorType = error_seeds[i];
  opType = op_seeds[i];
  dither(img);
  addContrast(140, img)
  if(i !== 2) {
    gradientMap(colors, img);
  }
  blendMode(blends[blend_seeds[i]]);
  flipX = Math.sign(fxrand()-0.5);
  if(i === 2) {
    flipY = 1;
  } else {
    flipY = Math.sign(fxrand()-0.5);
    imageRotation = floor(fxrand() * 4) * 90;
    rotate(imageRotation)
  }
  tint(255, map(i, 0, images.length, 190, 250));
  imageRatio = map(fxrand(), 0, 1, 1, 1.5)
  imageSize = map(fxrand(), 0, 1, CANVAS_SIZE, CANVAS_SIZE*imageRatio)
  imageOffset = fxrand() * -(imageSize - CANVAS_SIZE)
  scale(flipX,flipY);
  image(img, 0, 0, imageSize, imageSize);
  pop();
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
  addNoise();
  document.body.classList.add("loaded");
  document.querySelector(".logo-wrapper").classList.add("fadeOut");
  document.querySelector(".p5Canvas").classList.add("fadeIn");
  // end = millis();
  // renderTime = (end - begin) / 1000;
  // console.log(renderTime)
  fxpreview();
}

function addNoise() {
  blendMode(HARD_LIGHT);
  noiseGfx = createGraphics(CANVAS_SIZE, CANVAS_SIZE);
  noiseGfx.pixelDensity(2);
  noiseGfx.image(noise, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
  tint(255, map(fxrand(), 0, 1, 70, 250));
  image(noiseGfx, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
}

function addBorder() {
  noFill();
  strokeWeight(int(map(fxrand(), 0, 1, 80, 240)))
  stroke(255, 190)
  blendMode(ADD);
  rect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
  noStroke();
}

function addNoise() {
  noiseGfx = createGraphics(CANVAS_SIZE, CANVAS_SIZE);
  noiseGfx.pixelDensity(1);
  noiseGfx.image(noise, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
  gradientMap(colors, noiseGfx)
  tint(255, map(fxrand(), 0, 1, 70, 150));
  image(noiseGfx, 0, 0, CANVAS_SIZE, CANVAS_SIZE)
}

function keyPressed(){
  if (key === 's'){
    saveCanvas(`${fxhash}.jpg`);
  }
}