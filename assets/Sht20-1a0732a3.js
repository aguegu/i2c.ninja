import{l as A,f as j,s as k,_ as M,a as V,b as P,d as G,c as J,e as K,g as L,h as X,i as q,j as Q}from"./utils-7f4c410d.js";import"./lodash-819bf5e9.js";import{r as l,T as S,z as W,P as C,U as Y,A as Z,B as m,C as f,D as e,O as ee,J as t,F as r,K as D,M as te}from"./index-44b1c0b3.js";import{_ as ae}from"./Space-2d16d2df.js";class ne{constructor(a){this.adapter=a,this.address="40"}async init(){return this.adapter.transmit(`AT+TX=${this.address}FE`)}async measure(){const a=await this.adapter.transmit(`AT+TR=${this.address}e303`),u=((a.readUInt16BE()*17572>>16)-4685)/100,o=await this.adapter.transmit(`AT+TR=${this.address}e503`),c=(o.readUInt16BE()*125>>16)-6;if(A(a.slice(0,2),49,0)!=a.readUInt8(2)||A(o.slice(0,2),49,0)!=o.readUInt8(2))throw new Error("checksum not match");return Promise.resolve({temperature:u,humidity:c})}}const se={style:{position:"relative",height:"60vh"}},oe={name:"DeviceSht20"},ce=Object.assign(oe,{setup(I){const a=l(!1),u=l(null),o=l(null),c=l(200),y=l(null),v=l("40"),$=S("emitter"),{transmit:_,connect:U}=S("adapter");let p=null,n=null,h=Date.now();const x=async()=>{try{({humidity:o.value,temperature:u.value}=await p.measure());const s=Date.now();n.data.datasets[0].data.push({x:s,y:u.value}),n.data.datasets[1].data.push({x:s,y:o.value}),s>h+50&&(h=s,C().then(()=>{n.options.scales.x.min=k(new Date,{minutes:1});const i=n.data.datasets[1].data.findLastIndex(d=>d.x<n.options.scales.x.min);n.data.datasets[0].data.splice(0,i),n.data.datasets[1].data.splice(0,i),n.update()})),a.value&&(await Q(c.value),x())}catch(s){console.log(s),a.value=!1}},B=async()=>{await U(),await _("AT"),await _("AT");const s=await _("AT+SC");if(!Array.from(s).includes(parseInt(v.value,16)))throw $.emit("message",{type:"error",data:{message:"Not Found"}}),new Error(`SHT20 at adrress 0x${v.value} NOT Found`);p=new ne({transmit:_}),await p.init(),a.value=!0,x()};return W(()=>{console.log("onMounted"),C().then(()=>{n=new Y(y.value,{type:"line",data:{datasets:[{label:"Temperature",fill:!1,data:[],yAxisID:"yT"},{label:"Humidity",fill:!1,data:[],yAxisID:"yH"}]},options:{spanGaps:!0,responsive:!0,maintainAspectRatio:!1,parsing:!1,normalized:!0,animations:{numbers:{properties:["x"],type:"number",from:void 0}},scales:{x:{type:"time",min:j(k(new Date,{minutes:1})),ticks:{stepSize:5},time:{unit:"second"},title:{display:!0,text:"Date"}},yT:{title:{display:!0,text:"Celsius"},ticks:{stepSize:1,precision:1}},yH:{title:{display:!0,text:"%"},ticks:{stepSize:10,precision:0},position:"right",grid:{drawOnChartArea:!1}}}}})})}),Z(()=>{n.destroy()}),(s,i)=>{const d=V,H=P,z=G,E=J,F=K,g=te,N=ae,w=L,T=X,O=q,R=ee;return m(),f(R,null,{header:e(()=>[t(H,null,{default:e(()=>[t(d,null,{default:e(()=>[r("Device")]),_:1}),t(d,null,{default:e(()=>[r("SHT20")]),_:1})]),_:1})]),"header-extra":e(()=>[t(N,null,{default:e(()=>[t(F,{"label-placement":"left",inline:""},{default:e(()=>[t(E,{label:"Interval (ms):",style:{width:"300px"}},{default:e(()=>[t(z,{value:c.value,"onUpdate:value":i[0]||(i[0]=b=>c.value=b),step:100,min:0,max:5e3},null,8,["value"])]),_:1})]),_:1}),t(M),a.value?(m(),f(g,{key:0,onClick:i[1]||(i[1]=b=>{a.value=!1}),type:"warning"},{default:e(()=>[r("Stop")]),_:1})):(m(),f(g,{key:1,onClick:B,type:"primary"},{default:e(()=>[r("Start")]),_:1}))]),_:1})]),default:e(()=>[t(O,{"x-gap":"12",cols:2},{default:e(()=>[t(T,null,{default:e(()=>[t(w,{label:"Temperature",value:u.value},{suffix:e(()=>[r("°C")]),_:1},8,["value"])]),_:1}),t(T,null,{default:e(()=>[t(w,{label:"Air Humidity",value:o.value},{suffix:e(()=>[r("%")]),_:1},8,["value"])]),_:1})]),_:1}),D("div",se,[D("canvas",{ref_key:"chartRef",ref:y},null,512)])]),_:1})}}});export{ce as default};