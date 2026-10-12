/* OFF DAVOS preview lock. Browser-side only: keeps casual visitors and search engines out, not a security system. Remove this file + its script tags to open the site. */
(function(){
  var H="9f07f5636ab5df1a85bf01c70fc10c3c80760ca3cc7711032e668ee3e8139d9d", K="od_preview_ok";
  try{ if(localStorage.getItem(K)===H) return; }catch(e){}
  var d=document.documentElement; d.style.visibility="hidden";
  function hex(b){return Array.prototype.map.call(new Uint8Array(b),function(x){return ("0"+x.toString(16)).slice(-2)}).join("");}
  function build(){
    d.style.visibility="visible";
    var o=document.createElement("div");
    o.setAttribute("style","position:fixed;inset:0;z-index:2147483647;background:#13202B;color:#EDF0EF;display:flex;align-items:center;justify-content:center;padding:16px;font-family:'IBM Plex Sans',system-ui,sans-serif");
    o.innerHTML='<form style="max-width:420px;width:100%"><p style="margin:0 0 8px;font:500 12px monospace;letter-spacing:.1em;text-transform:uppercase;color:#F5C400">Preview · not public yet</p><h1 style="margin:0 0 14px;font-family:\'Big Shoulders Display\',Impact,sans-serif;font-weight:900;font-size:56px;line-height:.9;text-transform:uppercase"><span style="background:#F5C400;color:#151515;padding:0 6px">OFF</span> DAVOS</h1><label for="odpw" style="display:block;margin:0 0 6px">Password</label><input id="odpw" type="password" autocomplete="current-password" style="width:100%;font:inherit;font-size:18px;padding:10px;border:0;margin:0 0 10px"><button style="font:700 16px sans-serif;background:#F5C400;color:#151515;border:0;padding:10px 18px;cursor:pointer">Let me in</button><p id="odmsg" aria-live="polite" style="min-height:1.4em;margin:10px 0 0;color:#F5C400"></p></form>';
    document.body.appendChild(o);
    var f=o.querySelector("form"), i=o.querySelector("#odpw"), m=o.querySelector("#odmsg");
    i.focus();
    f.addEventListener("submit",function(ev){ev.preventDefault();
      crypto.subtle.digest("SHA-256",new TextEncoder().encode(i.value.trim().toLowerCase())).then(function(b){
        if(hex(b)===H){try{localStorage.setItem(K,H);}catch(e){} o.remove();}
        else{m.textContent="Nope. Not even with a white badge.";i.select();}
      });
    });
  }
  if(document.body) build(); else document.addEventListener("DOMContentLoaded",build);
})();
