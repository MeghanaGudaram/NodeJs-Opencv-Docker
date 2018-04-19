const fs = require('fs');
const path = require('path');
const cv = require('../');

if (!cv.xmodules.face) {
  throw new Error('exiting: opencv4nodejs compiled without face module');
}

const basePath = '../data/face-recognition';
//const imgsPath = process.argv[2];
const imgsPath = path.resolve(basePath, 'imgs');
const nameMappings = ['daryl', 'rick', 'negan'];

const imgFiles = fs.readdirSync(imgsPath);

const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
const getFaceImage = (grayImg) => {
  const faceRects = classifier.detectMultiScale(grayImg).objects;
  if (!faceRects.length) {
    throw new Error('failed to detect faces');
  }
  return grayImg.getRegion(faceRects[0]);
};
function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}
const images = imgFiles
  // get absolute file path
  .map(file => path.resolve(imgsPath, file))
  // read image
  .map(filePath => cv.imread(filePath))
  // face recognizer works with gray scale images
  .map(img => img.bgrToGray())
  // detect and extract face
  .map(getFaceImage)
  // face images must be equally sized
  .map(faceImg => faceImg.resize(80, 80));

const isImageFour = (_, i) => imgFiles[i].includes('4');
const isNotImageFour = (_, i) => !isImageFour(_, i);
// use images 1 - 3 for training
const trainImages = images.filter(isNotImageFour);
// use images 4 for testing
const testImages = images.filter(isImageFour);
// make labels
const labels = imgFiles
  .filter(isNotImageFour)
  .map(file => nameMappings.findIndex(name => file.includes(name)));

const runPrediction = (recognizer) => {
  testImages.forEach((img) => {
    const result = recognizer.predict(img);
    console.log('predicted: %s, confidence: %s Time: %s', nameMappings[result.label], result.confidence, getDateTime());
    cv.imshowWait('face', img);
    cv.destroyAllWindows();
  });
};

const eigen = new cv.EigenFaceRecognizer();
//const fisher = new cv.FisherFaceRecognizer();
//const lbph = new cv.LBPHFaceRecognizer();
eigen.train(trainImages, labels);
//fisher.train(trainImages, labels);
//lbph.train(trainImages, labels);

console.log('eigen:');
runPrediction(eigen);

/*console.log('fisher:');
runPrediction(fisher);

console.log('lbph:');
runPrediction(lbph);
*/
