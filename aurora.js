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
