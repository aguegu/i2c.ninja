import{_ as ae,M as oe,a as se,b as ne,c as le,e as re,f as ie,g as de,h as ce,i as ue,m as pe,s as V,d as me}from"./utils-CXPfh8Vn.js";import"./lodash-Dr83-R63.js";import{F as _e,f as fe}from"./FileSaver.min-DMznZ3XV.js";import{c as he,d as ge,f as A,i as xe,u as ye,j as E,l as j,n as ve,o as be,a0 as Ce,p as M,T as $e,r as y,U as O,z as ze,P as I,V as L,A as Se,R as Be,C as W,D as e,O as we,B as F,J as t,F as _,G as f,X as Te,Y as ke,Z as Ae,$ as Me,K as P,a1 as Fe,M as Pe}from"./index-BK02bb7p.js";import{_ as Re,a as We}from"./RadioGroup-DxUOFP0O.js";import{_ as De}from"./Space-Dg0Pa17L.js";const Ge={headerFontSize1:"30px",headerFontSize2:"22px",headerFontSize3:"18px",headerFontSize4:"16px",headerFontSize5:"16px",headerFontSize6:"16px",headerMargin1:"28px 0 20px 0",headerMargin2:"28px 0 20px 0",headerMargin3:"28px 0 20px 0",headerMargin4:"28px 0 18px 0",headerMargin5:"28px 0 18px 0",headerMargin6:"28px 0 18px 0",headerPrefixWidth1:"16px",headerPrefixWidth2:"16px",headerPrefixWidth3:"12px",headerPrefixWidth4:"12px",headerPrefixWidth5:"12px",headerPrefixWidth6:"12px",headerBarWidth1:"4px",headerBarWidth2:"4px",headerBarWidth3:"3px",headerBarWidth4:"3px",headerBarWidth5:"3px",headerBarWidth6:"3px",pMargin:"16px 0 16px 0",liMargin:".25em 0 0 0",olPadding:"0 0 0 2em",ulPadding:"0 0 0 2em"},Ue=p=>{const{primaryColor:i,textColor2:s,borderColor:m,lineHeight:c,fontSize:n,borderRadiusSmall:x,dividerColor:o,fontWeightStrong:S,textColor1:h,textColor3:v,infoColor:d,warningColor:b,errorColor:u,successColor:g,codeColor:B}=p;return Object.assign(Object.assign({},Ge),{aTextColor:i,blockquoteTextColor:s,blockquotePrefixColor:m,blockquoteLineHeight:c,blockquoteFontSize:n,codeBorderRadius:x,liTextColor:s,liLineHeight:c,liFontSize:n,hrColor:o,headerFontWeight:S,headerTextColor:h,pTextColor:s,pTextColor1Depth:h,pTextColor2Depth:s,pTextColor3Depth:v,pLineHeight:c,pFontSize:n,headerBarColor:i,headerBarColorPrimary:i,headerBarColorInfo:d,headerBarColorError:u,headerBarColorWarning:b,headerBarColorSuccess:g,textColor:s,textColor1Depth:h,textColor2Depth:s,textColor3Depth:v,textColorPrimary:i,textColorInfo:d,textColorSuccess:g,textColorWarning:b,textColorError:u,codeTextColor:s,codeColor:B,codeBorder:"1px solid #0000"})},Ve={name:"Typography",common:he,self:Ue},je=Ve,Oe=ge("text",`
 transition: color .3s var(--n-bezier);
 color: var(--n-text-color);
`,[A("strong",`
 font-weight: var(--n-font-weight-strong);
 `),A("italic",{fontStyle:"italic"}),A("underline",{textDecoration:"underline"}),A("code",`
 line-height: 1.4;
 display: inline-block;
 font-family: var(--n-font-famliy-mono);
 transition: 
 color .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 box-sizing: border-box;
 padding: .05em .35em 0 .35em;
 border-radius: var(--n-code-border-radius);
 font-size: .9em;
 color: var(--n-code-text-color);
 background-color: var(--n-code-color);
 border: var(--n-code-border);
 `)]),Ie=Object.assign(Object.assign({},E.props),{code:Boolean,type:{type:String,default:"default"},delete:Boolean,strong:Boolean,italic:Boolean,underline:Boolean,depth:[String,Number],tag:String,as:{type:String,validator:()=>!0,default:void 0}}),Le=xe({name:"Text",props:Ie,setup(p){const{mergedClsPrefixRef:i,inlineThemeDisabled:s}=ye(p),m=E("Typography","-text",Oe,je,p,i),c=j(()=>{const{depth:x,type:o}=p,S=o==="default"?x===void 0?"textColor":`textColor${x}Depth`:ve("textColor",o),{common:{fontWeightStrong:h,fontFamilyMono:v,cubicBezierEaseInOut:d},self:{codeTextColor:b,codeBorderRadius:u,codeColor:g,codeBorder:B,[S]:w}}=m.value;return{"--n-bezier":d,"--n-text-color":w,"--n-font-weight-strong":h,"--n-font-famliy-mono":v,"--n-code-border-radius":u,"--n-code-text-color":b,"--n-code-color":g,"--n-code-border":B}}),n=s?be("text",j(()=>`${p.type[0]}${p.depth||""}`),c,p):void 0;return{mergedClsPrefix:i,compitableTag:Ce(p,["as","tag"]),cssVars:s?void 0:c,themeClass:n==null?void 0:n.themeClass,onRender:n==null?void 0:n.onRender}},render(){var p,i,s;const{mergedClsPrefix:m}=this;(p=this.onRender)===null||p===void 0||p.call(this);const c=[`${m}-text`,this.themeClass,{[`${m}-text--code`]:this.code,[`${m}-text--delete`]:this.delete,[`${m}-text--strong`]:this.strong,[`${m}-text--italic`]:this.italic,[`${m}-text--underline`]:this.underline}],n=(s=(i=this.$slots).default)===null||s===void 0?void 0:s.call(i);return this.code?M("code",{class:c,style:this.cssVars},this.delete?M("del",null,n):n):this.delete?M("del",{class:c,style:this.cssVars},n):M(this.compitableTag||"span",{class:c,style:this.cssVars},n)}}),Ee={style:{position:"relative",height:"30vh"}},Ne={style:{position:"relative",height:"30vh"}},He={name:"DeviceMpu6050"},Qe=Object.assign(He,{setup(p){const{t:i}=$e({useScope:"global"}),s=y(!1),m=y(100),c=y("68"),n=y("500"),x=y("4"),o=y({accelerometers:{},gyroscopes:{}}),S=O("emitter"),h=[],v=y(null);let d=null;const b=y(null);let u=null;const{transmit:g,connect:B}=O("adapter");let w=null,D=Date.now();const G=async()=>{try{o.value=await w.measure();const a=Date.now();d.data.datasets[0].data.push({x:a,y:o.value.accelerometers.x}),d.data.datasets[1].data.push({x:a,y:o.value.accelerometers.y}),d.data.datasets[2].data.push({x:a,y:o.value.accelerometers.z}),u.data.datasets[0].data.push({x:a,y:o.value.gyroscopes.x}),u.data.datasets[1].data.push({x:a,y:o.value.gyroscopes.y}),u.data.datasets[2].data.push({x:a,y:o.value.gyroscopes.z}),h.push([fe(a,{fractionDigits:3}),o.value.accelerometers.x,o.value.accelerometers.y,o.value.accelerometers.z,o.value.gyroscopes.x,o.value.gyroscopes.y,o.value.gyroscopes.z]),a>D+50&&(D=a,I().then(()=>{d.options.scales.x.min=V(a,{minutes:1}),u.options.scales.x.min=V(a,{minutes:1});const l=d.data.datasets[0].data.findLastIndex(T=>T.x<d.options.scales.x.min);d.data.datasets[0].data.splice(0,l),d.data.datasets[1].data.splice(0,l),d.data.datasets[2].data.splice(0,l),u.data.datasets[0].data.splice(0,l),u.data.datasets[1].data.splice(0,l),u.data.datasets[2].data.splice(0,l),d.update(),u.update()})),s.value&&(await me(m.value),G())}catch(a){console.log(a),s.value=!1}},N=async()=>{await B(),await g("AT"),await g("AT");const a=await g("AT+SC");if(!Array.from(a).includes(parseInt(c.value,16)))throw S.emit("message",{type:"error",data:{message:"Not Found"}}),new Error(`MPU6050 at adrress 0x${c.value} NOT Found`);w=new oe({transmit:g},c.value),await w.init(n.value,x.value),s.value=!0,h.length=0,G()};ze(()=>{I().then(()=>{d=new L(v.value,{type:"line",data:{datasets:[{label:`${i("measurement.Accelerometers")}.X`,fill:!1,data:[]},{label:`${i("measurement.Accelerometers")}.Y`,fill:!1,data:[]},{label:`${i("measurement.Accelerometers")}.Z`,fill:!1,data:[]}]},options:{spanGaps:!0,responsive:!0,maintainAspectRatio:!1,parsing:!1,normalized:!0,animations:{numbers:{properties:["x"],type:"number",from:void 0}},scales:{x:{type:"time",ticks:{stepSize:5},time:{unit:"second"}},y:{title:{display:!0,text:""}}}}}),u=new L(b.value,{type:"line",data:{datasets:[{label:`${i("measurement.Gyroscopes")}.X`,fill:!1,data:[]},{label:`${i("measurement.Gyroscopes")}.Y`,fill:!1,data:[]},{label:`${i("measurement.Gyroscopes")}.Z`,fill:!1,data:[]}]},options:{spanGaps:!0,responsive:!0,maintainAspectRatio:!1,parsing:!1,normalized:!0,animations:{numbers:{properties:["x"],type:"number",from:void 0}},scales:{x:{type:"time",ticks:{stepSize:5},time:{unit:"second"}},y:{title:{display:!0,text:""}}}}})})});const H=()=>{const a=new Blob([`timestamp,accelerometers.x,accelerometers.y,accelerometers.z,gyroscopes.x,gyroscopes.y,gyroscopes.z
`,h.map(l=>l.join(",")).join(`
`)],{type:"text/csv;charset=utf-8"});_e.saveAs(a,`MPU6050_${new Date().toISOString()}.csv`)};return Se(()=>{d.destroy(),u.destroy()}),(a,l)=>{const T=se,X=ne,Y=We,Z=Re,k=le,U=Fe,q=re,K=ie,R=Pe,J=Be("svg-icon"),Q=De,C=Le,$=de,z=ce,ee=ue,te=we;return F(),W(te,null,{header:e(()=>[t(X,null,{default:e(()=>[t(T,null,{default:e(()=>[_(f(a.$t("header.Motion"))+f(a.$t("adapter.Sensor")),1)]),_:1}),t(T,null,{default:e(()=>[_("MPU6050")]),_:1})]),_:1})]),"header-extra":e(()=>[t(Q,null,{default:e(()=>[t(K,{"label-placement":"left",inline:""},{default:e(()=>[t(k,{label:a.$t("adapter.Address")},{default:e(()=>[t(Z,{value:c.value,"onUpdate:value":l[0]||(l[0]=r=>c.value=r)},{default:e(()=>[(F(),Te(Ae,null,ke(["68","69"],r=>t(Y,{key:r,value:r},{default:e(()=>[_("0x"+f(r),1)]),_:2},1032,["value"])),64))]),_:1},8,["value"])]),_:1},8,["label"]),t(k,{label:`${a.$t("measurement.Gyroscopes")}${a.$t("measurement.Range")}`},{default:e(()=>[t(U,{value:n.value,"onUpdate:value":l[1]||(l[1]=r=>n.value=r),options:["250","500","1000","2000"].map(r=>({value:r,label:`±${r}°/s`})),size:"small",style:{width:"120px"}},null,8,["value","options"])]),_:1},8,["label"]),t(k,{label:`${a.$t("measurement.Accelerometers")}${a.$t("measurement.Range")}`},{default:e(()=>[t(U,{value:x.value,"onUpdate:value":l[2]||(l[2]=r=>x.value=r),options:["2","4","8","16"].map(r=>({value:r,label:`±${r}g`})),size:"small",style:{width:"90px"}},null,8,["value","options"])]),_:1},8,["label"]),t(k,{label:`${a.$t("adapter.Interval")} (ms)`,style:{width:"240px"}},{default:e(()=>[t(q,{value:m.value,"onUpdate:value":l[3]||(l[3]=r=>m.value=r),step:100,min:0,max:1e3},null,8,["value"])]),_:1},8,["label"])]),_:1}),t(ae),s.value?(F(),W(R,{key:0,onClick:l[4]||(l[4]=r=>{s.value=!1}),type:"warning"},{default:e(()=>[_(f(a.$t("adapter.Stop")),1)]),_:1})):(F(),W(R,{key:1,onClick:N,type:"primary"},{default:e(()=>[_(f(a.$t("adapter.Start")),1)]),_:1})),t(R,{onClick:H},{icon:e(()=>[t(J,{type:"mdi",path:Me(pe)},null,8,["path"])]),_:1})]),_:1})]),default:e(()=>[t(ee,{"x-gap":"12",cols:6},{default:e(()=>[t(z,null,{default:e(()=>[t($,{label:`${a.$t("measurement.Accelerometers")}.X`},{default:e(()=>[t(C,{style:{"font-size":"0.8em"}},{default:e(()=>[_(f(o.value.accelerometers.x),1)]),_:1})]),_:1},8,["label"])]),_:1}),t(z,null,{default:e(()=>[t($,{label:`${a.$t("measurement.Accelerometers")}.Y`},{default:e(()=>[t(C,{style:{"font-size":"0.8em"}},{default:e(()=>[_(f(o.value.accelerometers.y),1)]),_:1})]),_:1},8,["label"])]),_:1}),t(z,null,{default:e(()=>[t($,{label:`${a.$t("measurement.Accelerometers")}.Z`},{default:e(()=>[t(C,{style:{"font-size":"0.8em"}},{default:e(()=>[_(f(o.value.accelerometers.z),1)]),_:1})]),_:1},8,["label"])]),_:1}),t(z,null,{default:e(()=>[t($,{label:`${a.$t("measurement.Gyroscopes")}.X`},{default:e(()=>[t(C,{style:{"font-size":"0.8em"}},{default:e(()=>[_(f(o.value.gyroscopes.x),1)]),_:1})]),_:1},8,["label"])]),_:1}),t(z,null,{default:e(()=>[t($,{label:`${a.$t("measurement.Gyroscopes")}.Y`},{default:e(()=>[t(C,{style:{"font-size":"0.8em"}},{default:e(()=>[_(f(o.value.gyroscopes.y),1)]),_:1})]),_:1},8,["label"])]),_:1}),t(z,null,{default:e(()=>[t($,{label:`${a.$t("measurement.Gyroscopes")}.Z`},{default:e(()=>[t(C,{style:{"font-size":"0.8em"}},{default:e(()=>[_(f(o.value.gyroscopes.z),1)]),_:1})]),_:1},8,["label"])]),_:1})]),_:1}),P("div",Ee,[P("canvas",{ref_key:"chartAccelerometersRef",ref:v},null,512)]),P("div",Ne,[P("canvas",{ref_key:"chartGyroscopesRef",ref:b},null,512)])]),_:1})}}});export{Qe as default};
