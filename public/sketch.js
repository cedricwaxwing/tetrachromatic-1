let l1 = [];
let l2 = [];
let l3 = [];
let l4 = [];
let images = [];
let img1, img2, img3, img4, noise;
let palette_seed, colors;
let ditherOp, ditherOpIndex;
let ditherOps = ["<<",">>","/","*","-","+","&&"];
let diffType, quantizeFactor, x, y, ly, channelBitDepth;

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
  palette_seed = 4 // int(map(fxrand(), 0, 1, 0, palettes.length-1))
  colors = palettes[palette_seed].colors

  // Images
  l1_seed = int(map(fxrand(), 0, 1, 1, assetAmounts.l1))
  l2_seed = int(map(fxrand(), 0, 1, 1, assetAmounts.l2))
  l3_seed = int(map(fxrand(), 0, 1, 1, assetAmounts.l3))
  l4_seed = int(map(fxrand(), 0, 1, 1, assetAmounts.l4))
  // img1 = l1[l1_seed];
  // img2 = l2[l2_seed];
  img1 = l1[3];
  img2 = l2[7];
  img3 = l3[l3_seed];
  img4 = l4[l4_seed];
  images = [
    img1,
    img2,
    // img3,
    // img4
  ];

  // Dither
  ditherOpIndex = int(map(fxrand(), 0, 1, 0, ditherOps.length-1))
  diffType = "ATK" // int(map(fxrand(), 0, 1, 0, diffMapList.length-1))
  channelBitDepth = 2;

  console.log({
    palette: palettes[palette_seed].name,
    images: [l1_seed, l2_seed, l3_seed, l4_seed],
    ditherOp: ditherOps[ditherOpIndex],
    diffMapList: diffMapList,
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
  background("green");
  createCanvas(canvasSize, canvasSize);

  quantizeFactor = pow(2, channelBitDepth);
  for (let i = 0; i < diffMapList.length; i++) {
    if (diffType == diffMapList[i][0]) {
      diffTypeName = diffMapList[i][1];
      diffMap = diffMapList[i][2];
      break;
    }
  }

  if (diffMap == undefined) {
    if (diffType == "") {
      console.log(
        "ERROR: \nA diffusion map wasn't specificed, so dithering was disabled."
      );
      diffTypeName = "N/A";
      diffMap = null;
    } else {
      console.log(
        "ERROR: \nThere was no diffusion map under the name '" +
          diffType +
          "', so the default was used instead."
      );
      diffTypeName = diffMapList[0][1];
      diffMap = diffMapList[0][2];
    }
  }

  x = 0;
  y = 0;
  ly = 0;


  blendMode(OVERLAY);
  images.map((img, i) => {
    tint(255, map(i, 0, images.length-1, 60, 250));
    dither(img);
    // addContrast(150, img)
    // gradientMap(colors, img);
    // blendMode(i < images.length*.7 ? EXCLUSION : OVERLAY);
    image(img, 0, 0, canvasSize, canvasSize);
  })

  // blendMode(OVERLAY);
  // tint(255, 130);
  // addNoise();
}

function index(img, t, i) {
  return 4 * (t + i * img.width)
}

let origin;
function dither(img) {
  img.loadPixels();
  for (let x = 0; x < img.width - 1; x++)
      for (let y = 1; y < img.height - 1; y++) {
          let oldR = img.pixels[index(img, y, x)]
            , oldG = img.pixels[index(img, y, x) + 1]
            , oldB = img.pixels[index(img, y, x) + 2]
            , a = 1
            , newR = round(a * oldR / 255) * (255 / a)
            , newG = round(a * oldG / 255) * (255 / a)
            , newB = round(a * oldB / 255) * (255 / a)
            , errR = oldR - newR
            , errG = oldG - newG
            , errB = oldB - newB;
          
          diffMapList[0][3].map((diffs, pixelRow) => {
            mapDiffs(img, diffs, pixelRow, errR, errG, errB, x, y);
          })
          // // error 0
          // img.pixels[index(img, y, x)] = newR,
          // img.pixels[index(img, y, x) + 1] = newG,
          // img.pixels[index(img, y, x) + 2] = newB,
          // // error 1
          // img.pixels[index(img, y + 1, x)] += 7 * (oldR - newR) / 16.0,
          // img.pixels[index(img, y + 1, x) + 1] += fxrand()*2*7 * (oldG - newG) / 16.0,
          // img.pixels[index(img, y + 1, x) + 2] += randOperation(7, (oldB - newB)) / 16.0,
          // // error 2
          // img.pixels[index(img, y - 1, x + 1)] += 3 * (oldR - newR) / 16.0,
          // img.pixels[index(img, y - 1, x + 1) + 1] += fxrand()*2*3 * (oldG - newG) / 16.0,
          // img.pixels[index(img, y - 1, x + 1) + 2] += randOperation(3, (oldB - newB)) / 16.0,
          // // error 3
          // img.pixels[index(img, y, x + 1)] += 5 * (oldR - newR) / 16.0,
          // img.pixels[index(img, y, x + 1) + 1] += fxrand()*2*5 * (oldG - newG) / 16.0,
          // img.pixels[index(img, y, x + 1) + 2] += randOperation(5, (oldB - newB)) / 16.0,
          // // error 4
          // img.pixels[index(img, y + 1, x + 1)] += 1 * (oldR - newR) / 16.0,
          // img.pixels[index(img, y + 1, x + 1) + 1] += fxrand()*2*1 * (oldG - newG) / 16.0,
          // img.pixels[index(img, y + 1, x + 1) + 2] += randOperation(1, (oldB - newB)) / 16.0
      }
  img.updatePixels()
}

function mapDiffs(img, diffs, pixelRow, errR, errG, errB, x, y) {
  diffs.map((diff, pixelCol) => {

    if(!origin && diff === "ø") { 
      origin = [pixelCol, pixelRow];
      mapDiffs(img, diffs, pixelRow, errR, errG, errB, x, y);
    } else if(origin && diff !== "ø") {
      const xOff = pixelCol - origin[0];
      const yOff = pixelRow - origin[1];

      // debug arena
      if(x === 1 && y === 1) {
        console.log(diff, xOff, yOff)
      }

      img.pixels[index(img, y + yOff, x + xOff) + 0] += diff * errR / 16.0,
      img.pixels[index(img, y + yOff, x + xOff) + 1] += diff * errG / 16.0,
      img.pixels[index(img, y + yOff, x + xOff) + 2] += diff * errB / 16.0;
    }
  })
};

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