// ../src/index.ts
var width = 320;
var height = 320;
function getVideo(onFacelets) {
  console.log("Getting video");
  navigator.mediaDevices.getUserMedia({
    video: {
      width,
      height
    }
  }).then((stream) => {
    console.log("Streaming video");
    const video = document.getElementById("video");
    video.srcObject = stream;
    video.onloadedmetadata = function(e) {
      video.play();
    };
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    let time;
    function loop() {
      requestAnimationFrame((newTime) => {
        if (!time)
          time = newTime;
        const elapsed = newTime - time;
        if (elapsed >= 1e3) {
          time = newTime;
          ctx.drawImage(video, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          const pixels = imageData.data;
          console.log(pixels);
          const facelets = getFacelets(pixels);
          onFacelets(facelets);
          return;
        }
        loop();
      });
    }
    loop();
  }).catch((err) => console.log(err));
}
function getFacelets(pixels) {
  const ninths = new Array(3);
  for (let i = 0; i < 3; i++) {
    ninths[i] = new Array(3);
    for (let j = 0; j < 3; j++) {
      ninths[i][j] = new Uint8ClampedArray(width * height * 3 / 9 + 1);
    }
  }
  const indices = new Array(3);
  for (let i = 0; i < 3; i++) {
    indices[i] = new Array(3);
    for (let j = 0; j < 3; j++) {
      indices[i][j] = 0;
    }
  }
  for (let i = 0; i < width * height; i++) {
    const i4 = i * 4;
    const r = pixels[i4];
    const g = pixels[i4 + 1];
    const b = pixels[i4 + 2];
    const x = i % width;
    const y = Math.floor(i / width);
    const x9 = Math.floor(x / (width / 3));
    const y9 = Math.floor(y / (height / 3));
    const index = indices[x9][y9];
    const index3 = index * 3;
    ninths[x9][y9][index3] = r;
    ninths[x9][y9][index3 + 1] = g;
    ninths[x9][y9][index3 + 2] = b;
    indices[x9][y9]++;
  }
  const facelets = new Uint8Array(9 * 3);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const [r, g, b] = getFacelet(ninths[i][j], indices[i][j]);
      const index = (i * 3 + j) * 3;
      facelets[index] = r;
      facelets[index + 1] = g;
      facelets[index + 2] = b;
    }
  }
  return facelets;
}
function getFacelet(pixels, len) {
  const avgDistances = new Array(len);
  for (let i = 0; i < len; i++) {
    const i3 = i * 3;
    const r = pixels[i3];
    const g = pixels[i3 + 1];
    const b = pixels[i3 + 2];
    let sum = 0;
    for (let j = 0; j < len; j += 8) {
      if (i === j) {
        continue;
      }
      const j3 = j * 3;
      const r2 = pixels[j3];
      const g2 = pixels[j3 + 1];
      const b2 = pixels[j3 + 2];
      sum += distance(r - r2, g - g2, b - b2);
    }
    avgDistances[i] = sum / (len - 1);
  }
  const sortedAvgDistances = avgDistances.slice().sort((a, b) => a - b);
  const lowerQuartile = getLowerQuartile(sortedAvgDistances);
  const upperQuartile = getUpperQuartile(sortedAvgDistances);
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let numNonOutliers = 0;
  for (let i = 0; i < len; i++) {
    const avgDistance = avgDistances[i];
    if (avgDistance < lowerQuartile || avgDistance > upperQuartile) {
      continue;
    }
    numNonOutliers++;
    const i3 = i * 3;
    const r = pixels[i3];
    const g = pixels[i3 + 1];
    const b = pixels[i3 + 2];
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      continue;
    }
    rSum += r;
    gSum += g;
    bSum += b;
  }
  let rAvg = rSum / numNonOutliers;
  let gAvg = gSum / numNonOutliers;
  let bAvg = bSum / numNonOutliers;
  return [Math.floor(rAvg), Math.floor(gAvg), Math.floor(bAvg)];
}
function distance(r, g, b) {
  return r * r + g * g + b * b;
}
function getLowerQuartile(arr) {
  return arr[Math.floor(arr.length * 2 / 5)];
}
function getUpperQuartile(arr) {
  return arr[Math.floor(arr.length * 3 / 5)];
}
export {
  getVideo
};
//# sourceMappingURL=index.js.map
