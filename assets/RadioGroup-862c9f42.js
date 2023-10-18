import{c as ne,b as L,$ as ae,a0 as M,r as $,T as ie,a1 as E,a2 as G,a3 as O,u as j,a4 as F,d as B,f as x,e as l,h as S,a5 as U,i as N,j as V,l as D,n as I,k as K,o as W,p as y,v as de,Q as se,a6 as le}from"./index-4aea67d9.js";import{g as ce}from"./Space-f2e62416.js";const ue={radioSizeSmall:"14px",radioSizeMedium:"16px",radioSizeLarge:"18px",labelPadding:"0 8px",labelFontWeight:"400"},be=e=>{const{borderColor:o,primaryColor:t,baseColor:n,textColorDisabled:a,inputColorDisabled:f,textColor2:r,opacityDisabled:s,borderRadius:d,fontSizeSmall:v,fontSizeMedium:p,fontSizeLarge:C,heightSmall:b,heightMedium:w,heightLarge:m,lineHeight:R}=e;return Object.assign(Object.assign({},ue),{labelLineHeight:R,buttonHeightSmall:b,buttonHeightMedium:w,buttonHeightLarge:m,fontSizeSmall:v,fontSizeMedium:p,fontSizeLarge:C,boxShadow:`inset 0 0 0 1px ${o}`,boxShadowActive:`inset 0 0 0 1px ${t}`,boxShadowFocus:`inset 0 0 0 1px ${t}, 0 0 0 2px ${L(t,{alpha:.2})}`,boxShadowHover:`inset 0 0 0 1px ${t}`,boxShadowDisabled:`inset 0 0 0 1px ${o}`,color:n,colorDisabled:f,colorActive:"#0000",textColor:r,textColorDisabled:a,dotColorActive:t,dotColorDisabled:o,buttonBorderColor:o,buttonBorderColorActive:t,buttonBorderColorHover:o,buttonColor:n,buttonColorActive:n,buttonTextColor:r,buttonTextColorActive:t,buttonTextColorHover:t,opacityDisabled:s,buttonBoxShadowFocus:`inset 0 0 0 1px ${t}, 0 0 0 2px ${L(t,{alpha:.3})}`,buttonBoxShadowHover:"inset 0 0 0 1px #0000",buttonBoxShadow:"inset 0 0 0 1px #0000",buttonBorderRadius:d})},he={name:"Radio",common:ne,self:be},Q=he,fe={name:String,value:{type:[String,Number,Boolean],default:"on"},checked:{type:Boolean,default:void 0},defaultChecked:Boolean,disabled:{type:Boolean,default:void 0},label:String,size:String,onUpdateChecked:[Function,Array],"onUpdate:checked":[Function,Array],checkedValue:{type:Boolean,default:void 0}},Y=ae("n-radio-group");function ve(e){const o=M(e,{mergedSize(i){const{size:c}=e;if(c!==void 0)return c;if(r){const{mergedSizeRef:{value:h}}=r;if(h!==void 0)return h}return i?i.mergedSize.value:"medium"},mergedDisabled(i){return!!(e.disabled||r!=null&&r.disabledRef.value||i!=null&&i.disabled.value)}}),{mergedSizeRef:t,mergedDisabledRef:n}=o,a=$(null),f=$(null),r=ie(Y,null),s=$(e.defaultChecked),d=E(e,"checked"),v=G(d,s),p=O(()=>r?r.valueRef.value===e.value:v.value),C=O(()=>{const{name:i}=e;if(i!==void 0)return i;if(r)return r.nameRef.value}),b=$(!1);function w(){if(r){const{doUpdateValue:i}=r,{value:c}=e;F(i,c)}else{const{onUpdateChecked:i,"onUpdate:checked":c}=e,{nTriggerFormInput:h,nTriggerFormChange:u}=o;i&&F(i,!0),c&&F(c,!0),h(),u(),s.value=!0}}function m(){n.value||p.value||w()}function R(){m()}function z(){b.value=!1}function k(){b.value=!0}return{mergedClsPrefix:r?r.mergedClsPrefixRef:j(e).mergedClsPrefixRef,inputRef:a,labelRef:f,mergedName:C,mergedDisabled:n,uncontrolledChecked:s,renderSafeChecked:p,focus:b,mergedSize:t,handleRadioInputChange:R,handleRadioInputBlur:z,handleRadioInputFocus:k}}const ge=B("radio",`
 line-height: var(--n-label-line-height);
 outline: none;
 position: relative;
 user-select: none;
 -webkit-user-select: none;
 display: inline-flex;
 align-items: flex-start;
 flex-wrap: nowrap;
 font-size: var(--n-font-size);
 word-break: break-word;
`,[x("checked",[l("dot",`
 background-color: var(--n-color-active);
 `)]),l("dot-wrapper",`
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
 `),l("dot",`
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
 `),x("checked",{boxShadow:"var(--n-box-shadow-active)"},[S("&::before",`
 opacity: 1;
 transform: scale(1);
 `)])]),l("label",`
 color: var(--n-text-color);
 padding: var(--n-label-padding);
 font-weight: var(--n-label-font-weight);
 display: inline-block;
 transition: color .3s var(--n-bezier);
 `),U("disabled",`
 cursor: pointer;
 `,[S("&:hover",[l("dot",{boxShadow:"var(--n-box-shadow-hover)"})]),x("focus",[S("&:not(:active)",[l("dot",{boxShadow:"var(--n-box-shadow-focus)"})])])]),x("disabled",`
 cursor: not-allowed;
 `,[l("dot",{boxShadow:"var(--n-box-shadow-disabled)",backgroundColor:"var(--n-color-disabled)"},[S("&::before",{backgroundColor:"var(--n-dot-color-disabled)"}),x("checked",`
 opacity: 1;
 `)]),l("label",{color:"var(--n-text-color-disabled)"}),B("radio-input",`
 cursor: not-allowed;
 `)])]),pe=Object.assign(Object.assign({},V.props),fe),Se=N({name:"Radio",props:pe,setup(e){const o=ve(e),t=V("Radio","-radio",ge,Q,e,o.mergedClsPrefix),n=D(()=>{const{mergedSize:{value:v}}=o,{common:{cubicBezierEaseInOut:p},self:{boxShadow:C,boxShadowActive:b,boxShadowDisabled:w,boxShadowFocus:m,boxShadowHover:R,color:z,colorDisabled:k,colorActive:i,textColor:c,textColorDisabled:h,dotColorActive:u,dotColorDisabled:g,labelPadding:_,labelLineHeight:T,labelFontWeight:A,[I("fontSize",v)]:H,[I("radioSize",v)]:P}}=t.value;return{"--n-bezier":p,"--n-label-line-height":T,"--n-label-font-weight":A,"--n-box-shadow":C,"--n-box-shadow-active":b,"--n-box-shadow-disabled":w,"--n-box-shadow-focus":m,"--n-box-shadow-hover":R,"--n-color":z,"--n-color-active":i,"--n-color-disabled":k,"--n-dot-color-active":u,"--n-dot-color-disabled":g,"--n-font-size":H,"--n-radio-size":P,"--n-text-color":c,"--n-text-color-disabled":h,"--n-label-padding":_}}),{inlineThemeDisabled:a,mergedClsPrefixRef:f,mergedRtlRef:r}=j(e),s=K("Radio",r,f),d=a?W("radio",D(()=>o.mergedSize.value[0]),n,e):void 0;return Object.assign(o,{rtlEnabled:s,cssVars:a?void 0:n,themeClass:d==null?void 0:d.themeClass,onRender:d==null?void 0:d.onRender})},render(){const{$slots:e,mergedClsPrefix:o,onRender:t,label:n}=this;return t==null||t(),y("label",{class:[`${o}-radio`,this.themeClass,{[`${o}-radio--rtl`]:this.rtlEnabled,[`${o}-radio--disabled`]:this.mergedDisabled,[`${o}-radio--checked`]:this.renderSafeChecked,[`${o}-radio--focus`]:this.focus}],style:this.cssVars},y("input",{ref:"inputRef",type:"radio",class:`${o}-radio-input`,value:this.value,name:this.mergedName,checked:this.renderSafeChecked,disabled:this.mergedDisabled,onChange:this.handleRadioInputChange,onFocus:this.handleRadioInputFocus,onBlur:this.handleRadioInputBlur}),y("div",{class:`${o}-radio__dot-wrapper`}," ",y("div",{class:[`${o}-radio__dot`,this.renderSafeChecked&&`${o}-radio__dot--checked`]})),de(e.default,a=>!a&&!n?null:y("div",{ref:"labelRef",class:`${o}-radio__label`},a||n)))}}),me=B("radio-group",`
 display: inline-block;
 font-size: var(--n-font-size);
`,[l("splitor",`
 display: inline-block;
 vertical-align: bottom;
 width: 1px;
 transition:
 background-color .3s var(--n-bezier),
 opacity .3s var(--n-bezier);
 background: var(--n-button-border-color);
 `,[x("checked",{backgroundColor:"var(--n-button-border-color-active)"}),x("disabled",{opacity:"var(--n-opacity-disabled)"})]),x("button-group",`
 white-space: nowrap;
 height: var(--n-height);
 line-height: var(--n-height);
 `,[B("radio-button",{height:"var(--n-height)",lineHeight:"var(--n-height)"}),l("splitor",{height:"var(--n-height)"})]),B("radio-button",`
 vertical-align: bottom;
 outline: none;
 position: relative;
 user-select: none;
 -webkit-user-select: none;
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
 pointer-events: none;
 position: absolute;
 border: 0;
 border-radius: inherit;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 opacity: 0;
 z-index: 1;
 `),l("state-border",`
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
 `,[l("state-border",`
 border-top-left-radius: var(--n-button-border-radius);
 border-bottom-left-radius: var(--n-button-border-radius);
 `)]),S("&:last-child",`
 border-top-right-radius: var(--n-button-border-radius);
 border-bottom-right-radius: var(--n-button-border-radius);
 border-right: 1px solid var(--n-button-border-color);
 `,[l("state-border",`
 border-top-right-radius: var(--n-button-border-radius);
 border-bottom-right-radius: var(--n-button-border-radius);
 `)]),U("disabled",`
 cursor: pointer;
 `,[S("&:hover",[l("state-border",`
 transition: box-shadow .3s var(--n-bezier);
 box-shadow: var(--n-button-box-shadow-hover);
 `),U("checked",{color:"var(--n-button-text-color-hover)"})]),x("focus",[S("&:not(:active)",[l("state-border",{boxShadow:"var(--n-button-box-shadow-focus)"})])])]),x("checked",`
 background: var(--n-button-color-active);
 color: var(--n-button-text-color-active);
 border-color: var(--n-button-border-color-active);
 `),x("disabled",`
 cursor: not-allowed;
 opacity: var(--n-opacity-disabled);
 `)])]);function xe(e,o,t){var n;const a=[];let f=!1;for(let r=0;r<e.length;++r){const s=e[r],d=(n=s.type)===null||n===void 0?void 0:n.name;d==="RadioButton"&&(f=!0);const v=s.props;if(d!=="RadioButton"){a.push(s);continue}if(r===0)a.push(s);else{const p=a[a.length-1].props,C=o===p.value,b=p.disabled,w=o===v.value,m=v.disabled,R=(C?2:0)+(b?0:1),z=(w?2:0)+(m?0:1),k={[`${t}-radio-group__splitor--disabled`]:b,[`${t}-radio-group__splitor--checked`]:C},i={[`${t}-radio-group__splitor--disabled`]:m,[`${t}-radio-group__splitor--checked`]:w},c=R<z?i:k;a.push(y("div",{class:[`${t}-radio-group__splitor`,c]}),s)}}return{children:a,isButtonGroup:f}}const Ce=Object.assign(Object.assign({},V.props),{name:String,value:[String,Number,Boolean],defaultValue:{type:[String,Number,Boolean],default:null},size:String,disabled:{type:Boolean,default:void 0},"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array]}),ze=N({name:"RadioGroup",props:Ce,setup(e){const o=$(null),{mergedSizeRef:t,mergedDisabledRef:n,nTriggerFormChange:a,nTriggerFormInput:f,nTriggerFormBlur:r,nTriggerFormFocus:s}=M(e),{mergedClsPrefixRef:d,inlineThemeDisabled:v,mergedRtlRef:p}=j(e),C=V("Radio","-radio-group",me,Q,e,d),b=$(e.defaultValue),w=E(e,"value"),m=G(w,b);function R(u){const{onUpdateValue:g,"onUpdate:value":_}=e;g&&F(g,u),_&&F(_,u),b.value=u,a(),f()}function z(u){const{value:g}=o;g&&(g.contains(u.relatedTarget)||s())}function k(u){const{value:g}=o;g&&(g.contains(u.relatedTarget)||r())}se(Y,{mergedClsPrefixRef:d,nameRef:E(e,"name"),valueRef:m,disabledRef:n,mergedSizeRef:t,doUpdateValue:R});const i=K("Radio",p,d),c=D(()=>{const{value:u}=t,{common:{cubicBezierEaseInOut:g},self:{buttonBorderColor:_,buttonBorderColorActive:T,buttonBorderRadius:A,buttonBoxShadow:H,buttonBoxShadowFocus:P,buttonBoxShadowHover:q,buttonColorActive:J,buttonTextColor:X,buttonTextColorActive:Z,buttonTextColorHover:ee,opacityDisabled:oe,[I("buttonHeight",u)]:te,[I("fontSize",u)]:re}}=C.value;return{"--n-font-size":re,"--n-bezier":g,"--n-button-border-color":_,"--n-button-border-color-active":T,"--n-button-border-radius":A,"--n-button-box-shadow":H,"--n-button-box-shadow-focus":P,"--n-button-box-shadow-hover":q,"--n-button-color-active":J,"--n-button-text-color":X,"--n-button-text-color-hover":ee,"--n-button-text-color-active":Z,"--n-height":te,"--n-opacity-disabled":oe}}),h=v?W("radio-group",D(()=>t.value[0]),c,e):void 0;return{selfElRef:o,rtlEnabled:i,mergedClsPrefix:d,mergedValue:m,handleFocusout:k,handleFocusin:z,cssVars:v?void 0:c,themeClass:h==null?void 0:h.themeClass,onRender:h==null?void 0:h.onRender}},render(){var e;const{mergedValue:o,mergedClsPrefix:t,handleFocusin:n,handleFocusout:a}=this,{children:f,isButtonGroup:r}=xe(le(ce(this)),o,t);return(e=this.onRender)===null||e===void 0||e.call(this),y("div",{onFocusin:n,onFocusout:a,ref:"selfElRef",class:[`${t}-radio-group`,this.rtlEnabled&&`${t}-radio-group--rtl`,this.themeClass,r&&`${t}-radio-group--button-group`],style:this.cssVars},f)}});export{ze as _,Se as a};
