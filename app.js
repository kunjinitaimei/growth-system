/* 成长系统 · 饮食模块 v1（纯本地，数据存浏览器） */
(function () {
  'use strict';

  var KEY = 'growthos.v1';
  var MEALS = [
    { id: 'breakfast', name: '早餐', icon: '☀' },
    { id: 'lunch', name: '午餐', icon: '◐' },
    { id: 'dinner', name: '晚餐', icon: '☾' },
    { id: 'snack', name: '加餐', icon: '＋' }
  ];
  var WATER_STEP = 250, WATER_GOAL = 3000;

  var DEFAULT_STATE = {
    profile: {
      height: 190, weight: 72, birthYear: 2007, sex: 'male',
      goal: '增肌 + 运动表现', avoid: ['茄子'],
      note: '不吃蛋白粉（怕长痘）'
    },
    targets: {
      training: { kcal: 3400, p: 140, c: 548, f: 72 },
      rest: { kcal: 3000, p: 140, c: 435, f: 72 }
    },
    days: {},
    study: { days: {} },
    customFoods: [],
    sync: {
      repo: 'kunjinitaimei/personal-vault',
      branch: 'main',
      token: '',
      auto: true,
      lastSync: null,
      lastError: null
    }
  };

  /* ---------------- 存储 ---------------- */
  var state = load();
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return clone(DEFAULT_STATE);
      var s = JSON.parse(raw);
      var out = Object.assign(clone(DEFAULT_STATE), s);
      out.sync = Object.assign(clone(DEFAULT_STATE.sync), s.sync || {});
      out.study = { days: (s.study && s.study.days) || {} };
      return out;
    } catch (e) { return clone(DEFAULT_STATE); }
  }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { toast('存储失败'); }
  }

  /* ---------------- 工具 ---------------- */
  function todayKey(d) {
    var x = d || new Date();
    return x.getFullYear() + '-' + pad(x.getMonth() + 1) + '-' + pad(x.getDate());
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function parseKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function shiftKey(k, delta) { var d = parseKey(k); d.setDate(d.getDate() + delta); return todayKey(d); }
  function dateLabel(k) {
    var d = parseKey(k), t = todayKey();
    var w = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()];
    var base = (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + w;
    if (k === t) return '今天 · ' + base;
    if (k === shiftKey(t, -1)) return '昨天 · ' + base;
    if (k === shiftKey(t, 1)) return '明天 · ' + base;
    return base;
  }
  function r1(n) { return Math.round(n * 10) / 10; }
  function r0(n) { return Math.round(n); }
  function num(v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; }

  function day(k) {
    k = k || todayKey();
    if (!state.days[k]) {
      state.days[k] = {
        type: 'training',
        meals: { breakfast: [], lunch: [], dinner: [], snack: [] },
        water: 0, weight: null
      };
    }
    var d = state.days[k];
    d.meals = d.meals || {};
    MEALS.forEach(function (m) { if (!d.meals[m.id]) d.meals[m.id] = []; });
    return d;
  }
  function totals(k) {
    var d = day(k), t = { kcal: 0, p: 0, c: 0, f: 0 };
    MEALS.forEach(function (m) {
      (d.meals[m.id] || []).forEach(function (it) {
        t.kcal += it.kcal; t.p += it.p; t.c += it.c; t.f += it.f;
      });
    });
    t.kcal = r0(t.kcal); t.p = r1(t.p); t.c = r1(t.c); t.f = r1(t.f);
    return t;
  }
  function target(k) { return state.targets[day(k).type] || state.targets.training; }
  function allFoods() { return window.FOODS.concat(state.customFoods); }
  function findFood(id) {
    var f = allFoods().filter(function (x) { return x.id === id; })[0];
    return f || { id: id, name: '未知食物', cat: '我的', kcal: 0, p: 0, c: 0, f: 0, units: [] };
  }
  function isAvoid(name) {
    return (state.profile.avoid || []).some(function (a) { return a && name.indexOf(a) > -1; });
  }

  /* ---------------- 视图状态 ---------------- */
  var tab = 'today';
  var logDate = todayKey();
  var foodQ = '', foodCat = '全部';
  var mTab = /[?&]tab=(\w+)/.exec(location.search);
  if (mTab && ['today', 'study', 'log', 'foods', 'me'].indexOf(mTab[1]) > -1) tab = mTab[1];

  /* ---------------- 渲染 ---------------- */
  var view = document.getElementById('view');

  function render() {
    if (tab === 'today') view.innerHTML = viewToday();
    else if (tab === 'study') view.innerHTML = viewStudy();
    else if (tab === 'log') view.innerHTML = viewLog();
    else if (tab === 'foods') view.innerHTML = viewFoods();
    else view.innerHTML = viewMe();
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('on', b.dataset.tab === tab);
    });
    window.scrollTo(0, 0);
  }

  function head(eyebrow, title, right) {
    return '<div class="topbar"><div><div class="eyebrow">' + eyebrow + '</div><h1>' + title + '</h1></div>' + (right || '') + '</div>';
  }

  function bar(label, val, tgt, color, unit) {
    var p = tgt > 0 ? Math.min(100, val / tgt * 100) : 0;
    return '' +
      '<div class="macro">' +
        '<div class="macro-top"><span class="macro-name">' + label + '</span>' +
        '<span class="macro-val"><b>' + r0(val) + '</b><i>/ ' + r0(tgt) + (unit || 'g') + '</i></span></div>' +
        '<div class="track"><span style="width:' + p + '%;background:' + color + '"></span></div>' +
      '</div>';
  }

  function viewToday() {
    var k = todayKey(), d = day(k), t = totals(k), tg = target(k);
    var left = tg.kcal - t.kcal;
    var C = 2 * Math.PI * 78;
    var p = Math.min(1, t.kcal / tg.kcal);
    var over = left < 0;

    var s = head(dateLabel(k).replace(' · ', ' · '), '今日',
      '<div class="seg" data-act="daytype">' +
        '<button class="' + (d.type === 'training' ? 'on' : '') + '" data-type="training">训练日</button>' +
        '<button class="' + (d.type === 'rest' ? 'on' : '') + '" data-type="rest">休息日</button>' +
      '</div>');

    s += '<section class="card hero">' +
      '<div class="ring-wrap">' +
        '<svg viewBox="0 0 200 200" class="ring">' +
          '<circle cx="100" cy="100" r="78" class="ring-bg"/>' +
          '<circle cx="100" cy="100" r="78" class="ring-fg' + (over ? ' over' : '') + '" ' +
            'stroke-dasharray="' + C + '" stroke-dashoffset="' + (C * (1 - p)) + '"/>' +
        '</svg>' +
        '<div class="ring-center">' +
          '<div class="ring-num">' + (over ? '+' : '') + Math.abs(r0(left)) + '</div>' +
          '<div class="ring-label">' + (over ? '千卡超出' : '千卡可吃') + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="hero-meta">' +
        '<div><span>已摄入</span><b>' + t.kcal + '</b></div>' +
        '<div><span>目标</span><b>' + tg.kcal + '</b></div>' +
        '<div><span>蛋白质</span><b>' + r0(t.p) + '<i>g</i></b></div>' +
      '</div>' +
    '</section>';

    s += '<section class="card">' +
      '<div class="card-head"><h2>三大营养素</h2><span class="hint">今天还差 ' +
        Math.max(0, r0(tg.p - t.p)) + 'g 蛋白</span></div>' +
      bar('蛋白质', t.p, tg.p, 'var(--lime)') +
      bar('碳水', t.c, tg.c, 'var(--blue)') +
      bar('脂肪', t.f, tg.f, 'var(--orange)') +
    '</section>';

    var wl = d.water || 0;
    s += '<div class="grid2">' +
      '<section class="card mini">' +
        '<div class="mini-head"><span>饮水</span><b>' + (wl / 1000).toFixed(2).replace(/\.?0+$/, '') + 'L</b></div>' +
        '<div class="cups">' + cups(wl) + '</div>' +
        '<div class="mini-actions"><button class="ghost" data-act="water" data-d="-1">−</button>' +
        '<button class="solid" data-act="water" data-d="1">+250ml</button></div>' +
      '</section>' +
      '<section class="card mini">' +
        '<div class="mini-head"><span>体重</span><b>' + (d.weight || state.profile.weight) + '<i>kg</i></b></div>' +
        '<div class="mini-sub">' + weightTrend() + '</div>' +
        '<div class="mini-actions"><button class="solid full" data-act="weigh">记录体重</button></div>' +
      '</section>' +
    '</div>';

    s += '<section class="card"><div class="card-head"><h2>近 7 天</h2><span class="hint">热量 / 目标</span></div>' + weekBars() + '</section>';

    s += '<button class="fab-add" data-act="quickadd">＋ 记录吃了什么</button>';
    return s;
  }

  function cups(ml) {
    var n = Math.round(ml / WATER_STEP), out = '';
    for (var i = 0; i < 12; i++) out += '<span class="cup' + (i < n ? ' on' : '') + '"></span>';
    return out;
  }

  function weightTrend() {
    var keys = Object.keys(state.days).filter(function (k) { return state.days[k].weight; }).sort();
    if (keys.length < 2) return '<span class="dim">再记一次就有趋势</span>';
    var a = state.days[keys[keys.length - 2]].weight, b = state.days[keys[keys.length - 1]].weight;
    var diff = r1(b - a);
    return '<span class="' + (diff >= 0 ? 'up' : 'down') + '">' + (diff >= 0 ? '↑ +' : '↓ ') + diff + 'kg</span> <span class="dim">较上次</span>';
  }

  function weekBars() {
    var out = '<div class="bars">';
    for (var i = 6; i >= 0; i--) {
      var k = shiftKey(todayKey(), -i), t = totals(k), tg = target(k);
      var p = tg.kcal ? Math.min(100, t.kcal / tg.kcal * 100) : 0;
      var dt = parseKey(k);
      out += '<div class="barcol">' +
        '<div class="barcol-track"><span style="height:' + p + '%"></span></div>' +
        '<div class="barcol-lb">' + (dt.getMonth() + 1) + '/' + dt.getDate() + '</div>' +
      '</div>';
    }
    return out + '</div>';
  }

  /* ---------------- 学习模块 ---------------- */
  var SUBJECTS = [
    { id: 'english', name: '英语' },
    { id: 'anatomy', name: '运动解剖' },
    { id: 'reading', name: '自由阅读' }
  ];
  var ANATOMY_STEPS = [
    { t: '第 1 步 · 建骨架', d: '只认骨骼和四个关节：肩、髋、膝、踝。今天从膝开始——股骨、胫骨、髌骨，先在书上找到，再摸自己的膝盖对上。' },
    { t: '第 2 步 · 挂肌肉', d: '每块肌肉只记三件事：起点、止点、功能。别背整段文字，用手在自己身上找出位置，摸到了才算会。' },
    { t: '第 3 步 · 配图谱', d: '教材配一本彩色图谱（奈特）或手机装 Complete Anatomy 看 3D。文字 + 图像 + 手感，三条一起记才留得住。' },
    { t: '第 4 步 · 再啃难的', d: '神经、循环、生物力学放到最后。前面三样不牢，直接看这些只会挫败。' }
  ];

  function subjectName(id) {
    var s = SUBJECTS.filter(function (x) { return x.id === id; })[0];
    return s ? s.name : '英语';
  }
  function studyDay(k) {
    k = k || todayKey();
    if (!state.study) state.study = { days: {} };
    if (!state.study.days[k]) state.study.days[k] = { words: 0, read: null, out: null };
    var d = state.study.days[k];
    if (!d.read) d.read = { subject: 'english', minutes: 0, key: '' };
    if (!d.out) d.out = { subject: 'english', text: '', feedback: '' };
    return d;
  }
  function studyDone(k) {
    var d = studyDay(k), n = 0;
    if (d.words > 0) n++;
    if (d.read.minutes > 0 || d.read.key) n++;
    if (d.out.text) n++;
    return n;
  }
  function setStudy(path, v) {
    var d = studyDay(todayKey()), p = path.split('.');
    if (p.length === 1) d[p[0]] = v; else d[p[0]][p[1]] = v;
    save();
    var badge = document.getElementById('st-badge');
    if (badge) badge.textContent = '今日 ' + studyDone() + '/3';
    queueSync();
  }

  function viewStudy() {
    var k = todayKey(), d = studyDay(k), done = studyDone(k);
    var s = head('四级 → 六级 → 雅思', '学习',
      '<div class="pill" id="st-badge">今日 ' + done + '/3</div>');

    s += '<section class="card"><div class="card-head"><h2>今天三件事</h2><span class="hint">20 分钟能做完</span></div>' +
      '<div class="steps">' +
        stepRow('单词', d.words > 0 ? d.words + ' 个' : '未做', d.words > 0) +
        stepRow('精读', d.read.minutes > 0 ? subjectName(d.read.subject) + ' · ' + d.read.minutes + ' 分钟' : '未做', d.read.minutes > 0 || !!d.read.key) +
        stepRow('输出', d.out.text ? '已写 ' + d.out.text.length + ' 字' : '未做', !!d.out.text) +
      '</div>' +
      '<p class="note">只看课、只背词是纯输入，考场上考的是你能不能读懂、写得出。第二、三项才是提分的地方。</p>' +
    '</section>';

    /* 1 单词 */
    s += '<section class="card"><div class="card-head"><h2><i class="idx">1</i>单词</h2><span class="hint">今天背了多少个</span></div>' +
      '<div class="words-row">' +
        '<button class="ghost sq" data-act="words" data-d="-10">−10</button>' +
        '<input id="sw-words" data-study="words" type="number" inputmode="numeric" value="' + (d.words || 0) + '">' +
        '<button class="ghost sq" data-act="words" data-d="10">+10</button>' +
      '</div>' +
    '</section>';

    /* 2 精读 */
    s += '<section class="card"><div class="card-head"><h2><i class="idx">2</i>精读一段</h2><span class="hint">看不懂的句子才是重点</span></div>' +
      '<div class="chips">' + SUBJECTS.map(function (x) {
        return '<button class="chip' + (d.read.subject === x.id ? ' on' : '') + '" data-act="rsub" data-s="' + x.id + '">' + x.name + '</button>';
      }).join('') + '</div>' +
      '<label class="frow-in" style="margin-top:12px"><span>时长</span>' +
        '<input data-study="read.minutes" type="number" inputmode="numeric" value="' + (d.read.minutes || '') + '"><i>分钟</i></label>' +
      '<textarea class="ta" data-study="read.key" rows="3" placeholder="' + (d.read.subject === 'anatomy'
        ? '今天看懂的结构 / 起止点 / 功能，用自己的话写'
        : '抄一句今天没看懂的句子，写下你的理解') + '">' + esc(d.read.key) + '</textarea>' +
    '</section>';

    /* 3 输出 + AI 批改 */
    s += '<section class="card"><div class="card-head"><h2><i class="idx">3</i>输出</h2><span class="hint">这一步决定你有没有进步</span></div>' +
      '<div class="chips">' + SUBJECTS.map(function (x) {
        return '<button class="chip' + (d.out.subject === x.id ? ' on' : '') + '" data-act="osub" data-s="' + x.id + '">' + x.name + '</button>';
      }).join('') + '</div>' +
      '<textarea class="ta" data-study="out.text" rows="4" placeholder="' + (d.out.subject === 'anatomy'
        ? '用三句话说清今天这个结构：它在哪、连着谁、干什么'
        : '写 2 句英文：今天做的一件具体的事 + 你的感受') + '">' + esc(d.out.text) + '</textarea>' +
      '<div class="btns">' +
        '<button class="solid" data-act="aisend">交给 AI 批改</button>' +
        '<button class="ghost" data-act="deepseek">打开 DeepSeek</button>' +
      '</div>' +
      '<div class="aibox">' +
        '<div class="aibox-h"><span>AI 批改结果</span><button class="linkbtn" data-act="aipaste">粘贴回答</button></div>' +
        '<textarea class="ta" data-study="out.feedback" rows="5" placeholder="点上面「交给 AI 批改」→ 到 DeepSeek 粘贴、发送 → 复制回答 → 回来点「粘贴回答」">' + esc(d.out.feedback) + '</textarea>' +
      '</div>' +
    '</section>';

    /* 近 7 天 */
    s += '<section class="card"><div class="card-head"><h2>近 7 天</h2><span class="hint">每天完成几项</span></div>' +
      '<div class="bars">' + studyBars() + '</div></section>';

    /* 解剖路线 */
    s += '<section class="card"><div class="card-head"><h2>运动解剖学 · 从哪入手</h2><span class="hint">别从第一页读</span></div>' +
      ANATOMY_STEPS.map(function (x) {
        return '<div class="stepitem"><div class="stept">' + x.t + '</div><div class="stepd">' + x.d + '</div></div>';
      }).join('') +
    '</section>';

    return s;
  }

  function stepRow(name, val, on) {
    return '<div class="steprow"><span class="dot' + (on ? ' on' : '') + '"></span>' +
      '<span class="stepn">' + name + '</span><span class="stepv">' + val + '</span></div>';
  }
  function studyBars() {
    var out = '';
    for (var i = 6; i >= 0; i--) {
      var k = shiftKey(todayKey(), -i), n = studyDone(k);
      var dt = parseKey(k);
      out += '<div class="barcol"><div class="barcol-track"><span style="height:' + Math.round(n / 3 * 100) + '%"></span></div>' +
        '<div class="barcol-lb">' + (dt.getMonth() + 1) + '/' + dt.getDate() + '</div></div>';
    }
    return out;
  }

  function buildPrompt(d) {
    var body = d.out.text.trim();
    if (d.out.subject === 'anatomy') {
      return '你是运动解剖学老师，要求严格。下面是我今天的复述，请：\n' +
        '1) 逐条指出事实性错误（结构名称、起止点、功能）\n' +
        '2) 补充我漏掉的关键点，不超过 3 条\n' +
        '3) 最后用一句话指出我最该补的短板\n' +
        '不要客套，直接给结论。\n\n我的复述：\n"""\n' + body + '\n"""';
    }
    if (d.out.subject === 'reading') {
      return '你是我的阅读教练。下面是我今天读书后的输出，请：\n' +
        '1) 指出我理解偏了或漏掉的地方\n' +
        '2) 提 2 个能逼我想得更深的问题\n' +
        '3) 一句话说明我该往哪个方向继续读\n' +
        '不要客套。\n\n我的输出：\n"""\n' + body + '\n"""';
    }
    return '你是我的英语老师，要求严格。下面是我今天写的英文，请：\n' +
      '1) 逐句指出语法和用词错误，给出修改\n' +
      '2) 给一个更地道的版本\n' +
      '3) 用一句话指出我最该改的一个毛病\n' +
      '不要客套，直接给结论。\n\n我写的：\n"""\n' + body + '\n"""';
  }

  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () {
        toast('提示词已复制，去 DeepSeek 粘贴');
      }, function () { fallbackCopy(t); });
    } else fallbackCopy(t);
  }
  function fallbackCopy(t) {
    var a = document.createElement('textarea');
    a.value = t; a.style.position = 'fixed'; a.style.opacity = '0';
    document.body.appendChild(a); a.select();
    try { document.execCommand('copy'); toast('提示词已复制'); } catch (e) { toast('复制失败，请手动选择'); }
    document.body.removeChild(a);
  }

  function aiSend() {
    var d = studyDay(todayKey());
    if (!d.out.text.trim()) { toast('先写下今天的输出'); return; }
    var p = buildPrompt(d);
    if (navigator.share) {
      navigator.share({ text: p }).catch(function () { copyText(p); });
    } else copyText(p);
  }

  function aiPaste() {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      toast('这个浏览器不能读剪贴板，请长按下面输入框手动粘贴'); return;
    }
    navigator.clipboard.readText().then(function (t) {
      if (!t || !t.trim()) { toast('剪贴板是空的'); return; }
      setStudy('out.feedback', t.trim());
      render();
      toast('已粘入批改结果');
    }, function () {
      toast('读取被拒绝，请长按输入框手动粘贴');
    });
  }

  function viewLog() {
    var d = day(logDate), t = totals(logDate), tg = target(logDate);
    var s = head(dateLabel(logDate), '记录',
      '<div class="datenav"><button data-act="day" data-d="-1">‹</button>' +
      '<button data-act="day" data-d="0">今</button>' +
      '<button data-act="day" data-d="1">›</button></div>');

    s += '<div class="strip">' +
      '<div><span>热量</span><b>' + t.kcal + '<i>/' + tg.kcal + '</i></b></div>' +
      '<div><span>蛋白</span><b>' + r0(t.p) + '<i>/' + tg.p + 'g</i></b></div>' +
      '<div><span>碳水</span><b>' + r0(t.c) + '<i>/' + tg.c + 'g</i></b></div>' +
    '</div>';

    MEALS.forEach(function (m) {
      var items = d.meals[m.id] || [];
      var mk = items.reduce(function (a, b) { return a + b.kcal; }, 0);
      var mp = items.reduce(function (a, b) { return a + b.p; }, 0);
      s += '<section class="card meal">' +
        '<div class="meal-head"><div class="meal-t"><span class="micon">' + m.icon + '</span>' + m.name + '</div>' +
          '<div class="meal-k"><b>' + r0(mk) + '</b> kcal <i>' + r0(mp) + 'g 蛋白</i></div></div>' +
        (items.length ? '<ul class="items">' + items.map(function (it, i) {
          return '<li><div class="it-name">' + esc(it.name) +
            (isAvoid(it.name) ? '<em class="tag">忌口</em>' : '') + '</div>' +
            '<div class="it-num">' + it.g + 'g · ' + r0(it.kcal) + 'kcal · ' + r0(it.p) + 'g</div>' +
            '<button class="del" data-act="del" data-meal="' + m.id + '" data-i="' + i + '">×</button></li>';
        }).join('') + '</ul>' : '<div class="empty">还没记</div>') +
        '<button class="add-row" data-act="add" data-meal="' + m.id + '">＋ 添加食物</button>' +
      '</section>';
    });
    return s;
  }

  function viewFoods() {
    var list = allFoods().filter(function (f) {
      if (foodCat !== '全部' && f.cat !== foodCat) return false;
      if (foodQ && f.name.indexOf(foodQ) < 0) return false;
      return true;
    });
    var s = head('常用 ' + allFoods().length + ' 种', '食物库',
      '<button class="ghost small" data-act="newfood">＋ 自定义</button>');
    s += '<div class="search"><input id="foodQ" placeholder="搜索食物，如 鸡胸、米饭" value="' + esc(foodQ) + '"></div>';
    s += '<div class="chips">' + ['全部'].concat(window.CATS, ['我的']).map(function (c) {
      return '<button class="chip' + (c === foodCat ? ' on' : '') + '" data-act="cat" data-cat="' + c + '">' + c + '</button>';
    }).join('') + '</div>';

    if (!list.length) s += '<div class="empty big">没有匹配的食物<br><span class="dim">可以点右上角自己加一个</span></div>';
    s += '<div class="flist">' + list.map(function (f) {
      return '<button class="frow" data-act="pick" data-id="' + f.id + '">' +
        '<div class="frow-l"><div class="fname">' + esc(f.name) +
          (isAvoid(f.name) ? '<em class="tag">忌口</em>' : '') + '</div>' +
          '<div class="fsub">' + f.cat + ' · 每100g</div></div>' +
        '<div class="frow-r"><b>' + f.kcal + '</b><span>kcal</span><i>蛋白 ' + f.p + 'g</i></div>' +
      '</button>';
    }).join('') + '</div>';
    return s;
  }

  function viewMe() {
    var p = state.profile, t = state.targets;
    var s = head('档案与目标', '我的', '');
    s += '<section class="card">' +
      '<div class="card-head"><h2>身体档案</h2></div>' +
      '<div class="form">' +
        row('身高', 'height', p.height, 'cm', 'number') +
        row('体重', 'weight', p.weight, 'kg', 'number') +
        row('出生年', 'birthYear', p.birthYear, '年', 'number') +
        row('目标', 'goal', p.goal, '', 'text') +
      '</div>' +
      '<div class="avoid"><div class="avoid-t">忌口 / 不吃</div>' +
        '<div class="chips">' + (p.avoid || []).map(function (a) {
          return '<button class="chip on" data-act="rmavoid" data-a="' + esc(a) + '">' + esc(a) + ' ×</button>';
        }).join('') + '<button class="chip" data-act="addavoid">＋ 添加</button></div></div>' +
    '</section>';

    s += '<section class="card">' +
      '<div class="card-head"><h2>热量与营养目标</h2></div>' +
      tgtBlock('训练日', 'training', t.training) +
      tgtBlock('休息日', 'rest', t.rest) +
      '<p class="note">按 190cm / 72kg 增肌设定：每周涨 0.3–0.4kg，连续两周不涨就把训练日加到 3600 kcal。</p>' +
    '</section>';

    s += '<section class="card">' +
      '<div class="card-head"><h2>自动备份</h2><span class="hint" id="sync-state">' + syncLabel() + '</span></div>' +
      '<div class="form">' +
        '<label class="frow-in"><span>私有库</span>' +
          '<input data-bind="sync.repo" type="text" value="' + esc(state.sync.repo) + '" placeholder="用户名/仓库名"></label>' +
        '<label class="frow-in"><span>令牌</span>' +
          '<input data-bind="sync.token" type="password" value="' + esc(state.sync.token) + '" placeholder="github_pat_..."></label>' +
        '<label class="frow-in"><span>自动同步</span>' +
          '<input id="sync-auto" type="checkbox"' + (state.sync.auto ? ' checked' : '') + ' style="flex:0 0 auto;width:22px;height:22px;accent-color:#C6FF3D"><i></i></label>' +
      '</div>' +
      '<div class="btns"><button class="solid" data-act="syncnow">立即同步</button>' +
        '<button class="ghost" data-act="restore">从云端恢复</button></div>' +
      '<p class="note">记录会自动写进你的私有仓库，只有你能看。换手机时把仓库名和令牌填回来，点「从云端恢复」。令牌只保存在这台设备浏览器里。</p>' +
    '</section>';

    s += '<section class="card">' +
      '<div class="card-head"><h2>手动备份</h2><span class="hint">不依赖令牌</span></div>' +
      '<div class="btns">' +
        '<button class="solid" data-act="export">导出文件</button>' +
        '<button class="ghost" data-act="import">导入文件</button>' +
      '</div>' +
      '<p class="note">没有网络或不想用令牌时，导出 JSON 存网盘，换设备后再导入。</p>' +
    '</section>';

    s += '<div class="foot">成长系统 · 饮食 + 学习<br>下一个模块：训练</div>';
    return s;
  }

  function row(label, field, val, unit, type) {
    return '<label class="frow-in"><span>' + label + '</span>' +
      '<input data-bind="profile.' + field + '" type="' + type + '" value="' + esc(String(val == null ? '' : val)) + '"' +
      (type === 'number' ? ' inputmode="decimal"' : '') + '><i>' + unit + '</i></label>';
  }
  function tgtBlock(name, key, v) {
    return '<div class="tgt"><div class="tgt-h">' + name + '</div><div class="tgt-grid">' +
      tgtIn(key, 'kcal', '热量', v.kcal, 'kcal') +
      tgtIn(key, 'p', '蛋白', v.p, 'g') +
      tgtIn(key, 'c', '碳水', v.c, 'g') +
      tgtIn(key, 'f', '脂肪', v.f, 'g') +
    '</div></div>';
  }
  function tgtIn(key, f, label, val, unit) {
    return '<label class="tgt-in"><span>' + label + '</span>' +
      '<input data-bind="targets.' + key + '.' + f + '" type="number" inputmode="numeric" value="' + val + '"><i>' + unit + '</i></label>';
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  /* ---------------- 弹层 ---------------- */
  var mask = document.getElementById('mask');
  var sheet = document.getElementById('sheet');
  function openSheet(html) { sheet.innerHTML = html; sheet.hidden = false; mask.hidden = false; requestAnimationFrame(function () { sheet.classList.add('show'); }); }
  function closeSheet() { sheet.classList.remove('show'); setTimeout(function () { sheet.hidden = true; mask.hidden = true; sheet.innerHTML = ''; }, 180); }

  var curFood = null, curMeal = 'breakfast', curGrams = 100;

  function openPortion(id, meal) {
    var f = findFood(id);
    curFood = f;
    curMeal = meal || mealByTime();
    curGrams = (f.units && f.units[0]) ? f.units[0][1] : 100;
    drawPortion();
  }
  function mealByTime() {
    var h = new Date().getHours();
    if (h < 10) return 'breakfast';
    if (h < 15) return 'lunch';
    if (h < 20) return 'dinner';
    return 'snack';
  }
  function drawPortion() {
    var f = curFood;
    var kcal = f.kcal * curGrams / 100, p = f.p * curGrams / 100;
    openSheet('<div class="sh-grab"></div>' +
      '<div class="sh-head"><div><div class="sh-name">' + esc(f.name) + '</div>' +
        '<div class="sh-sub">' + f.kcal + ' kcal / 100g</div></div>' +
        '<button class="sh-close" data-act="closesheet">×</button></div>' +
      '<div class="sh-units">' + (f.units || []).map(function (u) {
        return '<button class="chip' + (u[1] === curGrams ? ' on' : '') + '" data-act="unit" data-g="' + u[1] + '">' + u[0] + '</button>';
      }).join('') + '</div>' +
      '<div class="sh-grams"><input id="grams" type="number" inputmode="decimal" value="' + curGrams + '"><span>克</span></div>' +
      '<div class="sh-kcal"><b>' + r0(kcal) + '</b> kcal　蛋白 <b>' + r1(p) + '</b>g</div>' +
      '<div class="sh-meals">' + MEALS.map(function (m) {
        return '<button class="chip' + (m.id === curMeal ? ' on' : '') + '" data-act="meal" data-m="' + m.id + '">' + m.name + '</button>';
      }).join('') + '</div>' +
      '<button class="solid full big" data-act="confirm">加入' + nameOf(curMeal) + '</button>');
    var gi = document.getElementById('grams');
    if (gi) gi.addEventListener('input', function () {
      curGrams = Math.max(0, num(this.value, 0));
      var k = curFood.kcal * curGrams / 100, pp = curFood.p * curGrams / 100;
      var box = document.querySelector('.sh-kcal');
      box.innerHTML = '<b>' + r0(k) + '</b> kcal　蛋白 <b>' + r1(pp) + '</b>g';
    });
  }
  function nameOf(id) { return (MEALS.filter(function (m) { return m.id === id; })[0] || { name: '加餐' }).name; }

  function openCustom() {
    openSheet('<div class="sh-grab"></div>' +
      '<div class="sh-head"><div class="sh-name">自定义食物</div><button class="sh-close" data-act="closesheet">×</button></div>' +
      '<p class="note">填每 100g 的营养，以后就能一键记录。</p>' +
      '<div class="form tight">' +
        '<label class="frow-in"><span>名称</span><input id="cf-name" type="text" placeholder="如 食堂鸡腿饭"></label>' +
        '<label class="frow-in"><span>热量</span><input id="cf-kcal" type="number" inputmode="numeric" placeholder="kcal"><i>kcal</i></label>' +
        '<label class="frow-in"><span>蛋白质</span><input id="cf-p" type="number" inputmode="decimal" placeholder="0"><i>g</i></label>' +
        '<label class="frow-in"><span>碳水</span><input id="cf-c" type="number" inputmode="decimal" placeholder="0"><i>g</i></label>' +
        '<label class="frow-in"><span>脂肪</span><input id="cf-f" type="number" inputmode="decimal" placeholder="0"><i>g</i></label>' +
      '</div>' +
      '<button class="solid full big" data-act="savefood">保存</button>');
  }

  /* ---------------- 事件 ---------------- */
  document.addEventListener('click', function (e) {
    var tabBtn = e.target.closest('.tab');
    if (tabBtn) { tab = tabBtn.dataset.tab; render(); return; }

    var el = e.target.closest('[data-act]');
    if (!el) return;
    var act = el.dataset.act;

    if (act === 'daytype') {
      var b = e.target.closest('button[data-type]');
      if (!b) return;
      day(todayKey()).type = b.dataset.type; save(); render(); return;
    }
    if (act === 'day') {
      var d = +el.dataset.d;
      logDate = d === 0 ? todayKey() : shiftKey(logDate, d);
      render(); return;
    }
    if (act === 'water') {
      var dd = day(todayKey());
      dd.water = Math.max(0, (dd.water || 0) + (+el.dataset.d) * WATER_STEP);
      if (dd.water > WATER_GOAL * 2) dd.water = WATER_GOAL * 2;
      save(); render(); queueSync(); return;
    }
    if (act === 'weigh') { askWeight(); return; }
    if (act === 'quickadd') { tab = 'foods'; render(); document.getElementById('foodQ').focus(); return; }
    if (act === 'add') { tab = 'foods'; window.__mealPick = el.dataset.meal; render(); return; }
    if (act === 'del') {
      var dk = day(logDate);
      dk.meals[el.dataset.meal].splice(+el.dataset.i, 1);
      save(); render(); toast('已删除'); queueSync(); return;
    }
    if (act === 'cat') { foodCat = el.dataset.cat; render(); return; }
    if (act === 'pick') { openPortion(el.dataset.id, window.__mealPick); window.__mealPick = null; return; }
    if (act === 'unit') { curGrams = +el.dataset.g; drawPortion(); return; }
    if (act === 'meal') { curMeal = el.dataset.m; drawPortion(); return; }
    if (act === 'confirm') {
      var f = curFood, g = curGrams;
      if (!g || g <= 0) { toast('份量要大于 0'); return; }
      if (isAvoid(f.name) && !confirm('「' + f.name + '」在你的忌口名单里，仍然要记吗？')) return;
      var k = day(logDate);
      k.meals[curMeal].push({
        name: f.name, g: r0(g),
        kcal: r1(f.kcal * g / 100), p: r1(f.p * g / 100),
        c: r1(f.c * g / 100), f: r1(f.f * g / 100)
      });
      save(); closeSheet(); render(); toast('已加入' + nameOf(curMeal)); queueSync(); return;
    }
    if (act === 'closesheet') { closeSheet(); return; }
    if (act === 'newfood') { openCustom(); return; }
    if (act === 'savefood') {
      var name = (document.getElementById('cf-name').value || '').trim();
      if (!name) { toast('先填名称'); return; }
      state.customFoods.push({
        id: 'c' + Date.now(), name: name, cat: '我的',
        kcal: num(document.getElementById('cf-kcal').value, 0),
        p: num(document.getElementById('cf-p').value, 0),
        c: num(document.getElementById('cf-c').value, 0),
        f: num(document.getElementById('cf-f').value, 0),
        units: [['100g', 100]]
      });
      save(); closeSheet(); render(); toast('已保存'); return;
    }
    if (act === 'rmavoid') {
      state.profile.avoid = state.profile.avoid.filter(function (a) { return a !== el.dataset.a; });
      save(); render(); return;
    }
    if (act === 'addavoid') {
      var a = prompt('添加一个忌口（如 香菜）');
      if (a && a.trim()) { state.profile.avoid = (state.profile.avoid || []).concat([a.trim()]); save(); render(); }
      return;
    }
    if (act === 'words') {
      var sd = studyDay(todayKey());
      var nw = num(sd.words, 0) + (+el.dataset.d);
      setStudy('words', nw < 0 ? 0 : nw);
      render(); return;
    }
    if (act === 'rsub') { setStudy('read.subject', el.dataset.s); render(); return; }
    if (act === 'osub') { setStudy('out.subject', el.dataset.s); render(); return; }
    if (act === 'aisend') { aiSend(); return; }
    if (act === 'deepseek') { window.open('https://chat.deepseek.com/', '_blank'); return; }
    if (act === 'aipaste') { aiPaste(); return; }
    if (act === 'export') { exportData(); return; }
    if (act === 'import') { importData(); return; }
    if (act === 'syncnow') { syncDay(todayKey()); return; }
    if (act === 'restore') { restoreAll(); return; }
  });

  mask.addEventListener('click', closeSheet);

  document.addEventListener('change', function (e) {
    if (e.target.id === 'sync-auto') {
      state.sync.auto = e.target.checked;
      save();
      setSyncState(syncLabel());
      if (e.target.checked) queueSync();
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'foodQ') {
      foodQ = e.target.value;
      render();
      var qi = document.getElementById('foodQ');
      if (qi) {
        qi.focus();
        qi.setSelectionRange(qi.value.length, qi.value.length);
      }
      return;
    }
    var stPath = e.target.getAttribute && e.target.getAttribute('data-study');
    if (stPath) {
      setStudy(stPath, e.target.type === 'number' ? num(e.target.value, 0) : e.target.value);
      return;
    }
    var bind = e.target.getAttribute && e.target.getAttribute('data-bind');
    if (bind) {
      var v = e.target.type === 'number' ? num(e.target.value, 0) : e.target.value;
      if (bind.indexOf('targets.') === 0) {
        var p = bind.split('.');
        state.targets[p[1]][p[2]] = v;
      } else if (bind.indexOf('profile.') === 0) {
        state.profile[bind.split('.')[1]] = v;
      } else if (bind.indexOf('sync.') === 0) {
        state.sync[bind.split('.')[1]] = v;
      }
      save();
    }
  });

  /* ---------------- GitHub 私有库自动备份 ---------------- */
  var DATA_DIR = 'data/diet/';
  var syncTimer = null, syncing = false;

  function syncReady() {
    var s = state.sync || {};
    return !!(s.repo && s.token && String(s.token).length > 20);
  }
  function apiUrl(path) {
    return 'https://api.github.com/repos/' + state.sync.repo + '/contents/' + path;
  }
  function headers() {
    return {
      'Authorization': 'Bearer ' + state.sync.token,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json'
    };
  }
  function b64enc(str) { return btoa(unescape(encodeURIComponent(str))); }
  function b64dec(b) { return decodeURIComponent(escape(atob(String(b).replace(/\s/g, '')))); }
  function timeOf(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    return pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function setSyncState(text) {
    var el = document.getElementById('sync-state');
    if (el) el.textContent = text;
  }
  function syncLabel() {
    var s = state.sync || {};
    if (!syncReady()) return '未配置';
    if (s.lastError) return '上次失败';
    if (s.lastSync) return '上次 ' + timeOf(s.lastSync);
    return '待同步';
  }

  function queueSync() {
    if (!state.sync.auto || !syncReady()) return;
    setSyncState('等待同步…');
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { syncDay(todayKey()); }, 1200);
  }

  function syncDay(k) {
    if (syncing) return Promise.resolve();
    if (!syncReady()) { setSyncState('未配置'); return Promise.resolve(); }
    syncing = true;
    setSyncState('同步中…');
    var path = DATA_DIR + k + '.json';
    var body = JSON.stringify({ date: k, updatedAt: new Date().toISOString(), day: state.days[k] || null,
      study: (state.study && state.study.days && state.study.days[k]) || null }, null, 1);

    return getFile(path).then(function (info) {
      var payload = {
        message: 'diet: ' + k,
        content: b64enc(body),
        branch: state.sync.branch || 'main'
      };
      if (info && info.sha) payload.sha = info.sha;
      return fetch(apiUrl(path), { method: 'PUT', headers: headers(), body: JSON.stringify(payload) });
    }).then(function (r) {
      if (!r.ok) return r.text().then(function (t) { throw new Error(r.status + ' ' + t.slice(0, 100)); });
      state.sync.lastSync = new Date().toISOString();
      state.sync.lastError = null;
      save();
      setSyncState('已同步 ' + timeOf(state.sync.lastSync));
      toast('已备份到私有库');
    }).catch(function (err) {
      state.sync.lastError = String(err.message || err);
      save();
      setSyncState('失败 ' + state.sync.lastError.slice(0, 30));
    }).then(function () { syncing = false; });
  }

  function getFile(path) {
    return fetch(apiUrl(path) + '?ref=' + (state.sync.branch || 'main'), { headers: headers() })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function restoreAll() {
    if (!syncReady()) { toast('先填仓库和令牌'); return; }
    setSyncState('拉取中…');
    var dir = apiUrl(DATA_DIR) + '?ref=' + (state.sync.branch || 'main');
    fetch(dir, { headers: headers() })
      .then(function (r) {
        if (r.status === 404) throw new Error('云端还没有数据目录');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (list) {
        if (!Array.isArray(list)) throw new Error('返回格式不对');
        var files = list.filter(function (f) { return /\.json$/.test(f.name); });
        if (!files.length) throw new Error('云端还没有记录');
        return Promise.all(files.map(function (f) {
          return fetch(f.url, { headers: headers() }).then(function (r) { return r.json(); });
        }));
      })
      .then(function (items) {
        var n = 0;
        items.forEach(function (it) {
          try {
            var obj = JSON.parse(b64dec(it.content));
            if (obj && obj.date && obj.day && !state.days[obj.date]) { state.days[obj.date] = obj.day; n++; }
            if (obj && obj.date && obj.study && !state.study.days[obj.date]) { state.study.days[obj.date] = obj.study; }
          } catch (e) { }
        });
        save(); render();
        setSyncState('已恢复 ' + n + ' 天');
        toast(n ? '已恢复 ' + n + ' 天记录' : '本地已是最新');
      })
      .catch(function (err) {
        setSyncState('拉取失败 ' + String(err.message || err).slice(0, 28));
        toast('拉取失败');
      });
  }

  function askWeight() {
    var w = prompt('今天的体重（kg）', state.profile.weight);
    if (w === null) return;
    var n = parseFloat(w);
    if (isNaN(n) || n <= 0) { toast('数字不对'); return; }
    var d = day(todayKey());
    d.weight = r1(n);
    state.profile.weight = r1(n);
    save(); render(); toast('已记录体重'); queueSync();
  }

  function exportData() {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = '成长系统备份-' + todayKey() + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(a.href); }, 3000);
    toast('备份已导出');
  }
  function importData() {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'application/json,.json';
    inp.onchange = function () {
      var file = inp.files[0];
      if (!file) return;
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var obj = JSON.parse(fr.result);
          if (!obj || !obj.profile || !obj.targets) throw new Error('bad');
          state = Object.assign(clone(DEFAULT_STATE), obj);
          save(); render(); toast('已恢复');
        } catch (err) { toast('文件不对，导入失败'); }
      };
      fr.readAsText(file);
    };
    inp.click();
  }

  var toastEl = document.getElementById('toast'), toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); toastEl.hidden = true; }, 1600);
  }

  /* ---------------- 启动 ---------------- */
  render();
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js').catch(function () { });
  }
})();
