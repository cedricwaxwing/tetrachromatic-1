let l1 = [];
let l2 = [];
let l3 = [];
let l4 = [];
let images = [];
let img1, img2, img3, img4, noise;
let palette_seed, colors;
let ditherOp, ditherOpIndex;
let ditherOps = ["<<",">>","/","*","-","+","&&"];

const canvasSize = 1500;

const assetAmounts = {
  l1: 7,
  l2: 8,
  l3: 5,
  l4: 3,
}

const palettes = [
  // 0
  { name: "photosynthesis",
    colors: [[6,62,14], [0,255,234], [17,190,94], [169,245,108], [240,255,0], [249,255,157]],
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
  { name: "morning sun",
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
  palette_seed = int(map(fxrand(), 0, 1, 0, palettes.length-1))
  colors = palettes[palette_seed].colors

  // Images
  l1_seed = int(map(fxrand(), 0, 1, 1, assetAmounts.l1))
  l2_seed = int(map(fxrand(), 0, 1, 1, assetAmounts.l2))
  l3_seed = int(map(fxrand(), 0, 1, 1, assetAmounts.l3))
  l4_seed = int(map(fxrand(), 0, 1, 1, assetAmounts.l4))
  img1 = l1[l1_seed];
  img2 = l2[l2_seed];
  img3 = l3[l3_seed];
  img4 = l4[l4_seed];
  images = [img1, img2, img3, img4];

  // Dither Operators
  ditherOpIndex = int(map(fxrand(), 0, 1, 0, ditherOps.length))

  console.log({
    palette: palettes[palette_seed].name,
    images: [l1_seed, l2_seed, l3_seed, l4_seed],
    ditherOp: ditherOps[ditherOpIndex],
  })
}

function getRandOp(a, b) {
  switch (ditherOpIndex) {
    case 0: ditherOp = a << b; break;
    case 1: ditherOp = a >> b; break;
    case 2: ditherOp = a / b; break;
    case 3: ditherOp = a * b; break;
    case 4: ditherOp = a - b; break;
    case 5: ditherOp = a + b; break;
    case 6: ditherOp = a && b; break;
  }
}

function setup() {
  pixelDensity(2);
  colorMode(RGB)
  background("green");
  createCanvas(canvasSize, canvasSize);


  images.map((img, i) => {
    tint(255, map(i, 0, images.length-1, 60, 250));
    dither(img);
    addContrast(150, img)
    gradientMap(colors, img);
    blendMode(i < images.length*.7 ? EXCLUSION : OVERLAY);
    image(img, 0, 0, canvasSize, canvasSize);
  })
  // tint(255,255);
  // blendMode(BLEND)
  // gradientMap(colors);
  // image(get(), 0, 0, canvasSize, canvasSize);

  blendMode(OVERLAY);
  tint(255, 130);
  addNoise();
}

function index(img, t, i) {
  return 4 * (t + i * img.width)
}

function dither(img) {
  img.loadPixels();
  for (let t = 0; t < img.width - 1; t++)
      for (let i = 1; i < img.height - 1; i++) {
          let r = img.pixels[index(img, i, t)]
            , n = img.pixels[index(img, i, t) + 1]
            , o = img.pixels[index(img, i, t) + 2]
            , a = 1
            , s = round(a * r / 255) * (255 / a)
            , d = round(a * n / 255) * (255 / a)
            , h = round(a * o / 255) * (255 / a);
          // error 0
          img.pixels[index(img, i, t)] = s,
          img.pixels[index(img, i, t) + 1] = d,
          img.pixels[index(img, i, t) + 2] = h,
          // error 1
          img.pixels[index(img, i + 1, t)] += 7 * (r - s) / 16.0,
          img.pixels[index(img, i + 1, t) + 1] += fxrand()*2*7 * (r - s) / 16.0,
          img.pixels[index(img, i + 1, t) + 2] += getRandOp(7, (r - s)) / 16.0,
          // error 2
          img.pixels[index(img, i - 1, t + 1)] += 3 * (r - s) / 16.0,
          img.pixels[index(img, i - 1, t + 1) + 1] += fxrand()*2*3 * (r - s) / 16.0,
          img.pixels[index(img, i - 1, t + 1) + 2] += getRandOp(3, (r - s)) / 16.0,
          // error 3
          img.pixels[index(img, i, t + 1)] += 5 * (r - s) / 16.0,
          img.pixels[index(img, i, t + 1) + 1] += fxrand()*2*5 * (r - s) / 16.0,
          img.pixels[index(img, i, t + 1) + 2] += getRandOp(5, (r - s)) / 16.0,
          // error 4
          img.pixels[index(img, i + 1, t + 1)] += 1 * (r - s) / 16.0,
          img.pixels[index(img, i + 1, t + 1) + 1] += fxrand()*2*1 * (r - s) / 16.0,
          img.pixels[index(img, i + 1, t + 1) + 2] += getRandOp(1, (r - s)) / 16.0
      }
  img.updatePixels()
}

function gradientMap(palette, img) {
  if(!img) {
    img = get();
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
  dither(noiseGfx)
  image(noiseGfx, 0, 0, canvasSize, canvasSize)
  gradientMap(colors, noiseGfx)
}