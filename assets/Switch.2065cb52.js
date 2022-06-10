import{g as de,_ as ce,b as ue}from"./Grid.2c2b07c1.js";import{f as he,_ as be,e as fe}from"./bh1750.0df03ba3.js";import{h as K,r as $,q as o,aX as j,O as ge,P as ve,D as L,G as t,H as O,E as P,S as s,T as D,u as me,j as N,V as pe,J as we,U as xe,l as V,s as g,aO as W,v as d,a1 as ye,aY as M,a2 as v,N as _e,M as ke,a6 as H}from"./index.35f855e2.js";const Se=Object.assign(Object.assign({},ue),fe);var We=K({__GRID_ITEM__:!0,name:"FormItemGridItem",alias:["FormItemGi"],props:Se,setup(){const e=$(null);return{formItemInstRef:e,validate:(...n)=>{const{value:r}=e;if(r)return r.validate(...n)},restoreValidation:()=>{const{value:n}=e;if(n)return n.restoreValidation()}}},render(){return o(ce,j(this.$.vnode.props||{},de),{default:()=>{const e=j(this.$props,he);return o(be,Object.assign({ref:"formItemInstRef"},e),this.$slots)}})}}),Re={buttonHeightSmall:"14px",buttonHeightMedium:"18px",buttonHeightLarge:"22px",buttonWidthSmall:"14px",buttonWidthMedium:"18px",buttonWidthLarge:"22px",buttonWidthPressedSmall:"20px",buttonWidthPressedMedium:"24px",buttonWidthPressedLarge:"28px",railHeightSmall:"18px",railHeightMedium:"22px",railHeightLarge:"26px",railWidthSmall:"32px",railWidthMedium:"40px",railWidthLarge:"48px"};const Be=e=>{const{primaryColor:l,opacityDisabled:c,borderRadius:n,textColor3:r}=e,m="rgba(0, 0, 0, .14)";return Object.assign(Object.assign({},Re),{iconColor:r,textColor:"white",loadingColor:l,opacityDisabled:c,railColor:m,railColorActive:l,buttonBoxShadow:"0 1px 4px 0 rgba(0, 0, 0, 0.3), inset 0 0 1px 0 rgba(0, 0, 0, 0.05)",buttonColor:"#FFF",railBorderRadiusSmall:n,railBorderRadiusMedium:n,railBorderRadiusLarge:n,buttonBorderRadiusSmall:n,buttonBorderRadiusMedium:n,buttonBorderRadiusLarge:n,boxShadowFocus:`0 0 0 2px ${ve(l,{alpha:.2})}`})},Ce={name:"Switch",common:ge,self:Be};var Ve=Ce,$e=L("switch",`
 height: var(--n-height);
 min-width: var(--n-width);
 vertical-align: middle;
 user-select: none;
 display: inline-flex;
 outline: none;
 justify-content: center;
 align-items: center;
`,[t("children-placeholder",`
 height: var(--n-rail-height);
 display: flex;
 flex-direction: column;
 overflow: hidden;
 pointer-events: none;
 visibility: hidden;
 `),t("rail-placeholder",`
 display: flex;
 flex-wrap: none;
 `),t("button-placeholder",`
 width: calc(1.75 * var(--n-rail-height));
 height: var(--n-rail-height);
 `),L("base-loading",`
 position: absolute;
 top: 50%;
 left: 50%;
 transform: translateX(-50%) translateY(-50%);
 font-size: calc(var(--n-button-width) - 4px);
 color: var(--n-loading-color);
 transition: color .3s var(--n-bezier);
 `,[O({left:"50%",top:"50%",originalTransform:"translateX(-50%) translateY(-50%)"})]),t("checked, unchecked",`
 transition: color .3s var(--n-bezier);
 color: var(--n-text-color);
 box-sizing: border-box;
 position: absolute;
 white-space: nowrap;
 top: 0;
 bottom: 0;
 display: flex;
 align-items: center;
 line-height: 1;
 `),t("checked",`
 right: 0;
 padding-right: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),t("unchecked",`
 left: 0;
 justify-content: flex-end;
 padding-left: calc(1.25 * var(--n-rail-height) - var(--n-offset));
 `),P("&:focus",[t("rail",`
 box-shadow: var(--n-box-shadow-focus);
 `)]),s("round",[t("rail","border-radius: calc(var(--n-rail-height) / 2);",[t("button","border-radius: calc(var(--n-button-height) / 2);")])]),D("disabled",[D("icon",[s("rubber-band",[s("pressed",[t("rail",[t("button","max-width: var(--n-button-width-pressed);")])]),t("rail",[P("&:active",[t("button","max-width: var(--n-button-width-pressed);")])]),s("active",[s("pressed",[t("rail",[t("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])]),t("rail",[P("&:active",[t("button","left: calc(100% - var(--n-offset) - var(--n-button-width-pressed));")])])])])])]),s("active",[t("rail",[t("button","left: calc(100% - (var(--n-rail-height) + var(--n-button-width)) / 2)")])]),t("rail",`
 overflow: hidden;
 height: var(--n-rail-height);
 min-width: var(--n-rail-width);
 border-radius: var(--n-rail-border-radius);
 cursor: pointer;
 position: relative;
 transition:
 opacity .3s var(--n-bezier),
 background .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 background-color: var(--n-rail-color);
 `,[t("button-icon",`
 color: var(--n-icon-color);
 transition: color .3s var(--n-bezier);
 font-size: calc(var(--n-button-height) - 4px);
 position: absolute;
 left: 0;
 right: 0;
 top: 0;
 bottom: 0;
 display: flex;
 justify-content: center;
 align-items: center;
 line-height: 1;
 `,[O()]),t("button",`
 align-items: center; 
 top: var(--n-offset);
 left: var(--n-offset);
 height: var(--n-button-width);
 width: var(--n-button-width-pressed);
 max-width: var(--n-button-width);
 border-radius: var(--n-button-border-radius);
 background-color: var(--n-button-color);
 box-shadow: var(--n-button-box-shadow);
 box-sizing: border-box;
 cursor: inherit;
 content: "";
 position: absolute;
 transition:
 background-color .3s var(--n-bezier),
 left .3s var(--n-bezier),
 opacity .3s var(--n-bezier),
 max-width .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier);
 `)]),s("active",[t("rail","background-color: var(--n-rail-color-active);")]),s("loading",[t("rail",`
 cursor: wait;
 `)]),s("disabled",[t("rail",`
 cursor: not-allowed;
 opacity: .5;
 `)])]);const Fe=Object.assign(Object.assign({},N.props),{size:{type:String,default:"medium"},value:{type:[String,Number,Boolean],default:void 0},loading:Boolean,defaultValue:{type:[String,Number,Boolean],default:!1},disabled:{type:Boolean,default:void 0},round:{type:Boolean,default:!0},"onUpdate:value":[Function,Array],onUpdateValue:[Function,Array],checkedValue:{type:[String,Number,Boolean],default:!0},uncheckedValue:{type:[String,Number,Boolean],default:!1},railStyle:Function,rubberBand:{type:Boolean,default:!0},onChange:[Function,Array]});var Me=K({name:"Switch",props:Fe,setup(e){const{mergedClsPrefixRef:l,inlineThemeDisabled:c}=me(e),n=N("Switch","-switch",$e,Ve,e,l),r=pe(e),{mergedSizeRef:m,mergedDisabledRef:b}=r,x=$(e.defaultValue),S=we(e,"value"),f=xe(S,x),y=V(()=>f.value===e.checkedValue),p=$(!1),i=$(!1),u=V(()=>{const{railStyle:a}=e;if(!!a)return a({focused:i.value,checked:y.value})});function h(a){const{"onUpdate:value":R,onChange:B,onUpdateValue:C}=e,{nTriggerFormInput:F,nTriggerFormChange:z}=r;R&&H(R,a),C&&H(C,a),B&&H(B,a),x.value=a,F(),z()}function U(){const{nTriggerFormFocus:a}=r;a()}function A(){const{nTriggerFormBlur:a}=r;a()}function E(){e.loading||b.value||(f.value!==e.checkedValue?h(e.checkedValue):h(e.uncheckedValue))}function G(){i.value=!0,U()}function X(){i.value=!1,A(),p.value=!1}function Y(a){e.loading||b.value||a.key===" "&&(f.value!==e.checkedValue?h(e.checkedValue):h(e.uncheckedValue),p.value=!1)}function q(a){e.loading||b.value||a.key===" "&&(a.preventDefault(),p.value=!0)}const T=V(()=>{const{value:a}=m,{self:{opacityDisabled:R,railColor:B,railColorActive:C,buttonBoxShadow:F,buttonColor:z,boxShadowFocus:J,loadingColor:Q,textColor:Z,iconColor:ee,[g("buttonHeight",a)]:_,[g("buttonWidth",a)]:te,[g("buttonWidthPressed",a)]:ae,[g("railHeight",a)]:k,[g("railWidth",a)]:I,[g("railBorderRadius",a)]:ie,[g("buttonBorderRadius",a)]:oe},common:{cubicBezierEaseInOut:ne}}=n.value,re=W((d(k)-d(_))/2),le=W(Math.max(d(k),d(_))),se=d(k)>d(_)?I:W(d(I)+d(_)-d(k));return{"--n-bezier":ne,"--n-button-border-radius":oe,"--n-button-box-shadow":F,"--n-button-color":z,"--n-button-width":te,"--n-button-width-pressed":ae,"--n-button-height":_,"--n-height":le,"--n-offset":re,"--n-opacity-disabled":R,"--n-rail-border-radius":ie,"--n-rail-color":B,"--n-rail-color-active":C,"--n-rail-height":k,"--n-rail-width":I,"--n-width":se,"--n-box-shadow-focus":J,"--n-loading-color":Q,"--n-text-color":Z,"--n-icon-color":ee}}),w=c?ye("switch",V(()=>m.value[0]),T,e):void 0;return{handleClick:E,handleBlur:X,handleFocus:G,handleKeyup:Y,handleKeydown:q,mergedRailStyle:u,pressed:p,mergedClsPrefix:l,mergedValue:f,checked:y,mergedDisabled:b,cssVars:c?void 0:T,themeClass:w==null?void 0:w.themeClass,onRender:w==null?void 0:w.onRender}},render(){const{mergedClsPrefix:e,mergedDisabled:l,checked:c,mergedRailStyle:n,onRender:r,$slots:m}=this;r==null||r();const{checked:b,unchecked:x,icon:S,"checked-icon":f,"unchecked-icon":y}=m,p=!(M(S)&&M(f)&&M(y));return o("div",{role:"switch","aria-checked":c,class:[`${e}-switch`,this.themeClass,p&&`${e}-switch--icon`,c&&`${e}-switch--active`,l&&`${e}-switch--disabled`,this.round&&`${e}-switch--round`,this.loading&&`${e}-switch--loading`,this.pressed&&`${e}-switch--pressed`,this.rubberBand&&`${e}-switch--rubber-band`],tabindex:this.mergedDisabled?void 0:0,style:this.cssVars,onClick:this.handleClick,onFocus:this.handleFocus,onBlur:this.handleBlur,onKeyup:this.handleKeyup,onKeydown:this.handleKeydown},o("div",{class:`${e}-switch__rail`,"aria-hidden":"true",style:n},v(b,i=>v(x,u=>i||u?o("div",{"aria-hidden":!0,class:`${e}-switch__children-placeholder`},o("div",{class:`${e}-switch__rail-placeholder`},o("div",{class:`${e}-switch__button-placeholder`}),i),o("div",{class:`${e}-switch__rail-placeholder`},o("div",{class:`${e}-switch__button-placeholder`}),u)):null)),o("div",{class:`${e}-switch__button`},v(S,i=>v(f,u=>v(y,h=>o(_e,null,{default:()=>this.loading?o(ke,{key:"loading",clsPrefix:e,strokeWidth:20}):this.checked&&(u||i)?o("div",{class:`${e}-switch__button-icon`,key:u?"checked-icon":"icon"},u||i):!this.checked&&(h||i)?o("div",{class:`${e}-switch__button-icon`,key:h?"unchecked-icon":"icon"},h||i):null})))),v(b,i=>i&&o("div",{key:"checked",class:`${e}-switch__checked`},i)),v(x,i=>i&&o("div",{key:"unchecked",class:`${e}-switch__unchecked`},i)))))}});export{We as _,Me as a};
