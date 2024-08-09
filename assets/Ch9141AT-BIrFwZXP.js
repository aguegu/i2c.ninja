import{y as D,r as w,l as E,A as F,C as A,D as l,O as K,B as C,X as q,J as u,F as f,G as k,Z as M,L as I,K as G,M as H,P as J}from"./index-D8iiR0FR.js";import{f as W,b as d,_ as X}from"./index-Bjb9kidm.js";import{_ as Z}from"./Space-D9uvP3KX.js";const z=["value"],Q={name:"ComponentSerialPort"},re=Object.assign(Q,{setup(Y,{expose:P}){const y=D(),p=w(!1),o=w(""),x=w("AT+"),U=new TextEncoder,O=new TextDecoder,$=w(null);let a=null,m=null,v=null;const h={baudRate:115200,dataBits:8,stopBits:1,parity:"none",flowControl:"none"},T=async()=>{const{value:t,done:e}=await m.read();if(e)return Promise.resolve();const n=O.decode(t);return y.emit("rx",n),o.value+=n,J().then(()=>{$.value.scrollTop=$.value.scrollHeight}),T()},L=async()=>{await a.open(h),p.value=!0,m=a.readable.getReader(),v=a.writable.getWriter(),T()},S=async(t=!1)=>{try{return p.value?(console.log("serial port opend already"),Promise.resolve()):((t||!a)&&(a=await navigator.serial.requestPort({filters:[{usbVendorId:6790}]})),L())}catch{return Promise.resolve()}},B=async()=>{await v.close(),await v.releaseLock(),await m.cancel(),await m.releaseLock(),await a.close(),p.value=!1,console.log("serial port closed")},N=t=>new Promise((e,n)=>{let r="";const i=`${t}\r
`,g=s=>{if(r+=s,r.indexOf(`\r
OK\r
`)>-1||r.indexOf(`\r
ERROR\r
`)>-1){y.off("rx",g);const b=r.split(`\r
`);e(d.Buffer.from(b[b.length-3],"hex"))}};y.on("rx",g),v.write(U.encode(i)).catch(n)}),R=W.promise(N,1),c=t=>R.push(t).then(e=>(o.value+=`----\r
`,o.value+=e.toString(),o.value+=`-----------------------\r
`,Promise.resolve(e))),V=async()=>{await B(),await a.forget(),a=null},_=E(()=>`AT+BL=${d.Buffer.from(x.value).toString("hex").toUpperCase()}`),j=async()=>{let t=await c(`AT+BL=${d.Buffer.from("AT+NAME?").toString("hex").toUpperCase()}`);const e=t.toString().split(`\r
`)[0];t=await c(`AT+BL=${d.Buffer.from("AT+MAC?").toString("hex").toUpperCase()}`);const n=t.toString().split(`\r
`)[0].split(":").reverse().join(":");t=await c("AT+SC");const r=Array.from(d.Buffer.from(t,"utf-8"));o.value+=`${e}\r
${n}\r
`,o.value+=`-----------------------\r
`,o.value+=`Devices: ${r.map(i=>i.toString(16).toUpperCase()).join(" ")}\r
`,o.value+=`-----------------------\r
`,o.value+=`${e}	${n}	${r.map(i=>i.toString(16).toUpperCase()).join("")}`,o.value+=`\r
-----------------------\r
`};return F(()=>{a&&p.value&&B()}),P({transmit:c,connect:S,disconnect:B}),(t,e)=>{const n=H,r=Z,i=X,g=K;return C(),A(g,{title:t.$t("adapter.serial"),bordered:!1},{"header-extra":l(()=>[p.value?(C(),q(M,{key:0},[u(n,{onClick:e[0]||(e[0]=s=>o.value="")},{default:l(()=>[f(k(t.$t("adapter.Clear")),1)]),_:1}),u(r,null,{default:l(()=>[u(n,{onClick:e[1]||(e[1]=s=>c(_.value))},{default:l(()=>[f(k(t.$t("adapter.Transmit")),1)]),_:1}),u(n,{onClick:e[2]||(e[2]=s=>j())},{default:l(()=>[f("Name")]),_:1}),u(n,{type:"warning",onClick:V},{default:l(()=>[f("Forget Port")]),_:1})]),_:1})],64)):(C(),A(n,{key:1,onClick:S,type:"primary"},{default:l(()=>[f(k(t.$t("adapter.Open")),1)]),_:1}))]),default:l(()=>[u(r,{vertical:""},{default:l(()=>[u(i,{value:x.value,"onUpdate:value":e[3]||(e[3]=s=>x.value=s),type:"text",onKeyup:e[4]||(e[4]=I(s=>c(_.value),["enter"]))},null,8,["value"]),u(i,{value:_.value,"onUpdate:value":e[5]||(e[5]=s=>_.value=s),type:"text",readonly:""},null,8,["value"]),G("textarea",{ref_key:"com",ref:$,value:o.value,rows:"60",readonly:"",style:{width:"100%",border:"solid 1px #ccc"}},null,8,z)]),_:1})]),_:1},8,["title"])}}});export{re as default};
