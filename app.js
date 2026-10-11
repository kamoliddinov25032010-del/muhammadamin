/* ============================================================
   POG'ONA — Asosiy logika (app.js)
   Muhammadamin tomonidan, 2026
   ============================================================ */

(function(){
"use strict";

/* ============ GLOBAL STATE ============ */
var app = document.getElementById("app");
var toastEl = document.getElementById("toast");
var modalEl = document.getElementById("modal");
var modalInner = document.getElementById("modalInner");
var confettiEl = document.getElementById("confetti");
var navEl = document.getElementById("nav");

var S = null;       // Level test state
var P = null;       // Practice state
var C = null;       // Cards state
var timerInterval = null;
var currentMode = "home";

/* ============ HELPERS ============ */
function $(s){ return document.querySelector(s); }
function $$(s){ return document.querySelectorAll(s); }
function esc(s){
  return String(s).replace(/[&<>"']/g, function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
  });
}
function shuffle(a){
  a = a.slice();
  for(var i=a.length-1;i>0;i--){
    var j = Math.floor(Math.random()*(i+1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function today(){ return new Date().toDateString(); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function fmtDate(d){ return new Date(d).toLocaleDateString("uz-UZ"); }

function toast(msg, type){
  toastEl.textContent = msg;
  toastEl.className = "toast on" + (type ? " " + type : "");
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(function(){ toastEl.classList.remove("on"); }, 2400);
}

function openModal(html){
  modalInner.innerHTML = html;
  modalEl.classList.add("on");
}
function closeModal(){
  modalEl.classList.remove("on");
}
modalEl.onclick = function(e){
  if(e.target === modalEl) closeModal();
};

function speak(text, lang){
  if(!("speechSynthesis" in window)){ toast("Ovoz qo'llab-quvvatlanmaydi"); return; }
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(text);
  u.lang = lang || "en-US";
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

function vibrate(ms){
  if(navigator.vibrate) navigator.vibrate(ms || 20);
}

/* ============ STORAGE ============ */
var store = {
  KEY: "pogona_v2",
  get: function(){
    try{
      var raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : this.default();
    }catch(e){ return this.default(); }
  },
  save: function(data){
    try{ localStorage.setItem(this.KEY, JSON.stringify(data)); }catch(e){}
  },
  default: function(){
    return {
      history: [],         // [{l,p,date,ts,mode}]
      wrong: [],           // [{t,correct,chosen,date}]
      streak: { days:0, last:"", best:0 },
      achievements: [],    // ["first","streak3",...]
      cards: {},           // {word: count}
      writing: {},         // {title: text}
      totalAnswers: 0,
      totalCorrect: 0,
      visited: []          // ["home","level",...]
    };
  },
  add: function(record){
    var d = this.get();
    d.history.unshift(record);
    d.history = d.history.slice(0, 50);
    this.save(d);
  },
  addWrong: function(item){
    var d = this.get();
    if(!d.wrong.find(function(w){ return w.t === item.t; })){
      d.wrong.unshift({ t:item.t, correct:item.correct, chosen:item.chosen, date: todayISO() });
      d.wrong = d.wrong.slice(0, 100);
    }
    this.save(d);
  },
  clearWrong: function(){
    var d = this.get(); d.wrong = []; this.save(d);
  },
  clearAll: function(){
    try{ localStorage.removeItem(this.KEY); }catch(e){}
  },
  updateStreak: function(){
    var d = this.get();
    var last = d.streak.last;
    var t = today();
    if(last === t) return d.streak;
    var y = new Date(Date.now() - 86400000).toDateString();
    d.streak.days = (last === y) ? d.streak.days + 1 : 1;
    d.streak.last = t;
    if(d.streak.days > d.streak.best) d.streak.best = d.streak.days;
    this.save(d);
    return d.streak;
  },
  addAnswer: function(correct){
    var d = this.get();
    d.totalAnswers++;
    if(correct) d.totalCorrect++;
    this.save(d);
  },
  saveCard: function(word, known){
    var d = this.get();
    if(!d.cards[word]) d.cards[word] = 0;
    if(known) d.cards[word]++;
    this.save(d);
  },
  saveWriting: function(title, text){
    var d = this.get();
    d.writing[title] = text;
    this.save(d);
  },
  addVisited: function(mode){
    var d = this.get();
    if(d.visited.indexOf(mode) === -1){
      d.visited.push(mode);
      this.save(d);
    }
  }
};

/* ============ ACHIEVEMENTS ============ */
var achv = {
  unlock: function(id){
    var d = store.get();
    if(d.achievements.indexOf(id) !== -1) return false;
    d.achievements.push(id);
    store.save(d);
    var a = ACHIEVEMENTS.find(function(x){ return x.id === id; });
    if(a){
      showAchvModal(a);
      confetti(30);
      vibrate([20, 50, 20]);
    }
    return true;
  },
  has: function(id){
    return store.get().achievements.indexOf(id) !== -1;
  },
  check: function(){
    var d = store.get();
    /* Birinchi test */
    if(d.history.length >= 1) this.unlock("first");
    /* Streak */
    if(d.streak.days >= 3) this.unlock("streak3");
    if(d.streak.days >= 7) this.unlock("streak7");
    /* Perfect */
    if(d.history.find(function(h){ return h.p === 100; })) this.unlock("perfect");
    /* B2+ */
    if(d.history.find(function(h){ return h.l === "B2" || h.l === "C1" || h.l === "C2"; })) this.unlock("b2");
    if(d.history.find(function(h){ return h.l === "C1" || h.l === "C2"; })) this.unlock("c1");
    /* Bo'limlar */
    if(d.visited.indexOf("grammar") !== -1) this.unlock("grammar");
    if(d.visited.indexOf("read") !== -1) this.unlock("reader");
    if(d.visited.indexOf("listen") !== -1) this.unlock("listener");
    if(d.visited.indexOf("write") !== -1) this.unlock("writer");
    /* Kartochkalar */
    var cardsKnown = Object.keys(d.cards).filter(function(k){ return d.cards[k] > 0; }).length;
    if(cardsKnown >= 60) this.unlock("vocab100");
    /* Allround */
    var needed = ["level","grammar","vocab","read","listen","phrase","kids","biz","write","cards"];
    var hasAll = needed.every(function(m){ return d.visited.indexOf(m) !== -1; });
    if(hasAll) this.unlock("allround");
  }
};

function showAchvModal(a){
  openModal(
    '<span class="modal-emoji">' + a.emoji + '</span>' +
    '<h2 style="font-size:28px;margin-bottom:8px">Yangi yutuq!</h2>' +
    '<p style="color:var(--primary);font-weight:700;font-size:18px;margin-bottom:8px">' + esc(a.title) + '</p>' +
    '<p style="color:var(--text-2);margin-bottom:24px">' + esc(a.desc) + '</p>' +
    '<button class="btn primary" onclick="closeModal()">Davom etish</button>'
  );
}

/* ============ CONFETTI ============ */
function confetti(count){
  count = count || 50;
  var colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4"];
  confettiEl.innerHTML = "";
  for(var i=0;i<count;i++){
    var el = document.createElement("i");
    el.style.left = Math.random() * 100 + "%";
    el.style.top = "-20px";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.animationDelay = (Math.random() * 0.5) + "s";
    el.style.animationDuration = (2 + Math.random() * 2) + "s";
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    el.style.width = (6 + Math.random() * 8) + "px";
    el.style.height = (6 + Math.random() * 8) + "px";
    confettiEl.appendChild(el);
  }
  setTimeout(function(){ confettiEl.innerHTML = ""; }, 4500);
}

/* ============ NAV ============ */
navEl.innerHTML = MENU.map(function(m){
  return '<button data-k="' + m[0] + '">' + esc(m[1]) + '</button>';
}).join("");

navEl.onclick = function(e){
  var b = e.target.closest("button");
  if(b) go(b.dataset.k);
};

function setNavActive(k){
  $$("#nav button").forEach(function(b){
    b.classList.toggle("on", b.dataset.k === k);
  });
}

/* ============ ROUTER ============ */
function go(k){
  stopTimer();
  currentMode = k;
  setNavActive(k);
  window.scrollTo({ top: 0, behavior: "smooth" });
  store.addVisited(k);
  achv.check();

  if(k === "home") home();
  else if(k === "level") startLevelTest();
  else if(k === "cards") startCards();
  else if(k === "stats") renderStats();
  else if(k === "achv") renderAchievements();
  else if(k === "tips") renderTips();
  else if(k === "write") startWriting();
  else if(k === "listen") startListening();
  else startPractice(k);
}

/* ============ HOME ============ */
function home(){
  var d = store.get();
  var streak = d.streak.days;
  var dailyWord = DAILY_WORDS[new Date().getDate() % DAILY_WORDS.length];
  var dailyPhrase = DAILY_PHRASES[new Date().getDate() % DAILY_PHRASES.length];

  var html = '';
  /* Hero */
  html += '<section class="hero">';
  html += '  <div>';
  html += '    <div class="hero-badge"><span class="dot"></span> Bepul · Cheklovsiz · O\'zbek tilida</div>';
  html += '    <h1>Ingliz tilingiz <em>qaysi pog\'onada?</em></h1>';
  html += '    <p>30 savol, 6 daraja — A1 dan C2 gacha. Aniq darajangizni bilib oling, keyingi qadamni rejalashtiring.</p>';
  html += '    <div class="hero-actions">';
  html += '      <button class="btn primary lg" onclick="go(\'level\')">🚀 Testni boshlash</button>';
  html += '      <button class="btn ghost lg" onclick="go(\'tips\')">💡 Maslahatlar</button>';
  html += '    </div>';
  html += '    <div class="hero-stats">';
  html += '      <div class="hero-stat"><b>30</b><span>savol</span></div>';
  html += '      <div class="hero-stat"><b>~10</b><span>daqiqa</span></div>';
  html += '      <div class="hero-stat"><b>A1–C2</b><span>CEFR</span></div>';
  html += '      <div class="hero-stat"><b>' + streak + '🔥</b><span>kunlik seriya</span></div>';
  html += '    </div>';
  html += '  </div>';
  /* Stairs */
  html += '  <div class="stairs">';
  LEVELS.forEach(function(l, i){
    var info = LEVEL_INFO[l];
    html += '<div class="step" style="height:' + (30 + i * 14) + '%">';
    html +=   '<b>' + l + '</b>';
    html +=   '<span>' + esc(info.name) + '</span>';
    html += '</div>';
  });
  html += '  </div>';
  html += '</section>';

  /* Daily */
  html += '<section class="section">';
  html += '  <div class="daily">';
  html += '    <div>';
  html += '      <h2>📅 Kunlik mashq</h2>';
  html += '      <p>Bugungi so\'z va ibora. Har kuni yangi — takrorlash eng yaxshi o\'qituvchi!</p>';
  html += '    </div>';
  html += '    <div style="text-align:left">';
  html += '      <div style="background:rgba(255,255,255,.15);padding:12px 20px;border-radius:12px;margin-bottom:10px">';
  html += '        <div style="font-size:12px;opacity:.8;margin-bottom:4px">SO\'Z</div>';
  html += '        <div style="font-weight:700;font-size:18px">' + esc(dailyWord[0]) + '</div>';
  html += '        <div style="font-size:14px;opacity:.9">' + esc(dailyWord[1]) + '</div>';
  html += '      </div>';
  html += '      <div style="background:rgba(255,255,255,.15);padding:12px 20px;border-radius:12px">';
  html += '        <div style="font-size:12px;opacity:.8;margin-bottom:4px">IBORA</div>';
  html += '        <div style="font-weight:700;font-size:16px">' + esc(dailyPhrase.en) + '</div>';
  html += '        <div style="font-size:13px;opacity:.9">' + esc(dailyPhrase.uz) + '</div>';
  html += '      </div>';
  html += '    </div>';
  html += '  </div>';
  html += '</section>';

  /* Modes */
  html += '<section class="section">';
  html += '  <div class="section-head">';
  html += '    <h2>Nimadan boshlaymiz?</h2>';
  html += '    <p>13 ta bo\'lim — har biri o\'ziga xos ko\'nikmani rivojlantiradi.</p>';
  html += '  </div>';
  html += '  <div class="grid">';
  MODES.forEach(function(m){
    var progress = getModeProgress(m.key);
    html += '<div class="card hoverable" onclick="go(\'' + m.key + '\')">';
    html += '  <div class="card-icon ' + m.cls + '">' + m.icon + '</div>';
    html += '  <h3>' + esc(m.title) + '</h3>';
    html += '  <p>' + esc(m.desc) + '</p>';
    html += '  <span class="tag">' + esc(m.tag) + '</span>';
    if(progress > 0){
      html += '  <div class="progress-mini"><i style="width:' + progress + '%"></i></div>';
    }
    html += '</div>';
  });
  html += '  </div>';
  html += '</section>';

  /* Week Plan */
  html += '<section class="section">';
  html += '  <div class="section-head">';
  html += '    <h2>📆 Haftalik reja</h2>';
  html += '    <p>Har kuni 15-20 daqiqa — natija kafolatli.</p>';
  html += '  </div>';
  html += '  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">';
  var todayIdx = new Date().getDay(); // 0=Sun
  var dayMap = { 1:0, 2:1, 3:2, 4:3, 5:4, 6:5, 0:6 };
  var todayDay = dayMap[todayIdx];
  WEEK_PLAN.forEach(function(w, i){
    var isToday = i === todayDay;
    html += '<div class="card" style="' + (isToday ? 'border-color:var(--primary);background:linear-gradient(180deg,color-mix(in srgb,var(--primary) 6%,var(--panel)),var(--panel))' : '') + '">';
    html += '  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">';
    html += '    <b style="font-size:18px">' + w.day + '</b>';
    html += '    <span style="font-size:24px">' + w.icon + '</span>';
    html += '  </div>';
    html += '  <p style="font-weight:600;color:var(--text);font-size:14px;margin-bottom:6px">' + esc(w.task) + '</p>';
    html += '  <span class="tag">' + w.min + ' daqiqa</span>';
    html += '</div>';
  });
  html += '  </div>';
  html += '</section>';

  /* Recent */
  if(d.history.length){
    html += '<section class="section">';
    html += '  <div class="section-head"><h2>Oxirgi natijalar</h2>';
    html += '  <p><a href="#" onclick="event.preventDefault();go(\'stats\')" style="color:var(--primary);font-weight:600">Barchasini ko\'rish →</a></p></div>';
    html += '  <div class="hist">';
    d.history.slice(0, 8).forEach(function(h){
      html += '<div class="hist-item"><b>' + esc(h.l) + '</b> · ' + h.p + '% · ' + esc(h.date) + '</div>';
    });
    html += '  </div>';
    html += '</section>';
  }

  /* Resources */
  html += '<section class="section">';
  html += '  <div class="section-head"><h2>🔗 Foydali resurslar</h2><p>Tekshirilgan va bepul manbalar.</p></div>';
  html += '  <div class="grid">';
  RESOURCES.forEach(function(r){
    html += '<a href="' + r.url + '" target="_blank" rel="noopener" class="card hoverable">';
    html += '  <div class="card-icon blue">' + r.icon + '</div>';
    html += '  <h3>' + esc(r.title) + '</h3>';
    html += '  <p>' + esc(r.desc) + '</p>';
    html += '</a>';
  });
  html += '  </div>';
  html += '</section>';

  app.innerHTML = html;
}

function getModeProgress(key){
  var d = store.get();
  if(key === "cards"){
    var known = Object.keys(d.cards).filter(function(k){ return d.cards[k] > 0; }).length;
    return Math.min(100, Math.round(known / 60 * 100));
  }
  var hist = d.history.filter(function(h){ return h.mode === key; });
  if(!hist.length) return 0;
  return Math.min(100, hist.length * 20);
}
