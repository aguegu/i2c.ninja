import{c as te,a as T,b as E,d as i,e as u,f as G,g as re,h as x,i as Q,u as X,j as Y,k as ne,l as J,m as se,n as w,o as ae,r as P,p as b,q as ie,N as le,s as ce,t as de,E as ue,W as pe,I as me,S as fe,v as be,w as ge,x as he,y as ve,z as _e,A as Ce,B as H,C as W,D as _,F as B,G as N,H as U,J as M,K as Z,L as xe,_ as ye,M as Ie,O as we,P as $e,Q as ze,R as Pe}from"./index-CPfc8qSv.js";import{_ as F}from"./lodash-B4X47Vf9.js";import{f as Se,_ as Re,b as Te}from"./index-62M7H1f4.js";import{_ as ee}from"./Space-BaYJkXh7.js";const Ee={iconMargin:"11px 8px 0 12px",iconMarginRtl:"11px 12px 0 8px",iconSize:"24px",closeIconSize:"16px",closeSize:"20px",closeMargin:"13px 14px 0 0",closeMarginRtl:"13px 0 0 14px",padding:"13px"},Be=t=>{const{lineHeight:e,borderRadius:g,fontWeightStrong:y,baseColor:s,dividerColor:l,actionColor:S,textColor1:a,textColor2:r,closeColorHover:h,closeColorPressed:c,closeIconColor:I,closeIconColorHover:$,closeIconColorPressed:n,infoColor:o,successColor:k,warningColor:p,errorColor:R,fontSize:A}=t;return Object.assign(Object.assign({},Ee),{fontSize:A,lineHeight:e,titleFontWeight:y,borderRadius:g,border:`1px solid ${l}`,color:S,titleTextColor:a,iconColor:r,contentTextColor:r,closeBorderRadius:g,closeColorHover:h,closeColorPressed:c,closeIconColor:I,closeIconColorHover:$,closeIconColorPressed:n,borderInfo:`1px solid ${T(s,E(o,{alpha:.25}))}`,colorInfo:T(s,E(o,{alpha:.08})),titleTextColorInfo:a,iconColorInfo:o,contentTextColorInfo:r,closeColorHoverInfo:h,closeColorPressedInfo:c,closeIconColorInfo:I,closeIconColorHoverInfo:$,closeIconColorPressedInfo:n,borderSuccess:`1px solid ${T(s,E(k,{alpha:.25}))}`,colorSuccess:T(s,E(k,{alpha:.08})),titleTextColorSuccess:a,iconColorSuccess:k,contentTextColorSuccess:r,closeColorHoverSuccess:h,closeColorPressedSuccess:c,closeIconColorSuccess:I,closeIconColorHoverSuccess:$,closeIconColorPressedSuccess:n,borderWarning:`1px solid ${T(s,E(p,{alpha:.33}))}`,colorWarning:T(s,E(p,{alpha:.08})),titleTextColorWarning:a,iconColorWarning:p,contentTextColorWarning:r,closeColorHoverWarning:h,closeColorPressedWarning:c,closeIconColorWarning:I,closeIconColorHoverWarning:$,closeIconColorPressedWarning:n,borderError:`1px solid ${T(s,E(R,{alpha:.25}))}`,colorError:T(s,E(R,{alpha:.08})),titleTextColorError:a,iconColorError:R,contentTextColorError:r,closeColorHoverError:h,closeColorPressedError:c,closeIconColorError:I,closeIconColorHoverError:$,closeIconColorPressedError:n})},ke={name:"Alert",common:te,self:Be},Ae=ke,He=i("alert",`
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
 `),G("closable",[i("alert-body",[u("title",`
 padding-right: 24px;
 `)])]),u("icon",{color:"var(--n-icon-color)"}),i("alert-body",{padding:"var(--n-padding)"},[u("title",{color:"var(--n-title-text-color)"}),u("content",{color:"var(--n-content-text-color)"})]),re({originalTransition:"transform .3s var(--n-bezier)",enterToProps:{transform:"scale(1)"},leaveToProps:{transform:"scale(0.9)"}}),u("icon",`
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
 `),G("show-icon",[i("alert-body",{paddingLeft:"calc(var(--n-icon-margin-left) + var(--n-icon-size) + var(--n-icon-margin-right))"})]),G("right-adjust",[i("alert-body",{paddingRight:"calc(var(--n-close-size) + var(--n-padding) + 2px)"})]),i("alert-body",`
 border-radius: var(--n-border-radius);
 transition: border-color .3s var(--n-bezier);
 `,[u("title",`
 transition: color .3s var(--n-bezier);
 font-size: 16px;
 line-height: 19px;
 font-weight: var(--n-title-font-weight);
 `,[x("& +",[u("content",{marginTop:"9px"})])]),u("content",{transition:"color .3s var(--n-bezier)",fontSize:"var(--n-font-size)"})]),u("icon",{transition:"color .3s var(--n-bezier)"})]),We=Object.assign(Object.assign({},Y.props),{title:String,showIcon:{type:Boolean,default:!0},type:{type:String,default:"default"},bordered:{type:Boolean,default:!0},closable:Boolean,onClose:Function,onAfterLeave:Function,onAfterHide:Function}),Me=Q({name:"Alert",inheritAttrs:!1,props:We,setup(t){const{mergedClsPrefixRef:e,mergedBorderedRef:g,inlineThemeDisabled:y,mergedRtlRef:s}=X(t),l=Y("Alert","-alert",He,Ae,t,e),S=ne("Alert",s,e),a=J(()=>{const{common:{cubicBezierEaseInOut:n},self:o}=l.value,{fontSize:k,borderRadius:p,titleFontWeight:R,lineHeight:A,iconSize:D,iconMargin:j,iconMarginRtl:q,closeIconSize:O,closeBorderRadius:m,closeSize:d,closeMargin:v,closeMarginRtl:C,padding:z}=o,{type:f}=t,{left:L,right:K}=se(j);return{"--n-bezier":n,"--n-color":o[w("color",f)],"--n-close-icon-size":O,"--n-close-border-radius":m,"--n-close-color-hover":o[w("closeColorHover",f)],"--n-close-color-pressed":o[w("closeColorPressed",f)],"--n-close-icon-color":o[w("closeIconColor",f)],"--n-close-icon-color-hover":o[w("closeIconColorHover",f)],"--n-close-icon-color-pressed":o[w("closeIconColorPressed",f)],"--n-icon-color":o[w("iconColor",f)],"--n-border":o[w("border",f)],"--n-title-text-color":o[w("titleTextColor",f)],"--n-content-text-color":o[w("contentTextColor",f)],"--n-line-height":A,"--n-border-radius":p,"--n-font-size":k,"--n-title-font-weight":R,"--n-icon-size":D,"--n-icon-margin":j,"--n-icon-margin-rtl":q,"--n-close-size":d,"--n-close-margin":v,"--n-close-margin-rtl":C,"--n-padding":z,"--n-icon-margin-left":L,"--n-icon-margin-right":K}}),r=y?ae("alert",J(()=>t.type[0]),a,t):void 0,h=P(!0),c=()=>{const{onAfterLeave:n,onAfterHide:o}=t;n&&n(),o&&o()};return{rtlEnabled:S,mergedClsPrefix:e,mergedBordered:g,visible:h,handleCloseClick:()=>{var n;Promise.resolve((n=t.onClose)===null||n===void 0?void 0:n.call(t)).then(o=>{o!==!1&&(h.value=!1)})},handleAfterLeave:()=>{c()},mergedTheme:l,cssVars:y?void 0:a,themeClass:r==null?void 0:r.themeClass,onRender:r==null?void 0:r.onRender}},render(){var t;return(t=this.onRender)===null||t===void 0||t.call(this),b(ge,{onAfterLeave:this.handleAfterLeave},{default:()=>{const{mergedClsPrefix:e,$slots:g}=this,y={class:[`${e}-alert`,this.themeClass,this.closable&&`${e}-alert--closable`,this.showIcon&&`${e}-alert--show-icon`,!this.title&&this.closable&&`${e}-alert--right-adjust`,this.rtlEnabled&&`${e}-alert--rtl`],style:this.cssVars,role:"alert"};return this.visible?b("div",Object.assign({},ie(this.$attrs,y)),this.closable&&b(le,{clsPrefix:e,class:`${e}-alert__close`,onClick:this.handleCloseClick}),this.bordered&&b("div",{class:`${e}-alert__border`}),this.showIcon&&b("div",{class:`${e}-alert__icon`,"aria-hidden":"true"},ce(g.icon,()=>[b(de,{clsPrefix:e},{default:()=>{switch(this.type){case"success":return b(fe,null);case"info":return b(me,null);case"warning":return b(pe,null);case"error":return b(ue,null);default:return null}}})])),b("div",{class:[`${e}-alert-body`,this.mergedBordered&&`${e}-alert-body--bordered`]},be(g.header,s=>{const l=s||this.title;return l?b("div",{class:`${e}-alert-body__title`},l):null}),g.default&&b("div",{class:`${e}-alert-body__content`},g))):null}})}}),Le=i("input-group",`
 display: inline-flex;
 width: 100%;
 flex-wrap: nowrap;
 vertical-align: bottom;
`,[x(">",[i("input",[x("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),x("&:not(:first-child)",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 margin-left: -1px!important;
 `)]),i("button",[x("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `,[u("state-border, border",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `)]),x("&:not(:first-child)",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `,[u("state-border, border",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `)])]),x("*",[x("&:not(:last-child)",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `,[x(">",[i("input",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),i("base-selection",[i("base-selection-label",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),i("base-selection-tags",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `),u("box-shadow, border, state-border",`
 border-top-right-radius: 0!important;
 border-bottom-right-radius: 0!important;
 `)])])]),x("&:not(:first-child)",`
 margin-left: -1px!important;
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `,[x(">",[i("input",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),i("base-selection",[i("base-selection-label",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),i("base-selection-tags",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `),u("box-shadow, border, state-border",`
 border-top-left-radius: 0!important;
 border-bottom-left-radius: 0!important;
 `)])])])])])]),Oe={},Ne=Q({name:"InputGroup",props:Oe,setup(t){const{mergedClsPrefixRef:e}=X(t);return he("-input-group",Le,e),{mergedClsPrefix:e}},render(){const{mergedClsPrefix:t}=this;return b("div",{class:`${t}-input-group`},this.$slots)}}),je=Z("a",{href:"https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API",class:"warning--text"},"Web Bluetooth API",-1),Ve=["value"],Fe={name:"ModalBluetooth"},De=Object.assign(Fe,{setup(t,{expose:e}){const g="0000fff0-0000-1000-8000-00805f9b34fb",y=P(!1),s=P(!1),l=P(navigator.userAgent),S=P(!1),a=P(""),r=ve(),h=P(null);let c=null,I=null,$=null,n=null;const o=new TextDecoder,k=new TextEncoder,p=P({com:{tx:"",rx:"",tail:`\r
`}});_e(async()=>{y.value=!navigator.bluetooth,s.value||(s.value=await navigator.bluetooth.getAvailability())});const R=async()=>{c||(c=await navigator.bluetooth.requestDevice({filters:[{namePrefix:"CH9141"}],optionalServices:[g]}),console.log(c),a.value=c.name),I=await c.gatt.connect(),S.value=!0;const m=await I.getPrimaryService(g),d=await m.getCharacteristics();n=await m.getCharacteristic(F.chain(d).find(({properties:v})=>F.isMatch(v,{notify:!0,write:!1})).get("uuid").value()),$=await m.getCharacteristic(F.chain(d).find(({properties:v})=>F.isMatch(v,{notify:!1,write:!0})).get("uuid").value()),await n.startNotifications(),n.addEventListener("characteristicvaluechanged",v=>{const C=o.decode(v.target.value);r.emit("rx",C),p.value.com.rx+=C})},A=async()=>{await n.stopNotifications(),a.value="",I.disconnect(),S.value=!1},D=async()=>{A(),c.forget(),c=null},j=m=>new Promise((d,v)=>{let C="";const z=f=>{if(C+=f,$e().then(()=>{h.value.scrollTop=h.value.scrollHeight}),C.indexOf(`\r
OK\r
`)>-1||C.indexOf(`\r
ERROR\r
`)>-1){r.off("rx",z);const L=C.split(`\r
`);d(Te.Buffer.from(L[L.length-3],"hex"))}};r.on("rx",z),$.writeValueWithoutResponse(k.encode(m+p.value.com.tail)).catch(v)}),q=Se.promise(j,1),O=m=>q.push(m);return Ce(()=>{c&&S.value&&A()}),e({connect:R,transmit:O,disconnect:A}),(m,d)=>{const v=Me,C=ye,z=Ie,f=Re,L=Ne,K=ee,oe=we;return H(),W(oe,{title:m.$t("adapter.bluetooth"),bordered:!1},{"header-extra":_(()=>[a.value?(H(),W(C,{key:0,style:{"margin-right":"1em"}},{default:_(()=>[B(N(a.value),1)]),_:1})):U("",!0),M(z,{onClick:d[0]||(d[0]=V=>{p.value.com.rx=""}),style:{"margin-right":"1em"}},{default:_(()=>[B(N(m.$t("adapter.Clear")),1)]),_:1}),a.value?(H(),W(z,{key:1,type:"warning",onClick:D},{default:_(()=>[B("Forget Device")]),_:1})):(H(),W(z,{key:2,type:"primary",onClick:R},{default:_(()=>[B(N(m.$t("adapter.RequestBluetoothDevice")),1)]),_:1}))]),default:_(()=>[y.value?(H(),W(v,{key:0,title:"Error",type:"error"},{default:_(()=>[B(' This browser "'+N(l.value)+'" does not support ',1),je,B(" yet. See also this [Guide](https://developer.chrome.com/articles/bluetooth/) ")]),_:1})):U("",!0),s.value?U("",!0):(H(),W(v,{key:1,title:"Error",type:"error"},{default:_(()=>[B(" No Bluetooth Adapter Found ")]),_:1})),M(K,{vertical:""},{default:_(()=>[Z("textarea",{ref_key:"com",ref:h,value:p.value.com.rx,rows:"6",readonly:"",style:{width:"100%",border:"solid 1px #ccc"}},null,8,Ve),M(L,null,{default:_(()=>[M(f,{value:p.value.com.tx,"onUpdate:value":d[1]||(d[1]=V=>p.value.com.tx=V),type:"text",placeholder:"TX: press Enter to send",clearable:"",disabled:!a.value,onKeyup:d[2]||(d[2]=xe(V=>O(p.value.com.tx),["enter"]))},null,8,["value","disabled"]),M(z,{type:"primary",onClick:d[3]||(d[3]=V=>O(p.value.com.tx))},{default:_(()=>[B(N(m.$t("adapter.Transmit")),1)]),_:1})]),_:1})]),_:1})]),_:1},8,["title"])}}}),qe={name:"ViewBluetooth"},Qe=Object.assign(qe,{setup(t){const e=P(null);return ze("adapter",{transmit:(...l)=>e.value.transmit(...l),connect:(...l)=>e.value.connect(...l),disconnect:(...l)=>e.value.disconnect(...l)}),(l,S)=>{const a=Pe("router-view"),r=ee;return H(),W(r,{vertical:""},{default:_(()=>[M(a),M(De,{ref_key:"ble",ref:e},null,512)]),_:1})}}});export{Qe as default};
