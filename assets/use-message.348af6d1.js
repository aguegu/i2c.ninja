import{i as co,E as mo,a as V,S as vo,p as Co,b as O,d as to,u as yo,t as Mo,y as Y,O as Oo,h as z,f,a1 as jo,a2 as So,n as No,v as ao,s as w,g as p,w as uo,j as Lo,x as no,B as Vo,A as Ko,F as $o,G as n,o as eo,I as _o,a3 as xo,J as po,a4 as Qo,a5 as Ao,N as qo,m as Jo,Q as Uo,a6 as Yo,a7 as ho,a8 as Xo,a9 as Zo,aa as oe}from"./index.d1a12725.js";function ee(o,a="default",x=[]){const t=o.$slots[a];return t===void 0?x:t()}const go=Co("n-form-item");function re(o,{defaultSize:a="medium",mergedSize:x,mergedDisabled:i}={}){const t=co(go,null);mo(go,null);const h=V(x?()=>x(t):()=>{const{size:$}=o;if($)return $;if(t){const{mergedSize:W}=t;if(W.value!==void 0)return W.value}return a}),D=V(i?()=>i(t):()=>{const{disabled:$}=o;return $!==void 0?$:t?t.disabled.value:!1}),R=V(()=>{const{status:$}=o;return $||(t==null?void 0:t.mergedValidationStatus.value)});return vo(()=>{t&&t.restoreValidation()}),{mergedSizeRef:h,mergedDisabledRef:D,mergedStatusRef:R,nTriggerFormBlur(){t&&t.handleContentBlur()},nTriggerFormChange(){t&&t.handleContentChange()},nTriggerFormFocus(){t&&t.handleContentFocus()},nTriggerFormInput(){t&&t.handleContentInput()}}}var te=O("base-wave",`
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 border-radius: inherit;
`),ne=to({name:"BaseWave",props:{clsPrefix:{type:String,required:!0}},setup(o){yo("-base-wave",te,Mo(o,"clsPrefix"));const a=Y(null),x=Y(!1);let i=null;return vo(()=>{i!==null&&window.clearTimeout(i)}),{active:x,selfRef:a,play(){i!==null&&(window.clearTimeout(i),x.value=!1,i=null),Oo(()=>{var t;(t=a.value)===null||t===void 0||t.offsetHeight,x.value=!0,i=window.setTimeout(()=>{x.value=!1,i=null},1e3)})}}},render(){const{clsPrefix:o}=this;return z("div",{ref:"selfRef","aria-hidden":!0,class:[`${o}-base-wave`,this.active&&`${o}-base-wave--active`]})}});const{cubicBezierEaseInOut:L}=jo;function se({duration:o=".2s",delay:a=".1s"}={}){return[f("&.fade-in-width-expand-transition-leave-from, &.fade-in-width-expand-transition-enter-to",{opacity:1}),f("&.fade-in-width-expand-transition-leave-to, &.fade-in-width-expand-transition-enter-from",`
 opacity: 0!important;
 margin-left: 0!important;
 margin-right: 0!important;
 `),f("&.fade-in-width-expand-transition-leave-active",`
 overflow: hidden;
 transition:
 opacity ${o} ${L},
 max-width ${o} ${L} ${a},
 margin-left ${o} ${L} ${a},
 margin-right ${o} ${L} ${a};
 `),f("&.fade-in-width-expand-transition-enter-active",`
 overflow: hidden;
 transition:
 opacity ${o} ${L} ${a},
 max-width ${o} ${L},
 margin-left ${o} ${L},
 margin-right ${o} ${L};
 `)]}function _(o){return So(o,[255,255,255,.16])}function ro(o){return So(o,[0,0,0,.12])}var ie={paddingTiny:"0 6px",paddingSmall:"0 10px",paddingMedium:"0 14px",paddingLarge:"0 18px",paddingRoundTiny:"0 10px",paddingRoundSmall:"0 14px",paddingRoundMedium:"0 18px",paddingRoundLarge:"0 22px",iconMarginTiny:"6px",iconMarginSmall:"6px",iconMarginMedium:"6px",iconMarginLarge:"6px",iconSizeTiny:"14px",iconSizeSmall:"18px",iconSizeMedium:"18px",iconSizeLarge:"20px",rippleDuration:".6s"};const le=o=>{const{heightTiny:a,heightSmall:x,heightMedium:i,heightLarge:t,borderRadius:h,fontSizeTiny:D,fontSizeSmall:R,fontSizeMedium:$,fontSizeLarge:W,opacityDisabled:Q,textColor2:C,textColor3:U,primaryColorHover:d,primaryColorPressed:y,borderColor:k,primaryColor:H,baseColor:s,infoColor:G,infoColorHover:T,infoColorPressed:r,successColor:c,successColorHover:S,successColorPressed:e,warningColor:E,warningColorHover:B,warningColorPressed:j,errorColor:I,errorColorHover:v,errorColorPressed:N,fontWeight:M,buttonColor2:A,buttonColor2Hover:F,buttonColor2Pressed:u,fontWeightStrong:X}=o;return Object.assign(Object.assign({},ie),{heightTiny:a,heightSmall:x,heightMedium:i,heightLarge:t,borderRadiusTiny:h,borderRadiusSmall:h,borderRadiusMedium:h,borderRadiusLarge:h,fontSizeTiny:D,fontSizeSmall:R,fontSizeMedium:$,fontSizeLarge:W,opacityDisabled:Q,colorOpacitySecondary:"0.16",colorOpacitySecondaryHover:"0.22",colorOpacitySecondaryPressed:"0.28",colorSecondary:A,colorSecondaryHover:F,colorSecondaryPressed:u,colorTertiary:A,colorTertiaryHover:F,colorTertiaryPressed:u,colorQuaternary:"#0000",colorQuaternaryHover:F,colorQuaternaryPressed:u,color:"#0000",colorHover:"#0000",colorPressed:"#0000",colorFocus:"#0000",colorDisabled:"#0000",textColor:C,textColorTertiary:U,textColorHover:d,textColorPressed:y,textColorFocus:d,textColorDisabled:C,textColorText:C,textColorTextHover:d,textColorTextPressed:y,textColorTextFocus:d,textColorTextDisabled:C,textColorGhost:C,textColorGhostHover:d,textColorGhostPressed:y,textColorGhostFocus:d,textColorGhostDisabled:C,border:`1px solid ${k}`,borderHover:`1px solid ${d}`,borderPressed:`1px solid ${y}`,borderFocus:`1px solid ${d}`,borderDisabled:`1px solid ${k}`,rippleColor:H,colorPrimary:H,colorHoverPrimary:d,colorPressedPrimary:y,colorFocusPrimary:d,colorDisabledPrimary:H,textColorPrimary:s,textColorHoverPrimary:s,textColorPressedPrimary:s,textColorFocusPrimary:s,textColorDisabledPrimary:s,textColorTextPrimary:H,textColorTextHoverPrimary:d,textColorTextPressedPrimary:y,textColorTextFocusPrimary:d,textColorTextDisabledPrimary:C,textColorGhostPrimary:H,textColorGhostHoverPrimary:d,textColorGhostPressedPrimary:y,textColorGhostFocusPrimary:d,textColorGhostDisabledPrimary:H,borderPrimary:`1px solid ${H}`,borderHoverPrimary:`1px solid ${d}`,borderPressedPrimary:`1px solid ${y}`,borderFocusPrimary:`1px solid ${d}`,borderDisabledPrimary:`1px solid ${H}`,rippleColorPrimary:H,colorInfo:G,colorHoverInfo:T,colorPressedInfo:r,colorFocusInfo:T,colorDisabledInfo:G,textColorInfo:s,textColorHoverInfo:s,textColorPressedInfo:s,textColorFocusInfo:s,textColorDisabledInfo:s,textColorTextInfo:G,textColorTextHoverInfo:T,textColorTextPressedInfo:r,textColorTextFocusInfo:T,textColorTextDisabledInfo:C,textColorGhostInfo:G,textColorGhostHoverInfo:T,textColorGhostPressedInfo:r,textColorGhostFocusInfo:T,textColorGhostDisabledInfo:G,borderInfo:`1px solid ${G}`,borderHoverInfo:`1px solid ${T}`,borderPressedInfo:`1px solid ${r}`,borderFocusInfo:`1px solid ${T}`,borderDisabledInfo:`1px solid ${G}`,rippleColorInfo:G,colorSuccess:c,colorHoverSuccess:S,colorPressedSuccess:e,colorFocusSuccess:S,colorDisabledSuccess:c,textColorSuccess:s,textColorHoverSuccess:s,textColorPressedSuccess:s,textColorFocusSuccess:s,textColorDisabledSuccess:s,textColorTextSuccess:c,textColorTextHoverSuccess:S,textColorTextPressedSuccess:e,textColorTextFocusSuccess:S,textColorTextDisabledSuccess:C,textColorGhostSuccess:c,textColorGhostHoverSuccess:S,textColorGhostPressedSuccess:e,textColorGhostFocusSuccess:S,textColorGhostDisabledSuccess:c,borderSuccess:`1px solid ${c}`,borderHoverSuccess:`1px solid ${S}`,borderPressedSuccess:`1px solid ${e}`,borderFocusSuccess:`1px solid ${S}`,borderDisabledSuccess:`1px solid ${c}`,rippleColorSuccess:c,colorWarning:E,colorHoverWarning:B,colorPressedWarning:j,colorFocusWarning:B,colorDisabledWarning:E,textColorWarning:s,textColorHoverWarning:s,textColorPressedWarning:s,textColorFocusWarning:s,textColorDisabledWarning:s,textColorTextWarning:E,textColorTextHoverWarning:B,textColorTextPressedWarning:j,textColorTextFocusWarning:B,textColorTextDisabledWarning:C,textColorGhostWarning:E,textColorGhostHoverWarning:B,textColorGhostPressedWarning:j,textColorGhostFocusWarning:B,textColorGhostDisabledWarning:E,borderWarning:`1px solid ${E}`,borderHoverWarning:`1px solid ${B}`,borderPressedWarning:`1px solid ${j}`,borderFocusWarning:`1px solid ${B}`,borderDisabledWarning:`1px solid ${E}`,rippleColorWarning:E,colorError:I,colorHoverError:v,colorPressedError:N,colorFocusError:v,colorDisabledError:I,textColorError:s,textColorHoverError:s,textColorPressedError:s,textColorFocusError:s,textColorDisabledError:s,textColorTextError:I,textColorTextHoverError:v,textColorTextPressedError:N,textColorTextFocusError:v,textColorTextDisabledError:C,textColorGhostError:I,textColorGhostHoverError:v,textColorGhostPressedError:N,textColorGhostFocusError:v,textColorGhostDisabledError:I,borderError:`1px solid ${I}`,borderHoverError:`1px solid ${v}`,borderPressedError:`1px solid ${N}`,borderFocusError:`1px solid ${v}`,borderDisabledError:`1px solid ${I}`,rippleColorError:I,waveOpacity:"0.6",fontWeight:M,fontWeightStrong:X})},ae={name:"Button",common:No,self:le};var de=ae;const b="0!important",Po="-1px!important";function q(o){return w(o+"-type",[f("& +",[O("button",{},[w(o+"-type",[p("border",{borderLeftWidth:b}),p("state-border",{left:Po})])])])])}function J(o){return w(o+"-type",[f("& +",[O("button",[w(o+"-type",[p("border",{borderTopWidth:b}),p("state-border",{top:Po})])])])])}var ce=O("button-group",`
 flex-wrap: nowrap;
 display: inline-flex;
 position: relative;
`,[ao("vertical",{flexDirection:"row"},[O("button",[f("&:first-child:not(:last-child)",`
 margin-right: ${b};
 border-top-right-radius: ${b};
 border-bottom-right-radius: ${b};
 `),f("&:last-child:not(:first-child)",`
 margin-left: ${b};
 border-top-left-radius: ${b};
 border-bottom-left-radius: ${b};
 `),f("&:not(:first-child):not(:last-child)",`
 margin-left: ${b};
 margin-right: ${b};
 border-radius: ${b};
 `),q("default"),w("ghost",[q("primary"),q("info"),q("success"),q("warning"),q("error")])])]),w("vertical",{flexDirection:"column"},[O("button",[f("&:first-child:not(:last-child)",`
 margin-bottom: ${b};
 margin-left: ${b};
 margin-right: ${b};
 border-bottom-left-radius: ${b};
 border-bottom-right-radius: ${b};
 `),f("&:last-child:not(:first-child)",`
 margin-top: ${b};
 margin-left: ${b};
 margin-right: ${b};
 border-top-left-radius: ${b};
 border-top-right-radius: ${b};
 `),f("&:not(:first-child):not(:last-child)",`
 margin: ${b};
 border-radius: ${b};
 `),J("default"),w("ghost",[J("primary"),J("info"),J("success"),J("warning"),J("error")])])])]);const wo=Co("n-button-group"),ue={size:{type:String,default:void 0},vertical:Boolean};to({name:"ButtonGroup",props:ue,setup(o){const{mergedClsPrefixRef:a}=uo(o);return yo("-button-group",ce,a),mo(wo,o),{mergedClsPrefix:a}},render(){const{mergedClsPrefix:o}=this;return z("div",{class:[`${o}-button-group`,this.vertical&&`${o}-button-group--vertical`],role:"group"},this.$slots)}});var be=f([O("button",`
 margin: 0;
 font-weight: var(--n-font-weight);
 line-height: 1;
 font-family: inherit;
 padding: var(--n-padding);
 height: var(--n-height);
 font-size: var(--n-font-size);
 border-radius: var(--n-border-radius);
 color: var(--n-text-color);
 background-color: var(--n-color);
 width: var(--n-width);
 white-space: nowrap;
 outline: none;
 position: relative;
 z-index: auto;
 border: none;
 display: inline-flex;
 flex-wrap: nowrap;
 flex-shrink: 0;
 align-items: center;
 justify-content: center;
 user-select: none;
 text-align: center;
 cursor: pointer;
 text-decoration: none;
 transition:
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 opacity .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[w("color",[p("border",{borderColor:"var(--n-border-color)"}),w("disabled",[p("border",{borderColor:"var(--n-border-color-disabled)"})]),ao("disabled",[f("&:focus",[p("state-border",{borderColor:"var(--n-border-color-focus)"})]),f("&:hover",[p("state-border",{borderColor:"var(--n-border-color-hover)"})]),f("&:active",[p("state-border",{borderColor:"var(--n-border-color-pressed)"})]),w("pressed",[p("state-border",{borderColor:"var(--n-border-color-pressed)"})])])]),w("disabled",{backgroundColor:"var(--n-color-disabled)",color:"var(--n-text-color-disabled)"},[p("border",{border:"var(--n-border-disabled)"})]),ao("disabled",[f("&:focus",{backgroundColor:"var(--n-color-focus)",color:"var(--n-text-color-focus)"},[p("state-border",{border:"var(--n-border-focus)"})]),f("&:hover",{backgroundColor:"var(--n-color-hover)",color:"var(--n-text-color-hover)"},[p("state-border",{border:"var(--n-border-hover)"})]),f("&:active",{backgroundColor:"var(--n-color-pressed)",color:"var(--n-text-color-pressed)"},[p("state-border",{border:"var(--n-border-pressed)"})]),w("pressed",{backgroundColor:"var(--n-color-pressed)",color:"var(--n-text-color-pressed)"},[p("state-border",{border:"var(--n-border-pressed)"})])]),w("loading",{"pointer-events":"none"}),O("base-wave",`
 pointer-events: none;
 top: 0;
 right: 0;
 bottom: 0;
 left: 0;
 animation-iteration-count: 1;
 animation-duration: var(--n-ripple-duration);
 animation-timing-function: var(--n-bezier-ease-out), var(--n-bezier-ease-out);
 `,[w("active",{zIndex:1,animationName:"button-wave-spread, button-wave-opacity"})]),typeof window!="undefined"&&"MozBoxSizing"in document.createElement("div").style?f("&::moz-focus-inner",{border:0}):null,p("border, state-border",`
 position: absolute;
 left: 0;
 top: 0;
 right: 0;
 bottom: 0;
 border-radius: inherit;
 transition: border-color .3s var(--n-bezier);
 pointer-events: none;
 `),p("border",{border:"var(--n-border)"}),p("state-border",{border:"var(--n-border)",borderColor:"#0000",zIndex:1}),p("icon",`
 margin: var(--n-icon-margin);
 margin-left: 0;
 height: var(--n-icon-size);
 width: var(--n-icon-size);
 max-width: var(--n-icon-size);
 font-size: var(--n-icon-size);
 position: relative;
 flex-shrink: 0;
 `,[O("icon-slot",`
 height: var(--n-icon-size);
 width: var(--n-icon-size);
 position: absolute;
 left: 0;
 top: 50%;
 transform: translateY(-50%);
 display: flex;
 `,[Lo({top:"50%",originalTransform:"translateY(-50%)"})]),se()]),p("content",`
 display: flex;
 align-items: center;
 flex-wrap: nowrap;
 `,[f("~",[p("icon",{margin:"var(--n-icon-margin)",marginRight:0})])]),w("block",`
 display: flex;
 width: 100%;
 `),w("dashed",[p("border, state-border",{borderStyle:"dashed !important"})]),w("disabled",{cursor:"not-allowed",opacity:"var(--n-opacity-disabled)"})]),f("@keyframes button-wave-spread",{from:{boxShadow:"0 0 0.5px 0 var(--n-ripple-color)"},to:{boxShadow:"0 0 0.5px 4.5px var(--n-ripple-color)"}}),f("@keyframes button-wave-opacity",{from:{opacity:"var(--n-wave-opacity)"},to:{opacity:0}})]);const fe=Object.assign(Object.assign({},no.props),{color:String,textColor:String,text:Boolean,block:Boolean,loading:Boolean,disabled:Boolean,circle:Boolean,size:String,ghost:Boolean,round:Boolean,secondary:Boolean,tertiary:Boolean,quaternary:Boolean,strong:Boolean,focusable:{type:Boolean,default:!0},keyboard:{type:Boolean,default:!0},tag:{type:String,default:"button"},type:{type:String,default:"default"},dashed:Boolean,iconPlacement:{type:String,default:"left"},attrType:{type:String,default:"button"},bordered:{type:Boolean,default:!0},onClick:[Function,Array],internalAutoFocus:Boolean}),xe=to({name:"Button",props:fe,setup(o){const a=Y(null),x=Y(null),i=Y(!1);Vo(()=>{const{value:r}=a;r&&!o.disabled&&o.focusable&&o.internalAutoFocus&&r.focus({preventScroll:!0})});const t=Ko(()=>!o.quaternary&&!o.tertiary&&!o.secondary&&!o.text&&(!o.color||o.ghost||o.dashed)&&o.bordered),h=co(wo,{}),{mergedSizeRef:D}=re({},{defaultSize:"medium",mergedSize:r=>{const{size:c}=o;if(c)return c;const{size:S}=h;if(S)return S;const{mergedSize:e}=r||{};return e?e.value:"medium"}}),R=V(()=>o.focusable&&!o.disabled),$=r=>{var c;r.preventDefault(),!o.disabled&&R.value&&((c=a.value)===null||c===void 0||c.focus({preventScroll:!0}))},W=r=>{var c;if(!o.disabled&&!o.loading){const{onClick:S}=o;S&&Uo(S,r),o.text||(c=x.value)===null||c===void 0||c.play()}},Q=r=>{switch(r.code){case"Enter":case"NumpadEnter":if(!o.keyboard)return;i.value=!1}},C=r=>{switch(r.code){case"Enter":case"NumpadEnter":if(!o.keyboard||o.loading){r.preventDefault();return}i.value=!0}},U=()=>{i.value=!1},{inlineThemeDisabled:d,mergedClsPrefixRef:y,mergedRtlRef:k}=uo(o),H=no("Button","-button",be,de,o,y),s=$o("Button",k,y),G=V(()=>{const r=H.value,{common:{cubicBezierEaseInOut:c,cubicBezierEaseOut:S},self:e}=r,{rippleDuration:E,opacityDisabled:B,fontWeight:j,fontWeightStrong:I}=e,v=D.value,{dashed:N,type:M,ghost:A,text:F,color:u,round:X,circle:so,textColor:K,secondary:To,tertiary:bo,quaternary:zo,strong:Ho}=o,Bo={"font-weight":Ho?I:j};let g={"--n-color":"initial","--n-color-hover":"initial","--n-color-pressed":"initial","--n-color-focus":"initial","--n-color-disabled":"initial","--n-ripple-color":"initial","--n-text-color":"initial","--n-text-color-hover":"initial","--n-text-color-pressed":"initial","--n-text-color-focus":"initial","--n-text-color-disabled":"initial"};const Z=M==="tertiary",fo=M==="default",l=Z?"default":M;if(F){const m=K||u,P=m||e[n("textColorText",l)];g={"--n-color":"#0000","--n-color-hover":"#0000","--n-color-pressed":"#0000","--n-color-focus":"#0000","--n-color-disabled":"#0000","--n-ripple-color":"#0000","--n-text-color":P,"--n-text-color-hover":m?_(m):e[n("textColorTextHover",l)],"--n-text-color-pressed":m?ro(m):e[n("textColorTextPressed",l)],"--n-text-color-focus":m?_(m):e[n("textColorTextHover",l)],"--n-text-color-disabled":m||e[n("textColorTextDisabled",l)]}}else if(A||N){const m=K||u;g={"--n-color":"#0000","--n-color-hover":"#0000","--n-color-pressed":"#0000","--n-color-focus":"#0000","--n-color-disabled":"#0000","--n-ripple-color":u||e[n("rippleColor",l)],"--n-text-color":m||e[n("textColorGhost",l)],"--n-text-color-hover":m?_(m):e[n("textColorGhostHover",l)],"--n-text-color-pressed":m?ro(m):e[n("textColorGhostPressed",l)],"--n-text-color-focus":m?_(m):e[n("textColorGhostHover",l)],"--n-text-color-disabled":m||e[n("textColorGhostDisabled",l)]}}else if(To){const m=fo?e.textColor:Z?e.textColorTertiary:e[n("color",l)],P=u||m,oo=M!=="default"&&M!=="tertiary";g={"--n-color":oo?eo(P,{alpha:Number(e.colorOpacitySecondary)}):e.colorSecondary,"--n-color-hover":oo?eo(P,{alpha:Number(e.colorOpacitySecondaryHover)}):e.colorSecondaryHover,"--n-color-pressed":oo?eo(P,{alpha:Number(e.colorOpacitySecondaryPressed)}):e.colorSecondaryPressed,"--n-color-focus":oo?eo(P,{alpha:Number(e.colorOpacitySecondaryHover)}):e.colorSecondaryHover,"--n-color-disabled":e.colorSecondary,"--n-ripple-color":"#0000","--n-text-color":P,"--n-text-color-hover":P,"--n-text-color-pressed":P,"--n-text-color-focus":P,"--n-text-color-disabled":P}}else if(bo||zo){const m=fo?e.textColor:Z?e.textColorTertiary:e[n("color",l)],P=u||m;bo?(g["--n-color"]=e.colorTertiary,g["--n-color-hover"]=e.colorTertiaryHover,g["--n-color-pressed"]=e.colorTertiaryPressed,g["--n-color-focus"]=e.colorSecondaryHover,g["--n-color-disabled"]=e.colorTertiary):(g["--n-color"]=e.colorQuaternary,g["--n-color-hover"]=e.colorQuaternaryHover,g["--n-color-pressed"]=e.colorQuaternaryPressed,g["--n-color-focus"]=e.colorQuaternaryHover,g["--n-color-disabled"]=e.colorQuaternary),g["--n-ripple-color"]="#0000",g["--n-text-color"]=P,g["--n-text-color-hover"]=P,g["--n-text-color-pressed"]=P,g["--n-text-color-focus"]=P,g["--n-text-color-disabled"]=P}else g={"--n-color":u||e[n("color",l)],"--n-color-hover":u?_(u):e[n("colorHover",l)],"--n-color-pressed":u?ro(u):e[n("colorPressed",l)],"--n-color-focus":u?_(u):e[n("colorFocus",l)],"--n-color-disabled":u||e[n("colorDisabled",l)],"--n-ripple-color":u||e[n("rippleColor",l)],"--n-text-color":K||(u?e.textColorPrimary:Z?e.textColorTertiary:e[n("textColor",l)]),"--n-text-color-hover":K||(u?e.textColorHoverPrimary:e[n("textColorHover",l)]),"--n-text-color-pressed":K||(u?e.textColorPressedPrimary:e[n("textColorPressed",l)]),"--n-text-color-focus":K||(u?e.textColorFocusPrimary:e[n("textColorFocus",l)]),"--n-text-color-disabled":K||(u?e.textColorDisabledPrimary:e[n("textColorDisabled",l)])};let io={"--n-border":"initial","--n-border-hover":"initial","--n-border-pressed":"initial","--n-border-focus":"initial","--n-border-disabled":"initial"};F?io={"--n-border":"none","--n-border-hover":"none","--n-border-pressed":"none","--n-border-focus":"none","--n-border-disabled":"none"}:io={"--n-border":e[n("border",l)],"--n-border-hover":e[n("borderHover",l)],"--n-border-pressed":e[n("borderPressed",l)],"--n-border-focus":e[n("borderFocus",l)],"--n-border-disabled":e[n("borderDisabled",l)]};const{[n("height",v)]:lo,[n("fontSize",v)]:Eo,[n("padding",v)]:Io,[n("paddingRound",v)]:Fo,[n("iconSize",v)]:Do,[n("borderRadius",v)]:Ro,[n("iconMargin",v)]:Go,waveOpacity:Wo}=e,ko={"--n-width":so&&!F?lo:"initial","--n-height":F?"initial":lo,"--n-font-size":Eo,"--n-padding":so||F?"initial":X?Fo:Io,"--n-icon-size":Do,"--n-icon-margin":Go,"--n-border-radius":F?"initial":so||X?lo:Ro};return Object.assign(Object.assign(Object.assign(Object.assign({"--n-bezier":c,"--n-bezier-ease-out":S,"--n-ripple-duration":E,"--n-opacity-disabled":B,"--n-wave-opacity":Wo},Bo),g),io),ko)}),T=d?_o("button",V(()=>{let r="";const{dashed:c,type:S,ghost:e,text:E,color:B,round:j,circle:I,textColor:v,secondary:N,tertiary:M,quaternary:A,strong:F}=o;c&&(r+="a"),e&&(r+="b"),E&&(r+="c"),j&&(r+="d"),I&&(r+="e"),N&&(r+="f"),M&&(r+="g"),A&&(r+="h"),F&&(r+="i"),B&&(r+="j"+xo(B)),v&&(r+="k"+xo(v));const{value:u}=D;return r+="l"+u[0],r+="m"+S[0],r}),G,o):void 0;return{selfElRef:a,waveElRef:x,mergedClsPrefix:y,mergedFocusable:R,mergedSize:D,showBorder:t,enterPressed:i,rtlEnabled:s,handleMousedown:$,handleKeydown:C,handleBlur:U,handleKeyup:Q,handleClick:W,customColorCssVars:V(()=>{const{color:r}=o;if(!r)return null;const c=_(r);return{"--n-border-color":r,"--n-border-color-hover":c,"--n-border-color-pressed":ro(r),"--n-border-color-focus":c,"--n-border-color-disabled":r}}),cssVars:d?void 0:G,themeClass:T==null?void 0:T.themeClass,onRender:T==null?void 0:T.onRender}},render(){const{mergedClsPrefix:o,tag:a,onRender:x}=this;x==null||x();const i=po(this.$slots.default,t=>t&&z("span",{class:`${o}-button__content`},t));return z(a,{ref:"selfElRef",class:[this.themeClass,`${o}-button`,`${o}-button--${this.type}-type`,`${o}-button--${this.mergedSize}-type`,this.rtlEnabled&&`${o}-button--rtl`,this.disabled&&`${o}-button--disabled`,this.block&&`${o}-button--block`,this.enterPressed&&`${o}-button--pressed`,!this.text&&this.dashed&&`${o}-button--dashed`,this.color&&`${o}-button--color`,this.secondary&&`${o}-button--secondary`,this.loading&&`${o}-button--loading`,this.ghost&&`${o}-button--ghost`],tabindex:this.mergedFocusable?0:-1,type:this.attrType,style:this.cssVars,disabled:this.disabled,onClick:this.handleClick,onBlur:this.handleBlur,onMousedown:this.handleMousedown,onKeyup:this.handleKeyup,onKeydown:this.handleKeydown},this.iconPlacement==="right"&&i,z(Qo,{width:!0},{default:()=>po(this.$slots.icon,t=>(this.loading||t)&&z("span",{class:`${o}-button__icon`,style:{margin:Ao(this.$slots.default)?"0":""}},z(qo,null,{default:()=>this.loading?z(Jo,{clsPrefix:o,key:"loading",class:`${o}-icon-slot`,strokeWidth:20}):z("div",{key:"icon",class:`${o}-icon-slot`,role:"none"},t)})))}),this.iconPlacement==="left"&&i,this.text?null:z(ne,{ref:"waveElRef",clsPrefix:o}),this.showBorder?z("div",{"aria-hidden":!0,class:`${o}-button__border`,style:this.customColorCssVars}):null,this.showBorder?z("div",{"aria-hidden":!0,class:`${o}-button__state-border`,style:this.customColorCssVars}):null)}});var ye=xe,pe={gapSmall:"4px 8px",gapMedium:"8px 12px",gapLarge:"12px 16px"};const he=()=>pe,ge={name:"Space",self:he};var me=ge;const ve=Object.assign(Object.assign({},no.props),{align:String,justify:{type:String,default:"start"},inline:Boolean,vertical:Boolean,size:{type:[String,Number,Array],default:"medium"},itemStyle:[String,Object],wrap:{type:Boolean,default:!0}});var Se=to({name:"Space",props:ve,setup(o){const{mergedClsPrefixRef:a,mergedRtlRef:x}=uo(o),i=no("Space","-space",void 0,me,o,a);return{rtlEnabled:$o("Space",x,a),mergedClsPrefix:a,margin:V(()=>{const{size:h}=o;if(Array.isArray(h))return{horizontal:h[0],vertical:h[1]};if(typeof h=="number")return{horizontal:h,vertical:h};const{self:{[n("gap",h)]:D}}=i.value,{row:R,col:$}=Yo(D);return{horizontal:ho($),vertical:ho(R)}})}},render(){const{vertical:o,align:a,inline:x,justify:i,itemStyle:t,margin:h,wrap:D,mergedClsPrefix:R,rtlEnabled:$}=this,W=Xo(ee(this));if(!W.length)return null;const Q=`${h.horizontal}px`,C=`${h.horizontal/2}px`,U=`${h.vertical}px`,d=`${h.vertical/2}px`,y=W.length-1,k=i.startsWith("space-");return z("div",{role:"none",class:[`${R}-space`,$&&`${R}-space--rtl`],style:{display:x?"inline-flex":"flex",flexDirection:o?"column":"row",justifyContent:["start","end"].includes(i)?"flex-"+i:i,flexWrap:!D||o?"nowrap":"wrap",marginTop:o?"":`-${d}`,marginBottom:o?"":`-${d}`,alignItems:a}},W.map((H,s)=>z("div",{role:"none",style:[t,{maxWidth:"100%"},o?{marginBottom:s!==y?U:""}:$?{marginLeft:k?i==="space-between"&&s===y?"":C:s!==y?Q:"",marginRight:k?i==="space-between"&&s===0?"":C:"",paddingTop:d,paddingBottom:d}:{marginRight:k?i==="space-between"&&s===y?"":C:s!==y?Q:"",marginLeft:k?i==="space-between"&&s===0?"":C:"",paddingTop:d,paddingBottom:d}]},H)))}});function $e(){const o=co(Zo,null);return o===null&&oe("use-message","No outer <n-message-provider /> founded. See prerequisite in https://www.naiveui.com/en-US/os-theme/components/message for more details. If you want to use `useMessage` outside setup, please check https://www.naiveui.com/zh-CN/os-theme/components/message#Q-&-A."),o}export{ye as N,$e as a,Se as b,go as f,ee as g,re as u};
