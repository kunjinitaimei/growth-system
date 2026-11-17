/* FoodSeg103 / YOLOv8 分割推理：全部在本机 Web Worker 内完成 */
'use strict';

var MODEL_URL = './models/yolov8_foodseg103.onnx';
var INPUT_SIZE = 768;
var MASK_SIZE = 192;
var MASK_COEFFS = 32;
var SCORE_THRESHOLD = 0.05;
var NMS_THRESHOLD = 0.45;
var LABELS = [
  'background', 'candy', 'egg tart', 'french fries', 'chocolate', 'biscuit',
  'popcorn', 'pudding', 'ice cream', 'cheese butter', 'cake', 'wine',
  'milkshake', 'coffee', 'juice', 'milk', 'tea', 'almond', 'red beans',
  'cashew', 'dried cranberries', 'soy', 'walnut', 'peanut', 'egg', 'apple',
  'date', 'apricot', 'avocado', 'banana', 'strawberry', 'cherry', 'blueberry',
  'raspberry', 'mango', 'olives', 'peach', 'lemon', 'pear', 'fig', 'pineapple',
  'grape', 'kiwi', 'melon', 'orange', 'watermelon', 'steak', 'pork',
  'chicken duck', 'sausage', 'fried meat', 'lamb', 'sauce', 'crab', 'fish',
  'shellfish', 'shrimp', 'soup', 'bread', 'corn', 'hamburg', 'pizza',
  'hanamaki baozi', 'wonton dumplings', 'pasta', 'noodles', 'rice', 'pie',
  'tofu', 'eggplant', 'potato', 'garlic', 'cauliflower', 'tomato', 'kelp',
  'seaweed', 'spring onion', 'rape', 'ginger', 'okra', 'lettuce', 'pumpkin',
  'cucumber', 'white radish', 'carrot', 'asparagus', 'bamboo shoots', 'broccoli',
  'celery stick', 'cilantro mint', 'snow peas', 'cabbage', 'bean sprouts',
  'onion', 'pepper', 'green beans', 'French beans', 'king oyster mushroom',
  'shiitake', 'enoki mushroom', 'oyster mushroom', 'white button mushroom',
  'salad', 'other ingredients'
];

var ort = null;
var sessionPromise = null;

function loadSession(id) {
  if (sessionPromise) return sessionPromise;
  self.postMessage({ id: id, type: 'progress', stage: 'loading' });
  importScripts('./models/vendor/ort.wasm.min.js');
  ort = self.ort;
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.proxy = false;
  ort.env.wasm.wasmPaths = new URL('./models/vendor/', self.location.href).href;
  sessionPromise = ort.InferenceSession.create(MODEL_URL, {
    executionProviders: ['wasm'],
    graphOptimizationLevel: 'all'
  }).catch(function (err) {
    sessionPromise = null;
    throw err;
  });
  return sessionPromise;
}

function imageTensor(buffer) {
  var pixels = new Uint8ClampedArray(buffer);
  var plane = INPUT_SIZE * INPUT_SIZE;
  var values = new Float32Array(plane * 3);
  for (var i = 0; i < plane; i++) {
    var p = i * 4;
    values[i] = pixels[p] / 255;
    values[plane + i] = pixels[p + 1] / 255;
    values[plane * 2 + i] = pixels[p + 2] / 255;
  }
  return new ort.Tensor('float32', values, [1, 3, INPUT_SIZE, INPUT_SIZE]);
}

function overlap(a, b) {
  var ax1 = a.x - a.w / 2, ay1 = a.y - a.h / 2;
  var ax2 = ax1 + a.w, ay2 = ay1 + a.h;
  var bx1 = b.x - b.w / 2, by1 = b.y - b.h / 2;
  var bx2 = bx1 + b.w, by2 = by1 + b.h;
  var iw = Math.max(0, Math.min(ax2, bx2) - Math.max(ax1, bx1));
  var ih = Math.max(0, Math.min(ay2, by2) - Math.max(ay1, by1));
  var inter = iw * ih;
  return inter / Math.max(1, a.w * a.h + b.w * b.h - inter);
}

function detections(output, proto) {
  var dims = output.dims;
  var channelsFirst = dims[1] <= dims[2];
  var channels = channelsFirst ? dims[1] : dims[2];
  var anchors = channelsFirst ? dims[2] : dims[1];
  var classes = channels - 4 - MASK_COEFFS;
  var data = output.data;
  function at(c, i) { return data[channelsFirst ? c * anchors + i : i * channels + c]; }
  var candidates = [];

  for (var i = 0; i < anchors; i++) {
    var bestClass = -1, bestScore = 0;
    for (var c = 0; c < classes; c++) {
      var score = at(4 + c, i);
      if (score > bestScore) { bestScore = score; bestClass = c; }
    }
    if (bestClass <= 0 || bestScore < SCORE_THRESHOLD) continue;
    var coeff = [];
    for (var m = 0; m < MASK_COEFFS; m++) coeff.push(at(4 + classes + m, i));
    candidates.push({
      x: at(0, i), y: at(1, i), w: at(2, i), h: at(3, i),
      classId: bestClass, confidence: bestScore, coeff: coeff
    });
  }

  candidates.sort(function (a, b) { return b.confidence - a.confidence; });
  var kept = [];
  for (var n = 0; n < candidates.length && kept.length < 16; n++) {
    var candidate = candidates[n], suppressed = false;
    for (var k = 0; k < kept.length; k++) {
      if (kept[k].classId === candidate.classId && overlap(kept[k], candidate) > NMS_THRESHOLD) {
        suppressed = true;
        break;
      }
    }
    if (!suppressed) kept.push(candidate);
  }

  var pd = proto.dims;
  var maskH = pd[2] || MASK_SIZE, maskW = pd[3] || MASK_SIZE;
  var maskPlane = maskH * maskW;
  var protoData = proto.data;
  return kept.map(function (det) {
    var x1 = Math.max(0, Math.floor((det.x - det.w / 2) / INPUT_SIZE * maskW));
    var y1 = Math.max(0, Math.floor((det.y - det.h / 2) / INPUT_SIZE * maskH));
    var x2 = Math.min(maskW, Math.ceil((det.x + det.w / 2) / INPUT_SIZE * maskW));
    var y2 = Math.min(maskH, Math.ceil((det.y + det.h / 2) / INPUT_SIZE * maskH));
    var count = 0;
    for (var y = y1; y < y2; y++) {
      for (var x = x1; x < x2; x++) {
        var pixel = y * maskW + x, sum = 0;
        for (var m = 0; m < MASK_COEFFS; m++) sum += det.coeff[m] * protoData[m * maskPlane + pixel];
        if (1 / (1 + Math.exp(-sum)) >= 0.5) count++;
      }
    }
    var boxArea = Math.max(0, det.w * det.h) / (INPUT_SIZE * INPUT_SIZE);
    return {
      classId: det.classId,
      label: LABELS[det.classId] || ('class-' + det.classId),
      confidence: Math.round(det.confidence * 1000) / 1000,
      areaRatio: Math.max(count / maskPlane, boxArea * 0.08),
      box: [det.x / INPUT_SIZE, det.y / INPUT_SIZE, det.w / INPUT_SIZE, det.h / INPUT_SIZE]
    };
  }).filter(function (det) { return det.areaRatio > 0.0005; });
}

function recognize(message) {
  var id = message.id;
  return loadSession(id).then(function (session) {
    self.postMessage({ id: id, type: 'progress', stage: 'running' });
    var feeds = {};
    feeds[session.inputNames[0]] = imageTensor(message.pixels);
    return session.run(feeds);
  }).then(function (outputs) {
    var names = Object.keys(outputs);
    var output = null, proto = null;
    names.forEach(function (name) {
      var tensor = outputs[name];
      if (tensor.dims.length === 4) proto = tensor;
      else if (tensor.dims.length === 3) output = tensor;
    });
    if (!output || !proto) throw new Error('模型输出格式不符');
    var found = detections(output, proto);
    self.postMessage({ id: id, type: 'result', detections: found });
  }).catch(function (err) {
    self.postMessage({ id: id, type: 'error', error: String(err && err.stack ? err.stack : err) });
  });
}

self.onmessage = function (event) {
  if (event.data && event.data.type === 'recognize') recognize(event.data);
};
