import{E as p,y as r,H as c,h as C,u as _,i as f,k as z,M as S,m as i,O as u}from"./index.0658b5a7.js";const T=s=>{const{textColor2:e,textColor3:o,fontSize:n,fontWeight:l}=s;return{labelFontSize:n,labelFontWeight:l,valueFontWeight:l,labelTextColor:o,valuePrefixTextColor:e,valueSuffixTextColor:e,valueTextColor:e}},$={name:"Statistic",common:p,self:T};var w=$,F=r("statistic",[c("label",`
 font-weight: var(--n-label-font-weight);
 transition: .3s color var(--n-bezier);
 font-size: var(--n-label-font-size);
 color: var(--n-label-text-color);
 `),r("statistic-value",`
 margin-top: 4px;
 font-weight: var(--n-value-font-weight);
 `,[c("prefix",`
 margin: 0 4px 0 0;
 font-size: 24px;
 transition: .3s color var(--n-bezier);
 color: var(--n-value-prefix-text-color);
 `,[r("icon",{verticalAlign:"-0.125em"})]),c("content",`
 font-size: 24px;
 transition: .3s color var(--n-bezier);
 color: var(--n-value-text-color);
 `),c("suffix",`
 margin: 0 0 0 4px;
 font-size: 24px;
 transition: .3s color var(--n-bezier);
 color: var(--n-value-suffix-text-color);
 `,[r("icon",{verticalAlign:"-0.125em"})])])]);const P=Object.assign(Object.assign({},f.props),{tabularNums:Boolean,label:String,value:[String,Number]});var W=C({name:"Statistic",props:P,setup(s){const{mergedClsPrefixRef:e,inlineThemeDisabled:o}=_(s),n=f("Statistic","-statistic",F,w,s,e),l=z(()=>{const{self:{labelFontWeight:t,valueFontWeight:v,valuePrefixTextColor:x,labelTextColor:m,valueSuffixTextColor:b,valueTextColor:h,labelFontSize:d},common:{cubicBezierEaseInOut:g}}=n.value;return{"--n-bezier":g,"--n-label-font-size":d,"--n-label-font-weight":t,"--n-label-text-color":m,"--n-value-font-weight":v,"--n-value-prefix-text-color":x,"--n-value-suffix-text-color":b,"--n-value-text-color":h}}),a=o?S("statistic",void 0,l,s):void 0;return{mergedClsPrefix:e,cssVars:o?void 0:l,themeClass:a==null?void 0:a.themeClass,onRender:a==null?void 0:a.onRender}},render(){var s;const{mergedClsPrefix:e,$slots:{default:o,label:n,prefix:l,suffix:a}}=this;return(s=this.onRender)===null||s===void 0||s.call(this),i("div",{class:[`${e}-statistic`,this.themeClass],style:this.cssVars},u(n,t=>i("div",{class:`${e}-statistic__label`},this.label||t)),i("div",{class:`${e}-statistic-value`,style:{fontVariantNumeric:this.tabularNums?"tabular-nums":""}},u(l,t=>t&&i("span",{class:`${e}-statistic-value__prefix`},t)),this.value!==void 0?i("span",{class:`${e}-statistic-value__content`},this.value):u(o,t=>t&&i("span",{class:`${e}-statistic-value__content`},t)),u(a,t=>t&&i("span",{class:`${e}-statistic-value__suffix`},t))))}});export{W as _};
