import{m as y,f as j,s as b,_ as H,a as Q,b as W,c as ee,e as ae,g as te,h as se,i as le,j as ne,k as oe}from"./utils-f6224475.js";import"./lodash-69779c74.js";import{r as c,T as C,z as re,P as M,U as O,A as ie,B as f,C as k,D as a,O as ue,J as e,F as _,V as B,X as G,Y as E,K as w,M as ce,G as z}from"./index-651966c3.js";import{_ as de,a as pe}from"./RadioGroup-70983653.js";import{_ as _e}from"./Space-96c12402.js";const me=["2","4","8","16"],ve=["250","500","1000","2000"];class fe{constructor(s,d="68"){this.adapter=s,this.address=d}async init(s="500",d="4"){const u=ve.indexOf(s);if(u<0)throw new Error("invalid gyroscopeScale");const p=me.indexOf(d);if(p<0)throw new Error("invalid accelerometerScale");this.gyroscopeSensitivity=(131072>>u)/1e3,this.accelerometerSensitivity=16384>>p,await this.adapter.transmit(`AT+TX=${this.address}${[107,0].map(y).join("")}`),await this.adapter.transmit(`AT+TX=${this.address}${[25,15].map(y).join("")}`),await this.adapter.transmit(`AT+TX=${this.address}${[26,4].map(y).join("")}`),await this.adapter.transmit(`AT+TX=${this.address}${[27,u<<3].map(y).join("")}`),await this.adapter.transmit(`AT+TX=${this.address}${[28,p<<3].map(y).join("")}`)}async measure(){const s=await this.adapter.transmit(`AT+TR=${this.address}3B0E`);return{accelerometers:{x:s.readInt16BE()/this.accelerometerSensitivity,y:s.readInt16BE(2)/this.accelerometerSensitivity,z:s.readInt16BE(4)/this.accelerometerSensitivity},temperature:s.readInt16BE(6)/340+36.53,gyroscopes:{x:s.readInt16BE(8)/this.gyroscopeSensitivity,y:s.readInt16BE(10)/this.gyroscopeSensitivity,z:s.readInt16BE(12)/this.gyroscopeSensitivity}}}}const ye={style:{position:"relative",height:"30vh"}},ge={style:{position:"relative",height:"30vh"}},he={name:"DeviceMpu6050"},Te=Object.assign(he,{setup(F){const s=c(!1),d=c(100),u=c("68"),p=c("500"),A=c("4"),o=c({accelerometers:{},gyroscopes:{}}),N=C("emitter"),I=c(null);let r=null;const D=c(null);let i=null;const{transmit:g,connect:Y}=C("adapter");let S=null,X=Date.now();const R=async()=>{try{o.value=await S.measure();const n=Date.now();r.data.datasets[0].data.push({x:n,y:o.value.accelerometers.x}),r.data.datasets[1].data.push({x:n,y:o.value.accelerometers.y}),r.data.datasets[2].data.push({x:n,y:o.value.accelerometers.z}),i.data.datasets[0].data.push({x:n,y:o.value.gyroscopes.x}),i.data.datasets[1].data.push({x:n,y:o.value.gyroscopes.y}),i.data.datasets[2].data.push({x:n,y:o.value.gyroscopes.z}),n>X+50&&(X=n,M().then(()=>{r.options.scales.x.min=b(n,{minutes:1}),i.options.scales.x.min=b(n,{minutes:1});const l=r.data.datasets[0].data.findLastIndex(h=>h.x<r.options.scales.x.min);r.data.datasets[0].data.splice(0,l),r.data.datasets[1].data.splice(0,l),r.data.datasets[2].data.splice(0,l),i.data.datasets[0].data.splice(0,l),i.data.datasets[1].data.splice(0,l),i.data.datasets[2].data.splice(0,l),r.update(),i.update()})),s.value&&(await oe(d.value),R())}catch(n){console.log(n),s.value=!1}},V=async()=>{await Y(),await g("AT"),await g("AT");const n=await g("AT+SC");if(!Array.from(n).includes(parseInt(u.value,16)))throw N.emit("message",{type:"error",data:{message:"Not Found"}}),new Error(`MPU6050 at adrress 0x${u.value} NOT Found`);S=new fe({transmit:g},u.value),await S.init(p.value,A.value),s.value=!0,R()};return re(()=>{M().then(()=>{r=new O(I.value,{type:"line",data:{datasets:[{label:"Accelerometers.X",fill:!1,data:[]},{label:"Accelerometers.Y",fill:!1,data:[]},{label:"Accelerometers.Z",fill:!1,data:[]}]},options:{spanGaps:!0,responsive:!0,maintainAspectRatio:!1,parsing:!1,normalized:!0,animations:{numbers:{properties:["x"],type:"number",from:void 0}},scales:{x:{type:"time",min:j(b(new Date,{minutes:1})),ticks:{stepSize:5},time:{unit:"second"},title:{display:!0,text:"Date"}},y:{title:{display:!0,text:""}}}}}),i=new O(D.value,{type:"line",data:{datasets:[{label:"Gyroscopes.X",fill:!1,data:[]},{label:"Gyroscopes.Y",fill:!1,data:[]},{label:"Gyroscopes.Z",fill:!1,data:[]}]},options:{spanGaps:!0,responsive:!0,maintainAspectRatio:!1,parsing:!1,normalized:!0,animations:{numbers:{properties:["x"],type:"number",from:void 0}},scales:{x:{type:"time",min:j(b(new Date,{minutes:1})),ticks:{stepSize:5},time:{unit:"second"},title:{display:!0,text:"Date"}},y:{title:{display:!0,text:""}}}}})})}),ie(()=>{r.destroy(),i.destroy()}),(n,l)=>{const h=Q,Z=W,T=pe,$=de,x=ee,P=ae,L=te,U=ce,J=_e,m=se,v=le,K=ne,q=ue;return f(),k(q,null,{header:a(()=>[e(Z,null,{default:a(()=>[e(h,null,{default:a(()=>[_("Device")]),_:1}),e(h,null,{default:a(()=>[_("MPU6050")]),_:1})]),_:1})]),"header-extra":a(()=>[e(J,null,{default:a(()=>[e(L,{"label-placement":"left",inline:""},{default:a(()=>[e(x,{label:"Address:"},{default:a(()=>[e($,{value:u.value,"onUpdate:value":l[0]||(l[0]=t=>u.value=t)},{default:a(()=>[(f(),B(E,null,G(["68","69"],t=>e(T,{key:t,value:t},{default:a(()=>[_("0x"+z(t),1)]),_:2},1032,["value"])),64))]),_:1},8,["value"])]),_:1}),e(x,{label:"Gyroscopes Range:"},{default:a(()=>[e($,{value:p.value,"onUpdate:value":l[1]||(l[1]=t=>p.value=t)},{default:a(()=>[(f(),B(E,null,G(["250","500","1000","2000"],t=>e(T,{key:t,value:t},{default:a(()=>[_(z(`±${t}°/s`),1)]),_:2},1032,["value"])),64))]),_:1},8,["value"])]),_:1}),e(x,{label:"Accelerometers Range:"},{default:a(()=>[e($,{value:A.value,"onUpdate:value":l[2]||(l[2]=t=>A.value=t)},{default:a(()=>[(f(),B(E,null,G(["2","4","8","16"],t=>e(T,{key:t,value:t},{default:a(()=>[_(z(`±${t}g`),1)]),_:2},1032,["value"])),64))]),_:1},8,["value"])]),_:1}),e(x,{label:"Interval (ms):",style:{width:"300px"}},{default:a(()=>[e(P,{value:d.value,"onUpdate:value":l[3]||(l[3]=t=>d.value=t),step:100,min:0,max:1e3},null,8,["value"])]),_:1})]),_:1}),e(H),s.value?(f(),k(U,{key:0,onClick:l[4]||(l[4]=t=>{s.value=!1}),type:"warning"},{default:a(()=>[_("Stop")]),_:1})):(f(),k(U,{key:1,onClick:V,type:"primary"},{default:a(()=>[_("Start")]),_:1}))]),_:1})]),default:a(()=>[e(K,{"x-gap":"12",cols:6},{default:a(()=>[e(v,null,{default:a(()=>[e(m,{label:"Accelerometers.X",value:o.value.accelerometers.x},null,8,["value"])]),_:1}),e(v,null,{default:a(()=>[e(m,{label:"Accelerometers.Y",value:o.value.accelerometers.y},null,8,["value"])]),_:1}),e(v,null,{default:a(()=>[e(m,{label:"Accelerometers.Z",value:o.value.accelerometers.z},null,8,["value"])]),_:1}),e(v,null,{default:a(()=>[e(m,{label:"Gyroscopes.X",value:o.value.gyroscopes.x},null,8,["value"])]),_:1}),e(v,null,{default:a(()=>[e(m,{label:"Gyroscopes.Y",value:o.value.gyroscopes.y},null,8,["value"])]),_:1}),e(v,null,{default:a(()=>[e(m,{label:"Gyroscopes.Z",value:o.value.gyroscopes.z},null,8,["value"])]),_:1})]),_:1}),w("div",ye,[w("canvas",{ref_key:"chartAccelerometersRef",ref:I},null,512)]),w("div",ge,[w("canvas",{ref_key:"chartGyroscopesRef",ref:D},null,512)])]),_:1})}}});export{Te as default};