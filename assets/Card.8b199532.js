import{n as D,f as t,b as f,s as l,g as n,aa as G,ab as J,ac as K,d as N,w as Q,x as _,F as q,a as $,I as U,h as i,J as v,ad as X,Q as Y,G as y,H as Z}from"./index.632e8426.js";var oo={paddingSmall:"12px 16px 12px",paddingMedium:"19px 24px 20px",paddingLarge:"23px 32px 24px",paddingHuge:"27px 40px 28px",titleFontSizeSmall:"16px",titleFontSizeMedium:"18px",titleFontSizeLarge:"18px",titleFontSizeHuge:"18px",closeSize:"18px"};const eo=o=>{const{primaryColor:p,borderRadius:b,lineHeight:e,fontSize:s,cardColor:c,textColor2:d,textColor1:r,dividerColor:a,fontWeightStrong:g,closeColor:h,closeColorHover:x,closeColorPressed:u,modalColor:z,boxShadow1:C,popoverColor:S,actionColor:m}=o;return Object.assign(Object.assign({},oo),{lineHeight:e,color:c,colorModal:z,colorPopover:S,colorTarget:p,colorEmbedded:m,textColor:d,titleTextColor:r,borderColor:a,actionColor:m,titleFontWeight:g,closeColor:h,closeColorHover:x,closeColorPressed:u,fontSizeSmall:s,fontSizeMedium:s,fontSizeLarge:s,fontSizeHuge:s,boxShadow:C,borderRadius:b})},ro={name:"Card",common:D,self:eo};var to=ro,no=t([f("card",`
 font-size: var(--n-font-size);
 line-height: var(--n-line-height);
 display: flex;
 flex-direction: column;
 width: 100%;
 box-sizing: border-box;
 position: relative;
 border-radius: var(--n-border-radius);
 background-color: var(--n-color);
 color: var(--n-text-color);
 transition: 
 color .3s var(--n-bezier),
 background-color .3s var(--n-bezier),
 box-shadow .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 `,[l("hoverable",[t("&:hover","box-shadow: var(--n-box-shadow);")]),l("content-segmented",[t(">",[n("content",{paddingTop:"var(--n-padding-bottom)"})])]),l("content-soft-segmented",[t(">",[n("content",`
 margin: 0 var(--n-padding-left);
 padding: var(--n-padding-bottom) 0;
 `)])]),l("footer-segmented",[t(">",[n("footer",{paddingTop:"var(--n-padding-bottom)"})])]),l("footer-soft-segmented",[t(">",[n("footer",`
 padding: var(--n-padding-bottom) 0;
 margin: 0 var(--n-padding-left);
 `)])]),t(">",[f("card-header",`
 box-sizing: border-box;
 display: flex;
 align-items: center;
 font-size: var(--n-title-font-size);
 padding:
 var(--n-padding-top)
 var(--n-padding-left)
 var(--n-padding-bottom)
 var(--n-padding-left);
 `,[n("main",`
 font-weight: var(--n-title-font-weight);
 transition: color .3s var(--n-bezier);
 flex: 1;
 color: var(--n-title-text-color);
 `),n("extra",`
 display: flex;
 align-items: center;
 font-size: var(--n-font-size);
 font-weight: 400;
 transition: color .3s var(--n-bezier);
 color: var(--n-text-color);
 `),n("close",`
 font-size: var(--n-close-size);
 transition: color .3s var(--n-bezier);
 `)]),n("action",`
 box-sizing: border-box;
 transition:
 background-color .3s var(--n-bezier),
 border-color .3s var(--n-bezier);
 background-clip: padding-box;
 background-color: var(--n-action-color);
 `),n("content","flex: 1;"),n("content, footer",`
 box-sizing: border-box;
 padding: 0 var(--n-padding-left) var(--n-padding-bottom) var(--n-padding-left);
 font-size: var(--n-font-size);
 `,[t("&:first-child",{paddingTop:"var(--n-padding-bottom)"})]),n("action",`
 background-color: var(--n-action-color);
 padding: var(--n-padding-bottom) var(--n-padding-left);
 border-bottom-left-radius: var(--n-border-radius);
 border-bottom-right-radius: var(--n-border-radius);
 `)]),f("card-cover",`
 overflow: hidden;
 width: 100%;
 border-radius: var(--n-border-radius) var(--n-border-radius) 0 0;
 `,[t("img",`
 display: block;
 width: 100%;
 `)]),l("bordered",`
 border: 1px solid var(--n-border-color);
 `,[t("&:target","border-color: var(--n-color-target);")]),l("action-segmented",[t(">",[n("action",[t("&:not(:first-child)",{borderTop:"1px solid var(--n-border-color)"})])])]),l("content-segmented, content-soft-segmented",[t(">",[n("content",{transition:"border-color 0.3s var(--n-bezier)"},[t("&:not(:first-child)",{borderTop:"1px solid var(--n-border-color)"})])])]),l("footer-segmented, footer-soft-segmented",[t(">",[n("footer",{transition:"border-color 0.3s var(--n-bezier)"},[t("&:not(:first-child)",{borderTop:"1px solid var(--n-border-color)"})])])])]),G(f("card",{background:"var(--n-color-modal)"})),J(f("card",{background:"var(--n-color-popover)"})),f("card",[K({background:"var(--n-color-modal)"})])]);const ao={title:String,contentStyle:[Object,String],headerStyle:[Object,String],headerExtraStyle:[Object,String],footerStyle:[Object,String],embedded:Boolean,segmented:{type:[Boolean,Object],default:!1},size:{type:String,default:"medium"},bordered:{type:Boolean,default:!0},closable:{type:Boolean,default:!1},hoverable:Boolean,role:String,onClose:[Function,Array]},lo=Object.assign(Object.assign({},_.props),ao);var so=N({name:"Card",props:lo,setup(o){const p=()=>{const{onClose:g}=o;g&&Y(g)},{inlineThemeDisabled:b,mergedClsPrefixRef:e,mergedRtlRef:s}=Q(o),c=_("Card","-card",no,to,o,e),d=q("Card",s,e),r=$(()=>{const{size:g}=o,{self:{color:h,colorModal:x,colorTarget:u,textColor:z,titleTextColor:C,titleFontWeight:S,borderColor:m,actionColor:w,borderRadius:T,closeColor:k,closeColorHover:P,closeColorPressed:R,lineHeight:B,closeSize:F,boxShadow:H,colorPopover:O,colorEmbedded:j,[y("padding",g)]:E,[y("fontSize",g)]:M,[y("titleFontSize",g)]:L},common:{cubicBezierEaseInOut:V}}=c.value,{top:W,left:I,bottom:A}=Z(E);return{"--n-bezier":V,"--n-border-radius":T,"--n-color":o.embedded?j:h,"--n-color-modal":x,"--n-color-popover":O,"--n-color-target":u,"--n-text-color":z,"--n-line-height":B,"--n-action-color":w,"--n-title-text-color":C,"--n-title-font-weight":S,"--n-close-color":k,"--n-close-color-hover":P,"--n-close-color-pressed":R,"--n-border-color":m,"--n-box-shadow":H,"--n-padding-top":W,"--n-padding-bottom":A,"--n-padding-left":I,"--n-font-size":M,"--n-title-font-size":L,"--n-close-size":F}}),a=b?U("card",$(()=>o.size[0]),r,o):void 0;return{rtlEnabled:d,mergedClsPrefix:e,mergedTheme:c,handleCloseClick:p,cssVars:b?void 0:r,themeClass:a==null?void 0:a.themeClass,onRender:a==null?void 0:a.onRender}},render(){const{segmented:o,bordered:p,hoverable:b,mergedClsPrefix:e,rtlEnabled:s,onRender:c,$slots:d}=this;return c==null||c(),i("div",{class:[`${e}-card`,this.themeClass,{[`${e}-card--rtl`]:s,[`${e}-card--content${typeof o!="boolean"&&o.content==="soft"?"-soft":""}-segmented`]:o===!0||o!==!1&&o.content,[`${e}-card--footer${typeof o!="boolean"&&o.footer==="soft"?"-soft":""}-segmented`]:o===!0||o!==!1&&o.footer,[`${e}-card--action-segmented`]:o===!0||o!==!1&&o.action,[`${e}-card--bordered`]:p,[`${e}-card--hoverable`]:b}],style:this.cssVars,role:this.role},v(d.cover,r=>r&&i("div",{class:`${e}-card-cover`,role:"none"},r)),v(d.header,r=>r||this.title||this.closable?i("div",{class:`${e}-card-header`,style:this.headerStyle},i("div",{class:`${e}-card-header__main`,role:"heading"},r||[this.title]),v(d["header-extra"],a=>a&&i("div",{class:`${e}-card-header__extra`,style:this.headerExtraStyle},a)),this.closable?i(X,{clsPrefix:e,class:`${e}-card-header__close`,onClick:this.handleCloseClick}):null):null),v(d.default,r=>r&&i("div",{class:`${e}-card__content`,style:this.contentStyle,role:"none"},r)),v(d.footer,r=>r&&[i("div",{class:`${e}-card__footer`,style:this.footerStyle,role:"none"},r)]),v(d.action,r=>r&&i("div",{class:`${e}-card__action`,role:"none"},r)))}});export{so as _};
