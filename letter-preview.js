// Preview content comes from ApplyPilot's existing sanitized letter renderer.
// Defense-in-depth: strip scripts, embedded documents, handlers, and dangerous URLs.
window.letterPreview.onContent(html=>{
 const doc=new DOMParser().parseFromString(String(html),'text/html');
 doc.querySelectorAll('script,style,iframe,object,embed,form,meta,link,base,svg,math').forEach(el=>el.remove());
 doc.querySelectorAll('*').forEach(el=>{
  for(const attr of [...el.attributes]){
   const key=attr.name.toLowerCase();
   if(key.startsWith('on')||key==='style'||key==='srcdoc')el.removeAttribute(attr.name);
   else if(['href','src'].includes(key)&&!/^https?:\/\//i.test(attr.value)&&!/^mailto:/i.test(attr.value))el.removeAttribute(attr.name);
  }
 });
 document.getElementById('letter').replaceChildren(...[...doc.body.childNodes].map(n=>document.importNode(n,true)));
});
