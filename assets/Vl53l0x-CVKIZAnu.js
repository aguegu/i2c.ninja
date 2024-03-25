var H=Object.defineProperty;var y=(E,t,s)=>t in E?H(E,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):E[t]=s;var a=(E,t,s)=>(y(E,typeof t!="symbol"?t+"":t,s),s);import{l as i,_ as b,a as Y,b as k,e as W,c as Q,f as q,g as K,h as j,i as z,s as J,d as Z}from"./utils-CXPfh8Vn.js";import"./lodash-Dr83-R63.js";import{r as $,U as g,z as tt,P as x,V as at,A as st,C as N,D as _,O as it,B as I,J as h,F as S,G as L,K as P,M as et}from"./index-BK02bb7p.js";import{_ as rt}from"./Space-Dg0Pa17L.js";class dt{constructor(t,s="29"){a(this,"SYSRANGE_START",0);a(this,"SYSTEM_THRESH_HIGH",12);a(this,"SYSTEM_THRESH_LOW",14);a(this,"SYSTEM_SEQUENCE_CONFIG",1);a(this,"SYSTEM_RANGE_CONFIG",9);a(this,"SYSTEM_INTERMEASUREMENT_PERIOD",4);a(this,"SYSTEM_INTERRUPT_CONFIG_GPIO",10);a(this,"GPIO_HV_MUX_ACTIVE_HIGH",132);a(this,"SYSTEM_INTERRUPT_CLEAR",11);a(this,"RESULT_INTERRUPT_STATUS",19);a(this,"RESULT_RANGE_STATUS",20);a(this,"RESULT_CORE_AMBIENT_WINDOW_EVENTS_RTN",188);a(this,"RESULT_CORE_RANGING_TOTAL_EVENTS_RTN",192);a(this,"RESULT_CORE_AMBIENT_WINDOW_EVENTS_REF",208);a(this,"RESULT_CORE_RANGING_TOTAL_EVENTS_REF",212);a(this,"RESULT_PEAK_SIGNAL_RATE_REF",182);a(this,"ALGO_PART_TO_PART_RANGE_OFFSET_MM",40);a(this,"I2C_SLAVE_DEVICE_ADDRESS",138);a(this,"MSRC_CONFIG_CONTROL",96);a(this,"PRE_RANGE_CONFIG_MIN_SNR",39);a(this,"PRE_RANGE_CONFIG_VALID_PHASE_LOW",86);a(this,"PRE_RANGE_CONFIG_VALID_PHASE_HIGH",87);a(this,"PRE_RANGE_MIN_COUNT_RATE_RTN_LIMIT",100);a(this,"FINAL_RANGE_CONFIG_MIN_SNR",103);a(this,"FINAL_RANGE_CONFIG_VALID_PHASE_LOW",71);a(this,"FINAL_RANGE_CONFIG_VALID_PHASE_HIGH",72);a(this,"FINAL_RANGE_CONFIG_MIN_COUNT_RATE_RTN_LIMIT",68);a(this,"PRE_RANGE_CONFIG_SIGMA_THRESH_HI",97);a(this,"PRE_RANGE_CONFIG_SIGMA_THRESH_LO",98);a(this,"PRE_RANGE_CONFIG_VCSEL_PERIOD",80);a(this,"PRE_RANGE_CONFIG_TIMEOUT_MACROP_HI",81);a(this,"PRE_RANGE_CONFIG_TIMEOUT_MACROP_LO",82);a(this,"SYSTEM_HISTOGRAM_BIN",129);a(this,"HISTOGRAM_CONFIG_INITIAL_PHASE_SELECT",51);a(this,"HISTOGRAM_CONFIG_READOUT_CTRL",85);a(this,"FINAL_RANGE_CONFIG_VCSEL_PERIOD",112);a(this,"FINAL_RANGE_CONFIG_TIMEOUT_MACROP_HI",113);a(this,"FINAL_RANGE_CONFIG_TIMEOUT_MACROP_LO",114);a(this,"CROSSTALK_COMPENSATION_PEAK_RATE_MCPS",32);a(this,"MSRC_CONFIG_TIMEOUT_MACROP",70);a(this,"SOFT_RESET_GO2_SOFT_RESET_N",191);a(this,"IDENTIFICATION_MODEL_ID",192);a(this,"IDENTIFICATION_REVISION_ID",194);a(this,"OSC_CALIBRATE_VAL",248);a(this,"GLOBAL_CONFIG_VCSEL_WIDTH",50);a(this,"GLOBAL_CONFIG_SPAD_ENABLES_REF_0",176);a(this,"GLOBAL_CONFIG_SPAD_ENABLES_REF_1",177);a(this,"GLOBAL_CONFIG_SPAD_ENABLES_REF_2",178);a(this,"GLOBAL_CONFIG_SPAD_ENABLES_REF_3",179);a(this,"GLOBAL_CONFIG_SPAD_ENABLES_REF_4",180);a(this,"GLOBAL_CONFIG_SPAD_ENABLES_REF_5",181);a(this,"GLOBAL_CONFIG_REF_EN_START_SELECT",182);a(this,"DYNAMIC_SPAD_NUM_REQUESTED_REF_SPAD",78);a(this,"DYNAMIC_SPAD_REF_EN_START_OFFSET",79);a(this,"POWER_MANAGEMENT_GO1_POWER_FORCE",128);a(this,"VHV_CONFIG_PAD_SCL_SDA__EXTSUP_HV",137);a(this,"ALGO_PHASECAL_LIM",48);a(this,"ALGO_PHASECAL_CONFIG_TIMEOUT",48);this.adapter=t,this.address=s}async init(){const[t]=await this.adapter.transmit(`AT+TR=${this.address}C001`);if(t!==238)throw new Error(`Device at adrress 0x${this.address} IS NOT VL53L0`);const[s]=await this.adapter.transmit(`AT+TR=${this.address}8901`);await this.adapter.transmit(`AT+TX=${this.address}89${i(s|1)}`),await this.adapter.transmit(`AT+TX=${this.address}8800`),await this.adapter.transmit(`AT+TX=${this.address}8001`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}0000`);const[d]=await this.adapter.transmit(`AT+TR=${this.address}9101`);this.stopVariable=d,await this.adapter.transmit(`AT+TX=${this.address}0001`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}8000`);const[p]=await this.adapter.transmit(`AT+TR=${this.address}6001`);await this.adapter.transmit(`AT+TX=${this.address}60${i(p|18)}`),await this.setSignalRateLimit(.5),await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSTEM_SEQUENCE_CONFIG)}FF`);const{count:A,isAperture:c}=await this.getSpadInfo();console.log({count:A,isAperture:c});const o=await this.adapter.transmit(`AT+TR=${this.address}${i(this.GLOBAL_CONFIG_SPAD_ENABLES_REF_0)}06`).then(n=>Array.from(n));console.log({spadMap:o}),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}${i(this.DYNAMIC_SPAD_REF_EN_START_OFFSET)}00`),await this.adapter.transmit(`AT+TX=${this.address}${i(this.DYNAMIC_SPAD_NUM_REQUESTED_REF_SPAD)}2C`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}${i(this.GLOBAL_CONFIG_REF_EN_START_SELECT)}84`);const T=c?12:0;let e=0;for(let n=0;n<48;n++)n<T||e==A?o[parseInt(n/8)]&=~(1<<n%8):o[parseInt(n/8)]>>n%8&1&&e++;await this.adapter.transmit(`AT+TX=${this.address}${i(this.GLOBAL_CONFIG_SPAD_ENABLES_REF_0)}${o.map(i).join("")}`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}0000`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}0900`),await this.adapter.transmit(`AT+TX=${this.address}1000`),await this.adapter.transmit(`AT+TX=${this.address}1100`),await this.adapter.transmit(`AT+TX=${this.address}2401`),await this.adapter.transmit(`AT+TX=${this.address}25FF`),await this.adapter.transmit(`AT+TX=${this.address}7500`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}4E2C`),await this.adapter.transmit(`AT+TX=${this.address}4800`),await this.adapter.transmit(`AT+TX=${this.address}3020`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}3009`),await this.adapter.transmit(`AT+TX=${this.address}5400`),await this.adapter.transmit(`AT+TX=${this.address}3104`),await this.adapter.transmit(`AT+TX=${this.address}3203`),await this.adapter.transmit(`AT+TX=${this.address}4083`),await this.adapter.transmit(`AT+TX=${this.address}4625`),await this.adapter.transmit(`AT+TX=${this.address}6000`),await this.adapter.transmit(`AT+TX=${this.address}2700`),await this.adapter.transmit(`AT+TX=${this.address}5006`),await this.adapter.transmit(`AT+TX=${this.address}5100`),await this.adapter.transmit(`AT+TX=${this.address}5296`),await this.adapter.transmit(`AT+TX=${this.address}5608`),await this.adapter.transmit(`AT+TX=${this.address}5730`),await this.adapter.transmit(`AT+TX=${this.address}6100`),await this.adapter.transmit(`AT+TX=${this.address}6200`),await this.adapter.transmit(`AT+TX=${this.address}6400`),await this.adapter.transmit(`AT+TX=${this.address}6500`),await this.adapter.transmit(`AT+TX=${this.address}66A0`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}2232`),await this.adapter.transmit(`AT+TX=${this.address}4714`),await this.adapter.transmit(`AT+TX=${this.address}49FF`),await this.adapter.transmit(`AT+TX=${this.address}4A00`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}7A0A`),await this.adapter.transmit(`AT+TX=${this.address}7B00`),await this.adapter.transmit(`AT+TX=${this.address}7821`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}2334`),await this.adapter.transmit(`AT+TX=${this.address}4200`),await this.adapter.transmit(`AT+TX=${this.address}44FF`),await this.adapter.transmit(`AT+TX=${this.address}4526`),await this.adapter.transmit(`AT+TX=${this.address}4605`),await this.adapter.transmit(`AT+TX=${this.address}4040`),await this.adapter.transmit(`AT+TX=${this.address}0E06`),await this.adapter.transmit(`AT+TX=${this.address}201A`),await this.adapter.transmit(`AT+TX=${this.address}4340`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}3403`),await this.adapter.transmit(`AT+TX=${this.address}3544`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}3104`),await this.adapter.transmit(`AT+TX=${this.address}4B09`),await this.adapter.transmit(`AT+TX=${this.address}4C05`),await this.adapter.transmit(`AT+TX=${this.address}4D04`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}4400`),await this.adapter.transmit(`AT+TX=${this.address}4520`),await this.adapter.transmit(`AT+TX=${this.address}4708`),await this.adapter.transmit(`AT+TX=${this.address}4828`),await this.adapter.transmit(`AT+TX=${this.address}6700`),await this.adapter.transmit(`AT+TX=${this.address}7004`),await this.adapter.transmit(`AT+TX=${this.address}7101`),await this.adapter.transmit(`AT+TX=${this.address}72FE`),await this.adapter.transmit(`AT+TX=${this.address}7600`),await this.adapter.transmit(`AT+TX=${this.address}7700`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}0D01`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}8001`),await this.adapter.transmit(`AT+TX=${this.address}01F8`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}8E01`),await this.adapter.transmit(`AT+TX=${this.address}0001`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}8000`),await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSTEM_INTERRUPT_CONFIG_GPIO)}04`);const[r]=await this.adapter.transmit(`AT+TR=${this.address}${i(this.GPIO_HV_MUX_ACTIVE_HIGH)}01`);await this.adapter.transmit(`AT+TX=${this.address}${i(this.GPIO_HV_MUX_ACTIVE_HIGH)}${i(r&-17)}`),await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSTEM_INTERRUPT_CLEAR)}01`),this.measurement_timing_budget_us=await this.getMeasurementTimingBudget(),await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSTEM_SEQUENCE_CONFIG)}E8`),this.measurement_timing_budget_us=await this.setMeasurementTimingBudget(this.measurement_timing_budget_us),await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSTEM_SEQUENCE_CONFIG)}01`),await this.performSingleRefCalibration(64),await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSTEM_SEQUENCE_CONFIG)}02`),await this.performSingleRefCalibration(0),await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSTEM_SEQUENCE_CONFIG)}E8`)}async setSignalRateLimit(t){if(t<0||t>511.99)throw new Error("invalid limitMcps");const s=t*128;return this.adapter.transmit(`AT+TX=${this.address}44${i(s>>8)}${i(s&255)}`)}async getSpadInfo(){await this.adapter.transmit(`AT+TX=${this.address}8001`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}0000`),await this.adapter.transmit(`AT+TX=${this.address}FF06`);let[t]=await this.adapter.transmit(`AT+TR=${this.address}8301`);await this.adapter.transmit(`AT+TX=${this.address}83${i(t|4)}`),await this.adapter.transmit(`AT+TX=${this.address}FF07`),await this.adapter.transmit(`AT+TX=${this.address}8101`),await this.adapter.transmit(`AT+TX=${this.address}8001`),await this.adapter.transmit(`AT+TX=${this.address}946b`),await this.adapter.transmit(`AT+TX=${this.address}8300`),[t]=await this.adapter.transmit(`AT+TR=${this.address}8301`),t==0&&([t]=await this.adapter.transmit(`AT+TR=${this.address}8301`)),[t]=await this.adapter.transmit(`AT+TR=${this.address}9201`);const s=t&127,d=t>>7&1;return await this.adapter.transmit(`AT+TX=${this.address}8100`),await this.adapter.transmit(`AT+TX=${this.address}FF06`),[t]=await this.adapter.transmit(`AT+TR=${this.address}8301`),await this.adapter.transmit(`AT+TX=${this.address}83${i(t&-5)}`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}0001`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}8000`),Promise.resolve({count:s,isAperture:d})}async getSequenceStepEnables(){const[t]=await this.adapter.transmit(`AT+TR=${this.address}${i(this.SYSTEM_SEQUENCE_CONFIG)}01`);return Promise.resolve({tcc:t>>4&1,dss:t>>3&1,msrc:t>>2&1,pre_range:t>>6&1,final_range:t>>7&1})}decodeVcselPeriod(t){return t+1<<1}encodeVcselPeriod(t){return(t>>1)-1}async getVcselPulsePeriodPreRange(){const[t]=await this.adapter.transmit(`AT+TR=${this.address}${i(this.PRE_RANGE_CONFIG_VCSEL_PERIOD)}01`);return Promise.resolve(this.decodeVcselPeriod(t))}async getVcselPulsePeriodFinalRange(){const[t]=await this.adapter.transmit(`AT+TR=${this.address}${i(this.FINAL_RANGE_CONFIG_VCSEL_PERIOD)}01`);return Promise.resolve(this.decodeVcselPeriod(t))}calcMacroPeriod(t){return(2304*t*1655+500)/1e3}timeoutMclksToMicroseconds(t,s){const d=this.calcMacroPeriod(s);return(t*d+500)/1e3}decodeTimeout(t){return((t&255)<<((t&65280)>>8))+1}async getSequenceStepTimeouts(t){const s=await this.getVcselPulsePeriodPreRange(),d=await this.adapter.transmit(`AT+TR=${this.address}${i(this.MSRC_CONFIG_TIMEOUT_MACROP)}01`).then(r=>r[0]+1),p=this.timeoutMclksToMicroseconds(d,s),A=await this.adapter.transmit(`AT+TR=${this.address}${i(this.PRE_RANGE_CONFIG_TIMEOUT_MACROP_HI)}02`).then(r=>this.decodeTimeout(r.readUInt16BE())),c=this.timeoutMclksToMicroseconds(A,s),o=await this.getVcselPulsePeriodFinalRange();let T=await this.adapter.transmit(`AT+TR=${this.address}${i(this.FINAL_RANGE_CONFIG_TIMEOUT_MACROP_HI)}02`).then(r=>this.decodeTimeout(r.readUInt16BE()));t.pre_range&&(T-=A);const e=this.timeoutMclksToMicroseconds(T,o);return Promise.resolve({pre_range_vcsel_period_pclks:s,msrc_dss_tcc_mclks:d,msrc_dss_tcc_us:p,pre_range_mclks:A,pre_range_us:c,final_range_vcsel_period_pclks:o,final_range_mclks:T,final_range_us:e})}async getMeasurementTimingBudget(){let T=2870;const e=await this.getSequenceStepEnables(),r=await this.getSequenceStepTimeouts(e);return e.tcc&&(T+=r.msrc_dss_tcc_us+590),e.dss?T+=2*(r.msrc_dss_tcc_us+690):e.msrc&&(T+=r.msrc_dss_tcc_us+660),e.pre_range&&(T+=r.pre_range_us+660),e.final_range&&(T+=r.final_range_us+550),Promise.resolve(T)}async setMeasurementTimingBudget(t){let e=2870;const r=await this.getSequenceStepEnables(),n=await this.getSequenceStepTimeouts(r);if(r.tcc&&(e+=n.msrc_dss_tcc_us+590),r.dss?e+=2*(n.msrc_dss_tcc_us+690):r.msrc&&(e+=n.msrc_dss_tcc_us+660),r.pre_range&&(e+=n.pre_range_us+660),r.final_range){if(e+=550,e>t)throw new Error("Requested timeout too big.");const F=t-e;let R=this.timeoutMicrosecondsToMclks(F,n.final_range_vcsel_period_pclks);r.pre_range&&(R+=n.pre_range_mclks);const w=this.encodeTimeout(R);return this.adapter.transmit(`AT+TX=${this.address}${i(this.FINAL_RANGE_CONFIG_TIMEOUT_MACROP_HI)}${i(w>>8)}${i(w&255)}`)}return Promise.resolve(t)}timeoutMicrosecondsToMclks(t,s){const d=this.calcMacroPeriod(s);return(t*1e3+d/2)/d}encodeTimeout(t){let s=0,d=0;if(t>0){for(s=t-1;(s&4294967040)>0;)s>>=1,d++;return d<<8|s&255}return 0}async performSingleRefCalibration(t){await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSRANGE_START)}${i(1|t)}`);let[s]=await this.adapter.transmit(`AT+TR=${this.address}${i(this.RESULT_INTERRUPT_STATUS)}01`);console.log({interrupt:s}),s&7||([s]=await this.adapter.transmit(`AT+TR=${this.address}${i(this.RESULT_INTERRUPT_STATUS)}01`),console.log({interrupt:s})),s&7||([s]=await this.adapter.transmit(`AT+TR=${this.address}${i(this.RESULT_INTERRUPT_STATUS)}01`),console.log({interrupt:s})),await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSTEM_INTERRUPT_CLEAR)}01`),await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSRANGE_START)}00`)}async readRangeSingleMillimeters(){await this.adapter.transmit(`AT+TX=${this.address}8001`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}0000`),await this.adapter.transmit(`AT+TX=${this.address}91${i(this.stopVariable)}`),await this.adapter.transmit(`AT+TX=${this.address}0001`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}8000`),await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSRANGE_START)}01`);const[t]=await this.adapter.transmit(`AT+TR=${this.address}${i(this.SYSRANGE_START)}01`);return console.log({tmp:t}),this.readRangeContinuousMillimeters()}async readRangeContinuousMillimeters(){const t=Date.now();console.log({t});let[s]=await this.adapter.transmit(`AT+TR=${this.address}${i(this.RESULT_INTERRUPT_STATUS)}01`);console.log({interrupt:s}),s&7||([s]=await this.adapter.transmit(`AT+TR=${this.address}${i(this.RESULT_INTERRUPT_STATUS)}01`),console.log({interrupt:s})),s&7||([s]=await this.adapter.transmit(`AT+TR=${this.address}${i(this.RESULT_INTERRUPT_STATUS)}01`),console.log({interrupt:s}));const d=await this.adapter.transmit(`AT+TR=${this.address}${i(this.RESULT_RANGE_STATUS+10)}02`).then(p=>p.readUInt16BE());return await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSTEM_INTERRUPT_CLEAR)}01`),Promise.resolve(d)}async startContinuous(){await this.adapter.transmit(`AT+TX=${this.address}8001`),await this.adapter.transmit(`AT+TX=${this.address}FF01`),await this.adapter.transmit(`AT+TX=${this.address}0000`),await this.adapter.transmit(`AT+TX=${this.address}91${i(this.stopVariable)}`),await this.adapter.transmit(`AT+TX=${this.address}0001`),await this.adapter.transmit(`AT+TX=${this.address}FF00`),await this.adapter.transmit(`AT+TX=${this.address}8000`),await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSRANGE_START)}02`)}async stopContinuous(){await this.adapter.transmit(`AT+TX=${this.address}${i(this.SYSRANGE_START)}01`)}}const nt={style:{position:"relative",height:"60vh"}},Tt={name:"DeviceVl53l0x"},pt=Object.assign(Tt,{setup(E){const t=$(!1),s=$(null),d=$(500),p=$(null),A=$("29"),c=$(0),o=g("emitter");let T=null,e=null,r=Date.now();const{transmit:n,connect:F}=g("adapter"),R=async()=>{try{if(s.value=await T.readRangeSingleMillimeters(),s.value&4096)c.value=8192-s.value;else{c.value=0;const m=Date.now();e.data.datasets[0].data.push({x:m,y:s.value}),m>r+50&&(r=m,x().then(()=>{e.options.scales.x.min=J(new Date,{minutes:1});const l=e.data.datasets[0].data.findLastIndex(u=>u.x<e.options.scales.x.min);e.data.datasets[0].data.splice(0,l),e.update()}))}t.value&&(await Z(d.value),R())}catch(m){console.log(m),t.value=!1}},w=async()=>{await F(),await n("AT"),await n("AT");const m=await n("AT+SC");if(!Array.from(m).includes(parseInt(A.value,16)))throw o.emit("message",{type:"error",data:{message:"Not Found"}}),new Error(`VL53L0X at adrress 0x${A.value} NOT Found`);T=new dt({transmit:n},A.value),await T.init(),t.value=!0,R()};return tt(()=>{x().then(()=>{e=new at(p.value,{type:"line",data:{datasets:[{label:"Distance",fill:!1,data:[]}]},options:{spanGaps:!0,responsive:!0,maintainAspectRatio:!1,parsing:!1,normalized:!0,animations:{numbers:{properties:["x"],type:"number",from:void 0}},scales:{x:{type:"time",ticks:{stepSize:5},time:{unit:"second"},title:{display:!0,text:"Date"}},y:{title:{display:!0,text:"mm"}}}}})})}),st(()=>{e.destroy()}),(m,l)=>{const u=Y,M=k,f=W,v=Q,U=q,O=et,D=rt,X=K,C=j,B=z,V=it;return I(),N(V,null,{header:_(()=>[h(M,null,{default:_(()=>[h(u,null,{default:_(()=>[S("Device")]),_:1}),h(u,null,{default:_(()=>[S("VL53L0X")]),_:1})]),_:1})]),"header-extra":_(()=>[h(D,null,{default:_(()=>[h(U,{"label-placement":"left",inline:""},{default:_(()=>[h(v,{label:`${m.$t("adapter.Interval")} (ms)`,style:{width:"300px"}},{default:_(()=>[h(f,{value:d.value,"onUpdate:value":l[0]||(l[0]=G=>d.value=G),step:100,min:0,max:1e3},null,8,["value"])]),_:1},8,["label"])]),_:1}),h(b),t.value?(I(),N(O,{key:0,onClick:l[1]||(l[1]=G=>{t.value=!1}),type:"warning"},{default:_(()=>[S(L(m.$t("adapter.Stop")),1)]),_:1})):(I(),N(O,{key:1,onClick:w,type:"primary"},{default:_(()=>[S(L(m.$t("adapter.Start")),1)]),_:1}))]),_:1})]),default:_(()=>[h(B,{"x-gap":"12",cols:2},{default:_(()=>[h(C,null,{default:_(()=>[h(X,{label:"Distance",value:s.value},{suffix:_(()=>[S("mm")]),_:1},8,["value"])]),_:1}),h(C,null,{default:_(()=>[h(X,{label:"Error",value:c.value},null,8,["value"])]),_:1})]),_:1}),P("div",nt,[P("canvas",{ref_key:"chartRef",ref:p},null,512)])]),_:1})}}});export{pt as default};
