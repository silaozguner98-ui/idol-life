/* IDOL LIFE · Aurora
   - Karakterin cinsiyetine göre renk temasını <html data-g> ile ayarlar.
   - Beceri kartlarına seviye etiketi ekler.
   Oyun mantığına dokunmaz. */
(function(){
  var KEY="idol-life.tr.v3", root=document.documentElement;

  /* ---------- tema ---------- */
  function setG(g){ if(root.getAttribute("data-g")!==g) root.setAttribute("data-g",g); }
  function fromSave(){
    try{
      var s=localStorage.getItem(KEY), m=s&&s.match(/"gender"\s*:\s*"(\w+)"/);
      if(m) setG(/^(boy|male|m|erkek)$/i.test(m[1])?"boy":"girl");
      else setG(root.getAttribute("data-g")||"girl");
    }catch(e){ setG("girl"); }
  }
  fromSave();
  try{
    var orig=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k){ orig.apply(this,arguments); if(k===KEY) fromSave(); };
  }catch(e){}
  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest(".gender-options button");
    if(b) setG(/erkek/i.test(b.textContent)?"boy":"girl");
  },true);
  document.addEventListener("close",function(){ setTimeout(fromSave,0); },true);

  /* ---------- beceri seviyeleri ---------- */
  function lvl(v){ return v<20?"Başlangıç":v<45?"Gelişiyor":v<70?"İleri":"Usta"; }
  var queued=false;
  function enhance(){
    queued=false;
    var rows=document.querySelectorAll(".active-game .main-view .skill-row");
    for(var i=0;i<rows.length;i++){
      var b=rows[i].querySelector("b"); if(!b) continue;
      var v=parseFloat(b.textContent)||0, l=lvl(v);
      if(rows[i].getAttribute("data-level")!==l) rows[i].setAttribute("data-level",l);
    }
  }
  function schedule(){ if(!queued){ queued=true; requestAnimationFrame(enhance); } }
  function start(){
    var r=document.getElementById("root"); if(!r) return;
    new MutationObserver(schedule).observe(r,{childList:true,subtree:true,characterData:true});
    schedule();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start); else start();
})();

/* Uzun tutarları kutuya sığdır (değeri değiştirmez, yalnızca yazı boyutunu küçültür) */
(function(){
  var SEL = ".dashboard-indicators dd, .wallet-overview strong, .finance-grid strong, .xf-balance b, .xfp-stat b";
  function fit(el){
    el.style.removeProperty("font-size");
    el.style.setProperty("white-space","nowrap","important");
    var base = parseFloat(getComputedStyle(el).fontSize) || 16, size = base, guard = 0;
    while (el.scrollWidth > el.clientWidth + 1 && size > 12 && guard++ < 40) { size -= 1; el.style.setProperty("font-size", size + "px", "important"); }
    if (el.scrollWidth > el.clientWidth + 1) { el.style.setProperty("white-space","normal","important"); }
  }
  var t = null;
  function run(){ t = null; document.querySelectorAll(SEL).forEach(function(el){ if (/\d/.test(el.textContent)) fit(el); }); }
  function schedule(){ if (!t) t = setTimeout(run, 60); }
  function start(){
    var root = document.getElementById("root"); if (!root) return setTimeout(start, 200);
    new MutationObserver(schedule).observe(root, { childList: true, subtree: true, characterData: true });
    window.addEventListener("resize", schedule); schedule();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/* ===== Mobil kolaylık katmanı (v33): "Daha" menüsü + Hızlı işlemler =====
   Oyun mantığına dokunmaz; yalnızca mevcut düğmelere tıklar ve ilgili bölüme kaydırır. */
(function(){
  var MQ = window.matchMedia("(max-width:860px)");
  var PRI = ["life","skills","career","phone","study","wallet","relationship","myagency","achievements"];
  var NAMES = {life:"Ana Sayfa",skills:"Beceriler",career:"Kariyer",phone:"Telefon",study:"Ders",wallet:"Alışveriş",relationship:"İlişki",myagency:"Ajansım",achievements:"Başarılarım"};
  var more, fab, sheet, scrim, pending = null;

  function tabs(){ return Array.prototype.slice.call(document.querySelectorAll(".active-game .game-tabs button[data-tab]")); }
  function tabBtn(id){ return document.querySelector('.active-game .game-tabs button[data-tab="' + id + '"]'); }
  function current(){ var b = document.querySelector(".active-game .game-tabs button[aria-current=page]"); return b ? b.getAttribute("data-tab") : null; }
  function el(tag, cls, html){ var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function build(){
    if (more) return;
    more = el("button", "xm-more", '<span class="xm-ic" aria-hidden="true"></span><span class="xm-lb">Daha</span>');
    more.type = "button"; more.setAttribute("aria-label", "Diğer bölümler");
    more.addEventListener("click", function(){ openSheet("more"); });
    fab = el("button", "xm-fab", '<span aria-hidden="true">⚡</span><span class="xm-fab-lb">Hızlı</span>');
    fab.type = "button"; fab.setAttribute("aria-label", "Hızlı işlemler");
    fab.addEventListener("click", function(){ openSheet("quick"); });
    scrim = el("div", "xm-scrim"); scrim.addEventListener("click", closeSheet);
    sheet = el("div", "xm-sheet"); sheet.setAttribute("role", "menu");
    document.body.appendChild(more); document.body.appendChild(fab);
    document.body.appendChild(scrim); document.body.appendChild(sheet);
    document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeSheet(); });
  }

  var QUICK = [
    {ic:"🎤", t:"Prova yap",    s:"Vokal, dans, rap çalış",     tab:"skills", sel:".xf-prac-panel:not(.xf-rest-panel):not(.xfp-body-panel):not(.xfp-jobs-panel):not(.xfp-co-view)"},
    {ic:"😴", t:"Dinlen",       s:"Enerji ve sağlık topla",     tab:"skills", sel:".xf-rest-panel"},
    {ic:"🏃", t:"Spor ve kilo", s:"Form, kilo, sahne korkusu",  tab:"skills", sel:".xfp-body-panel"},
    {ic:"🎓", t:"Kurslar",      s:"Akademi ve özel kurslar",    tab:"skills", sel:".xf-course-panel"},
    {ic:"📚", t:"Ders çalış",   s:"Okul notunu yükselt",        tab:"study",  sel:".view-panel"},
    {ic:"💼", t:"Part-time iş", s:"Harçlık kazan",              tab:"career", sel:".xfp-jobs-panel"},
    {ic:"🏢", t:"Şirketler",    s:"Seçmelere başvur",           tab:"career", sel:".xfp-ags-panel"},
    {ic:"🛍️", t:"Alışveriş",    s:"Cüzdan ve harcamalar",       tab:"wallet", sel:".view-panel"},
    {ic:"📱", t:"Telefon",      s:"Bildirimler ve sosyal medya", tab:"phone", sel:".view-panel"},
    {ic:"💗", t:"İlişki",       s:"Aşk ve arkadaşlık",          tab:"relationship", sel:".view-panel"},
    {ic:"🏙️", t:"Ajansım",      s:"Kendi şirketin",             tab:"myagency", sel:".view-panel"}
  ];

  function openSheet(kind){
    var head = '<div class="xm-sheet-head"><b>' + (kind === "more" ? "Diğer bölümler" : "Hızlı işlemler") + '</b><button type="button" class="xm-x" aria-label="Kapat">✕</button></div>';
    var body;
    if (kind === "more") {
      body = '<div class="xm-grid">' + tabs().filter(function(b){ return b.hasAttribute("data-xm-hidden"); }).map(function(b){
        var id = b.getAttribute("data-tab");
        return '<button type="button" class="xm-tile' + (b.getAttribute("aria-current") === "page" ? " on" : "") + '" data-go="' + id + '"><span class="xm-tile-ic" data-tab-ic="' + id + '"></span><span>' + (NAMES[id] || b.textContent) + '</span></button>';
      }).join("") + '</div>';
    } else {
      body = '<div class="xm-list">' + QUICK.map(function(q, i){
        if (!tabBtn(q.tab)) return "";
        return '<button type="button" class="xm-row" data-q="' + i + '"><span class="xm-row-ic">' + q.ic + '</span><span class="xm-row-tx"><b>' + q.t + '</b><small>' + q.s + '</small></span><span class="xm-row-go">›</span></button>';
      }).join("") + '</div>';
    }
    sheet.innerHTML = head + body;
    sheet.querySelector(".xm-x").onclick = closeSheet;
    Array.prototype.forEach.call(sheet.querySelectorAll("[data-go]"), function(b){ b.onclick = function(){ closeSheet(); go(b.getAttribute("data-go")); }; });
    Array.prototype.forEach.call(sheet.querySelectorAll("[data-q]"), function(b){ b.onclick = function(){ var q = QUICK[+b.getAttribute("data-q")]; closeSheet(); go(q.tab, q.sel); }; });
    document.body.classList.add("xm-open");
  }
  function closeSheet(){ document.body.classList.remove("xm-open"); }

  function go(tab, sel){
    var b = tabBtn(tab); if (!b) return;
    if (b.getAttribute("aria-current") !== "page") b.click();
    if (!sel) { pending = null; window.scrollTo({top:0, behavior:"smooth"}); return; }
    pending = {sel:sel, t:Date.now()};
    setTimeout(seek, 60);
  }
  function seek(){
    if (!pending) return;
    var t = document.querySelector(".active-game .game-frame " + pending.sel);
    if (!t) { if (Date.now() - pending.t < 1500) setTimeout(seek, 80); else pending = null; return; }
    pending = null;
    if (t.classList.contains("xf-folded")) { var h = t.querySelector(".xf-fold-head"); if (h) h.click(); }
    setTimeout(function(){
      var clock = document.querySelector(".active-game .life-clock");
      var off = (clock && getComputedStyle(clock).position === "sticky" ? clock.offsetHeight : 0) + 12;
      window.scrollTo({top: t.getBoundingClientRect().top + window.scrollY - off, behavior:"smooth"});
      t.classList.remove("xm-flash"); void t.offsetWidth; t.classList.add("xm-flash");
    }, 40);
  }

  function layout(){
    var list = tabs(), on = MQ.matches && list.length > 0;
    document.body.classList.toggle("xm-game", on);
    if (!on) { list.forEach(function(b){ b.removeAttribute("data-xm-hidden"); }); closeSheet(); return; }
    build();
    var ids = list.map(function(b){ return b.getAttribute("data-tab"); });
    var needMore = list.length > 5;
    var keep = needMore ? PRI.filter(function(id){ return ids.indexOf(id) >= 0; }).slice(0, 4) : ids;
    list.forEach(function(b){
      var id = b.getAttribute("data-tab"), hide = keep.indexOf(id) < 0;
      if (hide !== b.hasAttribute("data-xm-hidden")) { if (hide) b.setAttribute("data-xm-hidden", ""); else b.removeAttribute("data-xm-hidden"); }
      var o = String(PRI.indexOf(id)); if (b.style.order !== o) b.style.order = o;
    });
    document.body.classList.toggle("xm-has-more", needMore);
    var cur = current(), away = needMore && keep.indexOf(cur) < 0;
    more.classList.toggle("on", away);
    var lb = more.querySelector(".xm-lb"), want = away && NAMES[cur] ? NAMES[cur] : "Daha";
    if (lb.textContent !== want) lb.textContent = want;
    var nav = document.querySelector(".active-game .game-tabs");
    if (nav) {
      var r = nav.getBoundingClientRect();
      more.style.top = (r.top + 7) + "px";
      more.style.height = Math.max(40, r.height - 14) + "px";
      more.style.right = (window.innerWidth - r.right + 7) + "px";
    }
  }

  var q = null;
  function sched(){ if (!q) q = setTimeout(function(){ q = null; layout(); }, 50); }
  function start(){
    var r = document.getElementById("root"); if (!r) return setTimeout(start, 200);
    new MutationObserver(sched).observe(r, {childList:true, subtree:true, attributes:true, attributeFilter:["aria-current"]});
    window.addEventListener("resize", sched);
    window.addEventListener("scroll", sched, {passive:true});
    if (MQ.addEventListener) MQ.addEventListener("change", sched);
    sched();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();

/* ===== v36: Telefonda uzun bölümler ilk açılışta kapalı gelsin (bir kez) ===== */
(function(){
  try{
    if (!window.matchMedia("(max-width:860px)").matches) return;
    var FLAG = "idol-life.tr.mfold.v36";
    if (localStorage.getItem(FLAG)) return;
    ["dev","dyn","prac","rest","acting","courses","xfp-body","xfp-debt","xfp-home","xfp-jobs","career","mind","tree","family","shop","beauty","studio","eco","xfp-cofound","xfp-ags"].forEach(function(id){
      var k = "idol-life.tr.fold." + id;
      if (localStorage.getItem(k) === null) localStorage.setItem(k, "0");
    });
    localStorage.setItem(FLAG, "1");
  }catch(e){}
})();
