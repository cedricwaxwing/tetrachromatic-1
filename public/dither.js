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

function dither(img, steps, errType, opType) {
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

      distributeError(img, x, y, errR, errG, errB, errType, opType);
    }
  }

  img.updatePixels();
}

function distributeError(img, x, y, errR, errG, errB, errType, opType) {
  if(x < 1 && y < 1) {
    console.log({
      errorType: errType,
      opType: opType,
      errorMappedVals: errorMappedVals,
    })
  }
  switch (errType) {
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
      addError(img, randOperation(7, 16, opType), x - 1, y + 1, errR, errG, errB);
      addError(img, 22.0 , x, y + 1, errR, errG, errB);
      addError(img, 0.1 / 16.0, x + 1, y + 1, errR, errG, errB);
    case 3: 
      addError(img, 1 / 16.0, x, y + errorMappedVals["3-1"], errR, errG, errB);
      addError(img, 7 / 16.0, x - 1, y + 145, errR, errG, errB);
      addError(img, randOperation(errorMappedVals["3-2"], 16, opType) , x, y + 1, errR, errG, errB);
      addError(img, 0.1 / 16.0, x + 1, y + 3, errR, errG, errB);
    case 4:
      addError(img, 6, x + (x < errorMappedVals["3-1"] ? randOperation(6,y/8, opType) : randOperation(24,y/5), opType), y, errR, errG, errB);
      addError(img, 3 / 16.0, x - 1, y + 1, errR, errG, errB);
      addError(img, -5, x, y + (y > errorMappedVals["3-1"]*2 ? 120+x/3 : errorMappedVals["3-2"]+x/50), errR, errG, errB);
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

function randOperation(a, b, opType = 1) {
  switch (op_seeds[opType]) {
    case 0: return ditherOp = a << b;
    case 1: return ditherOp = a >> b;
    case 2: return ditherOp = a / b;
    case 3: return ditherOp = a * b;
    case 4: return ditherOp = a - b;
    case 5: return ditherOp = a + b;
    case 6: return ditherOp = a && b;
  }
}