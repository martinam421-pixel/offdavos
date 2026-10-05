const TOPICS=["AI","Climate","Finance","Health","Geopolitics","Energy","Start-ups","Impact"];
let places=[];
let topic=null, showLocal=true, sel=null;
const chips=document.getElementById("chips"),pinsG=document.getElementById("pins"),list=document.getElementById("list");

function match(p){ if(p.local) return showLocal && !topic; return !topic||p.topics.includes(topic); }
function renderChips(){
  const all=`<button class="chip" id="chip-all" aria-pressed="${!topic}">All</button>`;
  chips.innerHTML=all+TOPICS.map(t=>{const n=places.filter(p=>p.topics.includes(t)).length;
    return `<button class="chip" id="chip-${t}" data-t="${t}" aria-pressed="${topic===t}">${t}<span class="n">${n}</span></button>`}).join("");
}
function render(){
  renderChips();
  let i=0;
  const shown=places.map(p=>({p,on:match(p)}));
  pinsG.innerHTML=places.map((p,idx)=>{
    const on=match(p); const label=p.local?"·":String(idx+1);
    const shape=p.local?`<circle class="bg" r="9"/>`:`<rect class="bg" x="-11" y="-11" width="22" height="22" transform="rotate(45)"/>`;
    return `<g class="pin${p.local?" local":""}${on?"":" dim"}${sel===idx?" sel":""}" data-i="${idx}" transform="translate(${p.x} ${p.y})" tabindex="${on?0:-1}" role="button" aria-label="${p.name}">${shape}<text>${p.local?"":label}</text></g>`;
  }).join("");
  const vis=places.map((p,idx)=>({p,idx})).filter(o=>match(o.p));
  list.innerHTML=vis.length?vis.map(({p,idx})=>`
    <button class="entry${p.local?" local":""}${sel===idx?" sel":""}" id="e${idx}" data-i="${idx}">
      <span class="num">${p.local?"":idx+1}</span>
      <span><h4>${p.name}${p.partner?'<span class="partner">Partner</span>':""}</h4>
        <div class="meta">${p.type} · ${p.where}</div>
        ${p.local?`<div class="meta" style="margin:0">${p.tip}</div>`:`<div class="tags">${p.topics.map(t=>`<span class="tag">${t}</span>`).join("")}</div><span class="go">Official site & program ↗</span>`}
      </span>
    </button>`).join(""):`<p class="empty">Nobody on the map for this topic yet. Houses announce late; we add them as they confirm.</p>`;
  const n=vis.filter(o=>!o.p.local).length;
  document.getElementById("count").textContent=`${n} ${n===1?"presence":"presences"}${topic?" on "+topic:""} · example entries`;
}
chips.addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;topic=b.dataset.t||null;sel=null;render();});
document.getElementById("localToggle").addEventListener("change",e=>{showLocal=e.target.checked;render();});
function pick(i){sel=(sel===i)?null:i;render();const el=document.getElementById("e"+i);if(el&&sel!==null)el.scrollIntoView({block:"nearest",behavior:matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"});}
pinsG.addEventListener("click",e=>{const g=e.target.closest(".pin");if(g&&!g.classList.contains("dim"))pick(+g.dataset.i);});
pinsG.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){const g=e.target.closest(".pin");if(g){e.preventDefault();pick(+g.dataset.i);}}});
list.addEventListener("click",e=>{const b=e.target.closest(".entry");if(b)pick(+b.dataset.i);});

/* content lives in /data so it can be edited without touching code */
const badge={known:["KNOWN","b-known"],think:["WE THINK","b-think"],unconf:["NOT YET CONFIRMED","b-unconf"]};
function renderFeed(updates){document.getElementById("feed").innerHTML=updates.map(u=>`
  <div class="upd${u.pin?" pinned":""}">
    <time class="tab">${u.t}</time>
    <div><span class="badge ${badge[u.s][1]}">${badge[u.s][0]}</span>${u.pin?'<span class="label">Pinned</span>':""}
      <p>${u.txt}</p><span class="src">${u.src}</span></div>
  </div>`).join("");}
Promise.all([fetch("data/updates.json").then(r=>r.json()),fetch("data/places.json").then(r=>r.json())])
  .then(([u,p])=>{renderFeed(u);places=p;render();})
  .catch(()=>{document.getElementById("feed").innerHTML='<p class="empty">Updates could not be loaded.</p>';render();});

/* ---- LIVE: weather (Open-Meteo) + departures (transport.opendata.ch). No fake numbers on failure. ---- */
const $=id=>document.getElementById(id);
const hm=d=>new Date(d).toLocaleTimeString("de-CH",{hour:"2-digit",minute:"2-digit",timeZone:"Europe/Zurich"});
const deg=v=>`${Math.round(v)===0?0:Math.round(v)}°`.replace("-","−");
const WMO={0:"Clear",1:"Mostly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Freezing fog",51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",56:"Freezing drizzle",57:"Freezing drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",66:"Freezing rain",67:"Freezing rain",71:"Light snow",73:"Snow",75:"Heavy snow",77:"Snow grains",80:"Rain showers",81:"Rain showers",82:"Violent showers",85:"Snow showers",86:"Heavy snow showers",95:"Thunderstorm",96:"Thunderstorm, hail",99:"Thunderstorm, hail"};
function tag(id,state,text){const t=$(id);t.className="livetag "+state;t.textContent=text;}
function wxNote(c,t,w){
  if([71,73,75,77,85,86].includes(c))return "Snow. Shoes with grip beat shoes that match the suit.";
  if(t<=-8)return "Properly cold. The coat is not optional, whatever the photo op says.";
  if(w>=35)return "Windy. Lifts on the upper sections may slow down or stop.";
  if([0,1].includes(c))return "Clear sky. Sunglasses count as business equipment up here.";
  if([61,63,65,80,81,82].includes(c))return "Rain in the valley can mean snow higher up.";
  return "Shoes with grip beat shoes that match the suit.";
}
async function loadWeather(){
  try{
    const u="https://api.open-meteo.com/v1/forecast?latitude=46.8027&longitude=9.8360&elevation=1560&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunset,snowfall_sum,weather_code&timezone=Europe%2FZurich&forecast_days=2";
    const r=await fetch(u);if(!r.ok)throw 0;const d=await r.json();const c=d.current,y=d.daily;
    $("wx-temp").textContent=deg(c.temperature_2m);
    $("wx-desc").textContent=WMO[c.weather_code]||"—";
    $("wx-feels").textContent="feels like "+deg(c.apparent_temperature);
    $("wx-range").textContent=`${deg(y.temperature_2m_min[0])} to ${deg(y.temperature_2m_max[0])}`;
    $("wx-wind").textContent=`${Math.round(c.wind_speed_10m)} km/h`;
    $("wx-snow").textContent=`${Math.round(y.snowfall_sum[0])} cm`;
    $("wx-tmrw").textContent=`${deg(y.temperature_2m_min[1])} to ${deg(y.temperature_2m_max[1])}, ${(WMO[y.weather_code[1]]||"").toLowerCase()}`;
    $("wx-sunset").textContent=y.sunset[0].slice(11,16);
    $("wx-note").textContent=wxNote(c.weather_code,c.temperature_2m,c.wind_speed_10m);
    $("wx-src").textContent=`Source: Open-Meteo (MeteoSwiss models) · updated ${c.time.slice(11,16)}`;
    tag("wx-tag","on","live");
  }catch(e){
    tag("wx-tag","off","offline");
    $("wx-desc").textContent="Weather feed not reachable right now.";
    $("wx-note").textContent="We'd rather show nothing than guess. Try again in a minute.";
  }
}
async function loadDepartures(){
  try{
    const r=await fetch("https://transport.opendata.ch/v1/stationboard?station=Davos%20Platz&limit=8");
    if(!r.ok)throw 0;const d=await r.json();const rows=(d.stationboard||[]).slice(0,6);
    if(!rows.length){$("dep-body").innerHTML=`<tr><td colspan="4" class="empty">No departures listed right now.</td></tr>`;}
    else $("dep-body").innerHTML=rows.map(x=>{
      const delay=x.stop.delay?`<span class="late">+${x.stop.delay}</span>`:"";
      const line=(x.category||"")+(/^(B|BUS|NFB)$/i.test(x.category||"")?" "+(x.number||""):"");
      const lbl=/^(B|BUS|NFB)$/i.test(x.category||"")?(x.number||"Bus"):(x.category||"");
      const esc=s=>String(s||"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
      return `<tr><td>${hm(x.stop.departure)} ${delay}</td><td><span class="line">${esc(lbl)}</span></td><td class="dest">${esc(x.to)}</td><td>${esc(x.stop.platform||"–")}</td></tr>`;
    }).join("");
    $("dep-src").textContent=`Source: Swiss public transport timetable (transport.opendata.ch) · checked ${hm(Date.now())}`;
    tag("dep-tag","on","live");
  }catch(e){
    tag("dep-tag","off","offline");
    $("dep-body").innerHTML=`<tr><td colspan="4" class="empty">Timetable not reachable right now. Check sbb.ch or the SBB app.</td></tr>`;
  }
}
loadWeather();loadDepartures();
setInterval(loadWeather,10*60*1000);setInterval(loadDepartures,60*1000);

/* ---- Best skiing today: rank areas from model data, explain why, mark on map ---- */
const AREAS=[
  {id:"parsenn",name:"Parsenn",lat:46.8335,lon:9.8065,el:2660},
  {id:"jakobshorn",name:"Jakobshorn",lat:46.7710,lon:9.8530,el:2590},
  {id:"pischa",name:"Pischa",lat:46.8180,lon:9.9150,el:2480},
  {id:"rinerhorn",name:"Rinerhorn",lat:46.7340,lon:9.8330,el:2490},
  {id:"madrisa",name:"Madrisa",lat:46.9050,lon:9.8790,el:2600}
];
async function loadSki(){
  try{
    const q=k=>AREAS.map(a=>a[k]).join(",");
    const u=`https://api.open-meteo.com/v1/forecast?latitude=${q("lat")}&longitude=${q("lon")}&elevation=${q("el")}&hourly=snow_depth&daily=snowfall_sum,wind_gusts_10m_max,sunshine_duration,temperature_2m_max&past_days=1&forecast_days=1&timezone=Europe%2FZurich`;
    const r=await fetch(u);if(!r.ok)throw 0;let d=await r.json();if(!Array.isArray(d))d=[d];
    const nowH=new Date().toLocaleString("sv-SE",{timeZone:"Europe/Zurich"}).slice(0,13).replace(" ","T");
    const res=AREAS.map((a,k)=>{const x=d[k];
      let hi=x.hourly.time.findIndex(t=>t.startsWith(nowH));if(hi<0)hi=x.hourly.time.length-1;
      const depth=x.hourly.snow_depth[hi]||0, fresh=(x.daily.snowfall_sum[0]||0)+(x.daily.snowfall_sum[1]||0),
            gust=x.daily.wind_gusts_10m_max[1]||0, sun=(x.daily.sunshine_duration[1]||0)/3600;
      const ok=depth>=0.3;
      const score=ok?Math.min(depth,1.5)*20+Math.min(fresh,30)*2+sun*3-Math.max(0,gust-50)*1.5:-999;
      return {...a,depth,fresh,gust,sun,ok,score};
    }).sort((a,b)=>b.score-a.score);
    $("ski-body").innerHTML=res.map(a=>`<div><span>${a.name}<span class="why">${a.ok?`${Math.round(a.depth*100)} cm base · ${Math.round(a.fresh)} cm new · gusts ${Math.round(a.gust)} km/h · ${Math.round(a.sun)} h sun`:"not enough snow"}</span></span><span class="st ${!a.ok?"closed":a===res[0]?"open":a.gust>70?"part":"open"}">${!a.ok?"No":a===res[0]?"Best":a.gust>70?"Windy":"Good"}</span></div>`).join("");
    document.querySelectorAll(".lbl-best").forEach(e=>{e.classList.remove("lbl-best");e.textContent=e.textContent.replace(" ★ BEST TODAY","")});
    const best=res[0], skiable=res.filter(a=>a.ok);
    if(!skiable.length){
      $("ski-pick").textContent="No ski area has enough snow yet. The models show less than 30 cm on every slope. Come back when the season starts.";
    }else{
      const others=skiable.slice(1); let why="the best mix of snow, wind and sun";
      if(others.length){
        if(best.fresh>=Math.max(...others.map(o=>o.fresh))&&best.fresh>=5)why="the most fresh snow";
        else if(best.depth>=Math.max(...others.map(o=>o.depth)))why="the deepest base";
        else if(best.gust<=Math.min(...others.map(o=>o.gust)))why="the least wind";
        else if(best.sun>=Math.max(...others.map(o=>o.sun)))why="the most sun";
      }
      $("ski-pick").innerHTML=`Today's pick: <b>${best.name}</b>. It has ${why}.${best.gust>70?" Strong gusts, so upper lifts may stop.":""}`;
      const l=document.getElementById("lbl-"+best.id);if(l){l.classList.add("lbl-best");l.textContent+=" ★ BEST TODAY";}
    }
    tag("ski-tag","on","live");
  }catch(e){
    tag("ski-tag","off","offline");
    $("ski-pick").textContent="Slope data not reachable right now. We won't guess.";
  }
}
loadSki();setInterval(loadSki,30*60*1000);
