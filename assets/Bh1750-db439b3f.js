import{B as d,f as E,s as k,_ as G,a as L,b as J,c as K,d as P,e as X,g as Y,h as Z,i as q,j as Q}from"./utils-7f4c410d.js";import"./lodash-819bf5e9.js";import{r as l,T as B,z as W,P as D,U as ee,A as te,B as r,C as f,D as e,O as ne,J as t,F as u,V as ae,X as se,Z as oe,Y as le,K as T,M as ue,G as _e}from"./index-44b1c0b3.js";import{_ as ie,a as re}from"./RadioGroup-1653886f.js";import{_ as ce}from"./Space-2d16d2df.js";const pe={style:{position:"relative",height:"60vh"}},me={name:"DeviceBh1750"},we=Object.assign(me,{setup(de){const _=l(!1),v=l(null),g=l(500),A=l(69),$=l(d.modes.continuousHighResMode),x=l(null),i=l(d.addresses[0]),C=B("emitter");let c=null,n=null,y=Date.now();const{transmit:p,connect:I}=B("adapter"),w=async()=>{try{v.value=await c.measure();const a=Date.now();n.data.datasets[0].data.push({x:a,y:v.value}),a>y+50&&(y=a,D().then(()=>{n.options.scales.x.min=k(new Date,{minutes:1});const s=n.data.datasets[0].data.findLastIndex(m=>m.x<n.options.scales.x.min);n.data.datasets[0].data.splice(0,s),n.update()})),_.value&&(await Q(g.value),w())}catch(a){console.log(a),_.value=!1}},S=async()=>{await I(),await p("AT"),await p("AT");const a=await p("AT+SC");if(!Array.from(a).includes(parseInt(i.value,16)))throw C.emit("message",{type:"error",data:{message:"Not Found"}}),new Error(`BH1750 at adrress 0x${i.value} NOT Found`);c=new d({transmit:p},i.value),await c.init($.value),await c.setMeasureTime(A.value),_.value=!0,w()};return W(()=>{D().then(()=>{n=new ee(x.value,{type:"line",data:{datasets:[{label:"Illuminance",fill:!1,data:[]}]},options:{spanGaps:!0,responsive:!0,maintainAspectRatio:!1,parsing:!1,normalized:!0,animations:{numbers:{properties:["x"],type:"number",from:void 0}},scales:{x:{type:"time",min:E(k(new Date,{minutes:1})),ticks:{stepSize:5},time:{unit:"second"},title:{display:!0,text:"Date"}},y:{title:{display:!0,text:"lx"}}}}})})}),te(()=>{n.destroy()}),(a,s)=>{const m=L,F=J,N=re,U=ie,h=K,M=P,O=X,b=ue,R=ce,V=Y,j=Z,z=q,H=ne;return r(),f(H,null,{header:e(()=>[t(F,null,{default:e(()=>[t(m,null,{default:e(()=>[u("Device")]),_:1}),t(m,null,{default:e(()=>[u("BH1750")]),_:1})]),_:1})]),"header-extra":e(()=>[t(R,null,{default:e(()=>[t(O,{"label-placement":"left",inline:""},{default:e(()=>[t(h,{label:"Address:"},{default:e(()=>[t(U,{value:i.value,"onUpdate:value":s[0]||(s[0]=o=>i.value=o)},{default:e(()=>[(r(!0),ae(le,null,se(oe(d).addresses,o=>(r(),f(N,{key:o,value:o},{default:e(()=>[u("0x"+_e(o),1)]),_:2},1032,["value"]))),128))]),_:1},8,["value"])]),_:1}),t(h,{label:"Interval (ms):",style:{width:"300px"}},{default:e(()=>[t(M,{value:g.value,"onUpdate:value":s[1]||(s[1]=o=>g.value=o),step:100,min:0,max:1e3},null,8,["value"])]),_:1})]),_:1}),t(G),_.value?(r(),f(b,{key:0,onClick:s[2]||(s[2]=o=>{_.value=!1}),type:"warning"},{default:e(()=>[u("Stop")]),_:1})):(r(),f(b,{key:1,onClick:S,type:"primary"},{default:e(()=>[u("Start")]),_:1}))]),_:1})]),default:e(()=>[t(z,{"x-gap":"12",cols:2},{default:e(()=>[t(j,null,{default:e(()=>[t(V,{label:"Illuminance",value:v.value},{suffix:e(()=>[u("lx")]),_:1},8,["value"])]),_:1})]),_:1}),T("div",pe,[T("canvas",{ref_key:"chartRef",ref:x},null,512)])]),_:1})}}});export{we as default};