import{n as ae,o as j,p as ie,w as U,y as D,i as de,t as A,z as O,A as L,ar as se,Q as F,b as B,g as c,f as S,s as R,v as E,d as G,x as I,a as _,G as V,F as M,I as N,h as y,J as le,E as ue,a8 as ce}from"./index.d1a12725.js";import{u as K,g as be}from"./use-message.348af6d1.js";var he={radioSizeSmall:"14px",radioSizeMedium:"16px",radioSizeLarge:"18px",labelPadding:"0 8px"};const fe=e=>{const{borderColor:o,primaryColor:t,baseColor:n,textColorDisabled:d,inputColorDisabled:f,textColor2:r,opacityDisabled:s,borderRadius:i,fontSizeSmall:v,fontSizeMedium:g,fontSizeLarge:x,heightSmall:b,heightMedium:C,heightLarge:m,lineHeight:w}=e;return Object.assign(Object.assign({},he),{labelLineHeight:w,buttonHeightSmall:b,buttonHeightMedium:C,buttonHeightLarge:m,fontSizeSmall:v,fontSizeMedium:g,fontSizeLarge:x,boxShadow:`inset 0 0 0 1px ${o}`,boxShadowActive:`inset 0 0 0 1px ${t}`,boxShadowFocus:`inset 0 0 0 1px ${t}, 0 0 0 2px ${j(t,{alpha:.2})}`,boxShadowHover:`inset 0 0 0 1px ${t}`,boxShadowDisabled:`inset 0 0 0 1px ${o}`,color:n,colorDisabled:f,textColor:r,textColorDisabled:d,dotColorActive:t,dotColorDisabled:o,buttonBorderColor:o,buttonBorderColorActive:t,buttonBorderColorHover:o,buttonColor:n,buttonColorActive:n,buttonTextColor:r,buttonTextColorActive:t,buttonTextColorHover:t,opacityDisabled:s,buttonBoxShadowFocus:`inset 0 0 0 1px ${t}, 0 0 0 2px ${j(t,{alpha:.3})}`,buttonBoxShadowHover:"inset 0 0 0 1px #0000",buttonBoxShadow:"inset 0 0 0 1px #0000",buttonBorderRadius:i})},ve={name:"Radio",common:ae,self:fe};var J=ve;const pe={name:String,value:{type:[String,Number],default:"on"},checked:{type:Boolean,default:void 0},defaultChecked:Boolean,disabled:{type:Boolean,default:void 0},size:String,onUpdateChecked:[Function,Array],"onUpdate:checked":[Function,Array],checkedValue:{type:Boolean,validator:()=>(se("radio","`checked-value` is deprecated, please use `checked` instead."),!0),default:void 0}},Q=ie("n-radio-group");function P(e){const o=K(e,{mergedSize(a){const{size:l}=e;if(l!==void 0)return l;if(r){const{mergedSizeRef:{value:h}}=r;if(h!==void 0)return h}return a?a.mergedSize.value:"medium"},mergedDisabled(a){return!!(e.disabled||r!=null&&r.disabledRef.value||a!=null&&a.disabled.value)}}),{mergedSizeRef:t,mergedDisabledRef:n}=o,d=D(null),f=D(null),r=de(Q,null),s=D(e.defaultChecked),i=A(e,"checked"),v=O(i,s),g=L(()=>r?r.valueRef.value===e.value:v.value),x=L(()=>{const{name:a}=e;if(a!==void 0)return a;if(r)return r.nameRef.value}),b=D(!1);function C(){if(r){const{doUpdateValue:a}=r,{value:l}=e;F(a,l)}else{const{onUpdateChecked:a,"onUpdate:checked":l}=e,{nTriggerFormInput:h,nTriggerFormChange:u}=o;a&&F(a,!0),l&&F(l,!0),h(),u(),s.value=!0}}function m(){n.value||g.value||C()}function w(){m()}function z(){b.value=!1}function k(){b.value=!0}return{mergedClsPrefix:r?r.mergedClsPrefixRef:U(e).mergedClsPrefixRef,inputRef:d,labelRef:f,mergedName:x,mergedDisabled:n,uncontrolledChecked:s,renderSafeChecked:g,focus:b,mergedSize:t,handleRadioInputChange:w,handleRadioInputBlur:z,handleRadioInputFocus:k}}P.props=pe;var ge=B("radio",`
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
 `),B("radio-input",`
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
 `)]),c("label",{color:"var(--n-text-color-disabled)"}),B("radio-input",`
 cursor: not-allowed;
 `)])]),Se=G({name:"Radio",props:Object.assign(Object.assign({},I.props),P.props),setup(e){const o=P(e),t=I("Radio","-radio",ge,J,e,o.mergedClsPrefix),n=_(()=>{const{mergedSize:{value:v}}=o,{common:{cubicBezierEaseInOut:g},self:{boxShadow:x,boxShadowActive:b,boxShadowDisabled:C,boxShadowFocus:m,boxShadowHover:w,color:z,colorDisabled:k,textColor:a,textColorDisabled:l,dotColorActive:h,dotColorDisabled:u,labelPadding:p,labelLineHeight:$,[V("fontSize",v)]:T,[V("radioSize",v)]:H}}=t.value;return{"--n-bezier":g,"--n-label-line-height":$,"--n-box-shadow":x,"--n-box-shadow-active":b,"--n-box-shadow-disabled":C,"--n-box-shadow-focus":m,"--n-box-shadow-hover":w,"--n-color":z,"--n-color-disabled":k,"--n-dot-color-active":h,"--n-dot-color-disabled":u,"--n-font-size":T,"--n-radio-size":H,"--n-text-color":a,"--n-text-color-disabled":l,"--n-label-padding":p}}),{inlineThemeDisabled:d,mergedClsPrefixRef:f,mergedRtlRef:r}=U(e),s=M("Radio",r,f),i=d?N("radio",_(()=>o.mergedSize.value[0]),n,e):void 0;return Object.assign(o,{rtlEnabled:s,cssVars:d?void 0:n,themeClass:i==null?void 0:i.themeClass,onRender:i==null?void 0:i.onRender})},render(){const{$slots:e,mergedClsPrefix:o,onRender:t}=this;return t==null||t(),y("label",{class:[`${o}-radio`,this.themeClass,{[`${o}-radio--rtl`]:this.rtlEnabled,[`${o}-radio--disabled`]:this.mergedDisabled,[`${o}-radio--checked`]:this.renderSafeChecked,[`${o}-radio--focus`]:this.focus}],style:this.cssVars},y("input",{ref:"inputRef",type:"radio",class:`${o}-radio-input`,value:this.value,name:this.mergedName,checked:this.renderSafeChecked,disabled:this.mergedDisabled,onChange:this.handleRadioInputChange,onFocus:this.handleRadioInputFocus,onBlur:this.handleRadioInputBlur}),y("div",{class:`${o}-radio__dot-wrapper`},"\xA0",y("div",{class:[`${o}-radio__dot`,this.renderSafeChecked&&`${o}-radio__dot--checked`]})),le(e.default,n=>n?y("div",{ref:"labelRef",class:`${o}-radio__label`},n):null))}}),me=B("radio-group",`
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
 `,[B("radio-button",{height:"var(--n-height)",lineHeight:"var(--n-height)"}),c("splitor",{height:"var(--n-height)"})]),B("radio-button",`
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
 `,[B("radio-input",`
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
 `)])]);function xe(e,o,t){var n;const d=[];let f=!1;for(let r=0;r<e.length;++r){const s=e[r],i=(n=s.type)===null||n===void 0?void 0:n.name;i==="RadioButton"&&(f=!0);const v=s.props;if(i!=="RadioButton"){d.push(s);continue}if(r===0)d.push(s);else{const g=d[d.length-1].props,x=o===g.value,b=g.disabled,C=o===v.value,m=v.disabled,w=(x?2:0)+(b?0:1),z=(C?2:0)+(m?0:1),k={[`${t}-radio-group__splitor--disabled`]:b,[`${t}-radio-group__splitor--checked`]:x},a={[`${t}-radio-group__splitor--disabled`]:m,[`${t}-radio-group__splitor--checked`]:C},l=w<z?a:k;d.push(y("div",{class:[`${t}-radio-group__splitor`,l]}),s)}}return{children:d,isButtonGroup:f}}const Ce=Object.assign(Object.assign({},I.props),{name:String,value:[String,Number],defaultValue:{type:[String,Number],default:null},size:String,disabled:{type:Boolean,default:void 0},"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array]});var ze=G({name:"RadioGroup",props:Ce,setup(e){const o=D(null),{mergedSizeRef:t,mergedDisabledRef:n,nTriggerFormChange:d,nTriggerFormInput:f,nTriggerFormBlur:r,nTriggerFormFocus:s}=K(e),{mergedClsPrefixRef:i,inlineThemeDisabled:v,mergedRtlRef:g}=U(e),x=I("Radio","-radio-group",me,J,e,i),b=D(e.defaultValue),C=A(e,"value"),m=O(C,b);function w(u){const{onUpdateValue:p,"onUpdate:value":$}=e;p&&F(p,u),$&&F($,u),b.value=u,d(),f()}function z(u){const{value:p}=o;!p||p.contains(u.relatedTarget)||s()}function k(u){const{value:p}=o;!p||p.contains(u.relatedTarget)||r()}ue(Q,{mergedClsPrefixRef:i,nameRef:A(e,"name"),valueRef:m,disabledRef:n,mergedSizeRef:t,doUpdateValue:w});const a=M("Radio",g,i),l=_(()=>{const{value:u}=t,{common:{cubicBezierEaseInOut:p},self:{buttonBorderColor:$,buttonBorderColorActive:T,buttonBorderRadius:H,buttonBoxShadow:W,buttonBoxShadowFocus:Y,buttonBoxShadowHover:q,buttonColorActive:X,buttonTextColor:Z,buttonTextColorActive:ee,buttonTextColorHover:oe,opacityDisabled:te,[V("buttonHeight",u)]:re,[V("fontSize",u)]:ne}}=x.value;return{"--n-font-size":ne,"--n-bezier":p,"--n-button-border-color":$,"--n-button-border-color-active":T,"--n-button-border-radius":H,"--n-button-box-shadow":W,"--n-button-box-shadow-focus":Y,"--n-button-box-shadow-hover":q,"--n-button-color-active":X,"--n-button-text-color":Z,"--n-button-text-color-hover":oe,"--n-button-text-color-active":ee,"--n-height":re,"--n-opacity-disabled":te}}),h=v?N("radio-group",_(()=>t.value[0]),l,e):void 0;return{selfElRef:o,rtlEnabled:a,mergedClsPrefix:i,mergedValue:m,handleFocusout:k,handleFocusin:z,cssVars:v?void 0:l,themeClass:h==null?void 0:h.themeClass,onRender:h==null?void 0:h.onRender}},render(){var e;const{mergedValue:o,mergedClsPrefix:t,handleFocusin:n,handleFocusout:d}=this,{children:f,isButtonGroup:r}=xe(ce(be(this)),o,t);return(e=this.onRender)===null||e===void 0||e.call(this),y("div",{onFocusin:n,onFocusout:d,ref:"selfElRef",class:[`${t}-radio-group`,this.rtlEnabled&&`${t}-radio-group--rtl`,this.themeClass,r&&`${t}-radio-group--button-group`],style:this.cssVars},f)}});export{ze as N,Se as a};
