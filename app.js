/* 成长系统 v3 · 训练 / 饮食 / 学习 / 我的（数据存本地，自动备份到私有库） */
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

  /* 七天计划：按 getDay() 取，0 = 周日 */
  var TRAIN_PLAN = [
    {
      tag: '复盘', short: '复盘', title: '复盘 + 恢复',
      main: { name: '周复盘', big: '20', unit: 'MIN', small: '录像 · 只找一个问题' },
      brief: '今天不加量，把这一周看清楚。看 20 分钟录像，只找<b>你丢球前的那一步</b>：是左手被逼到边线、抬头太晚，还是出球慢半拍——写下来一条，下周就练它。',
      items: [
        { t: '看录像 20 分钟', d: '只看丢球回合，别整场刷' },
        { t: '称体重 + 拍照', d: '早起空腹，同一时间、同一光线' },
        { t: '膝康复 3 组', d: '直腿抬高 15 · 靠墙静蹲 45 秒 · 单腿站 30 秒' },
        { t: '只写下周一个目标', d: '要能验证，比如「卧推 32.5kg 做满 4×6」' }
      ]
    },
    {
      tag: '上肢推', short: '推', title: '上肢推 · 卧推',
      main: { name: '卧推', big: '30', unit: 'KG', small: '4 组 × 6 次' },
      brief: '上周 27.5kg 稳稳做满 4×6，今天加到 <b>30kg</b>。最后一组还能多做两次，就是「有余」，下周继续加；最后两次要人扶，就退回 27.5kg 把五组做满。',
      items: [
        { t: '卧推 30kg 4×6', d: '肩胛后收下沉，杠铃碰胸再推' },
        { t: '哑铃肩推 3×10', d: '坐姿背贴靠垫，别塌腰借力' },
        { t: '绳索下压 3×12', d: '肘固定在体侧，只有小臂动' },
        { t: '面拉 3×15', d: '拉到脸两侧，收住肩后束' }
      ]
    },
    {
      tag: '球 · 左手', short: '左手', title: '球场 · 左手',
      main: { name: '左手运球', big: '15', unit: 'MIN', small: '眼睛看前方，不看球' },
      brief: '左手是你要吃三年的饭。今天不做花活：原地运球 15 分钟，<b>眼睛看前方</b>；然后罚球 50 个，只数进了几个。数据比感觉诚实。',
      items: [
        { t: '左手原地运球 15 分钟', d: '低运球 + 体前变向，全程抬头' },
        { t: '罚球 50 个', d: '每组 10 个，记命中数' },
        { t: '左手启动变向 10×2', d: '压低重心，第一步要快' },
        { t: '拉伸 8 分钟', d: '小腿、髋前侧、胸椎' }
      ]
    },
    {
      tag: '下肢', short: '腿', title: '下肢 · 护膝',
      main: { name: '箱式半蹲', big: '52.5', unit: 'KG', small: '5 组 × 5 次' },
      brief: '术后的膝不靠感觉，靠箱子。<b>坐到箱子上停半秒</b>再起，屁股先发力，膝盖别内扣。52.5kg 是你现在的 PR，先把 5×5 做干净，再谈加重。',
      items: [
        { t: '箱式半蹲 52.5kg 5×5', d: '触箱停半秒，膝不内扣' },
        { t: '罗马尼亚硬拉 3×8', d: '髋往后坐，背别圆' },
        { t: '单腿臀桥 3×12', d: '每侧，顶住 2 秒' },
        { t: '提踵 3×20', d: '慢下快上，做满幅度' }
      ]
    },
    {
      tag: '恢复', short: '康复', title: '休息 · 膝康复',
      main: { name: '膝康复', big: '45', unit: 'MIN', small: '4 个动作 · 每个数到 3 秒' },
      brief: '休息日不是什么都不做。膝要的是<b>血</b>，不是重量——康复动作做慢，每个都数到 3 秒，做完大腿前侧发热才对。',
      items: [
        { t: '直腿抬高 3×15', d: '膝伸直，抬到 45° 停 3 秒' },
        { t: '靠墙静蹲 3×45 秒', d: '膝不超过脚尖，酸了也别塌' },
        { t: '单腿平衡 3×30 秒', d: '闭眼更难，护膝必练' },
        { t: '泡沫轴 大腿前侧 5 分钟', d: '慢滚，痛点停 20 秒' }
      ]
    },
    {
      tag: '上肢拉', short: '拉', title: '上肢拉 · 引体',
      main: { name: '引体向上', big: '待测', unit: '', small: '自重 · 3 组到力竭' },
      brief: '今天先做一件事：<b>测出你的引体极限</b>，写进下面的身体反馈。做不满五个就先做离心——跳上去，用 5 秒慢慢放下来，比硬拉省时间。',
      items: [
        { t: '引体向上 3 组到力竭', d: '记下第一组做了几个' },
        { t: '单臂哑铃划船 3×10', d: '每侧，肘贴身体往后拉' },
        { t: '哑铃弯举 3×12', d: '不甩，慢放' },
        { t: '农夫走 3×30 米', d: '肩不耸，走直' }
      ]
    },
    {
      tag: '球 · 突破', short: '突破', title: '球场 · 突破',
      main: { name: '左手突破', big: '10', unit: '×2', small: '对抗下完成 · 两组' },
      brief: '把周二的左手带到有人防的地方。左手突破 10 次一组，做两组；最后加 100 个定点三分，<b>只数进的</b>。累的时候动作才是真的。',
      items: [
        { t: '左手突破 10×2', d: '对抗下完成，别躲' },
        { t: '篮下换手终结 10×2', d: '起跳前护球' },
        { t: '定点三分 100 个', d: '五个点，每点 20 个' },
        { t: '冰敷左膝 10 分钟', d: '练完就做，别等肿' }
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
    study: { days: {} },
    train: { days: {} },
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
    out.study = { days: (s && s.study && s.study.days) || {} };
    out.train = { days: (s && s.train && s.train.days) || {} };
    out.customFoods = (s && s.customFoods) || [];
    return out;
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

  /* ---------------- 训练数据 ---------------- */
  function planOf(k) { return TRAIN_PLAN[parseKey(k).getDay()]; }
  function trainDay(k) {
    k = k || todayKey();
    if (!state.train.days[k]) state.train.days[k] = { done: [false, false, false, false], rpe: 0, sore: '', coach: '', actual: '' };
    var d = state.train.days[k];
    if (!Array.isArray(d.done)) d.done = [false, false, false, false];
    while (d.done.length < 4) d.done.push(false);
    if (typeof d.rpe !== 'number') d.rpe = 0;
    if (typeof d.sore !== 'string') d.sore = '';
    if (typeof d.coach !== 'string') d.coach = '';
    if (typeof d.actual !== 'string') d.actual = '';
    return d;
  }
  function doneRaw(k) {
    var t = state.train.days[k];
    return t && Array.isArray(t.done) ? t.done.filter(Boolean).length : 0;
  }
  function trainDone() { return doneRaw(todayKey()); }
  function weekDone() {
    var st = weekStart(todayKey()), n = 0;
    for (var i = 0; i < 7; i++) if (doneRaw(shiftKey(st, i)) >= 2) n++;
    return n;
  }
  function streak() {
    var n = 0, k = todayKey(), guard = 0;
    if (doneRaw(k) === 0) k = shiftKey(k, -1);
    while (doneRaw(k) > 0 && guard < 400) { n++; guard++; k = shiftKey(k, -1); }
    return n;
  }
  function setTrain(field, v) {
    var d = trainDay(todayKey());
    d[field] = v;
    save(); queueSync();
  }

  /* ---------------- 学习：日期驱动的每日计划 ---------------- */
  var PLAN_START = '2026-11-11';

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

  function newStudyDay() {
    return { en: [false, false, false], cscs: [false, false, false], right: 0, total: 0, out: '', feedback: '' };
  }
  function studyDay(k) {
    k = k || todayKey();
    if (!state.study.days[k]) state.study.days[k] = newStudyDay();
    var d = state.study.days[k];
    ['en', 'cscs'].forEach(function (f) {
      if (!Array.isArray(d[f])) d[f] = [false, false, false];
      while (d[f].length < 3) d[f].push(false);
    });
    if (d.out && typeof d.out === 'object') d.out = d.out.text || '';
    if (typeof d.out !== 'string') d.out = '';
    if (typeof d.feedback !== 'string') d.feedback = '';
    if (typeof d.right !== 'number') d.right = 0;
    if (typeof d.total !== 'number') d.total = 0;
    return d;
  }
  function studyDone(k) {
    var d = studyDay(k);
    return d.en.filter(Boolean).length + d.cscs.filter(Boolean).length;
  }
  function dayIdx(k) {
    return Math.max(0, Math.round((parseKey(k || todayKey()) - parseKey(PLAN_START)) / 86400000));
  }
  function planWeek(k) { return Math.floor(dayIdx(k) / 7); }
  function enWeek(k) { return EN_WEEKS[planWeek(k) % EN_WEEKS.length]; }
  function cscsWeek(k) { return CSCS_WEEKS[planWeek(k) % CSCS_WEEKS.length]; }
  function setStudy(field, v) {
    studyDay(todayKey())[field] = v;
    save();
    var badge = document.getElementById('st-badge');
    if (badge) badge.textContent = studyDone() + '/6 项';
    queueSync();
  }

  /* ---------------- 视图状态 ---------------- */
  var tab = 'train';
  var logDate = todayKey();
  var foodQ = '', foodCat = '全部';
  var SUB_OF = { log: 'today', foods: 'today' };
  var mTab = /[?&]tab=(\w+)/.exec(location.search);
  if (mTab && ['train', 'today', 'study', 'log', 'foods', 'me'].indexOf(mTab[1]) > -1) tab = mTab[1];

  /* ---------------- 渲染 ---------------- */
  var view = document.getElementById('view');

  function render() {
    if (tab === 'train') view.innerHTML = viewTrain();
    else if (tab === 'today') view.innerHTML = viewToday();
    else if (tab === 'study') view.innerHTML = viewStudy();
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

  /* ================= 训练 ================= */
  function viewTrain() {
    var k = todayKey(), p = planOf(k), d = trainDay(k);
    var done = d.done.filter(Boolean).length, goal = state.profile.trainWeekly || 5;

    var s = head('第 ' + weekNo() + ' 周 · ' + p.tag, '训练',
      '<span class="status">' + (done === 4 ? '已完成' : done > 0 ? '进行中' : '未开始') + '</span>');

    /* 读数 */
    s += '<section class="treadout">' +
      '<div class="tr-top"><span>' + (p.main ? p.main.name : '恢复') + '</span><span>' + done + ' / 4 项</span></div>' +
      '<div class="tr-num' + (String(p.main.big).length > 3 ? ' nosmall' : '') + '">' + esc(String(p.main.big)) +
        (p.main.unit ? '<small>' + p.main.unit + '</small>' : '') + '</div>' +
      '<div class="tr-bar"><i></i><span>' + esc(p.main.small) + '</span></div>' +
      '<label class="frow-in"><span>实际</span>' +
        '<input data-train="actual" type="text" placeholder="30kg × 6,6,6,5" value="' + esc(d.actual) + '"></label>' +
    '</section>';

    /* 教练简报 */
    s += '<div class="brief"><div class="brief-k">教练简报</div>' + p.brief + '</div>';

    /* 三个读数 */
    s += '<div class="mods">' +
      '<div class="mod' + (weekDone() >= goal ? ' on' : '') + '"><div class="mod-k">本周</div>' +
        '<div class="mod-v">' + weekDone() + '<i>/ ' + goal + '</i></div><div class="mod-f">训练天</div></div>' +
      '<div class="mod"><div class="mod-k">主项</div>' +
        '<div class="mod-v">' + esc(String(p.main.big)) + (p.main.unit ? '<i>' + p.main.unit + '</i>' : '') + '</div>' +
        '<div class="mod-f">' + esc(p.main.name) + '</div></div>' +
      '<div class="mod"><div class="mod-k">连续</div>' +
        '<div class="mod-v">' + streak() + '<i>天</i></div><div class="mod-f">不断档</div></div>' +
    '</div>';

    /* 今日清单 */
    s += '<section class="card"><div class="card-head"><h2>今天练什么</h2><span class="hint">做完点右边</span></div>' +
      p.items.map(function (it, i) {
        var on = !!d.done[i];
        return '<div class="todo' + (on ? ' done' : '') + '">' +
          '<div class="todo-no">' + pad(i + 1) + '</div>' +
          '<div class="todo-t"><h3>' + esc(it.t) + '</h3><p>' + esc(it.d) + '</p></div>' +
          '<button class="key" data-act="tcheck" data-i="' + i + '">' +
            (on ? '<svg viewBox="0 0 24 24"><path d="M4 12.5 9.5 18 20 6.5"/></svg>' : '') +
          '</button>' +
        '</div>';
      }).join('') +
      '<p class="note">做完一项点一下右边的键。四项全亮，这一天才算过。</p>' +
    '</section>';

    /* 强度 + 身体反馈 */
    s += '<section class="card"><div class="card-head"><h2>今天有多难</h2><span class="hint">1 轻松 · 10 拼到爆</span></div>' +
      '<div class="rpe">' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) {
        return '<span class="' + (d.rpe === n ? 'on' : '') + '" data-act="trpe" data-n="' + n + '">' + n + '</span>';
      }).join('') + '</div>' +
      '<textarea class="ta" data-train="sore" rows="2" placeholder="哪里酸、哪里不对，一句话（膝：稳 / 酸 / 痛）">' + esc(d.sore) + '</textarea>' +
    '</section>';

    /* 本周 */
    s += '<section class="card"><div class="card-head"><h2>这一周</h2><span class="hint">' + weekDone() + ' / ' + goal + ' 天</span></div>' +
      '<div class="week">' + weekStrip() + '</div>' +
    '</section>';

    /* AI 教练 */
    s += '<section class="card"><div class="card-head"><h2>问教练</h2><span class="hint">DeepSeek</span></div>' +
      '<div class="btns"><button class="solid" data-act="tsend">复制今日简报</button>' +
        '<button class="ghost" data-act="deepseek">打开 DeepSeek</button></div>' +
      '<div class="aibox"><div class="aibox-h"><span>教练回复</span><button class="linkbtn" data-act="tpaste">粘贴回答</button></div>' +
        '<textarea class="ta" data-train="coach" rows="5" placeholder="复制简报 → 到 DeepSeek 粘贴发送 → 复制回答 → 回来点「粘贴回答」">' + esc(d.coach) + '</textarea>' +
      '</div>' +
      '<p class="note">简报里带着你的伤、目标、今天完成度和 RPE，AI 才知道该加还是该减。</p>' +
    '</section>';

    return s;
  }

  function weekStrip() {
    var st = weekStart(todayKey()), out = '', nm = ['一', '二', '三', '四', '五', '六', '日'];
    for (var i = 0; i < 7; i++) {
      var k = shiftKey(st, i), p = planOf(k);
      out += '<div class="wd' + (k === todayKey() ? ' now' : '') + (p.main.unit === 'MIN' || p.tag === '恢复' ? ' rest' : '') +
        (doneRaw(k) ? ' ok' : '') + '"><b>' + nm[i] + '</b><span>' + p.short + '</span></div>';
    }
    return out;
  }

  function buildTrainPrompt() {
    var k = todayKey(), p = planOf(k), d = trainDay(k);
    var doneList = [];
    d.done.forEach(function (v, i) { if (v) doneList.push((i + 1) + '. ' + p.items[i].t); });
    var lines = p.items.map(function (it, i) { return (i + 1) + ') ' + it.t + '（' + it.d + '）'; }).join('\n');
    var hist = [];
    for (var i = 1; i <= 6; i++) {
      var kk = shiftKey(k, -i), t = state.train.days[kk];
      if (t && (t.rpe || (t.sore || '').trim() || (t.actual || '').trim())) {
        hist.push(dateLabel(kk) + '：完成 ' + (t.done || []).filter(Boolean).length + '/4，RPE ' + (t.rpe || '未记') +
          ((t.actual || '').trim() ? '，实做 ' + t.actual.trim() : '') +
          ((t.sore || '').trim() ? '，' + t.sore.trim() : ''));
      }
    }
    return '你是我的力量与篮球体能教练，要求严格，不要客套。\n' +
      '我：17 岁，CUBA 控卫，190cm / 72kg，左膝半月板术后 8 个月，正在增肌（每周 +0.3kg），左手持球是短板，不吃蛋白粉。\n' +
      '今天（' + dateLabel(k) + '）的计划：\n' + lines + '\n' +
      '已完成：' + (doneList.length ? doneList.join('；') : '暂无') + '\n' +
      '实际完成：' + ((d.actual || '').trim() || '未记录') + '\n' +
      '自评强度 RPE：' + (d.rpe ? d.rpe + '/10' : '未记录') + '\n' +
      '身体反馈：' + ((d.sore || '').trim() || '无') + '\n' +
      (hist.length ? '最近记录：\n' + hist.join('\n') + '\n' : '') +
      '\n直接回答四件事：\n' +
      '1) 今天的完成质量有没有问题\n' +
      '2) 明天练什么，重量加不加，加到多少\n' +
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
    var k = todayKey(), d = studyDay(k), n = studyDone(k);
    var wk = planWeek(k) + 1, en = enWeek(k), cs = cscsWeek(k);
    var role = dayIdx(k) % 7, enTasks = EN_ROLES[role](en), csTasks = CSCS_ROLES[role](cs);
    var rate = d.total > 0 ? Math.round(d.right / d.total * 100) + '%' : '未记';
    var s = head('第 ' + (dayIdx(k) + 1) + ' 天 · 第 ' + wk + ' 周', '学习',
      '<div class="pill" id="st-badge">' + n + '/6 项</div>');

    s += '<section class="card">' +
      '<div class="card-head"><h2><i class="idx">1</i>英语 · 四级</h2><span class="hint">' + esc(en.t) + '</span></div>' +
      enTasks.map(function (x, i) { return planTodo('encheck', i, x.t, x.d, d.en[i]); }).join('') +
      '<p class="note">刘晓艳给你方法和词汇，真题给你分数。只听课不做题，等于没学。</p>' +
    '</section>';

    s += '<section class="card">' +
      '<div class="card-head"><h2><i class="idx">2</i>CSCS</h2><span class="hint">' + esc(cs.t) + '</span></div>' +
      csTasks.map(function (x, i) { return planTodo('cscscheck', i, x.t, x.d, d.cscs[i]); }).join('') +
      '<p class="note">读一遍不算会。能用自己的话讲出来、能给队友用上，才算。</p>' +
    '</section>';

    s += '<section class="card"><div class="card-head"><h2><i class="idx">3</i>今天做题</h2><span class="hint">正确率 ' + rate + '</span></div>' +
      '<div class="rate">' +
        '<label><input data-study="right" type="number" inputmode="numeric" value="' + (d.right || '') + '"><i>做对</i></label>' +
        '<span>/</span>' +
        '<label><input data-study="total" type="number" inputmode="numeric" value="' + (d.total || '') + '"><i>总题数</i></label>' +
      '</div></section>';

    s += '<section class="card"><div class="card-head"><h2>近 7 天</h2><span class="hint">每天 6 项</span></div>' +
      '<div class="bars">' + studyBars() + '</div></section>';

    s += '<section class="card"><div class="card-head"><h2>两条线考什么</h2><span class="hint">先看地图再走路</span></div>' +
      '<div class="steps">' +
        stepRow('四级听力', '248.5 分 · 新闻 / 长对话 / 篇章', wk <= 5) +
        stepRow('四级阅读', '248.5 分 · 选词 / 匹配 / 仔细', wk >= 6 && wk <= 9) +
        stepRow('四级写作 + 翻译', '213 分 · 各 106.5', wk >= 10) +
        stepRow('CSCS 科学基础', '解剖 / 生物力学 / 内分泌 / 营养', wk <= 4) +
        stepRow('CSCS 实践应用', '测试 / 技术 / 计划 / 周期', wk >= 5) +
      '</div>' +
      '<p class="note">四级 425 过线；CSCS 两科都要 70% 左右。哪个都躲不掉，就按周次一周一周往前推。</p>' +
    '</section>';

    s += '<section class="card"><div class="card-head"><h2>作文 / 翻译批改</h2><span class="hint">写完贴进来</span></div>' +
      '<textarea class="ta" data-study="out" rows="4" placeholder="把今天写的作文或翻译贴进来，先自己看一遍再交给 AI">' + esc(d.out) + '</textarea>' +
      '<div class="btns">' +
        '<button class="solid" data-act="aisend">交给 AI 批改</button>' +
        '<button class="ghost" data-act="deepseek">打开 DeepSeek</button>' +
      '</div>' +
      '<div class="aibox">' +
        '<div class="aibox-h"><span>批改结果</span><button class="linkbtn" data-act="aipaste">粘贴回答</button></div>' +
        '<textarea class="ta" data-study="feedback" rows="4" placeholder="复制回答后回来点「粘贴回答」">' + esc(d.feedback) + '</textarea>' +
      '</div>' +
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
      out += '<div class="barcol"><div class="barcol-track"><span style="height:' + Math.round(n / 6 * 100) + '%"></span></div>' +
        '<div class="barcol-lb">' + (dt.getMonth() + 1) + '/' + dt.getDate() + '</div></div>';
    }
    return out;
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
    var d = studyDay(todayKey());
    if (!d.out.trim()) { toast('先把今天写的作文或翻译贴进来'); return; }
    shareOrCopy(buildPrompt(d));
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

    s += '<div class="foot">成长系统 · 训练 / 饮食 / 学习<br>数据只在这台手机和你的私有仓库里</div>';
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

  /* ---------------- 事件 ---------------- */
  document.addEventListener('click', function (e) {
    var tabBtn = e.target.closest('.tab');
    if (tabBtn) { tab = tabBtn.dataset.tab; if (tab === 'log') logDate = todayKey(); render(); return; }

    var el = e.target.closest('[data-act]');
    if (!el) return;
    var act = el.dataset.act;

    /* 训练 */
    if (act === 'tcheck') {
      var td = trainDay(todayKey()), i = +el.dataset.i;
      td.done[i] = !td.done[i];
      save(); renderKeep(); queueSync(); return;
    }
    if (act === 'trpe') {
      var tk = trainDay(todayKey());
      tk.rpe = (tk.rpe === +el.dataset.n) ? 0 : +el.dataset.n;
      save(); renderKeep(); queueSync(); return;
    }
    if (act === 'tsend') { shareOrCopy(buildTrainPrompt()); return; }
    if (act === 'tpaste') { pasteTo(function (t) { setTrain('coach', t); }); return; }

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
      var sd = studyDay(todayKey());
      var fld = act === 'encheck' ? 'en' : 'cscs';
      var ii = +el.dataset.i;
      sd[fld][ii] = !sd[fld][ii];
      save(); queueSync(); renderKeep(); return;
    }
    if (act === 'aisend') { aiSend(); return; }
    if (act === 'aipaste') { pasteTo(function (t) { setStudy('feedback', t); }); return; }
    if (act === 'deepseek') { window.open('https://chat.deepseek.com/', '_blank'); return; }

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
    var trField = e.target.getAttribute && e.target.getAttribute('data-train');
    if (trField) { setTrain(trField, e.target.value); return; }
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
      train: (state.train.days && state.train.days[k]) || null
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
            if (obj.study && !state.study.days[obj.date]) state.study.days[obj.date] = obj.study;
            if (obj.train && !state.train.days[obj.date]) state.train.days[obj.date] = obj.train;
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
