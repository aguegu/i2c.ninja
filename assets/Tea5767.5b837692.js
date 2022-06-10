import{d as Z,i as Q,a as ee,b as te}from"./bh1750.0df03ba3.js";import{_ as re,a as oe}from"./Switch.2065cb52.js";import{O as ie,E as M,D as m,S as z,h as L,l as P,ay as N,q as o,L as E,aT as H,aU as X,aV as F,aW as G,u as ne,j as V,s as U,a1 as se,x as ae,r as q,$ as le,a as W,c as T,w as l,d as i,aS as ce,f as B,af as ue,_ as de}from"./index.35f855e2.js";import{u as ge}from"./use-message.2aa8a098.js";import{_ as pe}from"./Card.199ce840.js";import{a as fe,_ as he}from"./RadioGroup.2cfeea99.js";import{_ as ve}from"./Space.d9f23c8f.js";import{a as me}from"./Grid.2c2b07c1.js";const xe=r=>{const{infoColor:e,successColor:p,warningColor:u,errorColor:c,textColor2:d,progressRailColor:v,fontSize:f,fontWeight:t}=r;return{fontSize:f,fontSizeCircle:"28px",fontWeightCircle:t,railColor:v,railHeight:"8px",iconSizeCircle:"36px",iconSizeLine:"18px",iconColor:e,iconColorInfo:e,iconColorSuccess:p,iconColorWarning:u,iconColorError:c,textColorCircle:d,textColorLineInner:"rgb(255, 255, 255)",textColorLineOuter:d,fillColor:e,fillColorInfo:e,fillColorSuccess:p,fillColorWarning:u,fillColorError:c,lineBgProcessing:"linear-gradient(90deg, rgba(255, 255, 255, .3) 0%, rgba(255, 255, 255, .5) 100%)"}},ye={name:"Progress",common:ie,self:xe};var _e=ye,be=M([m("progress",{display:"inline-block"},[m("progress-icon",`
 color: var(--n-icon-color);
 transition: color .3s var(--n-bezier);
 `),z("line",`
 width: 100%;
 display: block;
 `,[m("progress-content",`
 display: flex;
 align-items: center;
 `,[m("progress-graph",{flex:1})]),m("progress-custom-content",{marginLeft:"14px"}),m("progress-icon",`
 width: 30px;
 padding-left: 14px;
 height: var(--n-icon-size-line);
 line-height: var(--n-icon-size-line);
 font-size: var(--n-icon-size-line);
 `,[z("as-text",`
 color: var(--n-text-color-line-outer);
 text-align: center;
 width: 40px;
 font-size: var(--n-font-size);
 padding-left: 4px;
 transition: color .3s var(--n-bezier);
 `)])]),z("circle, dashboard",{width:"120px"},[m("progress-custom-content",`
 position: absolute;
 left: 50%;
 top: 50%;
 transform: translateX(-50%) translateY(-50%);
 display: flex;
 align-items: center;
 justify-content: center;
 `),m("progress-text",`
 position: absolute;
 left: 50%;
 top: 50%;
 transform: translateX(-50%) translateY(-50%);
 display: flex;
 align-items: center;
 color: inherit;
 font-size: var(--n-font-size-circle);
 color: var(--n-text-color-circle);
 font-weight: var(--n-font-weight-circle);
 transition: color .3s var(--n-bezier);
 white-space: nowrap;
 `),m("progress-icon",`
 position: absolute;
 left: 50%;
 top: 50%;
 transform: translateX(-50%) translateY(-50%);
 display: flex;
 align-items: center;
 color: var(--n-icon-color);
 font-size: var(--n-icon-size-circle);
 `)]),z("multiple-circle",`
 width: 200px;
 color: inherit;
 `,[m("progress-text",`
 font-weight: var(--n-font-weight-circle);
 color: var(--n-text-color-circle);
 position: absolute;
 left: 50%;
 top: 50%;
 transform: translateX(-50%) translateY(-50%);
 display: flex;
 align-items: center;
 justify-content: center;
 transition: color .3s var(--n-bezier);
 `)]),m("progress-content",{position:"relative"}),m("progress-graph",{position:"relative"},[m("progress-graph-circle",[M("svg",{verticalAlign:"bottom"}),m("progress-graph-circle-fill",`
 stroke: var(--n-fill-color);
 transition:
 opacity .3s var(--n-bezier),
 stroke .3s var(--n-bezier),
 stroke-dasharray .3s var(--n-bezier);
 `,[z("empty",{opacity:0})]),m("progress-graph-circle-rail",`
 transition: stroke .3s var(--n-bezier);
 overflow: hidden;
 stroke: var(--n-rail-color);
 `)]),m("progress-graph-line",[z("indicator-inside",[m("progress-graph-line-rail",`
 height: 16px;
 line-height: 16px;
 border-radius: 10px;
 `,[m("progress-graph-line-fill",`
 height: inherit;
 border-radius: 10px;
 `),m("progress-graph-line-indicator",`
 background: #0000;
 white-space: nowrap;
 text-align: right;
 margin-left: 14px;
 margin-right: 14px;
 height: inherit;
 font-size: 12px;
 color: var(--n-text-color-line-inner);
 transition: color .3s var(--n-bezier);
 `)])]),z("indicator-inside-label",`
 height: 16px;
 display: flex;
 align-items: center;
 `,[m("progress-graph-line-rail",`
 flex: 1;
 transition: background-color .3s var(--n-bezier);
 `),m("progress-graph-line-indicator",`
 background: var(--n-fill-color);
 font-size: 12px;
 transform: translateZ(0);
 display: flex;
 vertical-align: middle;
 height: 16px;
 line-height: 16px;
 padding: 0 10px;
 border-radius: 10px;
 position: absolute;
 white-space: nowrap;
 color: var(--n-text-color-line-inner);
 transition:
 right .2s var(--n-bezier),
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 `)]),m("progress-graph-line-rail",`
 position: relative;
 overflow: hidden;
 height: var(--n-rail-height);
 border-radius: 5px;
 background-color: var(--n-rail-color);
 transition: background-color .3s var(--n-bezier);
 `,[m("progress-graph-line-fill",`
 background: var(--n-fill-color);
 position: relative;
 border-radius: 5px;
 height: inherit;
 width: 100%;
 max-width: 0%;
 transition:
 background-color .3s var(--n-bezier),
 max-width .2s var(--n-bezier);
 `,[z("processing",[M("&::after",`
 content: "";
 background-image: var(--n-line-bg-processing);
 animation: progress-processing-animation 2s var(--n-bezier) infinite;
 `)])])])])])]),M("@keyframes progress-processing-animation",`
 0% {
 position: absolute;
 left: 0;
 top: 0;
 bottom: 0;
 right: 100%;
 opacity: 1;
 }
 66% {
 position: absolute;
 left: 0;
 top: 0;
 bottom: 0;
 right: 0;
 opacity: 0;
 }
 100% {
 position: absolute;
 left: 0;
 top: 0;
 bottom: 0;
 right: 0;
 opacity: 0;
 }
 `)]);const Ce={success:o(H,null),error:o(X,null),warning:o(F,null),info:o(G,null)};var Se=L({name:"ProgressLine",props:{clsPrefix:{type:String,required:!0},percentage:{type:Number,default:0},railColor:String,railStyle:[String,Object],fillColor:String,status:{type:String,required:!0},indicatorPlacement:{type:String,required:!0},indicatorTextColor:String,unit:{type:String,default:"%"},processing:{type:Boolean,required:!0},showIndicator:{type:Boolean,required:!0},height:[String,Number],railBorderRadius:[String,Number],fillBorderRadius:[String,Number]},setup(r,{slots:e}){const p=P(()=>N(r.height)),u=P(()=>r.railBorderRadius!==void 0?N(r.railBorderRadius):r.height!==void 0?N(r.height,{c:.5}):""),c=P(()=>r.fillBorderRadius!==void 0?N(r.fillBorderRadius):r.railBorderRadius!==void 0?N(r.railBorderRadius):r.height!==void 0?N(r.height,{c:.5}):"");return()=>{const{indicatorPlacement:d,railColor:v,railStyle:f,percentage:t,unit:y,indicatorTextColor:g,status:x,showIndicator:b,fillColor:a,processing:C,clsPrefix:n}=r;return o("div",{class:`${n}-progress-content`,role:"none"},o("div",{class:`${n}-progress-graph`,"aria-hidden":!0},o("div",{class:[`${n}-progress-graph-line`,{[`${n}-progress-graph-line--indicator-${d}`]:!0}]},o("div",{class:`${n}-progress-graph-line-rail`,style:[{backgroundColor:v,height:p.value,borderRadius:u.value},f]},o("div",{class:[`${n}-progress-graph-line-fill`,C&&`${n}-progress-graph-line-fill--processing`],style:{maxWidth:`${r.percentage}%`,backgroundColor:a,height:p.value,lineHeight:p.value,borderRadius:c.value}},d==="inside"?o("div",{class:`${n}-progress-graph-line-indicator`},t,y):null)))),b&&d==="outside"?o("div",null,e.default?o("div",{class:`${n}-progress-custom-content`,style:{color:g},role:"none"},e.default()):x==="default"?o("div",{role:"none",class:`${n}-progress-icon ${n}-progress-icon--as-text`,style:{color:g}},t,y):o("div",{class:`${n}-progress-icon`,"aria-hidden":!0},o(E,{clsPrefix:n},{default:()=>Ce[x]}))):null)}}});const $e={success:o(H,null),error:o(X,null),warning:o(F,null),info:o(G,null)};var we=L({name:"ProgressCircle",props:{clsPrefix:{type:String,required:!0},status:{type:String,required:!0},strokeWidth:{type:Number,required:!0},fillColor:String,railColor:String,railStyle:[String,Object],percentage:{type:Number,default:0},offsetDegree:{type:Number,default:0},showIndicator:{type:Boolean,required:!0},indicatorTextColor:String,unit:String,viewBoxWidth:{type:Number,required:!0},gapDegree:{type:Number,required:!0},gapOffsetDegree:{type:Number,default:0}},setup(r,{slots:e}){function p(u,c,d){const{gapDegree:v,viewBoxWidth:f}=r,t=50,y=0,g=t,x=0,b=2*t,a=`M 55,55 m ${y},${g}
      a ${t},${t} 0 1 1 ${x},${-b}
      a ${t},${t} 0 1 1 ${-x},${b}`,C=Math.PI*2*t,n={stroke:d,strokeDasharray:`${u/100*(C-v)}px ${f*8}px`,strokeDashoffset:`-${v/2+Math.PI/3.6*c}px`};return{pathString:a,pathStyle:n}}return()=>{const{fillColor:u,railColor:c,strokeWidth:d,offsetDegree:v,status:f,percentage:t,showIndicator:y,indicatorTextColor:g,unit:x,gapOffsetDegree:b,clsPrefix:a}=r,{pathString:C,pathStyle:n}=p(100,0,c),{pathString:s,pathStyle:w}=p(t,v,u);return o("div",{class:`${a}-progress-content`,role:"none"},o("div",{class:`${a}-progress-graph`,"aria-hidden":!0},o("div",{class:`${a}-progress-graph-circle`,style:{transform:b?`rotate(${b}deg)`:void 0}},o("svg",{viewBox:"0 0 110 110"},o("g",null,o("path",{class:`${a}-progress-graph-circle-rail`,d:C,"stroke-width":d,"stroke-linecap":"round",fill:"none",style:n})),o("g",null,o("path",{class:[`${a}-progress-graph-circle-fill`,t===0&&`${a}-progress-graph-circle-fill--empty`],d:s,"stroke-width":d,"stroke-linecap":"round",fill:"none",style:w}))))),y?o("div",null,e.default?o("div",{class:`${a}-progress-custom-content`,role:"none"},e.default()):f!=="default"?o("div",{class:`${a}-progress-icon`,"aria-hidden":!0},o(E,{clsPrefix:a},{default:()=>$e[f]})):o("div",{class:`${a}-progress-text`,style:{color:g},role:"none"},o("span",{class:`${a}-progress-text__percentage`},t),o("span",{class:`${a}-progress-text__unit`},x))):null)}}});function A(r,e,p=100){return`m ${p/2} ${p/2-r} a ${r} ${r} 0 1 1 0 ${2*r} a ${r} ${r} 0 1 1 0 -${2*r}`}var ke=L({name:"ProgressMultipleCircle",props:{clsPrefix:{type:String,required:!0},viewBoxWidth:{type:Number,required:!0},percentage:{type:Array,default:[0]},strokeWidth:{type:Number,required:!0},circleGap:{type:Number,required:!0},showIndicator:{type:Boolean,required:!0},fillColor:{type:Array,default:()=>[]},railColor:{type:Array,default:()=>[]},railStyle:{type:Array,default:()=>[]}},setup(r,{slots:e}){const p=P(()=>r.percentage.map((c,d)=>`${Math.PI*c/100*(r.viewBoxWidth/2-r.strokeWidth/2*(1+2*d)-r.circleGap*d)*2}, ${r.viewBoxWidth*8}`));return()=>{const{viewBoxWidth:u,strokeWidth:c,circleGap:d,showIndicator:v,fillColor:f,railColor:t,railStyle:y,percentage:g,clsPrefix:x}=r;return o("div",{class:`${x}-progress-content`,role:"none"},o("div",{class:`${x}-progress-graph`,"aria-hidden":!0},o("div",{class:`${x}-progress-graph-circle`},o("svg",{viewBox:`0 0 ${u} ${u}`},g.map((b,a)=>o("g",{key:a},o("path",{class:`${x}-progress-graph-circle-rail`,d:A(u/2-c/2*(1+2*a)-d*a,c,u),"stroke-width":c,"stroke-linecap":"round",fill:"none",style:[{strokeDashoffset:0,stroke:t[a]},y[a]]}),o("path",{class:[`${x}-progress-graph-circle-fill`,b===0&&`${x}-progress-graph-circle-fill--empty`],d:A(u/2-c/2*(1+2*a)-d*a,c,u),"stroke-width":c,"stroke-linecap":"round",fill:"none",style:{strokeDasharray:p.value[a],strokeDashoffset:0,stroke:f[a]}})))))),v&&e.default?o("div",null,o("div",{class:`${x}-progress-text`},e.default())):null)}}});const Be=Object.assign(Object.assign({},V.props),{processing:Boolean,type:{type:String,default:"line"},gapDegree:Number,gapOffsetDegree:Number,status:{type:String,default:"default"},railColor:[String,Array],railStyle:[String,Array],color:[String,Array],viewBoxWidth:{type:Number,default:100},strokeWidth:{type:Number,default:7},percentage:[Number,Array],unit:{type:String,default:"%"},showIndicator:{type:Boolean,default:!0},indicatorPosition:{type:String,default:"outside"},indicatorPlacement:{type:String,default:"outside"},indicatorTextColor:String,circleGap:{type:Number,default:1},height:Number,borderRadius:[String,Number],fillBorderRadius:[String,Number],offsetDegree:Number});var Pe=L({name:"Progress",props:Be,setup(r){const e=P(()=>r.indicatorPlacement||r.indicatorPosition),p=P(()=>{if(r.gapDegree||r.gapDegree===0)return r.gapDegree;if(r.type==="dashboard")return 75}),{mergedClsPrefixRef:u,inlineThemeDisabled:c}=ne(r),d=V("Progress","-progress",be,_e,r,u),v=P(()=>{const{status:t}=r,{common:{cubicBezierEaseInOut:y},self:{fontSize:g,fontSizeCircle:x,railColor:b,railHeight:a,iconSizeCircle:C,iconSizeLine:n,textColorCircle:s,textColorLineInner:w,textColorLineOuter:k,lineBgProcessing:_,fontWeightCircle:I,[U("iconColor",t)]:S,[U("fillColor",t)]:$}}=d.value;return{"--n-bezier":y,"--n-fill-color":$,"--n-font-size":g,"--n-font-size-circle":x,"--n-font-weight-circle":I,"--n-icon-color":S,"--n-icon-size-circle":C,"--n-icon-size-line":n,"--n-line-bg-processing":_,"--n-rail-color":b,"--n-rail-height":a,"--n-text-color-circle":s,"--n-text-color-line-inner":w,"--n-text-color-line-outer":k}}),f=c?se("progress",P(()=>r.status[0]),v,r):void 0;return{mergedClsPrefix:u,mergedIndicatorPlacement:e,gapDeg:p,cssVars:c?void 0:v,themeClass:f==null?void 0:f.themeClass,onRender:f==null?void 0:f.onRender}},render(){const{type:r,cssVars:e,indicatorTextColor:p,showIndicator:u,status:c,railColor:d,railStyle:v,color:f,percentage:t,viewBoxWidth:y,strokeWidth:g,mergedIndicatorPlacement:x,unit:b,borderRadius:a,fillBorderRadius:C,height:n,processing:s,circleGap:w,mergedClsPrefix:k,gapDeg:_,gapOffsetDegree:I,themeClass:S,$slots:$,onRender:R}=this;return R==null||R(),o("div",{class:[S,`${k}-progress`,`${k}-progress--${r}`,`${k}-progress--${c}`],style:e,"aria-valuemax":100,"aria-valuemin":0,"aria-valuenow":t,role:r==="circle"||r==="line"||r==="dashboard"?"progressbar":"none"},r==="circle"||r==="dashboard"?o(we,{clsPrefix:k,status:c,showIndicator:u,indicatorTextColor:p,railColor:d,fillColor:f,railStyle:v,offsetDegree:this.offsetDegree,percentage:t,viewBoxWidth:y,strokeWidth:g,gapDegree:_===void 0?r==="dashboard"?75:0:_,gapOffsetDegree:I,unit:b},$):r==="line"?o(Se,{clsPrefix:k,status:c,showIndicator:u,indicatorTextColor:p,railColor:d,fillColor:f,railStyle:v,percentage:t,processing:s,indicatorPlacement:x,unit:b,fillBorderRadius:C,railBorderRadius:a,height:n},$):r==="multiple-circle"?o(ke,{clsPrefix:k,strokeWidth:g,railColor:d,fillColor:f,railStyle:v,viewBoxWidth:y,percentage:t,showIndicator:u,circleGap:w},$):null)}});const j=window._;class ze{constructor(e){this.adapter=e,this.address="60",this.xtal=32768,this.pplOffset=225e3,this.configs={muted:!1,searchMode:!1,ppl:11e3,searchUp:!0,searchStopLevel:2,hlsi:!1,mono:!1,muteRight:!1,muteLeft:!1,standBy:!1,bl:0,xtal:!0,softMute:!1,highCutControl:!1,stereoNoiseCancelling:!1,pllref:!1,dtc:!1}}get adjustables(){return j.omit(this.configs,"ppl","searchMode","searchUp")}async adjust(e){return j.assign(this.configs,e),this.setConfigs()}async searchNext(e){return this.configs.searchMode=!0,this.configs.searchUp=e,this.configs.ppl+=e?10:-10,await this.setConfigs(),this.configs.searchMode=!1,await Z(500),this.getStates()}async setConfigs(){const e=[0,0,0,0,0];return e[0]=this.configs.ppl>>8&63,e[1]=this.configs.ppl&255,e[0]|=this.configs.muted?128:0,e[0]|=this.configs.searchMode?64:0,e[2]|=this.configs.searchUp?128:0,e[2]|=this.configs.searchStopLevel<<5,e[2]|=this.configs.hlsi?16:0,e[2]|=this.configs.mono?8:0,e[2]|=this.configs.muteRight?4:0,e[2]|=this.configs.muteLeft?2:0,e[3]|=this.configs.standBy?64:0,e[3]|=this.configs.bl?32:0,e[3]|=this.configs.xtal?16:0,e[3]|=this.configs.softMute?8:0,e[3]|=this.configs.highCutControl?4:0,e[3]|=this.configs.stereoNoiseCancelling?2:0,e[4]|=this.configs.pllref?128:0,e[4]|=this.configs.dtc?64:0,this.adapter.transmit(`AT+TX=${this.address}${e.map(Q).join("")}`)}get frequence(){return this.configs.ppl*this.xtal/4+this.pplOffset}get frequenceRange(){return this.configs.bl?[76e6,91e6]:[875e5,108e6]}async setFrequence(e){const[p,u]=this.frequenceRange;if(e<p||e>u)throw new Error("frequence out of range");return this.configs.ppl=parseInt((e-this.pplOffset)*4/this.xtal,10),this.setConfigs()}async getStates(){const e=await this.adapter.transmit(`AT+TR=${this.address}05`).then(Array.from),p=((e[0]&63)<<8)+e[1];return this.configs.ppl=p,{isReady:!!(e[0]&128),isBandLimitReached:!!(e[0]&64),ppl:p,isStereo:!!(e[2]&128),ifCounter:e[2]&127,level:e[3]>>4}}}const Re=B("Disconnect"),Ne=B("Connect"),qe=B("Prev"),De=B("Next"),Ie=B("5"),Me=B("7"),Le=B("10"),We=B("Japanese: 76 - 91 MHz"),Te=B("US/Europe: 87.5 - 108 MHz"),Oe={name:"DeviceTea5767"},D=window._,Ve=Object.assign(Oe,{setup(r){const e=ge(),{openPort:p,transmit:u}=ae("sp"),c=q(),d=q(),v=q(87.5),f=q(!1),t=q({}),y=q({}),g=new ze({transmit:u});t.value=g.adjustables,[c.value,d.value]=g.frequenceRange.map(n=>n/1e6),v.value=D.round(g.frequence/1e6,3);const x=P(()=>D.keyBy(D.range(D.ceil(c.value),d.value+1))),b=async()=>{try{await p();const n=await u("AT+SC");if(!Array.from(n).includes(parseInt(g.address,16)))throw new Error(`TEA5767 at adrress 0x${g.address} NOT Found`);y.value=await g.getStates(),f.value=!0}catch(n){e.error(n.message)}},a=async n=>{v.value=n,g.setFrequence(n*1e6),y.value=await g.getStates()},C=async n=>{y.value=await g.searchNext(n),v.value=D.round(g.frequence/1e6,3)};return le([()=>t.value.standBy,()=>t.value.muted,()=>t.value.mono,()=>t.value.muteLeft,()=>t.value.muteRight,()=>t.value.softMute,()=>t.value.highCutControl,()=>t.value.stereoNoiseCancelling,()=>t.value.bl],async()=>{await g.adjust(D.omit(t.value,"ppl")),y.value=await g.getStates(),[c.value,d.value]=g.frequenceRange.map(n=>n/1e6)}),(n,s)=>{const w=de,k=ee,_=re,I=Pe,S=oe,$=fe,R=ve,O=he,Y=me,J=te,K=pe;return W(),T(K,null,{default:l(()=>[f.value?(W(),T(w,{key:0,type:"warning",onClick:s[0]||(s[0]=h=>{f.value=!1})},{default:l(()=>[Re]),_:1})):(W(),T(w,{key:1,type:"primary",onClick:b},{default:l(()=>[Ne]),_:1})),i(J,{model:t.value,"label-placement":"left",style:{"margin-top":"1em"},disabled:!f.value},{default:l(()=>[i(Y,{cols:24,"x-gap":24},{default:l(()=>[i(_,{span:22,label:"Frequence (MHz)"},{default:l(()=>[i(k,{value:v.value,"onUpdate:value":s[1]||(s[1]=h=>v.value=h),step:.1,min:c.value,max:d.value,"on-update:value":a,marks:ce(x),"show-tooltip":!0},null,8,["value","step","min","max","marks"])]),_:1}),i(_,{span:2},{default:l(()=>[i(w,{onClick:s[2]||(s[2]=h=>{C(!1)})},{default:l(()=>[qe]),_:1}),i(w,{onClick:s[3]||(s[3]=h=>{C(!0)})},{default:l(()=>[De]),_:1})]),_:1}),i(_,{span:24,label:"Singal Level"},{default:l(()=>[i(I,{type:"line",percentage:100*y.value.level/15},{default:l(()=>[B(ue(y.value.level),1)]),_:1},8,["percentage"])]),_:1}),i(_,{span:4,label:"standBy"},{default:l(()=>[i(S,{value:t.value.standBy,"onUpdate:value":s[4]||(s[4]=h=>t.value.standBy=h)},null,8,["value"])]),_:1}),i(_,{span:4,label:"Muted"},{default:l(()=>[i(S,{value:t.value.muted,"onUpdate:value":s[5]||(s[5]=h=>t.value.muted=h)},null,8,["value"])]),_:1}),i(_,{span:4,label:"Mono"},{default:l(()=>[i(S,{value:t.value.mono,"onUpdate:value":s[6]||(s[6]=h=>t.value.mono=h)},null,8,["value"])]),_:1}),i(_,{span:4,label:"Mute Left"},{default:l(()=>[i(S,{value:t.value.muteLeft,"onUpdate:value":s[7]||(s[7]=h=>t.value.muteLeft=h)},null,8,["value"])]),_:1}),i(_,{span:4,label:"Mute Right"},{default:l(()=>[i(S,{value:t.value.muteRight,"onUpdate:value":s[8]||(s[8]=h=>t.value.muteRight=h)},null,8,["value"])]),_:1}),i(_,{span:4,label:"Soft Mute "},{default:l(()=>[i(S,{value:t.value.softMute,"onUpdate:value":s[9]||(s[9]=h=>t.value.softMute=h)},null,8,["value"])]),_:1}),i(_,{span:4,label:"High Cut Control"},{default:l(()=>[i(S,{value:t.value.highCutControl,"onUpdate:value":s[10]||(s[10]=h=>t.value.highCutControl=h)},null,8,["value"])]),_:1}),i(_,{span:4,label:"Stereo Noise Cancelling"},{default:l(()=>[i(S,{value:t.value.stereoNoiseCancelling,"onUpdate:value":s[11]||(s[11]=h=>t.value.stereoNoiseCancelling=h)},null,8,["value"])]),_:1}),i(_,{span:8,label:"Search Stop Level"},{default:l(()=>[i(O,{value:t.value.searchStopLevel,"onUpdate:value":s[12]||(s[12]=h=>t.value.searchStopLevel=h)},{default:l(()=>[i(R,null,{default:l(()=>[i($,{value:1},{default:l(()=>[Ie]),_:1}),i($,{value:2},{default:l(()=>[Me]),_:1}),i($,{value:3},{default:l(()=>[Le]),_:1})]),_:1})]),_:1},8,["value"])]),_:1}),i(_,{span:8,label:"Band"},{default:l(()=>[i(O,{value:t.value.bl,"onUpdate:value":s[13]||(s[13]=h=>t.value.bl=h)},{default:l(()=>[i(R,null,{default:l(()=>[i($,{value:1},{default:l(()=>[We]),_:1}),i($,{value:0},{default:l(()=>[Te]),_:1})]),_:1})]),_:1},8,["value"])]),_:1})]),_:1})]),_:1},8,["model","disabled"])]),_:1})}}});export{Ve as default};
