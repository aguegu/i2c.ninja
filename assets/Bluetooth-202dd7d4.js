import{c as te,a as T,b as B,d as a,e as u,f as K,g as re,h as C,i as Q,u as X,j as Y,k as ne,l as U,m as se,n as w,o as ie,r as P,p as f,q as ae,N as le,s as ce,t as de,E as ue,W as pe,I as me,S as fe,v as ge,w as be,x as he,y as ve,z as _e,A as Ce,B as H,C as W,D as v,F as E,G as J,H as G,J as M,K as Z,L as xe,_ as ye,M as Ie,O as we,P as ze,Q as Se,R as Pe}from"./index-4aea67d9.js";import{_ as V}from"./lodash-0e0768ac.js";import{f as $e,_ as Re,b as Te}from"./index-32b90afc.js";import{_ as ee}from"./Space-f2e62416.js";const Be={iconMargin:"11px 8px 0 12px",iconMarginRtl:"11px 12px 0 8px",iconSize:"24px",closeIconSize:"16px",closeSize:"20px",closeMargin:"13px 14px 0 0",closeMarginRtl:"13px 0 0 14px",padding:"13px"},Ee=t=>{const{lineHeight:e,borderRadius:g,fontWeightStrong:x,baseColor:s,dividerColor:l,actionColor:$,textColor1:i,textColor2:r,closeColorHover:b,closeColorPressed:c,closeIconColor:y,closeIconColorHover:z,closeIconColorPressed:n,infoColor:o,successColor:k,warningColor:p,errorColor:R,fontSize:A}=t;return Object.assign(Object.assign({},Be),{fontSize:A,lineHeight:e,titleFontWeight:x,borderRadius:g,border:`1px solid ${l}`,color:$,titleTextColor:i,iconColor:r,contentTextColor:r,closeBorderRadius:g,closeColorHover:b,closeColorPressed:c,closeIconColor:y,closeIconColorHover:z,closeIconColorPressed:n,borderInfo:`1px solid ${T(s,B(o,{alpha:.25}))}`,colorInfo:T(s,B(o,{alpha:.08})),titleTextColorInfo:i,iconColorInfo:o,contentTextColorInfo:r,closeColorHoverInfo:b,closeColorPressedInfo:c,closeIconColorInfo:y,closeIconColorHoverInfo:z,closeIconColorPressedInfo:n,borderSuccess:`1px solid ${T(s,B(k,{alpha:.25}))}`,colorSuccess:T(s,B(k,{alpha:.08})),titleTextColorSuccess:i,iconColorSuccess:k,contentTextColorSuccess:r,closeColorHoverSuccess:b,closeColorPressedSuccess:c,closeIconColorSuccess:y,closeIconColorHoverSuccess:z,closeIconColorPressedSuccess:n,borderWarning:`1px solid ${T(s,B(p,{alpha:.33}))}`,colorWarning:T(s,B(p,{alpha:.08})),titleTextColorWarning:i,iconColorWarning:p,contentTextColorWarning:r,closeColorHoverWarning:b,closeColorPressedWarning:c,closeIconColorWarning:y,closeIconColorHoverWarning:z,closeIconColorPressedWarning:n,borderError:`1px solid ${T(s,B(R,{alpha:.25}))}`,colorError:T(s,B(R,{alpha:.08})),titleTextColorError:i,iconColorError:R,contentTextColorError:r,closeColorHoverError:b,closeColorPressedError:c,closeIconColorError:y,closeIconColorHoverError:z,closeIconColorPressedError:n})},ke={name:"Alert",common:te,self:Ee},Ae=ke,He=a("alert",`
 line-height: var(--n-line-height);
 border-radius: var(--n-border-radius);
 position: relative;
 transition: background-color .3s var(--n-bezier);
 background-color: var(--n-color);
 text-align: start;
 word-break: break-word;
`,[u("border",`
 border-radius: inherit;
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 transition: border-color .3s var(--n-bezier);
 border: var(--n-border);
 pointer-events: none;
 `),K("closable",[a("alert-body",[u("title",`
 padding-right: 24px;
 `)])]),u("icon",{color:"var(--n-icon-color)"}),a("alert-body",{padding:"var(--n-padding)"},[u("title",{color:"var(--n-title-text-color)"}),u("content",{color:"var(--n-content-text-color)"})]),re({originalTransition:"transform .3s var(--n-bezier)",enterToProps:{transform:"scale(1)"},leaveToProps:{transform:"scale(0.9)"}}),u("icon",`
 position: absolute;
 left: 0;
 top: 0;
 align-items: center;
 justify-content: center;
 display: flex;
 width: var(--n-icon-size);
 height: var(--n-icon-size);
 font-size: var(--n-icon-size);
 margin: var(--n-icon-margin);
 `),u("close",`
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier);
 position: absolute;
 right: 0;
 top: 0;
 margin: var(--n-close-margin);
 `),K("show-icon",[a("alert-body",{paddingLeft:"calc(var(--n-icon-margin-left) + var(--n-icon-size) + var(--n-icon-margin-right))"})]),K("right-adjust",[a("alert-body",{paddingRight:"calc(var(--n-close-size) + var(--n-padding) + 2px)"})]),a("alert-body",`
 border-radius: var(--n-border-radius);
 transition: border-color .3s var(--n-bezier);
 `,[u("title",`
 transition: color .3s var(--n-bezier);
 font-size: 16px;
 line-height: 19px;
 font-weight: var(--n-title-font-weight);
 `,[C("& +",[u("content",{marginTop:"9px"})])]),u("content",{transition:"color .3s var(--n-bezier)",fontSize:"var(--n-font-size)"})]),u("icon",{transition:"color .3s var(--n-bezier)"})]),We=Object.assign(Object.assign({},Y.props),{title:String,showIcon:{type:Boolean,default:!0},type:{type:String,default:"default"},bordered:{type:Boolean,default:!0},closable:Boolean,onClose:Function,onAfterLeave:Function,onAfterHide:Function}),Me=Q({name:"Alert",inheritAttrs:!1,props:We,setup(t){const{mergedClsPrefixRef:e,mergedBorderedRef:g,inlineThemeDisabled:x,mergedRtlRef:s}=X(t),l=Y("Alert","-alert",He,Ae,t,e),$=ne("Alert",s,e),i=U(()=>{const{common:{cubicBezierEaseInOut:n},self:o}=l.value,{fontSize:k,borderRadius:p,titleFontWeight:R,lineHeight:A,iconSize:F,iconMargin:N,iconMarginRtl:D,closeIconSize:O,closeBorderRadius:I,closeSize:d,closeMargin:h,closeMarginRtl:_,padding:S}=o,{type:m}=t,{left:L,right:q}=se(N);return{"--n-bezier":n,"--n-color":o[w("color",m)],"--n-close-icon-size":O,"--n-close-border-radius":I,"--n-close-color-hover":o[w("closeColorHover",m)],"--n-close-color-pressed":o[w("closeColorPressed",m)],"--n-close-icon-color":o[w("closeIconColor",m)],"--n-close-icon-color-hover":o[w("closeIconColorHover",m)],"--n-close-icon-color-pressed":o[w("closeIconColorPressed",m)],"--n-icon-color":o[w("iconColor",m)],"--n-border":o[w("border",m)],"--n-title-text-color":o[w("titleTextColor",m)],"--n-content-text-color":o[w("contentTextColor",m)],"--n-line-height":A,"--n-border-radius":p,"--n-font-size":k,"--n-title-font-weight":R,"--n-icon-size":F,"--n-icon-margin":N,"--n-icon-margin-rtl":D,"--n-close-size":d,"--n-close-margin":h,"--n-close-margin-rtl":_,"--n-padding":S,"--n-icon-margin-left":L,"--n-icon-margin-right":q}}),r=x?ie("alert",U(()=>t.type[0]),i,t):void 0,b=P(!0),c=()=>{const{onAfterLeave:n,onAfterHide:o}=t;n&&n(),o&&o()};return{rtlEnabled:$,mergedClsPrefix:e,mergedBordered:g,visible:b,handleCloseClick:()=>{var n;Promise.resolve((n=t.onClose)===null||n===void 0?void 0:n.call(t)).then(o=>{o!==!1&&(b.value=!1)})},handleAfterLeave:()=>{c()},mergedTheme:l,cssVars:x?void 0:i,themeClass:r==null?void 0:r.themeClass,onRender:r==null?void 0:r.onRender}},render(){var t;return(t=this.onRender)===null||t===void 0||t.call(this),f(be,{onAfterLeave:this.handleAfterLeave},{default:()=>{const{mergedClsPrefix:e,$slots:g}=this,x={class:[`${e}-alert`,this.themeClass,this.closable&&`${e}-alert--closable`,this.showIcon&&`${e}-alert--show-icon`,!this.title&&this.closable&&`${e}-alert--right-adjust`,this.rtlEnabled&&`${e}-alert--rtl`],style:this.cssVars,role:"alert"};return this.visible?f("div",Object.assign({},ae(this.$attrs,x)),this.closable&&f(le,{clsPrefix:e,class:`${e}-alert__close`,onClick:this.handleCloseClick}),this.bordered&&f("div",{class:`${e}-alert__border`}),this.showIcon&&f("div",{class:`${e}-alert__icon`,"aria-hidden":"true"},ce(g.icon,()=>[f(de,{clsPrefix:e},{default:()=>{switch(this.type){case"success":return f(fe,null);case"info":return f(me,null);case"warning":return f(pe,null);case"error":return f(ue,null);default:return null}}})])),f("div",{class:[`${e}-alert-body`,this.mergedBordered&&`${e}-alert-body--bordered`]},ge(g.header,s=>{const l=s||this.title;return l?f("div",{class:`${e}-alert-body__title`},l):null}),g.default&&f("div",{class:`${e}-alert-body__content`},g))):null}})}}),Le=a("input-group",`
 display: inline-flex;
 width: 100%;
 flex-wrap: nowrap;
 vertical-align: bottom;
`,[C(">",[a("input",[C("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),C("&:not(:first-child)",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 margin-left: -1px!important;
 `)]),a("button",[C("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `,[u("state-border, border",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `)]),C("&:not(:first-child)",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `,[u("state-border, border",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `)])]),C("*",[C("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `,[C(">",[a("input",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),a("base-selection",[a("base-selection-label",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),a("base-selection-tags",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),u("box-shadow, border, state-border",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `)])])]),C("&:not(:first-child)",`
 margin-left: -1px!important;
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `,[C(">",[a("input",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),a("base-selection",[a("base-selection-label",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),a("base-selection-tags",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),u("box-shadow, border, state-border",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `)])])])])])]),Oe={},Ne=Q({name:"InputGroup",props:Oe,setup(t){const{mergedClsPrefixRef:e}=X(t);return he("-input-group",Le,e),{mergedClsPrefix:e}},render(){const{mergedClsPrefix:t}=this;return f("div",{class:`${t}-input-group`},this.$slots)}}),je=Z("a",{href:"https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API",class:"warning--text"},"Web Bluetooth API",-1),Ve=["value"],Fe={name:"ModalBluetooth"},De=Object.assign(Fe,{setup(t,{expose:e}){const g="0000fff0-0000-1000-8000-00805f9b34fb",x=P(!1),s=P(!1),l=P(navigator.userAgent),$=P(!1),i=P(""),r=ve(),b=P(null);let c=null,y=null,z=null,n=null;const o=new TextDecoder,k=new TextEncoder,p=P({com:{tx:"",rx:"",tail:`\r
`}});_e(async()=>{x.value=!navigator.bluetooth,s.value||(s.value=await navigator.bluetooth.getAvailability())});const R=async()=>{c||(c=await navigator.bluetooth.requestDevice({filters:[{namePrefix:"CH9141"}],optionalServices:[g]}),console.log(c),i.value=c.name),y=await c.gatt.connect(),$.value=!0;const I=await y.getPrimaryService(g),d=await I.getCharacteristics();n=await I.getCharacteristic(V.chain(d).find(({properties:h})=>V.isMatch(h,{notify:!0,write:!1})).get("uuid").value()),z=await I.getCharacteristic(V.chain(d).find(({properties:h})=>V.isMatch(h,{notify:!1,write:!0})).get("uuid").value()),await n.startNotifications(),n.addEventListener("characteristicvaluechanged",h=>{const _=o.decode(h.target.value);r.emit("rx",_),p.value.com.rx+=_})},A=async()=>{await n.stopNotifications(),i.value="",y.disconnect(),$.value=!1},F=async()=>{A(),c.forget(),c=null},N=I=>new Promise((d,h)=>{let _="";const S=m=>{if(_+=m,ze().then(()=>{b.value.scrollTop=b.value.scrollHeight}),_.indexOf(`\r
OK\r
`)>-1||_.indexOf(`\r
ERROR\r
`)>-1){r.off("rx",S);const L=_.split(`\r
`);d(Te.Buffer.from(L[L.length-3],"hex"))}};r.on("rx",S),z.writeValueWithoutResponse(k.encode(I+p.value.com.tail)).catch(h)}),D=$e.promise(N,1),O=I=>D.push(I);return Ce(()=>{c&&$.value&&A()}),e({connect:R,transmit:O,disconnect:A}),(I,d)=>{const h=Me,_=ye,S=Ie,m=Re,L=Ne,q=ee,oe=we;return H(),W(oe,{title:"Bluetooth",bordered:!1},{"header-extra":v(()=>[i.value?(H(),W(_,{key:0,style:{"margin-right":"1em"}},{default:v(()=>[E(J(i.value),1)]),_:1})):G("",!0),M(S,{onClick:d[0]||(d[0]=j=>{p.value.com.rx=""}),style:{"margin-right":"1em"}},{default:v(()=>[E("Clear")]),_:1}),i.value?(H(),W(S,{key:1,type:"warning",onClick:F},{default:v(()=>[E("Forget Device")]),_:1})):(H(),W(S,{key:2,type:"primary",onClick:R},{default:v(()=>[E("Request Bluetooth Device")]),_:1}))]),default:v(()=>[x.value?(H(),W(h,{key:0,title:"Error",type:"error"},{default:v(()=>[E(' This browser "'+J(l.value)+'" does not support ',1),je,E(" yet. See also this [Guide](https://developer.chrome.com/articles/bluetooth/) ")]),_:1})):G("",!0),s.value?G("",!0):(H(),W(h,{key:1,title:"Error",type:"error"},{default:v(()=>[E(" No Bluetooth Adapter Found ")]),_:1})),M(q,{vertical:""},{default:v(()=>[Z("textarea",{ref_key:"com",ref:b,value:p.value.com.rx,rows:"6",readonly:"",style:{width:"100%",border:"solid 1px #ccc"}},null,8,Ve),M(L,null,{default:v(()=>[M(m,{value:p.value.com.tx,"onUpdate:value":d[1]||(d[1]=j=>p.value.com.tx=j),type:"text",placeholder:"TX: press Enter to send",clearable:"",disabled:!i.value,onKeyup:d[2]||(d[2]=xe(j=>O(p.value.com.tx),["enter"]))},null,8,["value","disabled"]),M(S,{type:"primary",onClick:d[3]||(d[3]=j=>O(p.value.com.tx))},{default:v(()=>[E("Send")]),_:1})]),_:1})]),_:1})]),_:1})}}}),qe={name:"ViewBluetooth"},Qe=Object.assign(qe,{setup(t){const e=P(null);return Se("adapter",{transmit:(...l)=>e.value.transmit(...l),connect:(...l)=>e.value.connect(...l),disconnect:(...l)=>e.value.disconnect(...l)}),(l,$)=>{const i=Pe("router-view"),r=ee;return H(),W(r,{vertical:""},{default:v(()=>[M(i),M(De,{ref_key:"ble",ref:e},null,512)]),_:1})}}});export{Qe as default};
