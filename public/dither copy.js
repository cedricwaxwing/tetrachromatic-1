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
          errorDistribution(0, img, t, i, r, o, a, s, d, h);
          errorDistribution(1, img, t, i, r, o, a, s, d, h);
          errorDistribution(2, img, t, i, r, o, a, s, d, h);
          errorDistribution(3, img, t, i, r, o, a, s, d, h);
          errorDistribution(4, img, t, i, r, o, a, s, d, h);
      }
  img.updatePixels()
}

function errorDistribution(errType, img, t, i, r, o, a, s, d, h) {
  switch (errType) {
    case 0:
      img.pixels[index(img, i, t)] = s,
      img.pixels[index(img, i, t) + 1] = d,
      img.pixels[index(img, i, t) + 2] = h;
    case 1:
      img.pixels[index(img, i + 1, t)] += 7 * (r - s) / 16.0,
      img.pixels[index(img, i + 1, t) + 1] += fxrand()*2*7 * (r - s) / 16.0,
      img.pixels[index(img, i + 1, t) + 2] += getRandOp(7, (r - s)) / 16.0;
    case 2:
      img.pixels[index(img, i - 1, t + 1)] += 3 * (r - s) / 16.0,
      img.pixels[index(img, i - 1, t + 1) + 1] += fxrand()*2*3 * (r - s) / 16.0,
      img.pixels[index(img, i - 1, t + 1) + 2] += 3, - (r - s) / 16.0;
    case 3:
      img.pixels[index(img, i, t + 1)] += 5 * (r - s) / 16.0,
      img.pixels[index(img, i, t + 1) + 1] += fxrand()*2 * (r - s) / 16.0,
      img.pixels[index(img, i, t + 1) + 2] += 5 +  (r - s) / 16.0;
    case 4:
      img.pixels[index(img, i + 1, t + 1)] += 1 * (r - s) / 16.0,
      img.pixels[index(img, i + 1, t + 1) + 1] += fxrand()*2*1 * (r - s) / 16.0,
      img.pixels[index(img, i + 1, t + 1) + 2] += getRandOp(1, (r - s)) / 16.0;
  }
}

function getRandOp(a, b) {
  switch (ditherOpIndex) {
    case 0: return a << b;
    case 1: return a >> b;
    case 2: return a / b;
    case 3: return a * b;
    case 4: return a - b;
    case 5: return a + b;
    case 6: return a && b;
    default: return a * b;
  }
}