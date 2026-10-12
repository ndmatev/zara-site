var CACHE="mybudget-prototype-v1";
var CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(CORE)}).then(function(){return self.skipWaiting()}));
});
self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(cacheName){return cacheName.indexOf("mybudget-prototype-")===0&&cacheName!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener("fetch",function(e){
  var r=e.request;if(r.method!=="GET")return;
  var u=new URL(r.url);
  var ok=u.origin===location.origin||u.hostname==="fonts.googleapis.com"||u.hostname==="fonts.gstatic.com";
  if(!ok)return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(r,{ignoreSearch:true}).then(function(hit){
      var net=fetch(r).then(function(res){
        if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());
        return res;
      }).catch(function(){
        if(hit)return hit;
        if(r.mode==="navigate")return c.match("./index.html").then(function(x){return x||new Response("",{status:504})});
        return new Response("",{status:504});
      });
      return hit||net;
    });
  }));
});
