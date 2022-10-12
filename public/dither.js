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

function dither(img) {
  const steps = 1;
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

      distributeError(img, x, y, errR, errG, errB);
    }
  }

  img.updatePixels();
}

const floydamounts = [7,3,5,1];
function distributeError(img, x, y, errR, errG, errB) {
  for(i=0;i<4;i++) {
    addError(
      img,
      randOp(floydamounts[i], 16, i),
      i === 1 ? x - 1 : x + 1,
      i > 0 ? y + 1 : y,
      errR,
      errG,
      errB
    );
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

function randOp(a, b, index) {
  return a / b;
  if (index !== errorType) { 
    return a / b;
  };
  switch (opType) {
    case ditherOps[opType] === "*": return a * b;
    case ditherOps[opType] === "%": return a * b;
    case ditherOps[opType] === "<<": return a << b;
    case ditherOps[opType] === ">>": return a >> b;
    case ditherOps[opType] === "&&": return a && b;
    case ditherOps[opType] === "||": return a || b;
    default: return a / b;
  }
}