/* 成长系统 v4 · 训练 / 饮食 / 学习 / 支出 / 我的（数据存本地，自动备份到私有库） */
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
  var DAY_CN = ['日', '一', '二', '三', '四', '五', '六'];

  /* 有球线：12 次一循环，不绑日期，按「第 N 次」往前推 */
  var BALL_SESSIONS = [
    {
      t: '控球基础 · 低重心', big: '60', unit: 'MIN', small: '5 个 block · 左手为主',
      brief: '刚回球场别急着得分。这一练只做一件事：<b>把球压到膝盖以下，眼睛离开球</b>。左手如果总掉球，就把它当主力手练。',
      blocks: [
        { t: '动态热身', d: '8 分钟：高抬腿 2×20 米 · 侧滑步 2×15 米 · 弓步走 2×10 米（膝刺痛就停）' },
        { t: '原地控球', d: '12 分钟：右手 4 分 / 左手 4 分 / 交替 4 分，运球不过膝，全程抬头' },
        { t: '移动控球', d: '15 分钟：全场直线 6 趟 · Z 字 6 趟 · 后退 4 趟，左手占一半' },
        { t: '组合动作', d: '15 分钟：胯下 8 字 3×30 秒 · 背后交替 3×30 秒 · in&out 3×20 次' },
        { t: '罚球 + 冷身', d: '10 分钟：罚球 50 个记命中 · 小腿与髋前侧各拉伸 2 分钟' }
      ]
    },
    {
      t: '变向节奏 · 交叉 / 胯下 / 背后', big: '65', unit: 'MIN', small: '脚先到 · 球后到',
      brief: '变向不是把球拍得更快，是<b>脚先到、球后到</b>。每个动作都要求：先迈脚，再推球，最后压肩。慢一点做对，比快一点做乱值钱。',
      blocks: [
        { t: '热身', d: '8 分钟：跳绳 2×60 秒 · 八字绕膝 20 次 · 髋部绕环各 10 次' },
        { t: '原地变向', d: '12 分钟：交叉 3×30 秒 · 胯下 3×30 秒 · 背后 3×30 秒，左右各一轮' },
        { t: '移动变向', d: '18 分钟：标志桶 5 个，每桶一个动作，来回 6 趟，左手先做' },
        { t: '变向第一步', d: '12 分钟：1 对 0，每次变向后必须第一步过人，不许原地绕' },
        { t: '冷身', d: '10 分钟：慢跑 3 分钟 + 股四头、髂胫束、臀肌各拉伸 2 分钟' }
      ]
    },
    {
      t: '三威胁 · 第一步', big: '65', unit: 'MIN', small: '探步短 · 第一步长',
      brief: '控卫的第一步决定你有没有下一拍。<b>接球先三威胁，脚尖朝篮，探步要短</b>——探步是为了让防守人动，不是为了过人。',
      blocks: [
        { t: '热身 + 球感', d: '10 分钟：绕腰 20 圈 · 指尖拨球 2 分钟 · 三威胁姿势 10 次' },
        { t: '探步启动', d: '15 分钟：左/右探步各 3×10 次，探完必须第一步跨出去' },
        { t: '直线突破', d: '15 分钟：三分线一步到罚球线 10 趟，左右各 5' },
        { t: '急停收球', d: '15 分钟：突破 2 步急停，收球护在胸前 10 次×2' },
        { t: '罚球 + 冷身', d: '10 分钟：罚球 50 个，记命中' }
      ]
    },
    {
      t: '两侧手终结', big: '70', unit: 'MIN', small: '左手先练 · 不加花活',
      brief: '比赛里没人管你哪只手舒服。<b>左手先从不擅长的那一侧练起</b>：先慢速打板，再加干扰，最后才谈对抗。',
      blocks: [
        { t: '热身', d: '8 分钟：动态拉伸 + 原地低运球 2 分钟' },
        { t: '篮下打板', d: '15 分钟：右手 20 个 / 左手 20 个，只用打板，不加运球' },
        { t: '一步上篮', d: '15 分钟：左右各 15 次，起跳脚固定，双脚落地' },
        { t: '反手 + 欧洲步', d: '15 分钟：每侧 10 次，护球手抬起' },
        { t: '罚球 + 冰敷', d: '12 分钟：罚球 30 个；左膝冰敷 10 分钟' }
      ]
    },
    {
      t: '抛投与对抗终结', big: '65', unit: 'MIN', small: '抛投 100 个 · 记命中',
      brief: '小个换防、大个补防，控卫最后靠的是<b>抛投</b>。今天抛投 100 个，命中不到 50 个就加练 30 个——用数据逼自己。',
      blocks: [
        { t: '热身', d: '8 分钟：动态拉伸 + 篮下投篮 20 个找手感' },
        { t: '原地抛投', d: '15 分钟：距篮 3 米，左右各 25 个，手腕最后拨球' },
        { t: '一步抛投', d: '15 分钟：运一步起，左右各 20 个' },
        { t: '对抗终结', d: '15 分钟：有人举手干扰，篮下 10 次×3 组，护球在前' },
        { t: '罚球 + 冷身', d: '10 分钟：罚球 30 个 + 拉伸' }
      ]
    },
    {
      t: '接球投篮机制', big: '60', unit: 'MIN', small: '接球即出手 · 不运球调整',
      brief: '投篮是脚的事，不是手的事。<b>接球前脚尖就朝篮</b>，接球即起，别先落地再瞄。今天不许运球调整。',
      blocks: [
        { t: '热身 + 定点', d: '10 分钟：篮下 20 个、罚球线 20 个，找手感' },
        { t: '接球投篮', d: '15 分钟：五个点各 10 个，接球即出手' },
        { t: '移动接球', d: '15 分钟：底线绕出接球，左右各 10 个' },
        { t: '三分', d: '12 分钟：弧顶 + 两个 45 度，各 15 个，记命中' },
        { t: '罚球 + 冷身', d: '8 分钟：罚球 20 个 + 肩部拉伸' }
      ]
    },
    {
      t: '运一步急停', big: '65', unit: 'MIN', small: '双脚落地 · 球在胸口',
      brief: '控卫的杀招是<b>运一步就停</b>。停不稳，后面所有选择都不存在。每个急停都要求：双脚落地、身体不后仰、球在胸口。',
      blocks: [
        { t: '热身', d: '8 分钟：动态拉伸 + 低运球 2 分钟' },
        { t: '原地急停', d: '12 分钟：运一步急停 15 次×2，左右各一组' },
        { t: '急停跳投', d: '18 分钟：中距离左右各 15 个，只数命中' },
        { t: '急停后传球', d: '12 分钟：急停→击地给内线 10 次×2' },
        { t: '罚球 + 冷身', d: '10 分钟：罚球 30 个 + 拉伸' }
      ]
    },
    {
      t: '挡拆阅读', big: '70', unit: 'MIN', small: '先喊防守 · 再动',
      brief: '挡拆不是跑套路，是<b>读防守</b>：绕掩护就投，换防就打大个，收缩就分球。每回合先喊出防守方式再动。',
      blocks: [
        { t: '热身 + 运球', d: '10 分钟：动态拉伸 + 双手交替运球 3 分钟' },
        { t: '掩护后急停', d: '15 分钟：绕掩护 10 次，急停中投' },
        { t: '换防单打', d: '15 分钟：对大个 10 次，先试探步再决定' },
        { t: '分球', d: '15 分钟：突破吸引后击地/外传各 10 次' },
        { t: '罚球 + 冷身', d: '12 分钟：罚球 30 个 + 冷身' }
      ]
    },
    {
      t: '防守脚步', big: '60', unit: 'MIN', small: '膝不内扣 · 重心不起伏',
      brief: '想上场先能防。<b>滑步时膝盖别内扣</b>，这是你术后最需要保护的动作模式。今天所有脚步都对着镜子或录像做。',
      blocks: [
        { t: '热身', d: '8 分钟：动态拉伸 + 侧向移动 2 分钟' },
        { t: '滑步', d: '15 分钟：左右各 4×15 米，重心不上下起伏' },
        { t: '后退跑 + 转身', d: '12 分钟：后退 10 米接转身冲刺 10 米 ×6' },
        { t: '1 对 1 防守', d: '15 分钟：对手 10 回合，只防不抢' },
        { t: '冷身 + 泡沫轴', d: '10 分钟：大腿前侧、外侧各 3 分钟' }
      ]
    },
    {
      t: '转换进攻', big: '65', unit: 'MIN', small: '第一传 · 三秒决定',
      brief: '快攻只练两件事：<b>第一传和终结</b>。抢到球先抬头找前场，三秒内做决定。今天全场冲刺 10 趟，每趟都要有人追。',
      blocks: [
        { t: '热身', d: '8 分钟：动态拉伸 + 加速跑 4×15 米' },
        { t: '全场冲刺', d: '12 分钟：底线到底线 10 趟，间隔 30 秒' },
        { t: '2 打 1 / 3 打 2', d: '20 分钟：各 8 回合，先传球再上篮' },
        { t: '追身终结', d: '15 分钟：有人追防下上篮 10 次×2' },
        { t: '罚球 + 冷身', d: '10 分钟：罚球 30 个 + 拉伸' }
      ]
    },
    {
      t: '弱手综合日', big: '75', unit: 'MIN', small: '一整天不碰右手',
      brief: '一整天不碰右手。<b>左手运、左手传、左手终结</b>，掉了就捡起来重做。这天会很难看，但两个月后它就是你上场的原因。',
      blocks: [
        { t: '热身 + 左手运球', d: '12 分钟：全程左手，抬头看前方' },
        { t: '左手传球', d: '15 分钟：对墙双手胸前 20 次 / 单手左手 20 次' },
        { t: '左手终结', d: '20 分钟：篮下 30 个，一步上篮 20 个' },
        { t: '左手对抗', d: '18 分钟：有人干扰下完成 10 次×2' },
        { t: '左手罚球 + 冷身', d: '10 分钟：左罚 20 个 + 拉伸' }
      ]
    },
    {
      t: '实战复盘 + 测试', big: '70', unit: 'MIN', small: '四样测试 · 写数字',
      brief: '每 12 次做一次考试。今天只测四样：<b>左手全场运球时间、罚球 50 个命中、三分 25 个命中、折返跑</b>。数字写下来，下一轮对比。',
      blocks: [
        { t: '热身', d: '10 分钟：动态拉伸 + 低运球 3 分钟' },
        { t: '测试 1', d: '左手全场运球 2 趟计时，掉了重来' },
        { t: '测试 2', d: '罚球 50 个，记录命中数' },
        { t: '测试 3', d: '三分 25 个记命中 + 折返跑 3 组' },
        { t: '录像复盘', d: '12 分钟：看这 12 次的一点进步和一点没改的毛病' }
      ]
    }
  ];

  /* 力量线：A 推 / B 拉 / C 腿 / D 核心+康复，4 次一循环 */
  var LIFT_SESSIONS = [
    {
      t: 'A · 上肢推', big: '30', unit: 'KG', small: '卧推 4×6 · 45 分钟',
      brief: '推的日子只看卧推。<b>最后一组还能多做两次</b>就是有余，下次加 2.5kg；最后两次要人扶，就退回原重量做满 5 组。',
      blocks: [
        { t: '热身', d: '8 分钟：空杆 2×10 · 弹力带肩外旋 2×15 · 俯卧撑 10 个' },
        { t: '卧推', d: '18 分钟：30kg 4×6，肩胛后收，杠碰胸再推' },
        { t: '哑铃肩推', d: '10 分钟：每侧 10kg 3×10，坐姿背贴靠垫' },
        { t: '绳索下压 + 面拉', d: '10 分钟：下压 3×12 · 面拉 3×15' },
        { t: '冷身', d: '4 分钟：胸椎、胸大肌各拉伸 2 分钟' }
      ]
    },
    {
      t: 'B · 上肢拉', big: '3', unit: '组', small: '引体到力竭 · 45 分钟',
      brief: '今天先做一件事：<b>测出引体极限</b>。做不满 5 个就做离心——跳上去，用 5 秒慢慢放下来，比硬拉省时间。',
      blocks: [
        { t: '热身', d: '8 分钟：划船机 3 分钟 + 肩胛激活 2×12' },
        { t: '引体向上', d: '15 分钟：3 组到力竭，记第一组个数；不足 5 个改离心 5 秒' },
        { t: '单臂哑铃划船', d: '12 分钟：每侧 12.5kg 3×10，肘贴身体往后拉' },
        { t: '弯举 + 农夫走', d: '12 分钟：弯举 2×12 · 农夫走 3×30 米（每手 16kg）' },
        { t: '冷身', d: '5 分钟：背阔肌、二头拉伸' }
      ]
    },
    {
      t: 'C · 下肢护膝', big: '52.5', unit: 'KG', small: '箱式半蹲 5×5 · 50 分钟',
      brief: '术后的腿不靠感觉，靠箱子。<b>坐到箱上停半秒</b>再起，膝盖对着脚尖，别内扣。52.5kg 做干净再谈加重。',
      blocks: [
        { t: '热身', d: '8 分钟：自行车 5 分钟 + 徒手深蹲 2×15' },
        { t: '箱式半蹲', d: '20 分钟：52.5kg 5×5，触箱停半秒，膝不内扣' },
        { t: '罗马尼亚硬拉', d: '12 分钟：40kg 3×8，髋往后坐，背别圆' },
        { t: '单腿臀桥 + 提踵', d: '12 分钟：臀桥每侧 3×12 · 提踵 3×20' },
        { t: '冷身', d: '5 分钟：股四头、臀肌拉伸' }
      ]
    },
    {
      t: 'D · 核心 + 膝康复', big: '45', unit: 'MIN', small: '核心 + 康复 · 45 分钟',
      brief: '核心不是卷腹，是<b>抗旋转</b>。康复动作做慢，每个数到 3 秒，做完大腿前侧发热才对。',
      blocks: [
        { t: '热身', d: '5 分钟：快走或自行车' },
        { t: '平板 + 侧支撑', d: '12 分钟：平板 3×45 秒 · 侧支撑每侧 3×30 秒' },
        { t: '死虫 + 鸟狗', d: '10 分钟：各 3×10 每侧，腰不离地' },
        { t: '直腿抬高 + 靠墙静蹲', d: '12 分钟：抬高 3×15 · 静蹲 3×45 秒' },
        { t: '泡沫轴 + 单腿平衡', d: '6 分钟：大腿前侧 3 分钟 · 单腿站 3×30 秒' }
      ]
    }
  ];

  var DEFAULT_STATE = {
    profile: {
      height: 190, weight: 72, birthYear: 2007, sex: 'male',
      goal: '增肌 + 运动表现', avoid: ['茄子'],
      note: '不吃蛋白粉（怕长痘）', trainWeekly: 5
    },
    targets: {
      training: { kcal: 3400, p: 140, c: 548, f: 72 },
      rest: { kcal: 3000, p: 140, c: 435, f: 72 }
    },
    days: {},
    study: blankStudy(),
    train: { ball: blankTrack(), lift: blankTrack(), history: [], coach: '' },
    expenses: { budget: 500, items: [] },
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
      return normalize(JSON.parse(raw));
    } catch (e) { return clone(DEFAULT_STATE); }
  }
  function normalize(s) {
    var out = Object.assign(clone(DEFAULT_STATE), s || {});
    out.profile = Object.assign(clone(DEFAULT_STATE.profile), (s && s.profile) || {});
    out.targets = Object.assign(clone(DEFAULT_STATE.targets), (s && s.targets) || {});
    out.sync = Object.assign(clone(DEFAULT_STATE.sync), (s && s.sync) || {});
    out.days = (s && s.days) || {};
    var st = (s && s.study) || {};
    out.study = blankStudy();
    if (typeof st.idx === 'number') {
      out.study.idx = st.idx;
      out.study.en = normFlags(st.en);
      out.study.cscs = normFlags(st.cscs);
      out.study.right = num(st.right, 0);
      out.study.total = num(st.total, 0);
      out.study.out = typeof st.out === 'string' ? st.out : '';
      out.study.feedback = typeof st.feedback === 'string' ? st.feedback : '';
      out.study.history = Array.isArray(st.history) ? st.history : [];
    }
    var tr = (s && s.train) || {};
    out.train = { ball: blankTrack(), lift: blankTrack(), history: [], coach: '' };
    if (tr.ball || tr.lift) {
      out.train.ball = normTrack(tr.ball);
      out.train.lift = normTrack(tr.lift);
      out.train.history = Array.isArray(tr.history) ? tr.history : [];
      out.train.coach = typeof tr.coach === 'string' ? tr.coach : '';
    }
    var ex = (s && s.expenses) || {};
    out.expenses = { budget: num(ex.budget, 500) > 0 ? num(ex.budget, 500) : 500, items: [] };
    out.expenses.items = (Array.isArray(ex.items) ? ex.items : []).filter(function (it) {
      return it && /^\d{4}-\d{2}-\d{2}$/.test(it.date || '') && num(it.amount, 0) > 0;
    }).map(function (it) {
      return {
        id: String(it.id || ('e' + Date.now() + Math.random())), date: it.date,
        amount: Math.round(num(it.amount, 0) * 100) / 100,
        desc: String(it.desc || '未命名支出').slice(0, 60),
        category: String(it.category || '其他'), createdAt: it.createdAt || ''
      };
    });
    out.customFoods = (s && s.customFoods) || [];
    return out;
  }
  function blankTrack() {
    return { idx: 0, done: [false, false, false, false, false], rpe: 0, note: '' };
  }
  function blankStudy() {
    return { idx: 0, en: [false, false, false], cscs: [false, false, false], right: 0, total: 0, out: '', feedback: '', history: [] };
  }
  function normFlags(a) {
    var out = Array.isArray(a) ? a.slice(0, 3) : [];
    while (out.length < 3) out.push(false);
    return out.map(function (x) { return !!x; });
  }
  function normTrack(t) {
    var d = blankTrack();
    if (!t) return d;
    if (typeof t.idx === 'number') d.idx = Math.max(0, t.idx);
    if (Array.isArray(t.done)) {
      d.done = t.done.slice(0, 5);
      while (d.done.length < 5) d.done.push(false);
    }
    if (typeof t.rpe === 'number') d.rpe = t.rpe;
    if (typeof t.note === 'string') d.note = t.note;
    return d;
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
    var w = '周' + DAY_CN[d.getDay()];
    var base = (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + w;
    if (k === t) return '今天 · ' + base;
    if (k === shiftKey(t, -1)) return '昨天 · ' + base;
    if (k === shiftKey(t, 1)) return '明天 · ' + base;
    return base;
  }
  function r1(n) { return Math.round(n * 10) / 10; }
  function r0(n) { return Math.round(n); }
  function num(v, d) { var n = parseFloat(v); return isNaN(n) ? d : n; }
  function weekStart(k) { var d = parseKey(k); return shiftKey(k, -((d.getDay() + 6) % 7)); }
  function weekNo() {
    var d = new Date();
    var t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));
    var w1 = new Date(t.getFullYear(), 0, 4);
    return 1 + Math.round(((t - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7);
  }

  /* ---------------- 饮食数据 ---------------- */
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

  /* ---------------- 训练数据：双轨游标 ---------------- */
  function trackOf(name) { return state.train[name]; }
  function sessionOf(name, idx) {
    var arr = name === 'ball' ? BALL_SESSIONS : LIFT_SESSIONS;
    return arr[idx % arr.length];
  }
  function recentCounts(days) {
    var from = shiftKey(todayKey(), -(days - 1));
    var out = { ball: 0, lift: 0, total: 0 };
    state.train.history.forEach(function (h) {
      if (h && h.date && h.date >= from) {
        if (h.track === 'ball') out.ball++;
        if (h.track === 'lift') out.lift++;
        out.total++;
      }
    });
    return out;
  }
  function setTrackNote(name, v) {
    trackOf(name).note = v;
    save(); queueSync();
  }
  function completeTrack(name) {
    var t = trackOf(name), ses = sessionOf(name, t.idx);
    state.train.history.unshift({
      track: name, n: t.idx + 1, date: todayKey(), title: ses.t,
      done: t.done.filter(Boolean).length, rpe: t.rpe || 0, note: (t.note || '').trim()
    });
    state.train.history = state.train.history.slice(0, 80);
    t.idx++;
    t.done = [false, false, false, false, false];
    t.rpe = 0;
    t.note = '';
    save(); render(); queueSync();
    var next = sessionOf(name, t.idx);
    toast((name === 'ball' ? '有球' : '力量') + '第 ' + t.idx + ' 次完成 · 下一次「' + next.t + '」');
  }

  /* ---------------- 学习：按「第 N 天」推进 ---------------- */

  /* 英语：刘晓艳四级课 + 真题，12 周循环，逐周推进 */
  var EN_WEEKS = [
    { t: '词汇打底 · 短篇新闻', unit: '刘晓艳词汇 Unit 1–3', q: '听力短篇新闻', n: '真题短篇新闻 2 篇，每篇 3 分钟', tip: '新闻第一句必出主旨；听到数字立刻写下来，别等听完再回忆。' },
    { t: '数字与时间 · 短篇新闻', unit: '刘晓艳词汇 Unit 4–6', q: '听力短篇新闻', n: '真题短篇新闻 3 篇，精听其中 1 篇', tip: '精听＝逐句写下来再对原文，错的信息词抄在本子上。' },
    { t: '长对话入门', unit: '刘晓艳词汇 Unit 7–9', q: '长对话', n: '真题长对话 1 组，做完对答案', tip: '先看选项猜场景：选课、租房、面试、看病，场景词先入脑。' },
    { t: '长对话态度题', unit: '刘晓艳词汇 Unit 10–12', q: '长对话', n: '真题长对话 2 组 + 跟读 5 分钟', tip: '转折词 but / actually 后面才是答案，前面全是铺垫。' },
    { t: '听力篇章', unit: '刘晓艳词汇 Unit 13–15', q: '听力篇章', n: '真题篇章 2 篇 + 逐句精听 1 篇', tip: '听结构：总—分—例。例子题一定在"for example"之后。' },
    { t: '选词填空', unit: '刘晓艳词汇 Unit 16–18', q: '选词填空', n: '真题选词填空 1 篇（10 空）', tip: '先判词性再看意思，15 个词只有 10 个用得上，划掉用过的。' },
    { t: '仔细阅读 A', unit: '刘晓艳词汇 Unit 19–21', q: '仔细阅读', n: '真题仔细阅读 2 篇，每篇 8 分钟', tip: '题干关键词回原文定位，答案几乎都是同义替换，不是原词。' },
    { t: '仔细阅读 B · 干扰项', unit: '刘晓艳词汇 Unit 22–24', q: '仔细阅读', n: '真题 2 篇 + 错题归因', tip: '干扰项三种：绝对化、偷换对象、无中生有。选完给自己说理由。' },
    { t: '长篇阅读（匹配）', unit: '刘晓艳词汇 Unit 25–27', q: '长篇阅读', n: '真题 1 篇（10 题，15 分钟）', tip: '先读 10 个题干圈名词，再扫读段落，只找同义替换。' },
    { t: '翻译', unit: '刘晓艳词汇 Unit 28–30', q: '翻译', n: '真题 1 段（30 分钟，先自己写再对答案）', tip: '拆句→找主干→加修饰。不会的词用简单词代替，别空着。' },
    { t: '写作', unit: '刘晓艳词汇 Unit 31–33', q: '写作', n: '模板仿写 1 篇（30 分钟）', tip: '三段：现象—原因—建议。每段第一句必须清楚，阅卷只看这个。' },
    { t: '整套模拟', unit: '复习全部单词', q: '全卷', n: '真题 1 套（125 分钟，按考试时间计时）', tip: '按考试顺序做，写作放最后 30 分钟。做完只做一件事：把错题原因写下来。' }
  ];

  /* CSCS：12 周，每天读书 + 输出 + 自测 */
  var CSCS_WEEKS = [
    { t: '神经肌肉系统', book: '《CSCS》第 1 章 · 肌纤维类型与运动单位', out: '用自己的话写 3 句：为什么大重量能练力量？', quiz: '自测 5 题（运动单位募集顺序）' },
    { t: '生物力学', book: '《CSCS》第 2 章 · 杠杆、力矩、力—速度关系', out: '用深蹲举例写清"力矩"和"力臂"', quiz: '自测 5 题（杠杆分类）' },
    { t: '内分泌与代谢', book: '《CSCS》第 3 章 · 激素对训练的反应', out: '写清睾酮、皮质醇和训练量的关系', quiz: '自测 5 题（激素功能配对）' },
    { t: '营养', book: '《CSCS》第 4 章 · 宏量营养素与补剂', out: '给自己算一遍：72kg 一天该吃多少克蛋白', quiz: '自测 5 题（蛋白质与碳水推荐量）' },
    { t: '测试与评估', book: '《CSCS》第 11 章 · 效度、信度、1RM 测试', out: '设计一个 5 分钟的热身评估流程，明天在队里试', quiz: '自测 5 题（测试顺序与效度）' },
    { t: '动作技术 · 力量', book: '《CSCS》第 12 章 · 深蹲、硬拉、卧推要点', out: '写出深蹲最常见的 5 个错误和纠正方法', quiz: '自测 5 题（技术要点）' },
    { t: '动作技术 · 爆发', book: '《CSCS》第 13 章 · 奥举与增强式训练', out: '写清高翻的发力顺序：一拉、二拉、接铃', quiz: '自测 5 题（增强式禁忌）' },
    { t: '速度与灵敏', book: '《CSCS》第 14 章 · 加速、最大速度、变向', out: '设计一个 15 分钟的变向练习，明天在球场试', quiz: '自测 5 题（灵敏训练变量）' },
    { t: '有氧耐力与恢复', book: '《CSCS》第 15 章 · 能量系统与间歇训练', out: '写清 HIIT 和长时间慢跑各练什么', quiz: '自测 5 题（能量系统判定）' },
    { t: '程序设计', book: '《CSCS》第 16–17 章 · 需求分析与训练变量', out: '给现在的自己写一份一周力量计划', quiz: '自测 5 题（组数次数安排）' },
    { t: '周期化与组织管理', book: '《CSCS》第 18–22 章 · 周期化、设施、法律', out: '说清线性周期和板块周期的区别', quiz: '自测 5 题（周期化模型）' },
    { t: '全真模拟', book: '全书复盘 · 只看自己标注的错点', out: '把 12 周的输出翻一遍，挑 3 条写进笔记', quiz: '模拟 50 题，记录正确率' }
  ];

  /* 每天的任务不一样：同一周内 7 天各有分工 */
  var EN_ROLES = [
    function (w) { return [
      { t: '背单词 20 个', d: w.unit + '，先复习昨天错的，再背新的' },
      { t: w.q + ' · 方法', d: w.tip },
      { t: '真题', d: w.n }]; },
    function (w) { return [
      { t: '复习单词 20 个', d: '只复习不背新的，错的抄三遍' },
      { t: '同题型加练', d: w.q + ' 1 组，限时做，做完立刻对答案' },
      { t: '精听 5 分钟', d: '挑一句听不懂的，逐词写下来再对原文' }]; },
    function (w) { return [
      { t: '背单词 30 个', d: w.unit },
      { t: '错题回看', d: '把昨天的错题重做一遍，写清为什么错' },
      { t: '真题', d: w.n }]; },
    function (w) { return [
      { t: '复习单词', d: '昨天那 30 个遮住中文自测一遍' },
      { t: '限时训练', d: w.q + '：8 分钟 4 题，逼自己提速' },
      { t: '长难句 1 句', d: '拆主干：主语、谓语、宾语分别是哪个' }]; },
    function (w) { return [
      { t: '背单词 20 个', d: w.unit },
      { t: '真题', d: w.n },
      { t: '跟读 5 分钟', d: '跟读真题听力，模仿语音语调，别默读' }]; },
    function (w) { return [
      { t: '单词抽查', d: '自己抽查 20 个，错的标记进错题本' },
      { t: '真题', d: w.n },
      { t: '写 3 句', d: '用今天学的词写 3 句关于训练的话，明天交给 AI 改' }]; },
    function (w) { return [
      { t: '本周单词测', d: '本周 ' + w.unit + ' 自测，错的全部进错题本' },
      { t: '错题重做', d: '本周错题过一遍，还错的重点标出来' },
      { t: '周末整套', d: w.q === '全卷' ? '真题 1 套，125 分钟计时，按考试顺序做' : '听力或阅读整块 30 分钟，模拟考试节奏' }]; }
  ];

  var CSCS_ROLES = [
    function (w) { return [
      { t: '读新章', d: w.book + '，30 分钟，只读一遍，圈生词' },
      { t: '输出', d: w.out },
      { t: '自测', d: w.quiz }]; },
    function (w) { return [
      { t: '重读 + 画图', d: '把这章画成一张结构图：谁影响谁、顺序是什么' },
      { t: '输出', d: w.out },
      { t: '自测', d: w.quiz }]; },
    function (w) { return [
      { t: '应用', d: '给一个队友讲 5 分钟这章，讲不清的地方回去重读' },
      { t: '读第二遍', d: w.book + '，这次只关注圈出来的生词' },
      { t: '自测', d: w.quiz }]; },
    function (w) { return [
      { t: '口诀化', d: '把这章的要点写成 5 条能背下来的短句' },
      { t: '对照自己', d: '用这章的内容看自己今天的训练，写 1 条能改的地方' },
      { t: '自测', d: w.quiz }]; },
    function (w) { return [
      { t: '复习卡', d: '把这章 10 个概念做成问答卡，自问自答' },
      { t: '输出', d: w.out },
      { t: '自测', d: w.quiz }]; },
    function (w) { return [
      { t: '串起来', d: '把这章和前几周的内容连线：哪些是同一个系统' },
      { t: '复习卡', d: '只看问答卡，答不出的标红，明天先看' },
      { t: '自测', d: w.quiz }]; },
    function (w) { return [
      { t: '周测', d: '本周 15 题，限时 15 分钟，记录正确率' },
      { t: '错题归因', d: '每道错题写一句：是没记住，还是没理解' },
      { t: '一周复盘', d: '这周最难的一个概念，用一句话讲给外行听懂' }]; }
  ];

  function studyWeekNo() { return Math.floor(state.study.idx / 7) % EN_WEEKS.length; }
  function studyRole() { return state.study.idx % 7; }
  function studyDone() {
    var st = state.study;
    return st.en.filter(Boolean).length + st.cscs.filter(Boolean).length;
  }
  function setStudy(field, v) {
    state.study[field] = v;
    save();
    var badge = document.getElementById('st-badge');
    if (badge) badge.textContent = studyDone() + '/6 项';
    queueSync();
  }
  function completeStudyDay() {
    var st = state.study;
    if (studyDone() < 6) { toast('6 项全亮才算过一天'); return; }
    var wk = studyWeekNo();
    st.history.unshift({
      n: st.idx + 1, date: todayKey(), week: wk + 1,
      right: st.right || 0, total: st.total || 0,
      en: EN_WEEKS[wk].t, cscs: CSCS_WEEKS[wk].t
    });
    st.history = st.history.slice(0, 84);
    st.idx++;
    st.en = [false, false, false];
    st.cscs = [false, false, false];
    st.right = 0; st.total = 0; st.out = ''; st.feedback = '';
    save(); render(); queueSync();
    toast('第 ' + st.idx + ' 天，接着来');
  }

  /* ================= 支出：自然语言识别与统计 ================= */
  var EXPENSE_CATS = ['餐饮', '交通', '购物', '生活', '学习', '运动', '医疗', '娱乐', '其他'];
  var EXPENSE_RULES = [
    ['餐饮', /食堂|早餐|早饭|午餐|午饭|晚餐|晚饭|吃饭|餐|外卖|奶茶|咖啡|饮料|矿泉水|买水|水果|零食|麦当劳|肯德基|汉堡|面|粉|饭|水/],
    ['交通', /打车|出租|滴滴|地铁|公交|巴士|车票|高铁|火车|机票|加油|停车|单车|共享单车|路费/],
    ['学习', /教材|课本|书籍|买书|课程|网课|打印|文具|考试|四级|资料|笔|本子/],
    ['运动', /篮球|球场|场地|健身|训练|球鞋|球衣|运动|康复|护膝|蛋白/],
    ['医疗', /医院|药店|买药|看病|挂号|检查|治疗|药品|门诊/],
    ['娱乐', /电影|游戏|会员|KTV|演出|旅游|门票|唱歌|视频/],
    ['生活', /超市|日用品|洗衣|理发|牙膏|洗发|沐浴|纸巾|话费|电费|水费|房租/],
    ['购物', /淘宝|京东|拼多多|衣服|裤子|鞋|购物|网购/]
  ];

  function money(n) { return (Math.round(num(n, 0) * 100) / 100).toFixed(2); }
  function expenseCategory(text) {
    for (var i = 0; i < EXPENSE_RULES.length; i++) {
      if (EXPENSE_RULES[i][1].test(text)) return EXPENSE_RULES[i][0];
    }
    return '其他';
  }
  function expenseDate(text, fallback) {
    var base = fallback || todayKey(), t = todayKey();
    if (/大前天/.test(text)) return shiftKey(t, -3);
    if (/前天/.test(text)) return shiftKey(t, -2);
    if (/昨天|昨日/.test(text)) return shiftKey(t, -1);
    if (/今天|今日/.test(text)) return t;
    var full = text.match(/(20\d{2})[年\-\/\.](\d{1,2})[月\-\/\.](\d{1,2})[日号]?/);
    if (full) return full[1] + '-' + pad(+full[2]) + '-' + pad(+full[3]);
    var md = text.match(/(\d{1,2})月(\d{1,2})[日号]/);
    if (md) return new Date().getFullYear() + '-' + pad(+md[1]) + '-' + pad(+md[2]);
    var wd = text.match(/(上周|本周|这周|周|星期)([一二三四五六日天])/);
    if (wd) {
      var target = '一二三四五六日天'.indexOf(wd[2]);
      if (target === 7) target = 6;
      if (wd[1] === '上周') return shiftKey(weekStart(t), target - 7);
      return shiftKey(weekStart(t), target);
    }
    return base;
  }
  function cleanExpenseDesc(text) {
    var out = String(text || '')
      .replace(/20\d{2}[年\-\/\.]\d{1,2}[月\-\/\.]\d{1,2}[日号]?/g, '')
      .replace(/\d{1,2}月\d{1,2}[日号]/g, '')
      .replace(/大前天|前天|昨天|昨日|今天|今日|上周[一二三四五六日天]|本周[一二三四五六日天]|这周[一二三四五六日天]|周[一二三四五六日天]|星期[一二三四五六日天]/g, '')
      .replace(/\d+(?:\.\d+)?\s*(?:瓶|个|张|件|双|斤|公斤|克|g|ml)/gi, '')
      .replace(/[，,。；;、\n\r\t]/g, ' ')
      .replace(/早上|早晨|上午|中午|下午|晚上|昨晚|今早/g, '')
      .replace(/^\s*(?:和|还有|然后|接着|再|又|以及)+/, '')
      .replace(/^\s*(?:我)?(?:花了|花掉|花|买了|买|付了|付|用了|用|支出|消费)/, '')
      .replace(/^\s*[的了啊呢]+|\s+$/g, '')
      .trim();
    return (out || '未命名支出').slice(0, 60);
  }
  function parseExpenses(text) {
    var source = String(text || '').trim(), found = [];
    var re = /(\d+(?:\.\d{1,2})?)\s*(人民币|块钱|元|块|rmb|瓶|个|张|次|件|双|斤|公斤|克|g|ml|公里|km|月|日|号|年|点)?/gi;
    var m;
    while ((m = re.exec(source))) {
      var unit = (m[2] || '').toLowerCase();
      var before = source.charAt(m.index - 1), after = source.charAt(re.lastIndex);
      if (unit && ['元', '块', '块钱', '人民币', 'rmb'].indexOf(unit) < 0) continue;
      if (!unit && (/[-\.\/]/.test(before) || /[-\.\/%％]/.test(after))) continue;
      found.push({ start: m.index, end: re.lastIndex, amount: num(m[1], 0), lead: source.slice(found.length ? found[found.length - 1].end : 0, m.index) });
    }
    var currentDate = todayKey();
    return found.filter(function (x) { return x.amount > 0; }).map(function (x, i) {
      currentDate = expenseDate(x.lead, currentDate);
      var descSource = x.lead;
      if (!cleanExpenseDesc(descSource).replace(/未命名支出/, '').trim() && found.length === 1) {
        descSource += source.slice(x.end);
      }
      var desc = cleanExpenseDesc(descSource);
      return { date: currentDate, amount: Math.round(x.amount * 100) / 100, desc: desc, category: expenseCategory(desc + ' ' + x.lead) };
    });
  }
  function expensesOn(k) {
    return state.expenses.items.filter(function (it) { return it.date === k; });
  }
  function expensesFrom(start, days) {
    var end = shiftKey(start, days || 7);
    return state.expenses.items.filter(function (it) { return it.date >= start && it.date < end; });
  }
  function expenseSum(items) {
    return Math.round(items.reduce(function (sum, it) { return sum + num(it.amount, 0); }, 0) * 100) / 100;
  }
  function expenseCategoryStats(items) {
    var map = {};
    items.forEach(function (it) { map[it.category] = (map[it.category] || 0) + it.amount; });
    return Object.keys(map).map(function (k) { return { name: k, amount: Math.round(map[k] * 100) / 100 }; })
      .sort(function (a, b) { return b.amount - a.amount; });
  }
  function frequentExpenses(items) {
    var map = {};
    items.forEach(function (it) {
      var k = it.desc.replace(/\s/g, '').toLowerCase();
      if (!map[k]) map[k] = { name: it.desc, count: 0, amount: 0 };
      map[k].count++;
      map[k].amount += it.amount;
    });
    return Object.keys(map).map(function (k) {
      map[k].amount = Math.round(map[k].amount * 100) / 100;
      return map[k];
    }).filter(function (x) { return x.count > 1; }).sort(function (a, b) { return b.count - a.count || b.amount - a.amount; });
  }
  function expenseWeek(k) {
    var start = weekStart(k || todayKey()), items = expensesFrom(start, 7);
    return { start: start, items: items, total: expenseSum(items) };
  }
  function dailyAllowance() {
    var w = expenseWeek(todayKey()), left = state.expenses.budget - w.total;
    var days = 7 - ((parseKey(todayKey()).getDay() + 6) % 7);
    return { days: days, amount: Math.max(0, left) / days };
  }
  function answerExpense(q) {
    var question = String(q || '').trim(), w = expenseWeek(todayKey());
    var left = Math.round((state.expenses.budget - w.total) * 100) / 100;
    var allowance = dailyAllowance(), todayItems = expensesOn(todayKey());
    if (/还能花|剩余|剩下|预算|每天.*花|每日.*花/.test(question)) {
      return left >= 0
        ? '本周还可花 ¥' + money(left) + '。含今天还剩 ' + allowance.days + ' 天，按剩余天数平均每天可用 ¥' + money(allowance.amount) + '。'
        : '本周已超支 ¥' + money(Math.abs(left)) + '。当前剩余预算为 ¥0.00，已入账支出不会被限制。';
    }
    if (/今天|今日/.test(question) && /多少|花了|支出|消费/.test(question)) {
      return '今天共花 ¥' + money(expenseSum(todayItems)) + '，记了 ' + todayItems.length + ' 笔。';
    }
    if (/昨天|昨日/.test(question) && /多少|花了|支出|消费/.test(question)) {
      var yk = shiftKey(todayKey(), -1), yi = expensesOn(yk);
      return '昨天共花 ¥' + money(expenseSum(yi)) + '，记了 ' + yi.length + ' 笔。';
    }
    if (/哪天|哪一天|最高.*天|单日/.test(question)) {
      var dayTotals = [];
      for (var i = 0; i < 7; i++) {
        var dk = shiftKey(w.start, i), val = expenseSum(expensesOn(dk));
        dayTotals.push({ date: dk, amount: val });
      }
      dayTotals.sort(function (a, b) { return b.amount - a.amount; });
      return dayTotals[0].amount > 0
        ? '本周单日支出最高是 ' + dateLabel(dayTotals[0].date) + '，共 ¥' + money(dayTotals[0].amount) + '。'
        : '本周还没有支出记录。';
    }
    if (/哪类|类别|分类|类目|最大类/.test(question)) {
      var cats = expenseCategoryStats(w.items);
      return cats.length ? '本周支出最多的是「' + cats[0].name + '」，共 ¥' + money(cats[0].amount) + '，占本周支出 ' + Math.round(cats[0].amount / w.total * 100) + '%。' : '本周还没有支出记录。';
    }
    if (/常买|频繁|重复/.test(question)) {
      var freq = frequentExpenses(expensesFrom(shiftKey(todayKey(), -29), 30));
      return freq.length ? '近 30 天最常买的是「' + freq[0].name + '」，共 ' + freq[0].count + ' 笔，合计 ¥' + money(freq[0].amount) + '。' : '近 30 天还没有重复购买 2 次以上的项目。';
    }
    if (/超支|超出/.test(question)) {
      return left < 0 ? '本周已超支 ¥' + money(Math.abs(left)) + '。' : '本周尚未超支，预算还剩 ¥' + money(left) + '。';
    }
    if (/这周|本周|一周|周.*多少|周.*花/.test(question)) {
      return '本周共花 ¥' + money(w.total) + '，记了 ' + w.items.length + ' 笔，预算剩余 ¥' + money(Math.max(0, left)) + '。';
    }
    return '本周已花 ¥' + money(w.total) + '，今天已花 ¥' + money(expenseSum(todayItems)) + '。\n可以继续问「这周还能花多少」「哪类花得最多」或「近 30 天常买什么」。';
  }

  /* ---------------- 视图状态 ---------------- */
  var tab = 'train';
  var logDate = todayKey();
  var foodQ = '', foodCat = '全部';
  var expenseText = '', expenseQuestion = '', expenseAnswer = '';
  var SUB_OF = { log: 'today', foods: 'today' };
  var mTab = /[?&]tab=(\w+)/.exec(location.search);
  if (mTab && ['train', 'today', 'study', 'expense', 'log', 'foods', 'me'].indexOf(mTab[1]) > -1) tab = mTab[1];

  /* ---------------- 渲染 ---------------- */
  var view = document.getElementById('view');

  function render() {
    if (tab === 'train') view.innerHTML = viewTrain();
    else if (tab === 'today') view.innerHTML = viewToday();
    else if (tab === 'study') view.innerHTML = viewStudy();
    else if (tab === 'expense') view.innerHTML = viewExpense();
    else if (tab === 'log') view.innerHTML = viewLog();
    else if (tab === 'foods') view.innerHTML = viewFoods();
    else view.innerHTML = viewMe();
    var on = SUB_OF[tab] || tab;
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('on', b.dataset.tab === on);
    });
    window.scrollTo(0, 0);
  }

  /* 局部更新时保住滚动位置，别让页面跳回顶部 */
  function renderKeep() {
    var y = window.scrollY || window.pageYOffset || 0;
    render();
    window.scrollTo(0, y);
  }

  function head(eyebrow, title, right) {
    return '<div class="topbar"><div><div class="eyebrow">' + eyebrow + '</div><h1>' + title + '</h1></div>' + (right || '') + '</div>';
  }

  /* ================= 训练：有球 + 力量，双轨游标 ================= */
  var TICK = '<svg viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6.5"/></svg>';

  function readout(label, ses, done) {
    return '<section class="treadout">' +
      '<div class="tr-top"><span>' + label + '</span><span>' + done + ' / ' + ses.blocks.length + ' 项</span></div>' +
      '<div class="tr-num' + (String(ses.big).length > 3 ? ' nosmall' : '') + '">' + esc(String(ses.big)) +
        (ses.unit ? '<small>' + ses.unit + '</small>' : '') + '</div>' +
      '<div class="tr-bar"><i></i><span>' + esc(ses.small) + '</span></div>' +
    '</section>';
  }

  function viewTrain() {
    var tb = trackOf('ball'), tl = trackOf('lift');
    var sb = sessionOf('ball', tb.idx), sl = sessionOf('lift', tl.idx);
    var db = tb.done.filter(Boolean).length, dl = tl.done.filter(Boolean).length;
    var r7 = recentCounts(7);
    var s = head('不绑日期 · 有空就推进', '训练',
      '<span class="status">近 7 天 ' + r7.total + ' 次</span>');

    s += readout('有球 · 第 ' + (tb.idx + 1) + ' 次', sb, db);
    s += readout('力量 · 第 ' + (tl.idx + 1) + ' 次', sl, dl);

    s += '<div class="mods">' +
      '<div class="mod' + (r7.ball >= 4 ? ' on' : '') + '"><div class="mod-k">有球</div>' +
        '<div class="mod-v">' + r7.ball + '<i>次</i></div><div class="mod-f">近 7 天 · 目标 4–5</div></div>' +
      '<div class="mod' + (r7.lift >= 3 ? ' on' : '') + '"><div class="mod-k">力量</div>' +
        '<div class="mod-v">' + r7.lift + '<i>次</i></div><div class="mod-f">近 7 天 · 目标 3</div></div>' +
      '<div class="mod"><div class="mod-k">累计</div>' +
        '<div class="mod-v">' + state.train.history.length + '<i>次</i></div><div class="mod-f">两条线合计</div></div>' +
    '</div>';

    s += trackCard('ball', tb, sb);
    s += trackCard('lift', tl, sl);

    /* 最近完成 */
    var hist = state.train.history.slice(0, 6);
    s += '<section class="card"><div class="card-head"><h2>最近 6 次</h2><span class="hint">从新到旧</span></div>' +
      (hist.length ? '<div class="steps">' + hist.map(function (h) {
        return '<div class="steprow"><span class="dot on"></span><span class="stepn">' +
          (h.track === 'ball' ? '有球 ' : '力量 ') + h.n + ' · ' + esc(h.title) + '</span>' +
          '<span class="stepv">' + (h.date || '').slice(5) + ' · ' + h.done + '/5</span></div>';
      }).join('') + '</div>'
        : '<p class="note">还没有完成过一次。5 项做完，点「完成第 N 次」，这里会留下记录。</p>') +
    '</section>';

    /* AI 教练 */
    s += '<section class="card"><div class="card-head"><h2>问教练</h2><span class="hint">DeepSeek</span></div>' +
      '<div class="btns"><button class="solid" data-act="tsend">复制今日简报</button>' +
        '<button class="ghost" data-act="deepseek">打开 DeepSeek</button></div>' +
      '<div class="aibox"><div class="aibox-h"><span>教练回复</span><button class="linkbtn" data-act="tpaste">粘贴回答</button></div>' +
        '<textarea class="ta" id="tr-coach" rows="5" placeholder="复制简报 → 到 DeepSeek 粘贴发送 → 复制回答 → 回来点「粘贴回答」">' + esc(state.train.coach) + '</textarea>' +
      '</div>' +
      '<p class="note">简报里带着两条线的进度、RPE、备注和最近 6 次记录，AI 才知道该加还是该减。</p>' +
    '</section>';

    return s;
  }

  function trackCard(name, t, ses) {
    var isBall = name === 'ball';
    var n = t.done.filter(Boolean).length;
    return '<section class="card">' +
      '<div class="card-head"><h2><i class="idx">' + (isBall ? 'A' : 'B') + '</i>' +
        (isBall ? '有球 · 个人发展' : '力量 · 核心与护膝') + '</h2><span class="hint">' + n + ' / 5 项</span></div>' +
      '<div class="brief"><div class="brief-k">第 ' + (t.idx + 1) + ' 次 · ' + esc(ses.t) + '</div>' + ses.brief + '</div>' +
      ses.blocks.map(function (b, i) {
        var on = !!t.done[i];
        return '<div class="todo' + (on ? ' done' : '') + '">' +
          '<div class="todo-no">' + pad(i + 1) + '</div>' +
          '<div class="todo-t"><h3>' + esc(b.t) + '</h3><p>' + esc(b.d) + '</p></div>' +
          '<button class="key" data-act="' + (isBall ? 'bcheck' : 'lcheck') + '" data-i="' + i + '">' + (on ? TICK : '') + '</button>' +
        '</div>';
      }).join('') +
      '<div class="tr-top" style="margin-top:16px"><span>RPE · 这次有多难</span><span>1 轻松 · 10 拼到爆</span></div>' +
      '<div class="rpe">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (x) {
        return '<span class="' + (t.rpe === x ? 'on' : '') + '" data-act="' + (isBall ? 'brpe' : 'lrpe') + '" data-n="' + x + '">' + x + '</span>';
      }).join('') + '</div>' +
      '<textarea class="ta" data-trk="' + name + '" rows="2" placeholder="' +
        (isBall ? '哪里不顺：左手掉球、抬头、脚步…' : '实做重量 / 膝的反应（稳 · 酸 · 痛）') + '">' + esc(t.note) + '</textarea>' +
      '<button class="solid big" data-act="' + (isBall ? 'bnext' : 'lnext') + '">完成第 ' + (t.idx + 1) + ' 次 → 第 ' + (t.idx + 2) + ' 次</button>' +
    '</section>';
  }

  function buildTrainPrompt() {
    var tb = trackOf('ball'), tl = trackOf('lift');
    var sb = sessionOf('ball', tb.idx), sl = sessionOf('lift', tl.idx);
    function lines(ses) { return ses.blocks.map(function (b, i) { return (i + 1) + ') ' + b.t + '（' + b.d + '）'; }).join('\n'); }
    function doneList(t, ses) {
      var out = [];
      t.done.forEach(function (v, i) { if (v) out.push((i + 1) + '. ' + ses.blocks[i].t); });
      return out.length ? out.join('；') : '暂无';
    }
    var hist = state.train.history.slice(0, 6).map(function (h) {
      return (h.date || '').slice(5) + ' ' + (h.track === 'ball' ? '有球' : '力量') + '第' + h.n + '次「' + h.title + '」' +
        '完成 ' + h.done + '/5，RPE ' + (h.rpe || '未记') + (h.note ? '，' + h.note : '');
    });
    return '你是我的力量与篮球体能教练，要求严格，不要客套。\n' +
      '我：17 岁，CUBA 控卫，190cm / 72kg，左膝半月板术后 8 个月，正在增肌（每周 +0.3kg），左手持球是短板，不吃蛋白粉。\n' +
      '我不按日期练，按次数推进。今天的两条线：\n' +
      '【有球 第' + (tb.idx + 1) + '次】' + sb.t + '\n' + lines(sb) + '\n已完成：' + doneList(tb, sb) +
        '\nRPE：' + (tb.rpe || '未记') + '，备注：' + ((tb.note || '').trim() || '无') + '\n' +
      '【力量 第' + (tl.idx + 1) + '次】' + sl.t + '\n' + lines(sl) + '\n已完成：' + doneList(tl, sl) +
        '\nRPE：' + (tl.rpe || '未记') + '，备注：' + ((tl.note || '').trim() || '无') + '\n' +
      (hist.length ? '最近记录：\n' + hist.join('\n') + '\n' : '') +
      '\n直接回答四件事：\n' +
      '1) 这两练的量和强度够不够，哪里在偷懒\n' +
      '2) 下一次有球练什么，力量加不加、加到多少\n' +
      '3) 只指出一个我最该改的技术细节\n' +
      '4) 左膝如果有反应，我该停、减量还是照常练\n' +
      '结论优先，300 字以内。';
  }

  /* ================= 饮食 ================= */
  function viewToday() {
    var k = todayKey(), d = day(k), t = totals(k), tg = target(k);
    var left = tg.kcal - t.kcal, over = left < 0;
    var C = 2 * Math.PI * 78;
    var p = Math.min(1, t.kcal / tg.kcal);

    var s = head(dateLabel(k), '饮食',
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
      '<div class="card-head"><h2>三大营养素</h2><span class="hint">还差 ' + Math.max(0, r0(tg.p - t.p)) + 'g 蛋白</span></div>' +
      bar('蛋白质', t.p, tg.p, 'var(--volt)') +
      bar('碳水', t.c, tg.c, 'var(--ink-2)') +
      bar('脂肪', t.f, tg.f, 'var(--rust)') +
    '</section>';

    s += '<section class="card"><div class="card-head"><h2>今天吃了什么</h2><span class="hint">点一行去加</span></div>' +
      mealRows(k) + '</section>';

    var wl = d.water || 0;
    s += '<div class="grid2">' +
      '<section class="card mini">' +
        '<div class="mini-head"><span>饮水</span><b>' + (wl / 1000).toFixed(2).replace(/\.?0+$/, '') + 'L</b></div>' +
        '<div class="cups">' + cups(wl) + '</div>' +
        '<div class="mini-actions"><button class="ghost" data-act="water" data-d="-1">−</button>' +
        '<button class="solid" data-act="water" data-d="1">+250</button></div>' +
      '</section>' +
      '<section class="card mini">' +
        '<div class="mini-head"><span>体重</span><b>' + (d.weight || state.profile.weight) + '<i>kg</i></b></div>' +
        '<div class="mini-sub">' + weightTrend() + '</div>' +
        '<div class="mini-actions"><button class="solid full" data-act="weigh">记录体重</button></div>' +
      '</section>' +
    '</div>';

    s += '<section class="card"><div class="card-head"><h2>近 7 天</h2><span class="hint">热量 / 目标</span></div>' + weekBars() +
      '<div class="btns"><button class="ghost" data-act="openlog">每日记录</button>' +
      '<button class="ghost" data-act="openfoods">食物库</button></div>' +
    '</section>';

    s += '<button class="fab-add" data-act="quickadd">＋ 记录吃了什么</button>';
    return s;
  }

  function mealRows(k) {
    var d = day(k);
    return MEALS.map(function (m) {
      var items = d.meals[m.id] || [];
      var mk = items.reduce(function (a, b) { return a + b.kcal; }, 0);
      var mp = items.reduce(function (a, b) { return a + b.p; }, 0);
      return '<button class="frow" data-act="add" data-meal="' + m.id + '">' +
        '<div class="frow-l"><div class="fname">' + m.name + '</div>' +
          '<div class="fsub">' + (items.length ? m.icon + ' ' + items.length + ' 项 · 蛋白 ' + r0(mp) + 'g' : '还没记') + '</div></div>' +
        '<div class="frow-r">' + (items.length ? '<b>' + r0(mk) + '</b> kcal' : '<b>＋</b>') + '</div>' +
      '</button>';
    }).join('');
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
      s += '<section class="card">' +
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

    s += '<div class="btns" style="margin-top:16px"><button class="ghost full" data-act="backtoday">返回今日</button></div>';
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
    s += '<div class="search"><input id="foodQ" placeholder="搜食物，如 鸡胸、米饭" value="' + esc(foodQ) + '"></div>';
    s += '<div class="chips">' + ['全部'].concat(window.CATS, ['我的']).map(function (c) {
      return '<button class="chip' + (c === foodCat ? ' on' : '') + '" data-act="cat" data-cat="' + c + '">' + c + '</button>';
    }).join('') + '</div>';

    if (!list.length) s += '<div class="empty big">没有匹配的食物<br><span class="dim">点右上角自己加一个</span></div>';
    s += '<div class="flist">' + list.map(function (f) {
      return '<button class="frow" data-act="pick" data-id="' + f.id + '">' +
        '<div class="frow-l"><div class="fname">' + esc(f.name) +
          (isAvoid(f.name) ? '<em class="tag" style="margin-left:6px">忌口</em>' : '') + '</div>' +
          '<div class="fsub">' + f.cat + ' · 每 100g</div></div>' +
        '<div class="frow-r"><b>' + f.kcal + '</b> kcal<i style="margin-left:6px">蛋白 ' + f.p + 'g</i></div>' +
      '</button>';
    }).join('') + '</div>';
    return s;
  }

  /* ================= 支出 ================= */
  function viewExpense() {
    var w = expenseWeek(todayKey()), budget = state.expenses.budget;
    var left = Math.round((budget - w.total) * 100) / 100, over = left < 0;
    var usedPct = budget ? Math.round(w.total / budget * 100) : 0;
    var allowance = dailyAllowance(), todayTotal = expenseSum(expensesOn(todayKey()));
    var end = shiftKey(w.start, 6);
    var s = head(w.start.slice(5).replace('-', '/') + '—' + end.slice(5).replace('-', '/') + ' · 周一至周日', '支出',
      '<span class="status">周预算 ¥' + money(budget) + '</span>');

    s += '<section class="treadout ex-budget">' +
      '<div class="tr-top"><span>WEEKLY BALANCE</span><span>' + usedPct + '% 已用</span></div>' +
      '<div class="ex-left' + (over ? ' down' : '') + '"><small>¥</small>' + money(Math.abs(left)) + '</div>' +
      '<div class="ex-caption">' + (over ? '本周已超支' : '本周剩余') + '</div>' +
      '<div class="track ex-track"><span class="' + (over ? 'over' : '') + '" style="width:' + Math.min(100, usedPct) + '%"></span></div>' +
      '<div class="ex-scale"><span>已花 ¥' + money(w.total) + '</span><span>预算 ¥' + money(budget) + '</span></div>' +
    '</section>';

    s += '<div class="mods ex-mods">' +
      '<div class="mod"><div class="mod-k">今天</div><div class="mod-v">¥' + money(todayTotal) + '</div><div class="mod-f">' + expensesOn(todayKey()).length + ' 笔</div></div>' +
      '<div class="mod' + (!over ? ' on' : '') + '"><div class="mod-k">每日可用</div><div class="mod-v">¥' + money(allowance.amount) + '</div><div class="mod-f">含今天剩 ' + allowance.days + ' 天</div></div>' +
      '<div class="mod' + (over ? ' over' : '') + '"><div class="mod-k">本周笔数</div><div class="mod-v">' + w.items.length + '<i>笔</i></div><div class="mod-f">' + (over ? '超出 ¥' + money(Math.abs(left)) : '剩余 ¥' + money(left)) + '</div></div>' +
    '</div>';

    if (over) s += '<div class="brief ex-warning"><div class="brief-k">预算提醒</div>本周已超支 ¥' + money(Math.abs(left)) + '。支出仍可正常记录，统计会保留真实结果。</div>';

    s += '<section class="card"><div class="card-head"><h2>直接说支出</h2><span class="hint">识别确认后才入账</span></div>' +
      '<textarea class="ta" id="ex-input" rows="3" placeholder="如：中午食堂15，买水3块，昨天打车18">' + esc(expenseText) + '</textarea>' +
      '<button class="solid big" data-act="exparse">识别支出</button>' +
      '<p class="note">可一次说多笔，也能带今天、昨天、前天或具体日期。金额、描述、日期和类别都能在确认前修改。</p>' +
    '</section>';

    s += '<section class="card"><div class="card-head"><h2>本周每日</h2><span class="hint">合计 ¥' + money(w.total) + '</span></div>' + expenseWeekBars(w.start) + '</section>';

    var cats = expenseCategoryStats(w.items), maxCat = cats.length ? cats[0].amount : 0;
    s += '<section class="card"><div class="card-head"><h2>本周类别</h2><span class="hint">' + cats.length + ' 类</span></div>' +
      (cats.length ? cats.map(function (c) {
        return '<div class="macro"><div class="macro-top"><span class="macro-name">' + esc(c.name) + '</span>' +
          '<span class="macro-val"><b>¥' + money(c.amount) + '</b><i>' + Math.round(c.amount / w.total * 100) + '%</i></span></div>' +
          '<div class="track"><span style="width:' + (maxCat ? c.amount / maxCat * 100 : 0) + '%;background:var(--volt)"></span></div></div>';
      }).join('') : '<div class="empty">本周还没有支出。说一笔，类别会自动归入这里。</div>') +
    '</section>';

    var freq = frequentExpenses(expensesFrom(shiftKey(todayKey(), -29), 30));
    s += '<section class="card"><div class="card-head"><h2>近 30 天常买</h2><span class="hint">2 笔及以上</span></div>' +
      (freq.length ? freq.slice(0, 6).map(function (f, i) {
        return '<div class="steprow"><i class="idx">' + (i + 1) + '</i><span class="stepn">' + esc(f.name) + '</span>' +
          '<span class="stepv">' + f.count + ' 笔 · ¥' + money(f.amount) + '</span></div>';
      }).join('') : '<div class="empty">同一个项目记满 2 笔后，会在这里显示次数和合计。</div>') +
    '</section>';

    s += expenseReviewCard(w);

    s += '<section class="card"><div class="card-head"><h2>问支出助手</h2><span class="hint">按真实记录回答</span></div>' +
      '<div class="ex-ask"><input id="ex-question" type="text" value="' + esc(expenseQuestion) + '" placeholder="如：这周还能花多少">' +
      '<button class="solid" data-act="exask">提问</button></div>' +
      '<div class="chips">' + ['这周还能花多少', '今天花了多少', '哪类花得最多', '近30天常买什么'].map(function (q) {
        return '<button class="chip" data-act="exq" data-q="' + esc(q) + '">' + q + '</button>';
      }).join('') + '</div>' +
      (expenseAnswer ? '<div class="brief ex-answer">' + esc(expenseAnswer) + '</div>' : '') +
    '</section>';

    var sorted = state.expenses.items.slice().sort(function (a, b) {
      return a.date === b.date ? String(b.createdAt).localeCompare(String(a.createdAt)) : (a.date < b.date ? 1 : -1);
    });
    s += '<section class="card"><div class="card-head"><h2>按日明细</h2><span class="hint">共 ' + sorted.length + ' 笔 · 点一笔修改</span></div>';
    if (!sorted.length) s += '<div class="empty">还没有支出记录。</div>';
    var lastDate = '', dayItems = [];
    function flushDay() {
      if (!dayItems.length) return '';
      var html = '<div class="ex-day"><div class="ex-day-head"><span>' + dateLabel(lastDate) + '</span><b>¥' + money(expenseSum(dayItems)) + '</b></div>';
      html += dayItems.map(function (it) {
        return '<button class="ex-item" data-act="expedit" data-id="' + esc(it.id) + '">' +
          '<span class="ex-item-main"><b>' + esc(it.desc) + '</b><small>' + esc(it.category) + '</small></span>' +
          '<span class="ex-item-num">¥' + money(it.amount) + '</span><span class="ex-item-go">›</span></button>';
      }).join('') + '</div>';
      dayItems = [];
      return html;
    }
    sorted.forEach(function (it) {
      if (it.date !== lastDate) { s += flushDay(); lastDate = it.date; }
      dayItems.push(it);
    });
    s += flushDay() + '</section>';
    return s;
  }

  function expenseWeekBars(start) {
    var values = [];
    for (var i = 0; i < 7; i++) values.push(expenseSum(expensesOn(shiftKey(start, i))));
    var max = Math.max.apply(Math, values.concat([1]));
    return '<div class="ex-bars">' + values.map(function (v, i) {
      var k = shiftKey(start, i), isToday = k === todayKey();
      return '<div class="ex-barcol' + (isToday ? ' now' : '') + '"><span class="ex-bar-val">' + (v ? money(v) : '') + '</span>' +
        '<div class="ex-bar-track"><span style="height:' + (v / max * 100) + '%"></span></div>' +
        '<span class="ex-bar-day">' + DAY_CN[(i + 1) % 7] + '</span></div>';
    }).join('') + '</div>';
  }

  function expenseReviewCard(w) {
    var cats = expenseCategoryStats(w.items), last = expenseWeek(shiftKey(todayKey(), -7));
    var diff = Math.round((w.total - last.total) * 100) / 100;
    var largest = w.items.slice().sort(function (a, b) { return b.amount - a.amount; })[0];
    var freq = frequentExpenses(w.items)[0];
    var elapsed = ((parseKey(todayKey()).getDay() + 6) % 7) + 1;
    return '<section class="card"><div class="card-head"><h2>本周事实复盘</h2><span class="hint">不加评价</span></div>' +
      '<div class="ex-review">' +
        '<div><span>总支出</span><b>¥' + money(w.total) + '</b></div>' +
        '<div><span>截至今天日均</span><b>¥' + money(w.total / elapsed) + '</b></div>' +
        '<div><span>最大类别</span><b>' + (cats.length ? esc(cats[0].name) + ' · ¥' + money(cats[0].amount) : '暂无') + '</b></div>' +
        '<div><span>最高单笔</span><b>' + (largest ? esc(largest.desc) + ' · ¥' + money(largest.amount) : '暂无') + '</b></div>' +
        '<div><span>本周重复购买</span><b>' + (freq ? esc(freq.name) + ' · ' + freq.count + ' 笔' : '暂无') + '</b></div>' +
        '<div><span>较上周</span><b class="' + (diff > 0 ? 'down' : 'up') + '">' + (diff > 0 ? '+' : '') + '¥' + money(diff) + '</b></div>' +
      '</div><p class="note">上周总支出 ¥' + money(last.total) + '，本周记录 ' + w.items.length + ' 笔，上周记录 ' + last.items.length + ' 笔。</p></section>';
  }

  /* ================= 学习 ================= */
  function planTodo(act, i, title, desc, on) {
    return '<div class="todo' + (on ? ' done' : '') + '">' +
      '<div class="todo-no">' + pad(i + 1) + '</div>' +
      '<div class="todo-t"><h3>' + esc(title) + '</h3><p>' + desc + '</p></div>' +
      '<button class="key" data-act="' + act + '" data-i="' + i + '" aria-label="完成">' +
        (on ? '<svg viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6.5"/></svg>' : '') +
      '</button></div>';
  }

  function viewStudy() {
    var st = state.study, n = studyDone();
    var dayNo = st.idx + 1, wk = studyWeekNo() + 1;
    var en = EN_WEEKS[wk - 1], cs = CSCS_WEEKS[wk - 1];
    var role = studyRole(), enTasks = EN_ROLES[role](en), csTasks = CSCS_ROLES[role](cs);
    var rate = st.total > 0 ? Math.round(st.right / st.total * 100) + '%' : '未记';
    var s = head('第 ' + dayNo + ' 天 / 84 · 第 ' + wk + ' 周', '学习',
      '<div class="pill" id="st-badge">' + n + '/6 项</div>');

    s += '<section class="card"><div class="card-head"><h2>推到哪了</h2><span class="hint">已完成 ' + st.idx + ' 天</span></div>' +
      '<div class="track"><span style="width:' + Math.round(st.idx / 84 * 100) + '%;background:var(--volt)"></span></div>' +
      '<p class="note">不绑日期：今天没空，第 ' + dayNo + ' 天就停在这里，明天接着做同一份。6 项全亮才算过一天。</p>' +
      (n === 6
        ? '<button class="solid big" data-act="stnext">完成第 ' + dayNo + ' 天 → 第 ' + (dayNo + 1) + ' 天</button>'
        : '<p class="note">还差 ' + (6 - n) + ' 项。别跳天，跳了就永远补不上。</p>') +
    '</section>';

    s += '<section class="card">' +
      '<div class="card-head"><h2><i class="idx">1</i>英语 · 四级</h2><span class="hint">' + esc(en.t) + '</span></div>' +
      enTasks.map(function (x, i) { return planTodo('encheck', i, x.t, x.d, st.en[i]); }).join('') +
      '<p class="note">刘晓艳给你方法和词汇，真题给你分数。只听课不做题，等于没学。</p>' +
    '</section>';

    s += '<section class="card">' +
      '<div class="card-head"><h2><i class="idx">2</i>CSCS</h2><span class="hint">' + esc(cs.t) + '</span></div>' +
      csTasks.map(function (x, i) { return planTodo('cscscheck', i, x.t, x.d, st.cscs[i]); }).join('') +
      '<p class="note">读一遍不算会。能用自己的话讲出来、能给队友用上，才算。</p>' +
    '</section>';

    s += '<section class="card"><div class="card-head"><h2><i class="idx">3</i>今天做题</h2><span class="hint">正确率 ' + rate + '</span></div>' +
      '<div class="rate">' +
        '<label><input data-study="right" type="number" inputmode="numeric" value="' + (st.right || '') + '"><i>做对</i></label>' +
        '<span>/</span>' +
        '<label><input data-study="total" type="number" inputmode="numeric" value="' + (st.total || '') + '"><i>总题数</i></label>' +
      '</div></section>';

    s += '<section class="card"><div class="card-head"><h2>两条线考什么</h2><span class="hint">先看地图再走路</span></div>' +
      '<div class="steps">' +
        stepRow('四级听力', '248.5 分 · 新闻 / 长对话 / 篇章', wk <= 5) +
        stepRow('四级阅读', '248.5 分 · 选词 / 匹配 / 仔细', wk >= 6 && wk <= 9) +
        stepRow('四级写作 + 翻译', '213 分 · 各 106.5', wk >= 10) +
        stepRow('CSCS 科学基础', '解剖 / 生物力学 / 内分泌 / 营养', wk <= 4) +
        stepRow('CSCS 实践应用', '测试 / 技术 / 计划 / 周期', wk >= 5) +
      '</div>' +
      '<p class="note">四级 425 过线；CSCS 两科都要 70% 左右。哪个都躲不掉，就一天一天往前推。</p>' +
    '</section>';

    s += '<section class="card"><div class="card-head"><h2>作文 / 翻译批改</h2><span class="hint">写完贴进来</span></div>' +
      '<textarea class="ta" data-study="out" rows="4" placeholder="把今天写的作文或翻译贴进来，先自己看一遍再交给 AI">' + esc(st.out) + '</textarea>' +
      '<div class="btns">' +
        '<button class="solid" data-act="aisend">交给 AI 批改</button>' +
        '<button class="ghost" data-act="deepseek">打开 DeepSeek</button>' +
      '</div>' +
      '<div class="aibox">' +
        '<div class="aibox-h"><span>批改结果</span><button class="linkbtn" data-act="aipaste">粘贴回答</button></div>' +
        '<textarea class="ta" data-study="feedback" rows="4" placeholder="复制回答后回来点「粘贴回答」">' + esc(st.feedback) + '</textarea>' +
      '</div>' +
    '</section>';

    s += '<section class="card"><div class="card-head"><h2>最近完成</h2><span class="hint">从新到旧</span></div>' +
      (st.history.length
        ? '<div class="steps">' + st.history.slice(0, 5).map(function (h) {
            return '<div class="steprow"><span class="dot on"></span><span class="stepn">第 ' + h.n + ' 天 · 第 ' + (h.week || '') + ' 周</span>' +
              '<span class="stepv">' + (h.date || '').slice(5) + ' · 对 ' + (h.right || 0) + '/' + (h.total || 0) + '</span></div>';
          }).join('') + '</div>'
        : '<p class="note">还没有完成过一整天。先把今天的 6 项点亮。</p>') +
    '</section>';

    return s;
  }

  function stepRow(name, val, on) {
    return '<div class="steprow"><span class="dot' + (on ? ' on' : '') + '"></span>' +
      '<span class="stepn">' + name + '</span><span class="stepv">' + val + '</span></div>';
  }

  function buildPrompt(d) {
    return '你是四级作文 / 翻译的阅卷老师，要求严格。下面是我今天写的英文，请：\n' +
      '1) 按四级评分标准打分（满分 15 分），说明扣在哪\n' +
      '2) 逐句指出语法和用词错误，给出修改\n' +
      '3) 给一个更地道但不超纲的版本\n' +
      '4) 用一句话指出我最该改的一个毛病\n' +
      '不要客套，直接给结论。\n\n我写的：\n"""\n' + d.out.trim() + '\n"""';
  }

  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () {
        toast('已复制，去 DeepSeek 粘贴');
      }, function () { fallbackCopy(t); });
    } else fallbackCopy(t);
  }
  function fallbackCopy(t) {
    var a = document.createElement('textarea');
    a.value = t; a.style.position = 'fixed'; a.style.opacity = '0';
    document.body.appendChild(a); a.select();
    try { document.execCommand('copy'); toast('已复制'); } catch (e) { toast('复制失败，请手动选择'); }
    document.body.removeChild(a);
  }
  function shareOrCopy(text) {
    if (navigator.share) navigator.share({ text: text }).catch(function () { copyText(text); });
    else copyText(text);
  }

  function aiSend() {
    if (!state.study.out.trim()) { toast('先把今天写的作文或翻译贴进来'); return; }
    shareOrCopy(buildPrompt(state.study));
  }

  function pasteTo(fn) {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      toast('这个浏览器不能读剪贴板，请长按输入框手动粘贴'); return;
    }
    navigator.clipboard.readText().then(function (t) {
      if (!t || !t.trim()) { toast('剪贴板是空的'); return; }
      fn(t.trim()); render(); toast('已粘入');
    }, function () {
      toast('读取被拒绝，请长按输入框手动粘贴');
    });
  }

  /* ================= 我的 ================= */
  function viewMe() {
    var p = state.profile, t = state.targets;
    var s = head('档案与目标', '我的', '');
    s += '<section class="card">' +
      '<div class="card-head"><h2>身体档案</h2></div>' +
      '<div class="form">' +
        row('身高', 'height', p.height, 'cm', 'number') +
        row('体重', 'weight', p.weight, 'kg', 'number') +
        row('出生年', 'birthYear', p.birthYear, '年', 'number') +
        row('每周训练', 'trainWeekly', p.trainWeekly || 5, '天', 'number') +
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
          '<input id="sync-auto" type="checkbox"' + (state.sync.auto ? ' checked' : '') + ' style="flex:0 0 auto;width:22px;height:22px;accent-color:#A9B300"><i></i></label>' +
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

    s += '<div class="foot">成长系统 · 训练 / 饮食 / 学习 / 支出<br>数据只在这台手机和你的私有仓库里</div>';
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
      '<button class="solid big" data-act="confirm">加入' + nameOf(curMeal) + '</button>');
    var gi = document.getElementById('grams');
    if (gi) gi.addEventListener('input', function () {
      curGrams = Math.max(0, num(this.value, 0));
      var k = curFood.kcal * curGrams / 100, pp = curFood.p * curGrams / 100;
      var box = document.querySelector('.sh-kcal');
      if (box) box.innerHTML = '<b>' + r0(k) + '</b> kcal　蛋白 <b>' + r1(pp) + '</b>g';
    });
  }
  function nameOf(id) { return (MEALS.filter(function (m) { return m.id === id; })[0] || { name: '加餐' }).name; }

  function openCustom() {
    openSheet('<div class="sh-grab"></div>' +
      '<div class="sh-head"><div class="sh-name">自定义食物</div><button class="sh-close" data-act="closesheet">×</button></div>' +
      '<p class="note">填每 100g 的营养，以后就能一键记录。</p>' +
      '<div class="form tight">' +
        '<label class="frow-in"><span>名称</span><input id="cf-name" type="text" placeholder="如 食堂鸡腿饭"></label>' +
        '<label class="frow-in"><span>热量</span><input id="cf-kcal" type="number" inputmode="numeric" placeholder="0"><i>kcal</i></label>' +
        '<label class="frow-in"><span>蛋白质</span><input id="cf-p" type="number" inputmode="decimal" placeholder="0"><i>g</i></label>' +
        '<label class="frow-in"><span>碳水</span><input id="cf-c" type="number" inputmode="decimal" placeholder="0"><i>g</i></label>' +
        '<label class="frow-in"><span>脂肪</span><input id="cf-f" type="number" inputmode="decimal" placeholder="0"><i>g</i></label>' +
      '</div>' +
      '<button class="solid big" data-act="savefood">保存</button>');
  }

  var pendingWeight = 0;
  function openWeight() {
    pendingWeight = day(todayKey()).weight || state.profile.weight;
    openSheet('<div class="sh-grab"></div>' +
      '<div class="sh-head"><div><div class="sh-name">今天体重</div>' +
        '<div class="sh-sub">早起空腹，同一台秤</div></div>' +
        '<button class="sh-close" data-act="closesheet">×</button></div>' +
      '<div class="sh-grams"><input id="wt" type="number" inputmode="decimal" value="' + pendingWeight + '"><span>kg</span></div>' +
      '<button class="solid big" data-act="saveweight">保存</button>');
    var w = document.getElementById('wt');
    if (w) { w.focus(); w.addEventListener('input', function () { pendingWeight = num(this.value, 0); }); }
  }

  /* ---------------- 支出确认 / 编辑弹层 ---------------- */
  var pendingExpenses = [], editingExpenseId = null;
  function categoryOptions(selected) {
    return EXPENSE_CATS.map(function (c) {
      return '<option value="' + c + '"' + (c === selected ? ' selected' : '') + '>' + c + '</option>';
    }).join('');
  }
  function drawExpenseReview() {
    var editing = !!editingExpenseId;
    openSheet('<div class="sh-grab"></div>' +
      '<div class="sh-head"><div><div class="sh-name">' + (editing ? '编辑支出' : '确认 ' + pendingExpenses.length + ' 笔支出') + '</div>' +
        '<div class="sh-sub">' + (editing ? '修改金额、描述、日期或类别' : '检查识别结果，确认后才会入账') + '</div></div>' +
        '<button class="sh-close" data-act="closesheet" aria-label="关闭">×</button></div>' +
      '<div class="ex-drafts">' + pendingExpenses.map(function (it, i) {
        return '<div class="ex-draft" data-ex-row="' + i + '">' +
          '<div class="ex-draft-top"><input class="ex-desc" data-ex-f="desc" type="text" maxlength="60" value="' + esc(it.desc) + '" aria-label="支出描述">' +
            '<label class="ex-amount"><span>¥</span><input data-ex-f="amount" type="number" min="0.01" step="0.01" inputmode="decimal" value="' + money(it.amount) + '" aria-label="金额"></label></div>' +
          '<div class="ex-draft-bottom"><input data-ex-f="date" type="date" value="' + it.date + '" aria-label="日期">' +
            '<select data-ex-f="category" aria-label="类别">' + categoryOptions(it.category) + '</select>' +
            (editing ? '' : '<button class="ghost small" data-act="exremove" data-i="' + i + '">移除</button>') + '</div>' +
        '</div>';
      }).join('') + '</div>' +
      '<div class="btns">' + (editing
        ? '<button class="ghost" data-act="expdel">删除</button><button class="solid" data-act="exsaveedit">保存修改</button>'
        : '<button class="ghost" data-act="closesheet">返回修改</button><button class="solid" data-act="exconfirm">确认入账</button>') +
      '</div>');
  }
  function syncExpenseDrafts() {
    var rows = sheet.querySelectorAll('[data-ex-row]');
    rows.forEach(function (row, i) {
      if (!pendingExpenses[i]) return;
      pendingExpenses[i].desc = row.querySelector('[data-ex-f="desc"]').value.trim();
      pendingExpenses[i].amount = num(row.querySelector('[data-ex-f="amount"]').value, 0);
      pendingExpenses[i].date = row.querySelector('[data-ex-f="date"]').value;
      pendingExpenses[i].category = row.querySelector('[data-ex-f="category"]').value;
    });
  }
  function validExpenseDrafts() {
    syncExpenseDrafts();
    if (!pendingExpenses.length) { toast('没有需要入账的支出'); return false; }
    for (var i = 0; i < pendingExpenses.length; i++) {
      var it = pendingExpenses[i];
      if (!it.desc) { toast('第 ' + (i + 1) + ' 笔还缺描述'); return false; }
      if (!(it.amount > 0)) { toast('第 ' + (i + 1) + ' 笔金额要大于 0'); return false; }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(it.date)) { toast('第 ' + (i + 1) + ' 笔日期不对'); return false; }
      it.amount = Math.round(it.amount * 100) / 100;
    }
    return true;
  }
  function openExpenseEditor(id) {
    var it = state.expenses.items.filter(function (x) { return x.id === id; })[0];
    if (!it) { toast('这笔支出不存在'); return; }
    editingExpenseId = id;
    pendingExpenses = [clone(it)];
    drawExpenseReview();
  }

  /* ---------------- 事件 ---------------- */
  document.addEventListener('click', function (e) {
    var tabBtn = e.target.closest('.tab');
    if (tabBtn) { tab = tabBtn.dataset.tab; if (tab === 'log') logDate = todayKey(); render(); return; }

    var el = e.target.closest('[data-act]');
    if (!el) return;
    var act = el.dataset.act;

    /* 训练 */
    if (act === 'bcheck' || act === 'lcheck') {
      var name = act === 'bcheck' ? 'ball' : 'lift';
      var td = trackOf(name), i = +el.dataset.i;
      td.done[i] = !td.done[i];
      save(); renderKeep(); queueSync(); return;
    }
    if (act === 'brpe' || act === 'lrpe') {
      var trk = act === 'brpe' ? 'ball' : 'lift';
      var tk = trackOf(trk);
      tk.rpe = (tk.rpe === +el.dataset.n) ? 0 : +el.dataset.n;
      save(); renderKeep(); queueSync(); return;
    }
    if (act === 'bnext') { completeTrack('ball'); return; }
    if (act === 'lnext') { completeTrack('lift'); return; }
    if (act === 'tsend') { shareOrCopy(buildTrainPrompt()); return; }
    if (act === 'tpaste') {
      pasteTo(function (t) { state.train.coach = t; save(); queueSync(); }); return;
    }

    /* 饮食 */
    if (act === 'daytype') {
      var b = e.target.closest('button[data-type]');
      if (!b) return;
      day(todayKey()).type = b.dataset.type; save(); render(); return;
    }
    if (act === 'day') {
      var dd = +el.dataset.d;
      logDate = dd === 0 ? todayKey() : shiftKey(logDate, dd);
      render(); return;
    }
    if (act === 'water') {
      var wk = day(todayKey());
      wk.water = Math.max(0, (wk.water || 0) + (+el.dataset.d) * WATER_STEP);
      if (wk.water > WATER_GOAL * 2) wk.water = WATER_GOAL * 2;
      save(); render(); queueSync(); return;
    }
    if (act === 'weigh') { openWeight(); return; }
    if (act === 'saveweight') {
      if (!pendingWeight || pendingWeight <= 0) { toast('数字不对'); return; }
      var nd = day(todayKey());
      nd.weight = r1(pendingWeight);
      state.profile.weight = r1(pendingWeight);
      save(); closeSheet(); render(); toast('已记录体重'); queueSync(); return;
    }
    if (act === 'quickadd') { tab = 'foods'; render(); focusFood(); return; }
    if (act === 'openlog') { logDate = todayKey(); tab = 'log'; render(); return; }
    if (act === 'openfoods') { tab = 'foods'; render(); return; }
    if (act === 'backtoday') { tab = 'today'; render(); return; }
    if (act === 'add') { tab = 'foods'; window.__mealPick = el.dataset.meal; render(); focusFood(); return; }
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

    /* 学习 */
    if (act === 'encheck' || act === 'cscscheck') {
      var fld = act === 'encheck' ? 'en' : 'cscs';
      var ii = +el.dataset.i;
      state.study[fld][ii] = !state.study[fld][ii];
      save(); queueSync(); renderKeep(); return;
    }
    if (act === 'stnext') { completeStudyDay(); return; }
    if (act === 'aisend') { aiSend(); return; }
    if (act === 'aipaste') { pasteTo(function (t) { setStudy('feedback', t); }); return; }
    if (act === 'deepseek') { window.open('https://chat.deepseek.com/', '_blank'); return; }

    /* 支出 */
    if (act === 'exparse') {
      var exInput = document.getElementById('ex-input');
      expenseText = exInput ? exInput.value.trim() : expenseText.trim();
      if (!expenseText) { toast('先说说花了什么'); return; }
      var parsed = parseExpenses(expenseText);
      if (!parsed.length) { toast('没有识别到金额，请补充数字'); return; }
      pendingExpenses = parsed;
      editingExpenseId = null;
      drawExpenseReview();
      return;
    }
    if (act === 'exremove') {
      syncExpenseDrafts();
      pendingExpenses.splice(+el.dataset.i, 1);
      if (!pendingExpenses.length) closeSheet(); else drawExpenseReview();
      return;
    }
    if (act === 'exconfirm') {
      if (!validExpenseDrafts()) return;
      var now = new Date().toISOString();
      var additions = pendingExpenses.map(function (it, i) {
        return { id: 'e' + Date.now().toString(36) + i + Math.random().toString(36).slice(2, 6),
          date: it.date, amount: it.amount, desc: it.desc, category: it.category, createdAt: now };
      });
      state.expenses.items = state.expenses.items.concat(additions);
      expenseText = '';
      save(); closeSheet(); render(); queueSync();
      toast('已入账 ' + additions.length + ' 笔'); return;
    }
    if (act === 'expedit') { openExpenseEditor(el.dataset.id); return; }
    if (act === 'exsaveedit') {
      if (!validExpenseDrafts()) return;
      var editIndex = -1;
      state.expenses.items.forEach(function (it, i) { if (it.id === editingExpenseId) editIndex = i; });
      if (editIndex < 0) { toast('这笔支出不存在'); return; }
      state.expenses.items[editIndex] = Object.assign({}, state.expenses.items[editIndex], pendingExpenses[0]);
      save(); closeSheet(); renderKeep(); queueSync(); toast('已保存修改'); return;
    }
    if (act === 'expdel') {
      if (!confirm('删除这笔支出？')) return;
      state.expenses.items = state.expenses.items.filter(function (it) { return it.id !== editingExpenseId; });
      save(); closeSheet(); renderKeep(); queueSync(); toast('已删除支出'); return;
    }
    if (act === 'exask') {
      var qEl = document.getElementById('ex-question');
      expenseQuestion = qEl ? qEl.value.trim() : expenseQuestion.trim();
      if (!expenseQuestion) { toast('先输入一个问题'); return; }
      expenseAnswer = answerExpense(expenseQuestion);
      renderKeep(); return;
    }
    if (act === 'exq') {
      expenseQuestion = el.dataset.q;
      expenseAnswer = answerExpense(expenseQuestion);
      renderKeep(); return;
    }

    /* 备份 */
    if (act === 'export') { exportData(); return; }
    if (act === 'import') { importData(); return; }
    if (act === 'syncnow') { syncDay(todayKey()); return; }
    if (act === 'restore') { restoreAll(); return; }
  });

  function focusFood() {
    var qi = document.getElementById('foodQ');
    if (qi) qi.focus();
  }

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
    if (e.target.id === 'ex-input') { expenseText = e.target.value; return; }
    if (e.target.id === 'ex-question') { expenseQuestion = e.target.value; return; }
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
    var trkField = e.target.getAttribute && e.target.getAttribute('data-trk');
    if (trkField) { setTrackNote(trkField, e.target.value); return; }
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
    var body = JSON.stringify({
      date: k,
      updatedAt: new Date().toISOString(),
      day: state.days[k] || null,
      study: (state.study.days && state.study.days[k]) || null,
      train: (state.train.days && state.train.days[k]) || null,
      expenses: state.expenses.items
    }, null, 1);

    return getFile(path).then(function (info) {
      var payload = { message: 'day: ' + k, content: b64enc(body), branch: state.sync.branch || 'main' };
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
            if (!obj || !obj.date) return;
            if (obj.day && !state.days[obj.date]) { state.days[obj.date] = obj.day; n++; }
            if (obj.study && state.study.days && !state.study.days[obj.date]) state.study.days[obj.date] = obj.study;
            if (obj.train && state.train.days && !state.train.days[obj.date]) state.train.days[obj.date] = obj.train;
            if (Array.isArray(obj.expenses)) {
              var expenseIds = state.expenses.items.map(function (x) { return x.id; });
              obj.expenses.forEach(function (x) {
                if (x && x.id && expenseIds.indexOf(x.id) < 0) { state.expenses.items.push(x); expenseIds.push(x.id); }
              });
            }
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
          state = normalize(obj);
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
