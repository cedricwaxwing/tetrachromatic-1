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