import{E as ae,L as j,u as U,x as ie,r as $,v as de,A,a0 as O,K as L,aG as se,T as D,y as _,H as c,B as S,G as R,I as E,h as M,i as F,k as I,q as V,j as G,M as N,m as y,O as le,p as ue,l as ce}from"./index.1e85b313.js";import{a as K,g as be}from"./use-message.871b104f.js";var he={radioSizeSmall:"14px",radioSizeMedium:"16px",radioSizeLarge:"18px",labelPadding:"0 8px"};const fe=e=>{const{borderColor:o,primaryColor:t,baseColor:n,textColorDisabled:a,inputColorDisabled:f,textColor2:r,opacityDisabled:s,borderRadius:d,fontSizeSmall:v,fontSizeMedium:g,fontSizeLarge:x,heightSmall:b,heightMedium:C,heightLarge:m,lineHeight:w}=e;return Object.assign(Object.assign({},he),{labelLineHeight:w,buttonHeightSmall:b,buttonHeightMedium:C,buttonHeightLarge:m,fontSizeSmall:v,fontSizeMedium:g,fontSizeLarge:x,boxShadow:`inset 0 0 0 1px ${o}`,boxShadowActive:`inset 0 0 0 1px ${t}`,boxShadowFocus:`inset 0 0 0 1px ${t}, 0 0 0 2px ${j(t,{alpha:.2})}`,boxShadowHover:`inset 0 0 0 1px ${t}`,boxShadowDisabled:`inset 0 0 0 1px ${o}`,color:n,colorDisabled:f,textColor:r,textColorDisabled:a,dotColorActive:t,dotColorDisabled:o,buttonBorderColor:o,buttonBorderColorActive:t,buttonBorderColorHover:o,buttonColor:n,buttonColorActive:n,buttonTextColor:r,buttonTextColorActive:t,buttonTextColorHover:t,opacityDisabled:s,buttonBoxShadowFocus:`inset 0 0 0 1px ${t}, 0 0 0 2px ${j(t,{alpha:.3})}`,buttonBoxShadowHover:"inset 0 0 0 1px #0000",buttonBoxShadow:"inset 0 0 0 1px #0000",buttonBorderRadius:d})},ve={name:"Radio",common:ae,self:fe};var q=ve;const pe={name:String,value:{type:[String,Number],default:"on"},checked:{type:Boolean,default:void 0},defaultChecked:Boolean,disabled:{type:Boolean,default:void 0},label:String,size:String,onUpdateChecked:[Function,Array],"onUpdate:checked":[Function,Array],checkedValue:{type:Boolean,validator:()=>(se("radio","`checked-value` is deprecated, please use `checked` instead."),!0),default:void 0}},W=ie("n-radio-group");function P(e){const o=K(e,{mergedSize(i){const{size:l}=e;if(l!==void 0)return l;if(r){const{mergedSizeRef:{value:h}}=r;if(h!==void 0)return h}return i?i.mergedSize.value:"medium"},mergedDisabled(i){return!!(e.disabled||r!=null&&r.disabledRef.value||i!=null&&i.disabled.value)}}),{mergedSizeRef:t,mergedDisabledRef:n}=o,a=$(null),f=$(null),r=de(W,null),s=$(e.defaultChecked),d=A(e,"checked"),v=O(d,s),g=L(()=>r?r.valueRef.value===e.value:v.value),x=L(()=>{const{name:i}=e;if(i!==void 0)return i;if(r)return r.nameRef.value}),b=$(!1);function C(){if(r){const{doUpdateValue:i}=r,{value:l}=e;D(i,l)}else{const{onUpdateChecked:i,"onUpdate:checked":l}=e,{nTriggerFormInput:h,nTriggerFormChange:u}=o;i&&D(i,!0),l&&D(l,!0),h(),u(),s.value=!0}}function m(){n.value||g.value||C()}function w(){m()}function z(){b.value=!1}function k(){b.value=!0}return{mergedClsPrefix:r?r.mergedClsPrefixRef:U(e).mergedClsPrefixRef,inputRef:a,labelRef:f,mergedName:x,mergedDisabled:n,uncontrolledChecked:s,renderSafeChecked:g,focus:b,mergedSize:t,handleRadioInputChange:w,handleRadioInputBlur:z,handleRadioInputFocus:k}}P.props=pe;var ge=_("radio",`
 line-height: var(--n-label-line-height);
 outline: none;
 position: relative;
 user-select: none;
 display: inline-flex;
 align-items: flex-start;
 flex-wrap: nowrap;
 font-size: var(--n-font-size);
 word-break: break-word;
`,[c("dot-wrapper",`
 position: relative;
 flex-shrink: 0;
 flex-grow: 0;
 width: var(--n-radio-size);
 `),_("radio-input",`
 position: absolute;
 border: 0;
 border-radius: inherit;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 opacity: 0;
 z-index: 1;
 cursor: pointer;
 `),c("dot",`
 position: absolute;
 top: 50%;
 left: 0;
 transform: translateY(-50%);
 height: var(--n-radio-size);
 width: var(--n-radio-size);
 background: var(--n-color);
 box-shadow: var(--n-box-shadow);
 border-radius: 50%;
 transition:
 background-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 `,[S("&::before",`
 content: "";
 opacity: 0;
 position: absolute;
 left: 4px;
 top: 4px;
 height: calc(100% - 8px);
 width: calc(100% - 8px);
 border-radius: 50%;
 transform: scale(.8);
 background: var(--n-dot-color-active);
 transition: 
 opacity .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 transform .3s var(--n-bezier);
 `),R("checked",{boxShadow:"var(--n-box-shadow-active)"},[S("&::before",`
 opacity: 1;
 transform: scale(1);
 `)])]),c("label",`
 color: var(--n-text-color);
 padding: var(--n-label-padding);
 display: inline-block;
 transition: color .3s var(--n-bezier);
 `),E("disabled",`
 cursor: pointer;
 `,[S("&:hover",[c("dot",{boxShadow:"var(--n-box-shadow-hover)"})]),R("focus",[S("&:not(:active)",[c("dot",{boxShadow:"var(--n-box-shadow-focus)"})])])]),R("disabled",`
 cursor: not-allowed;
 `,[c("dot",{boxShadow:"var(--n-box-shadow-disabled)",backgroundColor:"var(--n-color-disabled)"},[S("&::before",{backgroundColor:"var(--n-dot-color-disabled)"}),R("checked",`
 opacity: 1;
 `)]),c("label",{color:"var(--n-text-color-disabled)"}),_("radio-input",`
 cursor: not-allowed;
 `)])]),Se=M({name:"Radio",props:Object.assign(Object.assign({},F.props),P.props),setup(e){const o=P(e),t=F("Radio","-radio",ge,q,e,o.mergedClsPrefix),n=I(()=>{const{mergedSize:{value:v}}=o,{common:{cubicBezierEaseInOut:g},self:{boxShadow:x,boxShadowActive:b,boxShadowDisabled:C,boxShadowFocus:m,boxShadowHover:w,color:z,colorDisabled:k,textColor:i,textColorDisabled:l,dotColorActive:h,dotColorDisabled:u,labelPadding:p,labelLineHeight:B,[V("fontSize",v)]:T,[V("radioSize",v)]:H}}=t.value;return{"--n-bezier":g,"--n-label-line-height":B,"--n-box-shadow":x,"--n-box-shadow-active":b,"--n-box-shadow-disabled":C,"--n-box-shadow-focus":m,"--n-box-shadow-hover":w,"--n-color":z,"--n-color-disabled":k,"--n-dot-color-active":h,"--n-dot-color-disabled":u,"--n-font-size":T,"--n-radio-size":H,"--n-text-color":i,"--n-text-color-disabled":l,"--n-label-padding":p}}),{inlineThemeDisabled:a,mergedClsPrefixRef:f,mergedRtlRef:r}=U(e),s=G("Radio",r,f),d=a?N("radio",I(()=>o.mergedSize.value[0]),n,e):void 0;return Object.assign(o,{rtlEnabled:s,cssVars:a?void 0:n,themeClass:d==null?void 0:d.themeClass,onRender:d==null?void 0:d.onRender})},render(){const{$slots:e,mergedClsPrefix:o,onRender:t,label:n}=this;return t==null||t(),y("label",{class:[`${o}-radio`,this.themeClass,{[`${o}-radio--rtl`]:this.rtlEnabled,[`${o}-radio--disabled`]:this.mergedDisabled,[`${o}-radio--checked`]:this.renderSafeChecked,[`${o}-radio--focus`]:this.focus}],style:this.cssVars},y("input",{ref:"inputRef",type:"radio",class:`${o}-radio-input`,value:this.value,name:this.mergedName,checked:this.renderSafeChecked,disabled:this.mergedDisabled,onChange:this.handleRadioInputChange,onFocus:this.handleRadioInputFocus,onBlur:this.handleRadioInputBlur}),y("div",{class:`${o}-radio__dot-wrapper`},"\xA0",y("div",{class:[`${o}-radio__dot`,this.renderSafeChecked&&`${o}-radio__dot--checked`]})),le(e.default,a=>!a&&!n?null:y("div",{ref:"labelRef",class:`${o}-radio__label`},a||n)))}}),me=_("radio-group",`
 display: inline-block;
 font-size: var(--n-font-size);
`,[c("splitor",`
 display: inline-block;
 vertical-align: bottom;
 width: 1px;
 transition:
 background-color .3s var(--n-bezier),
 opacity .3s var(--n-bezier);
 background: var(--n-button-border-color);
 `,[R("checked",{backgroundColor:"var(--n-button-border-color-active)"}),R("disabled",{opacity:"var(--n-opacity-disabled)"})]),R("button-group",`
 white-space: nowrap;
 height: var(--n-height);
 line-height: var(--n-height);
 `,[_("radio-button",{height:"var(--n-height)",lineHeight:"var(--n-height)"}),c("splitor",{height:"var(--n-height)"})]),_("radio-button",`
 vertical-align: bottom;
 outline: none;
 position: relative;
 user-select: none;
 display: inline-block;
 box-sizing: border-box;
 padding-left: 14px;
 padding-right: 14px;
 white-space: nowrap;
 transition:
 background-color .3s var(--n-bezier),
 opacity .3s var(--n-bezier),
 border-color .3s var(--n-bezier),
 color .3s var(--n-bezier);
 color: var(--n-button-text-color);
 border-top: 1px solid var(--n-button-border-color);
 border-bottom: 1px solid var(--n-button-border-color);
 `,[_("radio-input",`
 position: absolute;
 border: 0;
 border-radius: inherit;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 opacity: 0;
 z-index: 1;
 `),c("state-border",`
 z-index: 1;
 pointer-events: none;
 position: absolute;
 box-shadow: var(--n-button-box-shadow);
 transition: box-shadow .3s var(--n-bezier);
 left: -1px;
 bottom: -1px;
 right: -1px;
 top: -1px;
 `),S("&:first-child",`
 border-top-left-radius: var(--n-button-border-radius);
 border-bottom-left-radius: var(--n-button-border-radius);
 border-left: 1px solid var(--n-button-border-color);
 `,[c("state-border",`
 border-top-left-radius: var(--n-button-border-radius);
 border-bottom-left-radius: var(--n-button-border-radius);
 `)]),S("&:last-child",`
 border-top-right-radius: var(--n-button-border-radius);
 border-bottom-right-radius: var(--n-button-border-radius);
 border-right: 1px solid var(--n-button-border-color);
 `,[c("state-border",`
 border-top-right-radius: var(--n-button-border-radius);
 border-bottom-right-radius: var(--n-button-border-radius);
 `)]),E("disabled",`
 cursor: pointer;
 `,[S("&:hover",[c("state-border",`
 transition: box-shadow .3s var(--n-bezier);
 box-shadow: var(--n-button-box-shadow-hover);
 `),E("checked",{color:"var(--n-button-text-color-hover)"})]),R("focus",[S("&:not(:active)",[c("state-border",{boxShadow:"var(--n-button-box-shadow-focus)"})])])]),R("checked",`
 background: var(--n-button-color-active);
 color: var(--n-button-text-color-active);
 border-color: var(--n-button-border-color-active);
 `),R("disabled",`
 cursor: not-allowed;
 opacity: var(--n-opacity-disabled);
 `)])]);function xe(e,o,t){var n;const a=[];let f=!1;for(let r=0;r<e.length;++r){const s=e[r],d=(n=s.type)===null||n===void 0?void 0:n.name;d==="RadioButton"&&(f=!0);const v=s.props;if(d!=="RadioButton"){a.push(s);continue}if(r===0)a.push(s);else{const g=a[a.length-1].props,x=o===g.value,b=g.disabled,C=o===v.value,m=v.disabled,w=(x?2:0)+(b?0:1),z=(C?2:0)+(m?0:1),k={[`${t}-radio-group__splitor--disabled`]:b,[`${t}-radio-group__splitor--checked`]:x},i={[`${t}-radio-group__splitor--disabled`]:m,[`${t}-radio-group__splitor--checked`]:C},l=w<z?i:k;a.push(y("div",{class:[`${t}-radio-group__splitor`,l]}),s)}}return{children:a,isButtonGroup:f}}const Ce=Object.assign(Object.assign({},F.props),{name:String,value:[String,Number],defaultValue:{type:[String,Number],default:null},size:String,disabled:{type:Boolean,default:void 0},"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array]});var ze=M({name:"RadioGroup",props:Ce,setup(e){const o=$(null),{mergedSizeRef:t,mergedDisabledRef:n,nTriggerFormChange:a,nTriggerFormInput:f,nTriggerFormBlur:r,nTriggerFormFocus:s}=K(e),{mergedClsPrefixRef:d,inlineThemeDisabled:v,mergedRtlRef:g}=U(e),x=F("Radio","-radio-group",me,q,e,d),b=$(e.defaultValue),C=A(e,"value"),m=O(C,b);function w(u){const{onUpdateValue:p,"onUpdate:value":B}=e;p&&D(p,u),B&&D(B,u),b.value=u,a(),f()}function z(u){const{value:p}=o;!p||p.contains(u.relatedTarget)||s()}function k(u){const{value:p}=o;!p||p.contains(u.relatedTarget)||r()}ue(W,{mergedClsPrefixRef:d,nameRef:A(e,"name"),valueRef:m,disabledRef:n,mergedSizeRef:t,doUpdateValue:w});const i=G("Radio",g,d),l=I(()=>{const{value:u}=t,{common:{cubicBezierEaseInOut:p},self:{buttonBorderColor:B,buttonBorderColorActive:T,buttonBorderRadius:H,buttonBoxShadow:Y,buttonBoxShadowFocus:J,buttonBoxShadowHover:Q,buttonColorActive:X,buttonTextColor:Z,buttonTextColorActive:ee,buttonTextColorHover:oe,opacityDisabled:te,[V("buttonHeight",u)]:re,[V("fontSize",u)]:ne}}=x.value;return{"--n-font-size":ne,"--n-bezier":p,"--n-button-border-color":B,"--n-button-border-color-active":T,"--n-button-border-radius":H,"--n-button-box-shadow":Y,"--n-button-box-shadow-focus":J,"--n-button-box-shadow-hover":Q,"--n-button-color-active":X,"--n-button-text-color":Z,"--n-button-text-color-hover":oe,"--n-button-text-color-active":ee,"--n-height":re,"--n-opacity-disabled":te}}),h=v?N("radio-group",I(()=>t.value[0]),l,e):void 0;return{selfElRef:o,rtlEnabled:i,mergedClsPrefix:d,mergedValue:m,handleFocusout:k,handleFocusin:z,cssVars:v?void 0:l,themeClass:h==null?void 0:h.themeClass,onRender:h==null?void 0:h.onRender}},render(){var e;const{mergedValue:o,mergedClsPrefix:t,handleFocusin:n,handleFocusout:a}=this,{children:f,isButtonGroup:r}=xe(ce(be(this)),o,t);return(e=this.onRender)===null||e===void 0||e.call(this),y("div",{onFocusin:n,onFocusout:a,ref:"selfElRef",class:[`${t}-radio-group`,this.rtlEnabled&&`${t}-radio-group--rtl`,this.themeClass,r&&`${t}-radio-group--button-group`],style:this.cssVars},f)}});export{ze as _,Se as a};
