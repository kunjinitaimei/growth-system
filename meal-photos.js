/* 三餐照片：IndexedDB 存图、浏览器本地识别、常见份量粗略估算 */
(function () {
  'use strict';

  var DB_NAME = 'growthos-photos', STORE = 'photos';
  var dbPromise = null, worker = null, requestNo = 0;
  var pending = {};

  /* FoodSeg103 类别 → 当前食物库；没有可靠对应项时不编造食物。 */
  var CLASS_FOOD = {
    3: '薯条', 13: '美式咖啡（无糖）', 14: '橙汁', 15: '牛奶（全脂）',
    17: '杏仁', 19: '腰果', 22: '核桃', 23: '花生（炒）', 24: '鸡蛋（全）',
    25: '苹果', 29: '香蕉', 30: '草莓', 32: '蓝莓', 38: '梨',
    41: '葡萄', 42: '猕猴桃', 44: '橙子', 45: '西瓜', 46: '牛肉（瘦）',
    47: '猪瘦肉', 48: '鸡腿肉（去皮）', 51: '羊肉（瘦）', 54: '鲈鱼',
    56: '虾仁', 58: '白面包', 59: '玉米（煮）', 60: '巨无霸汉堡',
    61: '披萨', 63: '饺子（猪肉）', 65: '面条（熟）', 66: '米饭（熟）',
    68: '北豆腐', 69: '茄子', 70: '土豆（蒸）',
    73: '番茄', 77: '清炒时蔬', 80: '生菜', 82: '黄瓜', 84: '胡萝卜',
    85: '芦笋', 87: '西兰花', 90: '清炒时蔬', 91: '大白菜',
    92: '清炒时蔬', 93: '洋葱', 94: '青椒', 95: '清炒时蔬',
    96: '清炒时蔬', 97: '香菇', 98: '香菇', 99: '金针菇',
    100: '香菇', 101: '香菇'
  };

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!('indexedDB' in window)) { reject(new Error('此浏览器不支持照片存储')); return; }
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('照片存储打开失败')); };
    });
    return dbPromise;
  }

  function put(id, blob) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ id: id, blob: blob, updatedAt: Date.now() });
        tx.oncomplete = function () { resolve(id); };
        tx.onerror = function () { reject(tx.error || new Error('照片保存失败')); };
      });
    });
  }

  function get(id) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var req = db.transaction(STORE, 'readonly').objectStore(STORE).get(id);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    });
  }

  function remove(id) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  function bitmapFrom(blob) {
    if ('createImageBitmap' in window) return createImageBitmap(blob);
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(blob), img = new Image();
      img.onload = function () { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('无法读取这张照片')); };
      img.src = url;
    });
  }

  function canvasBlob(canvas, type, quality) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) { resolve(blob); }, type, quality);
    });
  }

  function compress(file) {
    return bitmapFrom(file).then(function (bitmap) {
      var width = bitmap.width, height = bitmap.height;
      var scale = Math.min(1, 1280 / Math.max(width, height));
      var canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      var ctx = canvas.getContext('2d', { alpha: false });
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      if (bitmap.close) bitmap.close();
      return canvasBlob(canvas, 'image/jpeg', 0.82).then(function (blob) {
        if (!blob) throw new Error('照片压缩失败，请换一张重试');
        return blob;
      });
    });
  }

  function pixelsFor(blob) {
    return bitmapFrom(blob).then(function (bitmap) {
      var canvas = document.createElement('canvas');
      canvas.width = 768; canvas.height = 768;
      var ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
      ctx.fillStyle = 'rgb(114,114,114)'; ctx.fillRect(0, 0, 768, 768);
      var scale = Math.min(768 / bitmap.width, 768 / bitmap.height);
      var w = bitmap.width * scale, h = bitmap.height * scale;
      ctx.drawImage(bitmap, (768 - w) / 2, (768 - h) / 2, w, h);
      if (bitmap.close) bitmap.close();
      return ctx.getImageData(0, 0, 768, 768).data.buffer;
    });
  }

  function ensureWorker() {
    if (worker) return worker;
    worker = new Worker('./food-recognition.worker.js');
    worker.onmessage = function (event) {
      var msg = event.data || {}, task = pending[msg.id];
      if (!task) return;
      if (msg.type === 'progress') { if (task.progress) task.progress(msg.stage); return; }
      delete pending[msg.id];
      clearTimeout(task.timer);
      if (msg.type === 'result') task.resolve(msg.detections || []);
      else task.reject(new Error(msg.error || '本地识别失败'));
    };
    worker.onerror = function (event) {
      var message = event.message || '识别组件加载失败';
      Object.keys(pending).forEach(function (id) {
        clearTimeout(pending[id].timer);
        pending[id].reject(new Error(message));
        delete pending[id];
      });
      worker.terminate(); worker = null;
    };
    return worker;
  }

  function recognize(blob, progress) {
    return pixelsFor(blob).then(function (pixels) {
      return new Promise(function (resolve, reject) {
        var id = 'r' + (++requestNo) + '-' + Date.now();
        pending[id] = { resolve: resolve, reject: reject, progress: progress };
        pending[id].timer = setTimeout(function () {
          if (!pending[id]) return;
          delete pending[id];
          if (worker) { worker.terminate(); worker = null; }
          reject(new Error('识别时间较长，请重拍或手动选择食物'));
        }, 120000);
        ensureWorker().postMessage({ type: 'recognize', id: id, pixels: pixels }, [pixels]);
      });
    });
  }

  function commonGrams(food) {
    var units = food.units || [];
    var unit = units.length > 1 ? units[1] : units[0];
    return unit && unit[1] > 0 ? unit[1] : 100;
  }

  function makeItem(food, grams) {
    var g = Math.max(5, Math.round((grams || commonGrams(food)) / 5) * 5);
    function round1(n) { return Math.round(n * 10) / 10; }
    return {
      foodId: food.id, name: food.name, g: g, estimated: true,
      kcal: round1(food.kcal * g / 100), p: round1(food.p * g / 100),
      c: round1(food.c * g / 100), f: round1(food.f * g / 100)
    };
  }

  function estimate(detections, foods) {
    var mapped = [];
    (detections || []).forEach(function (det) {
      var name = CLASS_FOOD[det.classId];
      if (!name) return;
      var food = foods.filter(function (f) { return f.name === name; })[0];
      if (food) mapped.push({ det: det, food: food });
    });

    /* 常规结果支持多种食物；没有可靠结果时只保留最大面积的弱候选，避免把误检全算进去。 */
    var confident = mapped.filter(function (x) { return (x.det.confidence || 0) >= 0.25; });
    var lowConfidence = false;
    if (confident.length) {
      mapped = confident;
    } else {
      var areas = {};
      mapped.forEach(function (x) {
        if ((x.det.confidence || 0) >= 0.05 && (x.det.areaRatio || 0) >= 0.01) {
          areas[x.food.id] = (areas[x.food.id] || 0) + x.det.areaRatio;
        }
      });
      var dominant = Object.keys(areas).sort(function (a, b) { return areas[b] - areas[a]; })[0];
      mapped = dominant ? mapped.filter(function (x) { return x.food.id === dominant; }) : [];
      lowConfidence = !!dominant;
    }

    var groups = {};
    mapped.forEach(function (x) {
      var det = x.det, food = x.food;
      if (!groups[food.id]) groups[food.id] = { food: food, area: 0, confidence: 0 };
      groups[food.id].area += Math.max(0, det.areaRatio || 0);
      groups[food.id].confidence = Math.max(groups[food.id].confidence, det.confidence || 0);
    });
    var list = Object.keys(groups).map(function (key) { return groups[key]; });
    list.sort(function (a, b) { return b.area - a.area; });
    list = list.slice(0, 8);
    var areaTotal = list.reduce(function (sum, x) { return sum + x.area; }, 0);
    var gramTotal = list.reduce(function (sum, x) { return sum + commonGrams(x.food); }, 0);
    return list.map(function (x) {
      var common = commonGrams(x.food), grams = common;
      if (list.length > 1 && areaTotal > 0) {
        grams = gramTotal * x.area / areaTotal;
        grams = Math.max(common * 0.45, Math.min(common * 1.6, grams));
      }
      var item = makeItem(x.food, grams);
      item.confidence = x.confidence;
      if (lowConfidence) item.lowConfidence = true;
      return item;
    });
  }

  window.MealPhotos = {
    put: put, get: get, remove: remove, compress: compress,
    recognize: recognize, estimate: estimate, makeItem: makeItem,
    commonGrams: commonGrams
  };
})();
