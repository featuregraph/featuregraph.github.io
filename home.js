(() => {
  const values = Array.from({length:150},(_,i)=>Math.sin(i*.18)+.18*Math.sin(i*.47)+.06*Math.cos(i*.09));
  const line=document.getElementById("signal");
  const layer=document.getElementById("objects");
  const body=document.getElementById("object-table");
  const status=document.getElementById("status");
  const button=document.getElementById("construct");
  if(!line||!layer||!body||!button)return;
  const x=i=>32+(i/(values.length-1))*748;
  const min=Math.min(...values),max=Math.max(...values),span=max-min||1;
  const y=v=>216-((v-min)/span)*176;
  line.setAttribute("class","signal");
  line.setAttribute("points",values.map((v,i)=>x(i).toFixed(1)+","+y(v).toFixed(1)).join(" "));
  const points=[];
  for(let i=1;i<values.length-1;i+=1){
    const a=values[i]-values[i-1],b=values[i+1]-values[i];
    if(a>0&&b<=0)points.push({index:i,type:"peak"});
    if(a<0&&b>=0)points.push({index:i,type:"trough"});
  }
  button.addEventListener("click",()=>{
    const troughs=points.filter(p=>p.type==="trough");
    const objects=[];
    for(let i=0;i<troughs.length-1;i+=1){
      const start=troughs[i].index,end=troughs[i+1].index;
      const peaks=points.filter(p=>p.type==="peak"&&p.index>start&&p.index<end);
      if(!peaks.length)continue;
      const peak=peaks.reduce((best,p)=>values[p.index]>values[best.index]?p:best).index;
      objects.push({id:objects.length+1,start,peak,end,duration:end-start,amplitude:values[peak]-Math.min(values[start],values[end])});
    }
    layer.replaceChildren();
    const ns="http://www.w3.org/2000/svg";
    objects.forEach(o=>{
      const band=document.createElementNS(ns,"rect");
      band.setAttribute("class","object-band");band.setAttribute("x",x(o.start));band.setAttribute("y",30);
      band.setAttribute("width",Math.max(2,x(o.end)-x(o.start)));band.setAttribute("height",196);layer.appendChild(band);
      [o.start,o.peak,o.end].forEach(i=>{const c=document.createElementNS(ns,"circle");c.setAttribute("class","object-point");c.setAttribute("cx",x(i));c.setAttribute("cy",y(values[i]));c.setAttribute("r",4);layer.appendChild(c)});
      const label=document.createElementNS(ns,"text");label.setAttribute("class","object-label");
      label.setAttribute("x",(x(o.start)+x(o.end))/2);label.setAttribute("y",48);label.textContent="O"+o.id;layer.appendChild(label);
    });
    body.innerHTML=objects.map(o=>"<tr><td>O"+o.id+"</td><td>"+o.start+"</td><td>"+o.peak+"</td><td>"+o.end+"</td><td>"+o.duration+"</td><td>"+o.amplitude.toFixed(3)+"</td></tr>").join("");
    status.textContent=objects.length+" complete oscillations are now explicit, measurable records.";
    button.textContent="Objects constructed";
    button.disabled=true;
  });
})();
