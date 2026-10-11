/* ============================================================
   POG'ONA — Asosiy logika (app.js) — TO'LIQ VERSIYA
   Muhammadamin tomonidan, 2026
   ============================================================ */

(function(){
"use strict";

/* ============ DOM ============ */
var app = document.getElementById("app");
var toastEl = document.getElementById("toast");
var modalEl = document.getElementById("modal");
var modalInner = document.getElementById("modalInner");
var confettiEl = document.getElementById("confetti");
var navEl = document.getElementById("nav");

var S = null, P = null, C = null;
var timerInterval = null;

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
function todayISO(){ return new Date().toISOString().slice(0,10); }

function toast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add("on");
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(function(){ toastEl.classList.remove("on"); }, 2400);
}

function openModal(html){
  modalInner.innerHTML = html;
  modalEl.classList.add("on");
}
function closeModal(){ modalEl.classList.remove("on"); }
modalEl.onclick = function(e){ if(e.target === modalEl) closeModal(); };

function speak(text){
  if(!("speechSynthesis" in window)){ toast("Ovoz yo'q"); return; }
  window.speechSynthesis.cancel();
  var u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US"; u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

/* ============ STORAGE ============ */
var store = {
  KEY: "pogona_v2",
  get: function(){
    try{
      var raw = localStorage.getItem(this.KEY);
      return raw ? JSON.parse(raw) : this.def();
    }catch(e){ return this.def(); }
  },
  save: function(d){
    try{ localStorage.setItem(this.KEY, JSON.stringify(d)); }catch(e){}
  },
  def: function(){
    return {
      history: [], wrong: [],
      streak: { days:0, last:"", best:0 },
      achievements: [], cards: {}, writing: {},
      visited: []
    };
  },
  add: function(r){
    var d = this.get();
    d.history.unshift(r);
    d.history = d.history.slice(0, 50);
    this.save(d);
  },
  addWrong: function(item){
    var d = this.get();
    var exists = false;
    for(var i=0;i<d.wrong.length;i++){ if(d.wrong[i].t === item.t){ exists = true; break; } }
    if(!exists){
      d.wrong.unshift({ t:item.t, correct:item.correct, chosen:item.chosen, date: todayISO() });
      d.wrong = d.wrong.slice(0, 100);
      this.save(d);
    }
  },
  clearWrong: function(){ var d = this.get(); d.wrong = []; this.save(d); },
  clearAll: function(){ try{ localStorage.removeItem(this.KEY); }catch(e){} },
  updateStreak: function(){
    var d = this.get();
    var t = new Date().toDateString();
    if(d.streak.last === t) return d.streak;
    var y = new Date(Date.now() - 86400000).toDateString();
    d.streak.days = (d.streak.last === y) ? d.streak.days + 1 : 1;
    d.streak.last = t;
    if(d.streak.days > d.streak.best) d.streak.best = d.streak.days;
    this.save(d);
    return d.streak;
  },
  saveCard: function(word){
    var d = this.get();
    d.cards[word] = (d.cards[word] || 0) + 1;
    this.save(d);
  },
  saveWriting: function(title, text){
    var d = this.get();
    d.writing[title] = text;
    this.save(d);
  },
  addVisited: function(m){
    var d = this.get();
    if(d.visited.indexOf(m) === -1){ d.visited.push(m); this.save(d); }
  }
};

/* ============ ACHIEVEMENTS ============ */
var achv = {
  unlock: function(id){
    var d = store.get();
    if(d.achievements.indexOf(id) !== -1) return false;
    d.achievements.push(id);
    store.save(d);
    var a = ACHIEVEMENTS.filter(function(x){ return x.id === id; })[0];
    if(a){
      setTimeout(function(){
        openModal(
          '<span class="modal-emoji">' + a.emoji + '</span>' +
          '<h2 style="font-size:26px;margin-bottom:8px">🎉 Yangi yutuq!</h2>' +
          '<p style="color:var(--primary);font-weight:700;font-size:18px;margin-bottom:8px">' + esc(a.title) + '</p>' +
          '<p style="color:var(--text-2);margin-bottom:24px">' + esc(a.desc) + '</p>' +
          '<button class="btn primary" onclick="closeModal()">Davom etish</button>'
        );
        confetti(40);
      }, 300);
    }
    return true;
  },
  check: function(){
    var d = store.get();
    if(d.history.length >= 1) this.unlock("first");
    if(d.streak.days >= 3) this.unlock("streak3");
    if(d.streak.days >= 7) this.unlock("streak7");
    for(var i=0;i<d.history.length;i++){
      if(d.history[i].p === 100){ this.unlock("perfect"); break; }
    }
    for(var j=0;j<d.history.length;j++){
      var lv = d.history[j].l;
      if(lv === "B2" || lv === "C1" || lv === "C2"){ this.unlock("b2"); }
      if(lv === "C1" || lv === "C2"){ this.unlock("c1"); }
    }
    if(d.visited.indexOf("grammar") !== -1) this.unlock("grammar");
    if(d.visited.indexOf("read") !== -1) this.unlock("reader");
    if(d.visited.indexOf("listen") !== -1) this.unlock("listener");
    if(d.visited.indexOf("write") !== -1) this.unlock("writer");
    var known = 0;
    for(var k in d.cards){ if(d.cards[k] > 0) known++; }
    if(known >= 60) this.unlock("vocab100");
    var needed = ["level","grammar","vocab","read","listen","phrase","kids","biz","write","cards"];
    var hasAll = needed.every(function(m){ return d.visited.indexOf(m) !== -1; });
    if(hasAll) this.unlock("allround");
  },
  has: function(id){ return store.get().achievements.indexOf(id) !== -1; }
};

/* ============ CONFETTI ============ */
function confetti(count){
  count = count || 50;
  var colors = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#06b6d4"];
  confettiEl.innerHTML = "";
  for(var i=0;i<count;i++){
    var el = document.createElement("i");
    el.style.cssText = "position:absolute;left:" + (Math.random()*100) + "%;top:-20px;" +
      "background:" + colors[Math.floor(Math.random()*colors.length)] + ";" +
      "width:" + (6+Math.random()*8) + "px;height:" + (6+Math.random()*8) + "px;" +
      "animation:fall " + (2+Math.random()*2) + "s linear " + (Math.random()*0.5) + "s forwards;" +
      "border-radius:" + (Math.random()>0.5 ? "50%" : "2px");
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
function setNav(k){
  $$("#nav button").forEach(function(b){
    b.classList.toggle("on", b.dataset.k === k);
  });
}

/* ============ ROUTER ============ */
function go(k){
  stopTimer();
  setNav(k);
  window.scrollTo(0, 0);
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
window.go = go;
window.closeModal = closeModal;

/* ============ HOME ============ */
function home(){
  var d = store.get();
  var dailyWord = DAILY_WORDS[new Date().getDate() % DAILY_WORDS.length];
  var dailyPhrase = DAILY_PHRASES[new Date().getDate() % DAILY_PHRASES.length];

  var html = '';
  html += '<section class="hero"><div>';
  html += '  <div class="hero-badge"><span class="dot"></span> Bepul · O\'zbek tilida</div>';
  html += '  <h1>Ingliz tilingiz <em>qaysi pog\'onada?</em></h1>';
  html += '  <p>30 savol, 6 daraja — A1 dan C2 gacha. Aniq darajangizni bilib oling.</p>';
  html += '  <div class="hero-actions">';
  html += '    <button class="btn primary lg" onclick="go(\'level\')">🚀 Testni boshlash</button>';
  html += '    <button class="btn ghost lg" onclick="go(\'tips\')">💡 Maslahatlar</button>';
  html += '  </div>';
  html += '  <div class="hero-stats">';
  html += '    <div class="hero-stat"><b>30</b><span>savol</span></div>';
  html += '    <div class="hero-stat"><b>~10</b><span>daqiqa</span></div>';
  html += '    <div class="hero-stat"><b>A1–C2</b><span>CEFR</span></div>';
  html += '    <div class="hero-stat"><b>' + d.streak.days + '🔥</b><span>kunlik seriya</span></div>';
  html += '  </div>';
  html += '</div><div class="stairs">';
  LEVELS.forEach(function(l, i){
    html += '<div class="step" style="height:' + (30 + i * 14) + '%">';
    html +=   '<b>' + l + '</b><span>' + esc(LEVEL_INFO[l].name) + '</span>';
    html += '</div>';
  });
  html += '</div></section>';

  /* Daily */
  html += '<section class="section"><div class="daily">';
  html += '  <div>';
  html += '    <h2>📅 Kunlik mashq</h2>';
  html += '    <p>Bugungi so\'z va ibora. Har kuni yangi!</p>';
  html += '  </div>';
  html += '  <div style="text-align:left">';
  html += '    <div style="background:rgba(255,255,255,.15);padding:12px 20px;border-radius:12px;margin-bottom:10px">';
  html += '      <div style="font-size:12px;opacity:.8">SO\'Z</div>';
  html += '      <div style="font-weight:700;font-size:18px">' + esc(dailyWord[0]) + '</div>';
  html += '      <div style="font-size:14px;opacity:.9">' + esc(dailyWord[1]) + '</div>';
  html += '    </div>';
  html += '    <div style="background:rgba(255,255,255,.15);padding:12px 20px;border-radius:12px">';
  html += '      <div style="font-size:12px;opacity:.8">IBORA</div>';
  html += '      <div style="font-weight:700;font-size:16px">' + esc(dailyPhrase.en) + '</div>';
  html += '      <div style="font-size:13px;opacity:.9">' + esc(dailyPhrase.uz) + '</div>';
  html += '    </div>';
  html += '  </div>';
  html += '</div></section>';

  /* Modes */
  html += '<section class="section">';
  html += '  <div class="section-head"><h2>Nimadan boshlaymiz?</h2>';
  html += '  <p>13 ta bo\'lim — har biri o\'ziga xos.</p></div>';
  html += '  <div class="grid">';
  MODES.forEach(function(m){
    html += '<div class="card hoverable" onclick="go(\'' + m.key + '\')">';
    html += '  <div class="card-icon ' + m.cls + '">' + m.icon + '</div>';
    html += '  <h3>' + esc(m.title) + '</h3>';
    html += '  <p>' + esc(m.desc) + '</p>';
    html += '  <span class="tag">' + esc(m.tag) + '</span>';
    html += '</div>';
  });
  html += '  </div>';
  html += '</section>';

  /* Week Plan */
  html += '<section class="section">';
  html += '  <div class="section-head"><h2>📆 Haftalik reja</h2>';
  html += '  <p>Kuniga 15-20 daqiqa — natija kafolatli.</p></div>';
  html += '  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr))">';
  var todayIdx = new Date().getDay();
  var map = {1:0,2:1,3:2,4:3,5:4,6:5,0:6};
  var td = map[todayIdx];
  WEEK_PLAN.forEach(function(w, i){
    var style = (i === td) ? 'border-color:var(--primary);background:linear-gradient(180deg,color-mix(in srgb,var(--primary) 6%,var(--panel)),var(--panel))' : '';
    html += '<div class="card" style="' + style + '">';
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

  /* History */
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
  html += '  <div class="section-head"><h2>🔗 Foydali resurslar</h2><p>Tekshirilgan va bepul.</p></div>';
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

/* ============ PRACTICE ENGINE ============ */
function getPracticeData(k){
  if(k === "grammar") return { t:"Grammatika", q: shuffle(GRAMMAR).slice(0, 10) };
  if(k === "vocab"){
    var picked = shuffle(VOCAB).slice(0, 10);
    return {
      t: "Lug'at",
      q: picked.map(function(p){
        var w = p[0], correct = p[1];
        var others = shuffle(VOCAB.filter(function(x){ return x[0] !== w; }).map(function(x){ return x[1]; })).slice(0, 3);
        return ['"' + w + '" nima degani?', [correct].concat(others), 0];
      })
    };
  }
  if(k === "kids") return { t:"Bolalar", q: shuffle(KIDS).slice(0, 10) };
  if(k === "biz") return { t:"Biznes", q: shuffle(BUSINESS).slice(0, 10) };
  if(k === "phrase") return { t:"Frazal fe'llar", q: shuffle(PHRASAL_VERBS).slice(0, 10) };
  return null;
}

function startPractice(k){
  if(k === "read"){ startReading(); return; }
  var d = getPracticeData(k);
  if(!d){ home(); return; }
  P = {
    k: k, i: 0, s: 0, a: null,
    d: { t: d.t },
    q: d.q.map(function(r){
      return {
        t: r[0], e: r[3],
        o: shuffle(r[1].map(function(x, j){ return { x:x, c: j === r[2] }; }))
      };
    }),
    done: false
  };
  renderPractice();
}

function startReading(){
  var r = READINGS[Math.floor(Math.random() * READINGS.length)];
  P = {
    k: "read", i: 0, s: 0, a: null,
    d: { t: "O'qish", p: r.text, title: r.title },
    q: r.q.map(function(x){
      return { t: x[0], o: shuffle(x[1].map(function(v, j){ return { x:v, c: j === x[2] }; })) };
    }),
    done: false
  };
  renderPractice();
}

function renderPractice(){
  var d = P.d, q = P.q[P.i], n = P.q.length, a = P.a;
  var html = '<section class="quiz">';
  html += '<div class="quiz-head">';
  html += '  <span class="quiz-title">' + esc(d.t) + '</span>';
  html += '  <div class="quiz-meta">';
  html += '    <span class="chip">' + (P.i + 1) + '/' + n + '</span>';
  html += '    <span class="chip good">✓ ' + P.s + '</span>';
  html += '  </div>';
  html += '</div>';
  html += '<div class="progress"><i style="width:' + (P.i / n * 100) + '%"></i></div>';

  if(d.p){
    html += '<p class="passage"><b>' + esc(d.title || "") + '</b>';
    html += esc(d.p);
    html += ' <button class="icon-btn" style="padding:4px 10px;font-size:14px" onclick="speakText(\'' + esc(d.p).replace(/'/g, "\\'") + '\')">🔊</button>';
    html += '</p>';
  }

  html += '<h2 class="q-text">' + esc(q.t) + '</h2>';
  html += '<div class="opts">';
  q.o.forEach(function(o, j){
    var cls = "opt";
    if(a !== null){
      if(o.c) cls += " good";
      else if(j === a) cls += " badc";
    }
    html += '<button class="' + cls + '" data-k="' + j + '"' + (a !== null ? " disabled" : "") + '>';
    html += '<kbd>' + (j + 1) + '</kbd>' + esc(o.x);
    html += '</button>';
  });
  html += '</div>';

  if(a !== null){
    var ok = q.o[a].c;
    html += '<p class="expl"><b>' + (ok ? "✅ To'g'ri!" : "❌ Noto'g'ri.") + '</b> ';
    html += esc(q.e || (ok ? "Barakalla!" : "To'g'ri javob: " + q.o.filter(function(o){ return o.c; })[0].x));
    html += '</p>';
    html += '<div class="quiz-nav"><span></span>';
    html += '<button class="btn primary" onclick="practiceNext()">' + (P.i === n - 1 ? "Yakunlash →" : "Keyingi →") + '</button>';
    html += '</div>';
  }

  html += '</section>';
  app.innerHTML = html;

  $$(".opt").forEach(function(b){
    b.onclick = function(){ practiceAnswer(parseInt(b.dataset.k)); };
  });
}

function practiceAnswer(j){
  if(P.a !== null) return;
  P.a = j;
  var q = P.q[P.i];
  if(q.o[j].c) P.s++;
  else store.addWrong({ t:q.t, correct:q.o.filter(function(o){ return o.c; })[0].x, chosen:q.o[j].x });
  renderPractice();
}

function practiceNext(){
  if(P.a === null) return;
  if(P.i < P.q.length - 1){
    P.i++; P.a = null; renderPractice();
  } else {
    finishPractice();
  }
}

function finishPractice(){
  P.done = true;
  var n = P.q.length, p = Math.round(P.s / n * 100);
  store.add({ l: P.d.t, p: p, date: new Date().toLocaleDateString("uz-UZ"), mode: P.k });
  store.updateStreak();
  achv.check();

  var msg = p >= 80 ? "🎉 Ajoyib natija!" : p >= 50 ? "👍 Yaxshi, davom eting!" : "💪 Yana bir bor urinib ko'ring.";
  var html = '<section class="result">';
  html += '<div class="result-hero">';
  html += '  <p style="color:var(--muted);font-weight:600;letter-spacing:.05em;text-transform:uppercase;font-size:13px">' + esc(P.d.t) + '</p>';
  html += '  <div class="result-level">' + P.s + '/' + n + '</div>';
  html += '  <h2 class="result-title">' + msg + '</h2>';
  html += '  <p class="result-desc">Natija: ' + p + '%</p>';
  html += '</div>';
  html += '<div class="quiz-nav" style="justify-content:center">';
  html += '  <button class="btn primary" onclick="startPracticeAgain()">🔄 Qayta urinish</button>';
  html += '  <button class="btn ghost" onclick="go(\'home\')">🏠 Bosh sahifa</button>';
  html += '</div>';
  html += '</section>';
  app.innerHTML = html;

  if(p >= 80) confetti(60);
}
window.practiceNext = practiceNext;
window.startPracticeAgain = function(){ startPractice(P.k); };
window.speakText = speak;

/* ============ READING ============ */
/* (startReading yuqorida) */

/* ============ LISTENING ============ */
function startListening(){
  P = {
    k: "listen", i: 0, s: 0, a: null,
    d: { t: "Tinglash" },
    q: shuffle(LISTENING).slice(0, 8).map(function(r){
      return {
        t: r[0], e: r[3],
        o: shuffle(r[1].map(function(x, j){ return { x:x, c: j === r[2] }; }))
      };
    }),
    done: false
  };
  renderListening();
}

function renderListening(){
  var q = P.q[P.i], n = P.q.length, a = P.a;
  var html = '<section class="quiz">';
  html += '<div class="quiz-head">';
  html += '  <span class="quiz-title">Tinglash</span>';
  html += '  <div class="quiz-meta">';
  html += '    <span class="chip">' + (P.i + 1) + '/' + n + '</span>';
  html += '    <span class="chip good">✓ ' + P.s + '</span>';
  html += '  </div>';
  html += '</div>';
  html += '<div class="progress"><i style="width:' + (P.i / n * 100) + '%"></i></div>';

  html += '<div class="passage" style="text-align:center;padding:32px">';
  html += '  <button class="btn primary lg" onclick="playAudio()" style="font-size:18px">🔊 Tinglash</button>';
  html += '  <p style="color:var(--text-2);font-size:14px;margin-top:12px">Tugmani bosing va diqqat bilan tinglang</p>';
  if(a !== null){
    html += '  <p style="margin-top:20px;font-style:italic;color:var(--text-2)">"' + esc(q.t) + '"</p>';
  }
  html += '</div>';

  html += '<h2 class="q-text">Savolga javob bering:</h2>';
  html += '<div class="opts">';
  q.o.forEach(function(o, j){
    var cls = "opt";
    if(a !== null){
      if(o.c) cls += " good";
      else if(j === a) cls += " badc";
    }
    html += '<button class="' + cls + '" data-k="' + j + '"' + (a !== null ? " disabled" : "") + '>';
    html += '<kbd>' + (j + 1) + '</kbd>' + esc(o.x);
    html += '</button>';
  });
  html += '</div>';

  if(a !== null){
    var ok = q.o[a].c;
    html += '<p class="expl"><b>' + (ok ? "✅ To'g'ri!" : "❌ Noto'g'ri.") + '</b> ' + esc(q.e || "");
    html += '</p>';
    html += '<div class="quiz-nav"><span></span>';
    html += '<button class="btn primary" onclick="listenNext()">' + (P.i === n - 1 ? "Yakunlash →" : "Keyingi →") + '</button>';
    html += '</div>';
  }
  html += '</section>';
  app.innerHTML = html;

  $$(".opt").forEach(function(b){
    b.onclick = function(){
      if(P.a !== null) return;
      P.a = parseInt(b.dataset.k);
      if(q.o[P.a].c) P.s++;
      renderListening();
    };
  });

  setTimeout(function(){ speak(q.t); }, 400);
}

window.playAudio = function(){ speak(P.q[P.i].t); };
window.listenNext = function(){
  if(P.a === null) return;
  if(P.i < P.q.length - 1){
    P.i++; P.a = null; renderListening();
  } else {
    var n = P.q.length, p = Math.round(P.s / n * 100);
    store.add({ l: "Tinglash", p: p, date: new Date().toLocaleDateString("uz-UZ"), mode: "listen" });
    store.updateStreak();
    achv.check();
    toast("Natija: " + P.s + "/" + n);
    finishPractice();
  }
};

/* ============ CARDS ============ */
function startCards(){
  C = { i: 0, f: false, k: 0, list: shuffle(VOCAB) };
  renderCards();
}

function renderCards(){
  var w = C.list[C.i];
  var html = '<section class="quiz">';
  html += '<div class="quiz-head">';
  html += '  <span class="quiz-title">Kartochkalar</span>';
  html += '  <div class="quiz-meta">';
  html += '    <span class="chip">' + (C.i + 1) + '/' + C.list.length + '</span>';
  html += '    <span class="chip good">✓ ' + C.k + '</span>';
  html += '  </div>';
  html += '</div>';
  html += '<div class="progress"><i style="width:' + (C.i / C.list.length * 100) + '%"></i></div>';

  html += '<div class="flashcard" onclick="flipCard()">';
  html += esc(C.f ? w[1] : w[0]);
  html += '<small>' + (C.f ? "o'zbekcha" : "inglizcha · bosing va o'giring") + '</small>';
  html += '</div>';

  html += '<div class="quiz-nav" style="margin-top:20px">';
  html += '  <button class="btn ghost" onclick="cardMove(-1)">← Orqaga</button>';
  html += '  <button class="icon-btn" onclick="cardSpeak()" style="padding:14px 18px">🔊</button>';
  html += '  <button class="btn primary" onclick="cardKnow()">Bilaman ✓</button>';
  html += '  <button class="btn ghost" onclick="cardMove(1)">Keyingi →</button>';
  html += '</div>';
  html += '</section>';
  app.innerHTML = html;
}

window.flipCard = function(){ C.f = !C.f; renderCards(); };
window.cardMove = function(d){ C.i = (C.i + d + C.list.length) % C.list.length; C.f = false; renderCards(); };
window.cardKnow = function(){
  store.saveCard(C.list[C.i][0]);
  C.k++;
  achv.check();
  window.cardMove(1);
};
window.cardSpeak = function(){ speak(C.list[C.i][0]); };

/* ============ WRITING ============ */
function startWriting(){
  var task = WRITING_TASKS[Math.floor(Math.random() * WRITING_TASKS.length)];
  var d = store.get();
  var saved = d.writing[task.title] || "";

  var html = '<section class="quiz">';
  html += '<div class="quiz-head">';
  html += '  <span class="quiz-title">✍️ Yozish mashqi</span>';
  html += '</div>';
  html += '<h2 class="q-text" style="font-size:clamp(24px,4vw,32px)">' + esc(task.title) + '</h2>';
  html += '<p style="color:var(--text-2);font-size:17px;margin-bottom:14px">' + esc(task.prompt) + '</p>';
  html += '<p style="color:var(--primary);font-size:14px;margin-bottom:16px">💡 ' + esc(task.hint) + '</p>';
  html += '<textarea id="wt" rows="8" style="width:100%;padding:16px;border-radius:14px;border:1.5px solid var(--line-2);background:var(--panel);color:var(--text);font:16px/1.6 Manrope,sans-serif;resize:vertical" placeholder="Bu yerga yozing...">' + esc(saved) + '</textarea>';
  html += '<div class="quiz-meta" style="margin-top:12px;justify-content:space-between">';
  html += '  <span class="chip" id="wc">0 so\'z</span>';
  html += '  <span class="chip" id="ch">0 belgi</span>';
  html += '</div>';
  html += '<div class="quiz-nav">';
  html += '  <button class="btn primary" onclick="saveWriting()">💾 Saqlash</button>';
  html += '  <button class="btn ghost" onclick="startWriting()">🔄 Boshqa mavzu</button>';
  html += '  <button class="btn ghost" onclick="clearWriting()">🗑 Tozalash</button>';
  html += '</div>';
  html += '</section>';
  app.innerHTML = html;

  var ta = $("#wt");
  function upd(){
    var t = ta.value.trim();
    $("#wc").textContent = (t ? t.split(/\s+/).length : 0) + " so'z";
    $("#ch").textContent = ta.value.length + " belgi";
  }
  ta.addEventListener("input", upd);
  upd();

    achv.unlock("writer");
}

window.saveWriting = function(){
  var ta = $("#wt");
  if(!ta) return;
  var task = ta.closest("section").querySelector("h2").textContent;
  store.saveWriting(task, ta.value);
  toast("✅ Saqlandi");
};

window.clearWriting = function(){
  if(!confirm("Yozuv tozalansinmi?")) return;
  var ta = $("#wt");
  if(ta) ta.value = "";
  var ev = new Event("input");
  ta.dispatchEvent(ev);
};

/* ============ TIPS ============ */
function renderTips(){
  var html = '<section class="section">';
  html += '<div class="section-head"><h2>💡 Oltin maslahatlar</h2>';
  html += '<p>Ingliz tilini tez va samarali o\'rganishning 10 ta isbotlangan yo\'li.</p></div>';
  html += '<div class="tips">';
  TIPS.forEach(function(t, i){
    html += '<div class="tip">';
    html += '  <div class="tip-icon">' + t.icon + '</div>';
    html += '  <div>';
    html += '    <h4>' + (i + 1) + '. ' + esc(t.title) + '</h4>';
    html += '    <p>' + esc(t.text) + '</p>';
    html += '  </div>';
    html += '</div>';
  });
  html += '</div>';
  html += '</section>';

  html += '<section class="section">';
  html += '<div class="daily">';
  html += '  <div><h2>🎯 Kuniga 15 daqiqa</h2>';
  html += '  <p>Eng muhim qoida — doimiylik. Haftada bir marta 3 soatdan ko\'ra, har kuni 15 daqiqa foydaliroq.</p></div>';
  html += '  <button class="btn lg" onclick="go(\'level\')">Testdan boshlash</button>';
  html += '</div>';
  html += '</section>';

  app.innerHTML = html;
}

/* ============ ACHIEVEMENTS ============ */
function renderAchievements(){
  var d = store.get();
  var unlocked = d.achievements.length;
  var total = ACHIEVEMENTS.length;

  var html = '<section class="section">';
  html += '<div class="section-head">';
  html += '  <h2>🏆 Yutuqlar</h2>';
  html += '  <p>Sizda ' + unlocked + '/' + total + ' yutuq</p>';
  html += '</div>';
  html += '<div class="progress" style="margin-bottom:24px"><i style="width:' + (unlocked / total * 100) + '%"></i></div>';
  html += '<div class="achievements">';
  ACHIEVEMENTS.forEach(function(a){
    var has = d.achievements.indexOf(a.id) !== -1;
    html += '<div class="achv ' + (has ? "unlocked" : "locked") + '">';
    html += '  <div class="achv-emoji">' + a.emoji + '</div>';
    html += '  <b>' + esc(a.title) + '</b>';
    html += '  <small>' + esc(a.desc) + '</small>';
    html += '</div>';
  });
  html += '</div>';
  html += '</section>';

  app.innerHTML = html;
}

/* ============ STATS ============ */
function renderStats(){
  var d = store.get();
  var totalAttempts = d.history.length;
  var avg = 0, best = 0;
  if(totalAttempts){
    var sum = 0;
    for(var i=0;i<d.history.length;i++){
      sum += d.history[i].p;
      if(d.history[i].p > best) best = d.history[i].p;
    }
    avg = Math.round(sum / totalAttempts);
  }

  var html = '<section class="section">';
  html += '<div class="section-head"><h2>📊 Statistika</h2>';
  html += '<p>Sizning umumiy natijalaringiz.</p></div>';

  html += '<div class="stat-grid">';
  html += '  <div class="stat-box"><b>' + totalAttempts + '</b><span>Urinishlar</span></div>';
  html += '  <div class="stat-box"><b>' + avg + '%</b><span>O\'rtacha ball</span></div>';
  html += '  <div class="stat-box"><b>' + best + '%</b><span>Eng yaxshi</span></div>';
  html += '  <div class="stat-box"><b>' + d.streak.days + '🔥</b><span>Seriya</span></div>';
  html += '  <div class="stat-box"><b>' + d.streak.best + '⭐</b><span>Rekord</span></div>';
  html += '  <div class="stat-box"><b>' + d.wrong.length + '</b><span>Xatolar</span></div>';
  html += '</div>';

  /* History */
  html += '<div class="section-head" style="margin-top:40px"><h2 style="font-size:24px">Oxirgi natijalar</h2></div>';
  if(d.history.length){
    html += '<div class="hist">';
    d.history.slice(0, 20).forEach(function(h){
      html += '<div class="hist-item"><b>' + esc(h.l) + '</b> · ' + h.p + '% · ' + esc(h.date) + '</div>';
    });
    html += '</div>';
  } else {
    html += '<p style="color:var(--text-2)">Hali natijalar yo\'q. Testdan boshlang!</p>';
  }

  /* Wrong answers */
  html += '<div class="section-head" style="margin-top:40px"><h2 style="font-size:24px">❌ Xatolar (' + d.wrong.length + ')</h2></div>';
  if(d.wrong.length){
    html += '<div class="wrong-list">';
    d.wrong.slice(0, 30).forEach(function(w){
      html += '<div class="wrong-item">';
      html += '  <small>Savol</small>';
      html += '  <div style="margin-bottom:8px;font-weight:600">' + esc(w.t) + '</div>';
      html += '  <div>Sizning javob: <span class="yours">' + esc(w.chosen) + '</span></div>';
      html += '  <div>To\'g\'ri javob: <span class="correct">' + esc(w.correct) + '</span></div>';
      html += '</div>';
    });
    html += '</div>';
  } else {
    html += '<div class="wrong-item" style="border-left-color:var(--success)">🎉 Xatolar yo\'q!</div>';
  }

  /* Actions */
  html += '<div class="quiz-nav" style="margin-top:30px">';
  html += '  <button class="btn ghost" onclick="clearWrongs()">🗑 Xatolarni tozalash</button>';
  html += '  <button class="btn danger" onclick="clearEverything()">⚠️ Hammasini o\'chirish</button>';
  html += '</div>';

  html += '</section>';
  app.innerHTML = html;
}

window.clearWrongs = function(){
  if(!confirm("Xatolar ro'yxati tozalansinmi?")) return;
  store.clearWrong();
  renderStats();
  toast("Tozalandi");
};

window.clearEverything = function(){
  if(!confirm("BARCHA natijalar o'chiriladi. Ishonchingiz komilmi?")) return;
  store.clearAll();
  go("home");
  toast("Barchasi tozalandi");
};

/* ============ LEVEL TEST ============ */
function startLevelTest(){
  var q = [];
  for(var lv = 0; lv < 6; lv++){
    var bucket = [];
    for(var i = lv * 8; i < lv * 8 + 8 && i < RAW.length; i++){
      bucket.push(RAW[i]);
    }
    var picked = shuffle(bucket).slice(0, 5);
    picked.forEach(function(r){
      q.push({
        lv: lv,
        t: r[0],
        o: shuffle(r[1].map(function(x, k){ return { x:x, c: k === r[2] }; }))
      });
    });
  }
  S = { i: 0, a: [], t: Date.now(), q: q, done: false };
  renderQuiz();
  startTimer();
}

function startTimer(){
  stopTimer();
  var start = Date.now();
  timerInterval = setInterval(function(){
    var el = $("#tmr");
    if(!el) return;
    var sec = Math.floor((Date.now() - start) / 1000);
    var m = ("0" + Math.floor(sec / 60)).slice(-2);
    var s = ("0" + (sec % 60)).slice(-2);
    el.textContent = "⏱ " + m + ":" + s;
    el.className = "chip timer" + (sec > 480 ? " danger" : sec > 300 ? " warn" : "");
  }, 1000);
}

function stopTimer(){
  if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
}

function renderQuiz(){
  var q = S.q[S.i], n = S.q.length, sel = S.a[S.i];
  var html = '<section class="quiz">';
  html += '<div class="quiz-head">';
  html += '  <span class="quiz-title">🎯 Daraja testi</span>';
  html += '  <div class="quiz-meta">';
  html += '    <span class="chip">Savol ' + (S.i + 1) + '/' + n + '</span>';
  html += '    <span class="chip timer" id="tmr">⏱ 00:00</span>';
  html += '  </div>';
  html += '</div>';
  html += '<div class="progress"><i style="width:' + (S.i / n * 100) + '%"></i></div>';
  html += '<h2 class="q-text">' + esc(q.t) + '</h2>';
  html += '<div class="opts">';
  q.o.forEach(function(o, k){
    html += '<button class="opt' + (sel === k ? " sel" : "") + '" data-k="' + k + '">';
    html += '<kbd>' + (k + 1) + '</kbd>' + esc(o.x);
    html += '</button>';
  });
  html += '</div>';
  html += '<div class="quiz-nav">';
  html += '  <button class="btn ghost" onclick="quizBack()"' + (S.i === 0 ? " disabled" : "") + '>← Orqaga</button>';
  html += '  <button class="btn primary" onclick="quizNext()"' + (sel === undefined ? " disabled" : "") + '>';
  html += (S.i === n - 1 ? "Natijani ko'rish →" : "Keyingi →");
  html += '  </button>';
  html += '</div>';
  html += '</section>';
  app.innerHTML = html;

  $$(".opt").forEach(function(b){
    b.onclick = function(){ quizPick(parseInt(b.dataset.k)); };
  });
}

function quizPick(k){
  S.a[S.i] = k;
  renderQuiz();
}

window.quizBack = function(){
  if(S.i > 0){ S.i--; renderQuiz(); }
};

window.quizNext = function(){
  if(S.a[S.i] === undefined) return;
  if(S.i < S.q.length - 1){
    S.i++; renderQuiz();
  } else {
    renderResult();
  }
};

/* ============ RESULT ============ */
function renderResult(){
  stopTimer();
  S.done = true;

  var sc = [0,0,0,0,0,0];
  S.q.forEach(function(q, i){
    if(q.o[S.a[i]] && q.o[S.a[i]].c) sc[q.lv]++;
  });

  var idx = -1;
  for(var l = 0; l < 6; l++){
    if(sc[l] >= 3) idx = l;
    else break;
  }

  var lv = idx < 0 ? "Pre-A1" : LEVELS[idx];
  var total = sc.reduce(function(a,b){ return a+b; }, 0);
  var pct = Math.round(total / 30 * 100);
  var mins = Math.max(1, Math.round((Date.now() - S.t) / 60000));

  store.add({ l: lv, p: pct, date: new Date().toLocaleDateString("uz-UZ"), mode: "level" });
  store.updateStreak();

  var wrong = [];
  S.q.forEach(function(q, i){
    if(!(q.o[S.a[i]] && q.o[S.a[i]].c)){
      wrong.push({ q: q, i: i });
      var chosen = S.a[i] !== undefined ? q.o[S.a[i]].x : "—";
      store.addWrong({
        t: q.t,
        correct: q.o.filter(function(o){ return o.c; })[0].x,
        chosen: chosen
      });
    }
  });

  achv.check();

  var info = LEVEL_INFO[lv];

  var html = '<section class="result">';
  html += '<div class="result-hero">';
  html += '  <p style="color:var(--muted);font-weight:600;letter-spacing:.05em;text-transform:uppercase;font-size:13px">Sizning darajangiz</p>';
  html += '  <div class="result-level">' + lv + '</div>';
  html += '  <h2 class="result-title">' + esc(info.emoji + " " + info.name) + '</h2>';
  html += '  <p class="result-desc">' + esc(info.desc) + '</p>';
  html += '</div>';

  /* Actions */
  html += '<div class="quiz-nav" style="justify-content:center;margin-bottom:40px">';
  html += '  <button class="btn primary" onclick="retakeTest()">🔄 Qayta topshirish</button>';
  html += '  <button class="btn ghost" onclick="copyResult(\'' + lv + '\',' + total + ',' + pct + ')">📋 Nusxalash</button>';
  html += '  <button class="btn ghost" onclick="go(\'home\')">🏠 Bosh sahifa</button>';
  html += '</div>';

  /* Info grid */
  html += '<div class="result-grid">';

  /* LEFT: Levels */
  html += '<div class="result-col">';
  html += '  <h3>Daraja bo\'yicha</h3>';
  html += '  <div class="level-rows">';
  LEVELS.forEach(function(l, i){
    html += '<div class="level-row' + (sc[i] >= 3 ? " pass" : "") + '">';
    html += '  <span>' + l + '</span>';
    html += '  <div class="bar"><i style="width:' + (sc[i] * 20) + '%"></i></div>';
    html += '  <span>' + sc[i] + '/5</span>';
    html += '</div>';
  });
  html += '  </div>';
  html += '  <p style="color:var(--text-2);font-size:14px;margin-top:16px">';
  html += '    Jami: <b>' + total + '/30</b> (' + pct + '%) · ' + mins + ' daqiqa';
  html += '  </p>';
  html += '  <h3 style="margin-top:32px">Keyingi qadam — ' + (info.next || "siz eng yuqoridasiz") + '</h3>';
  html += '  <ul style="padding-left:20px;color:var(--text-2);font-size:14px;line-height:1.8">';
  info.tips.forEach(function(t){
    html += '<li>' + esc(t) + '</li>';
  });
  html += '  </ul>';
  html += '</div>';

  /* RIGHT: Wrong answers */
  html += '<div class="result-col">';
  html += '  <h3>Xatolar (' + wrong.length + ')</h3>';
  if(wrong.length){
    html += '  <div class="wrong-list">';
    wrong.forEach(function(w){
      html += '<div class="wrong-item">';
      html += '  <small>' + LEVELS[w.q.lv] + '</small>';
      html += '  <div style="margin-bottom:6px">' + esc(w.q.t) + '</div>';
      html += '  <div>To\'g\'ri: <span class="correct">' + esc(w.q.o.filter(function(o){ return o.c; })[0].x) + '</span></div>';
      html += '</div>';
    });
    html += '  </div>';
  } else {
    html += '  <div class="wrong-item" style="border-left-color:var(--success)">🎉 Xato yo\'q! Ajoyib natija!</div>';
  }
  html += '</div>';

  html += '</div>';
  html += '</section>';

  app.innerHTML = html;

  if(pct >= 80) confetti(100);
  else if(pct >= 50) confetti(40);
}

window.retakeTest = function(){ startLevelTest(); };

window.copyResult = function(lv, total, pct){
  var text = "Mening ingliz tili darajam: " + lv + " (" + total + "/30, " + pct + "%) — pog'ona testi";
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(text).then(function(){
      toast("✅ Nusxalandi");
    }).catch(function(){ toast("Nusxalanmadi"); });
  } else {
    toast("Nusxalab bo'lmadi");
  }
};

/* ============ KEYBOARD SHORTCUTS ============ */
document.addEventListener("keydown", function(e){
  if(e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;

  if(S && !S.done && $(".quiz")){
    if(e.key >= "1" && e.key <= "4"){ quizPick(parseInt(e.key) - 1); e.preventDefault(); }
    else if(e.key === "Enter"){ quizNext(); e.preventDefault(); }
  } else if(P && !P.done && $(".quiz")){
    if(e.key >= "1" && e.key <= "4"){ practiceAnswer(parseInt(e.key) - 1); e.preventDefault(); }
    else if(e.key === "Enter"){ practiceNext(); e.preventDefault(); }
  }
});

/* ============ THEME ============ */
document.getElementById("themeBtn").onclick = function(){
  var r = document.documentElement;
  var isDark = r.dataset.theme
    ? r.dataset.theme === "dark"
    : (window.matchMedia && window.matchMedia("(prefers-color-scheme:dark)").matches);
  r.dataset.theme = isDark ? "light" : "dark";
  try{ localStorage.setItem("pogona_theme", r.dataset.theme); }catch(e){}
};

try{
  var saved = localStorage.getItem("pogona_theme");
  if(saved) document.documentElement.dataset.theme = saved;
}catch(e){}

/* ============ STREAK DISPLAY ============ */
function updateStreakDisplay(){
  var d = store.get();
  var el = document.getElementById("streakNum");
  if(el) el.textContent = d.streak.days;
}

/* ============ INIT ============ */
updateStreakDisplay();
home();

/* Expose for testing */
window.__pogona = { store: store, achv: achv };

})();
