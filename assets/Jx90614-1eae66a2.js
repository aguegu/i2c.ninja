import{f as j,s as h,_ as z,J as R,a as V,b as M,d as X,c as E,e as G,g as K,h as L,i as P,j as q}from"./utils-4a2a637f.js";import"./lodash-cd78795a.js";import{r as l,T as b,z as H,P as k,U as Q,A as W,B as d,C as f,D as e,O as Y,J as t,F as _,K as C,M as Z}from"./index-b4fcf539.js";import{_ as ee}from"./Space-22a2d323.js";const te={style:{position:"relative",height:"60vh"}},ne={name:"DeviceJx90614"},ue=Object.assign(ne,{setup(ae){const o=l(!1),r=l(null),c=l(500),v=l(null),p=l("7F"),T=b("emitter");let m=null,n=null,g=Date.now();const{transmit:u,connect:D}=b("adapter"),x=async()=>{try{({temperature:r.value}=await m.measure());const a=Date.now();n.data.datasets[0].data.push({x:a,y:r.value}),a>g+50&&(g=a,k().then(()=>{n.options.scales.x.min=h(new Date,{minutes:1});const s=n.data.datasets[0].data.findLastIndex(i=>i.x<n.options.scales.x.min);n.data.datasets[0].data.splice(0,s),n.update()})),o.value&&(await q(c.value),x())}catch(a){console.log(a),o.value=!1}},A=async()=>{await D(),await u("AT"),await u("AT");const a=await u("AT+SC");if(!Array.from(a).includes(parseInt(p.value,16)))throw T.emit("message",{type:"error",data:{message:"Not Found"}}),new Error(`JX90614 at adrress 0x${p.value} NOT Found`);m=new R({transmit:u},p.value),await m.init(),o.value=!0,x()};return H(()=>{k().then(()=>{n=new Q(v.value,{type:"line",data:{datasets:[{label:"Temperature",fill:!1,data:[]}]},options:{spanGaps:!0,responsive:!0,maintainAspectRatio:!1,parsing:!1,normalized:!0,animations:{numbers:{properties:["x"],type:"number",from:void 0}},scales:{x:{type:"time",min:j(h(new Date,{minutes:1})),ticks:{stepSize:5},time:{unit:"second"},title:{display:!0,text:"Date"}},y:{title:{display:!0,text:"Celsius"}}}}})})}),W(()=>{n.destroy()}),(a,s)=>{const i=V,J=M,$=X,B=E,F=G,y=Z,N=ee,S=K,I=L,O=P,U=Y;return d(),f(U,null,{header:e(()=>[t(J,null,{default:e(()=>[t(i,null,{default:e(()=>[_("Device")]),_:1}),t(i,null,{default:e(()=>[_("JX90614")]),_:1})]),_:1})]),"header-extra":e(()=>[t(N,null,{default:e(()=>[t(F,{"label-placement":"left",inline:""},{default:e(()=>[t(B,{label:"Interval (ms):",style:{width:"300px"}},{default:e(()=>[t($,{value:c.value,"onUpdate:value":s[0]||(s[0]=w=>c.value=w),step:100,min:0,max:1e3},null,8,["value"])]),_:1})]),_:1}),t(z),o.value?(d(),f(y,{key:0,onClick:s[1]||(s[1]=w=>{o.value=!1}),type:"warning"},{default:e(()=>[_("Stop")]),_:1})):(d(),f(y,{key:1,onClick:A,type:"primary"},{default:e(()=>[_("Start")]),_:1}))]),_:1})]),default:e(()=>[t(O,{"x-gap":"12",cols:1},{default:e(()=>[t(I,null,{default:e(()=>[t(S,{label:"Temperature",value:r.value},{suffix:e(()=>[_("Celsius")]),_:1},8,["value"])]),_:1})]),_:1}),C("div",te,[C("canvas",{ref_key:"chartRef",ref:v},null,512)])]),_:1})}}});export{ue as default};