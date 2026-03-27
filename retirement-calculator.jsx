import { useState, useEffect, useRef } from "react";

const fmt = (n) => {
  const abs = Math.abs(Math.round(n));
  return (n < 0 ? "-$" : "$") + abs.toLocaleString();
};
const fmtK = (n) => {
  if (Math.abs(n) >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
  return fmt(n);
};

function useTween(target, duration = 500) {
  const [val, setVal] = useState(target);
  const ref = useRef({ start: target, current: target, startTime: null, raf: null });
  useEffect(() => {
    const r = ref.current;
    r.start = r.current;
    r.startTime = null;
    cancelAnimationFrame(r.raf);
    const ease = (t) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const step = (ts) => {
      if (!r.startTime) r.startTime = ts;
      const p = Math.min((ts - r.startTime) / duration, 1);
      r.current = r.start + (target - r.start) * ease(p);
      setVal(r.current);
      if (p < 1) r.raf = requestAnimationFrame(step);
      else r.current = target;
    };
    r.raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(r.raf);
  }, [target, duration]);
  return val;
}

function Slider({ label, value, min, max, step=500, onChange, format=fmt, sublabel, color="#06b6d4" }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:11, color:"#64748b", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
        <span style={{ fontSize:14, color:"#f1f5f9", fontWeight:600, fontFamily:"'DM Mono',monospace" }}>{format(value)}</span>
      </div>
      {sublabel && <div style={{ fontSize:10, color:"#334155", marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>{sublabel}</div>}
      <div style={{ position:"relative", height:5, borderRadius:3, background:"#1e293b" }}>
        <div style={{ position:"absolute", left:0, top:0, height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,#3b82f6,${color})`, borderRadius:3, transition:"width 0.1s" }} />
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e)=>onChange(Number(e.target.value))}
          style={{ position:"absolute", inset:0, width:"100%", opacity:0, cursor:"pointer", height:"100%", margin:0 }} />
        <div style={{ position:"absolute", top:"50%", left:`${pct}%`, transform:"translate(-50%,-50%)", width:14, height:14, borderRadius:"50%", background:color, border:"2.5px solid #0f172a", boxShadow:`0 0 8px ${color}80`, pointerEvents:"none" }} />
      </div>
    </div>
  );
}

function CurrencyInput({ label, value, onChange, sublabel }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:11, color:"#64748b", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
        {sublabel && <span style={{ fontSize:10, color:"#334155", fontFamily:"'DM Sans',sans-serif" }}>{sublabel}</span>}
      </div>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", color:"#475569", fontFamily:"'DM Mono',monospace", fontSize:13 }}>$</span>
        <input type="number" value={value} min={0} onChange={(e)=>onChange(Number(e.target.value)||0)}
          style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.09)", borderRadius:8, padding:"9px 12px 9px 24px", color:"#f1f5f9", fontFamily:"'DM Mono',monospace", fontSize:13, outline:"none", boxSizing:"border-box", transition:"border-color 0.2s" }}
          onFocus={(e)=>e.target.style.borderColor="#3b82f6"}
          onBlur={(e)=>e.target.style.borderColor="rgba(255,255,255,0.09)"}
        />
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent=false, large=false, sub, warn=false, exact=false }) {
  const tweened = useTween(value);
  return (
    <div style={{
      background: accent ? "linear-gradient(135deg,#1d4ed8 0%,#0891b2 100%)" : warn ? "rgba(251,191,36,0.07)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${accent?"transparent":warn?"rgba(251,191,36,0.22)":"rgba(255,255,255,0.08)"}`,
      borderRadius:14, padding:"15px 16px"
    }}>
      <div style={{ fontSize:10, color: accent?"rgba(255,255,255,0.65)":warn?"#fbbf24":"#64748b", letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif", marginBottom:5 }}>{label}</div>
      <div style={{ fontSize: large?24:19, fontWeight:700, color:"#f8fafc", fontFamily:"'DM Mono',monospace", letterSpacing:"-0.02em" }}>{exact ? (Math.abs(tweened) >= 1e5 ? fmtK(tweened) : fmt(tweened)) : fmtK(tweened)}</div>
      {sub && <div style={{ fontSize:10, color: accent?"rgba(255,255,255,0.55)":"#475569", marginTop:3, fontFamily:"'DM Sans',sans-serif" }}>{sub}</div>}
    </div>
  );
}

function BarChart({ current, optimized }) {
  const max = optimized * 1.1;
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:14, height:110, padding:"0 4px" }}>
      {[{label:"Current 4%",val:current,color:"#1e293b"},{label:"Optimized",val:optimized,color:"url(#bg2)"}].map(({label,val,color})=>(
        <div key={label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
          <div style={{ fontSize:11, color:"#94a3b8", fontFamily:"'DM Mono',monospace" }}>{fmtK(val)}</div>
          <svg width="100%" height={75} style={{ overflow:"visible" }}>
            <defs><linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient></defs>
            <rect x="15%" y={75-(val/max)*70} width="70%" height={(val/max)*70} fill={color} rx={4} style={{ transition:"all 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}/>
          </svg>
          <div style={{ fontSize:9, color:"#475569", textAlign:"center", fontFamily:"'DM Sans',sans-serif" }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

function GrowthChart({ data, years, viewMode, setViewMode }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const W=320, H=145, PAD={t:12,r:12,b:26,l:52};
  const iW=W-PAD.l-PAD.r, iH=H-PAD.t-PAD.b;

  const accounts = [
    { key:"k401",    label:"401(k)",    stroke:"#3b82f6" },
    { key:"roth",    label:"Roth IRA",  stroke:"#06b6d4" },
    { key:"brokerage",label:"Brokerage",stroke:"#10b981" },
    { key:"cash",    label:"Cash",      stroke:"#f59e0b" },
  ];

  const maxVal = Math.max(...data.map(d=>d.total), 1);
  const px = (i) => PAD.l + (i/years)*iW;
  const py = (v) => PAD.t + iH - (v/maxVal)*iH;
  const pathStr = (pts) => pts.map((v,i)=>`${i===0?"M":"L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const areaStr = (pts) => `${pathStr(pts)} L${px(years)},${PAD.t+iH} L${PAD.l},${PAD.t+iH} Z`;

  const yTicks = [0,0.25,0.5,0.75,1].map(f=>({ v:maxVal*f, y:py(maxVal*f) }));
  const xTicks = Array.from({length:6},(_,i)=>Math.round(i*years/5));
  const hd = hoverIdx!=null ? data[hoverIdx] : null;

  return (
    <div>
      {/* Mode toggle + legend */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:14, flexWrap:"wrap" }}>
        {[["total","Total"],["accounts","By Account"]].map(([k,l])=>(
          <button key={k} onClick={()=>setViewMode(k)} style={{ padding:"5px 13px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, fontFamily:"'DM Sans',sans-serif", fontWeight:500, transition:"all 0.2s",
            background: viewMode===k?"rgba(59,130,246,0.22)":"rgba(255,255,255,0.04)",
            color: viewMode===k?"#93c5fd":"#475569",
            borderBottom: viewMode===k?"1.5px solid #3b82f6":"1.5px solid transparent",
          }}>{l}</button>
        ))}
        {viewMode==="accounts" && (
          <div style={{ display:"flex", gap:10, marginLeft:"auto", flexWrap:"wrap" }}>
            {accounts.map(a=>(
              <div key={a.key} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:8,height:8,borderRadius:2,background:a.stroke }}/>
                <span style={{ fontSize:10, color:"#475569", fontFamily:"'DM Sans',sans-serif" }}>{a.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ position:"relative" }} onMouseLeave={()=>setHoverIdx(null)}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow:"visible", cursor:"crosshair" }}
          onMouseMove={(e)=>{
            const rect=e.currentTarget.getBoundingClientRect();
            const mx=(e.clientX-rect.left)/rect.width*W;
            setHoverIdx(Math.max(0,Math.min(years,Math.round((mx-PAD.l)/iW*years))));
          }}>
          <defs>
            <linearGradient id="gTot" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#3b82f6"/><stop offset="100%" stopColor="#06b6d4"/></linearGradient>
            <linearGradient id="gTotFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/><stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/></linearGradient>
          </defs>

          {/* Grid */}
          {yTicks.map(({v,y})=>(
            <g key={v}>
              <line x1={PAD.l} y1={y} x2={W-PAD.r} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
              <text x={PAD.l-4} y={y+3.5} textAnchor="end" fontSize={7.5} fill="#334155" fontFamily="'DM Mono',monospace">{fmtK(v)}</text>
            </g>
          ))}
          {xTicks.map(i=>(
            <text key={i} x={px(i)} y={H-4} textAnchor="middle" fontSize={7.5} fill="#334155" fontFamily="'DM Mono',monospace">Yr {i}</text>
          ))}

          {viewMode==="total" ? (
            <>
              <path d={areaStr(data.map(d=>d.total))} fill="url(#gTotFill)"/>
              <path d={pathStr(data.map(d=>d.total))} fill="none" stroke="url(#gTot)" strokeWidth="2.5"/>
            </>
          ) : (
            accounts.map(a=>(
              <path key={a.key} d={pathStr(data.map(d=>d[a.key]))} fill="none" stroke={a.stroke} strokeWidth="1.8" opacity="0.85"/>
            ))
          )}

          {hoverIdx!=null && (
            <>
              <line x1={px(hoverIdx)} y1={PAD.t} x2={px(hoverIdx)} y2={PAD.t+iH} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 2"/>
              {(viewMode==="total" ? [{stroke:"#3b82f6",key:"total"}] : accounts).map(a=>(
                <circle key={a.key} cx={px(hoverIdx)} cy={py((hd||{})[a.key]||0)} r={3.5} fill={a.stroke} stroke="#0f172a" strokeWidth="1.5"/>
              ))}
            </>
          )}
        </svg>

        {hd && (
          <div style={{ position:"absolute", top:0, right:0, background:"rgba(10,18,35,0.97)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, padding:"10px 14px", minWidth:155, pointerEvents:"none", backdropFilter:"blur(12px)", zIndex:10 }}>
            <div style={{ fontSize:10, color:"#475569", fontFamily:"'DM Mono',monospace", marginBottom:7 }}>Year {hoverIdx}</div>
            {viewMode==="total" ? (
              <div style={{ display:"flex", justifyContent:"space-between", gap:14 }}>
                <span style={{ fontSize:11, color:"#94a3b8" }}>Total</span>
                <span style={{ fontSize:12, color:"#93c5fd", fontFamily:"'DM Mono',monospace", fontWeight:600 }}>{fmtK(hd.total)}</span>
              </div>
            ) : [...accounts,{key:"total",label:"Total",stroke:"#f1f5f9"}].map(a=>(
              <div key={a.key} style={{ display:"flex", justifyContent:"space-between", gap:14, marginBottom:3 }}>
                <span style={{ fontSize:10, color:a.stroke }}>{a.label}</span>
                <span style={{ fontSize:11, color:"#f1f5f9", fontFamily:"'DM Mono',monospace" }}>{fmtK(hd[a.key])}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const BRACKETS = [[23850,0.10],[96950,0.12],[206700,0.22],[394600,0.24],[501050,0.32],[751600,0.35],[Infinity,0.37]];
const calcFedTax = (inc) => { let t=0,p=0; for(const[lim,r] of BRACKETS){if(inc<=p)break;t+=(Math.min(inc,lim)-p)*r;p=lim;} return t; };
const getMarginal = (inc) => { for(const[lim,r] of BRACKETS){if(inc<=lim)return r;} return 0.37; };

const DEFAULT_EXPENSES = [
  {id:1,label:"Housing",amount:4500},
  {id:2,label:"Groceries & Dining",amount:1200},
  {id:3,label:"Transportation",amount:900},
  {id:4,label:"Utilities & Subscriptions",amount:500},
  {id:5,label:"Healthcare",amount:600},
  {id:6,label:"Entertainment",amount:600},
  {id:7,label:"Miscellaneous",amount:400},
];

export default function App() {
  const [yourSalary, setYourSalary] = useState(155000);
  const [spouseSalary, setSpouseSalary] = useState(180000);
  const [your401k, setYour401k] = useState(23500);
  const [spouse401k, setSpouse401k] = useState(23500);
  const [yourRoth, setYourRoth] = useState(7000);
  const [spouseRoth, setSpouseRoth] = useState(7000);
  const [matchPct, setMatchPct] = useState(4);
  const [startingCash, setStartingCash] = useState(50000);
  const [starting401k, setStarting401k] = useState(0);
  const [startingRoth, setStartingRoth] = useState(0);
  const [startingBrokerage, setStartingBrokerage] = useState(0);
  const [expenses, setExpenses] = useState(DEFAULT_EXPENSES);
  const [newLabel, setNewLabel] = useState("");
  const [newAmt, setNewAmt] = useState(0);
  const [years, setYears] = useState(25);
  const [returnRate, setReturnRate] = useState(7);
  const [activeTab, setActiveTab] = useState("overview");
  const [chartView, setChartView] = useState("total");

  const STD=30000, CA=0.093, SDI=0.009;
  const combinedBase = yourSalary + spouseSalary;
  const total401k = your401k + spouse401k;
  const totalRoth = yourRoth + spouseRoth;
  const totalRetirement = total401k + totalRoth;
  const employerMatch = combinedBase * matchPct/100;

  const taxableIncome = Math.max(0, combinedBase - total401k - STD);
  const fedTax = calcFedTax(taxableIncome);
  const ss = Math.min(yourSalary,168600)*0.062 + Math.min(spouseSalary,168600)*0.062;
  const medicare = combinedBase*0.0145 + Math.max(0,combinedBase-200000)*0.009;
  const caTax = taxableIncome*CA;
  const caSDI = combinedBase*SDI;
  const totalTax = fedTax+ss+medicare+caTax+caSDI;

  const annualTakeHome = combinedBase - total401k - totalRoth - totalTax;
  const biweeklyTakeHome = annualTakeHome/26;

  const totalMonthlyExp = expenses.reduce((s,e)=>s+e.amount,0);
  const annualExp = totalMonthlyExp*12;
  const annualSurplus = annualTakeHome - annualExp;
  const annualBrokerage = Math.max(0, annualSurplus);

  const curr401kC = combinedBase*0.04;
  const currTaxable = Math.max(0, combinedBase-curr401kC-STD);
  const currTotalTax = calcFedTax(currTaxable)+ss+medicare+currTaxable*CA+caSDI;
  const currentBiweekly = (combinedBase-curr401kC-currTotalTax)/26;
  const taxSavings = (calcFedTax(currTaxable)+currTaxable*CA)-(fedTax+caTax);

  const r = returnRate/100;
  const projData = (() => {
    let b401=starting401k, bRoth=startingRoth, bBrok=startingBrokerage, bCash=startingCash;
    return Array.from({length:years+1},(_,i)=>{
      if(i>0){ b401=b401*(1+r)+total401k+employerMatch; bRoth=bRoth*(1+r)+totalRoth; bBrok=bBrok*(1+r)+annualBrokerage; }
      return {k401:b401,roth:bRoth,brokerage:bBrok,cash:bCash,total:b401+bRoth+bBrok+bCash};
    });
  })();
  const finalData = projData[years];

  const currentProjected = (() => {
    let b=starting401k+startingRoth+startingBrokerage;
    for(let i=0;i<years;i++) b=b*(1+r)+curr401kC+employerMatch;
    return b+startingCash;
  })();

  const updateExp = (id,amount) => setExpenses(p=>p.map(e=>e.id===id?{...e,amount}:e));
  const removeExp = (id) => setExpenses(p=>p.filter(e=>e.id!==id));
  const addExp = () => { if(!newLabel.trim())return; setExpenses(p=>[...p,{id:Date.now(),label:newLabel,amount:newAmt}]); setNewLabel(""); setNewAmt(0); };

  const C = (children, extra={}) => (
    <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:18, padding:22, ...extra }}>{children}</div>
  );
  const SL = (text, color="#3b82f6") => (
    <div style={{ fontSize:10, color, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:16, fontFamily:"'DM Mono',monospace" }}>{text}</div>
  );

  const TABS = ["overview","expenses","breakdown","projection"];
  const TAB_LABELS = {overview:"Overview",expenses:"Expenses",breakdown:"Taxes",projection:"Projection"};

  return (
    <div style={{ minHeight:"100vh", background:"#060d1f", fontFamily:"'DM Sans',sans-serif", color:"#f1f5f9", paddingBottom:48 }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>

      <div style={{ background:"linear-gradient(180deg,rgba(59,130,246,0.1) 0%,transparent 100%)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"28px 20px 20px", marginBottom:18 }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <div style={{ width:7,height:7,borderRadius:"50%",background:"#06b6d4",boxShadow:"0 0 8px #06b6d4" }}/>
            <span style={{ fontSize:10, color:"#06b6d4", letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"'DM Mono',monospace" }}>San Francisco, CA · Married Filing Jointly · 2025</span>
          </div>
          <h1 style={{ fontSize:25, fontWeight:700, margin:0, letterSpacing:"-0.03em" }}>Retirement & Wealth Optimizer</h1>
          <p style={{ color:"#475569", margin:"5px 0 0", fontSize:13 }}>Full financial picture — income, taxes, expenses, and long-term growth</p>
        </div>
      </div>

      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 16px" }}>

        {/* KPIs */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
          <MetricCard label="Bi-Weekly Pay" value={biweeklyTakeHome} accent large exact/>
          <MetricCard label="Bi-Wkly Surplus" value={annualSurplus/26} warn={annualSurplus<0} sub={annualSurplus>=0?"→ to brokerage":"⚠ over budget"}/>
          <MetricCard label="Tax Savings" value={taxSavings} sub="vs 4% only"/>
          <MetricCard label={`Net Worth ${years}yr`} value={finalData.total} sub="all accounts"/>
        </div>

        {/* Tab bar */}
        <div style={{ display:"flex", gap:3, background:"rgba(255,255,255,0.03)", borderRadius:12, padding:4, marginBottom:16 }}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setActiveTab(t)} style={{ flex:1, padding:"7px 0", borderRadius:9, border:"none", cursor:"pointer",
              background: activeTab===t?"rgba(59,130,246,0.2)":"transparent",
              color: activeTab===t?"#93c5fd":"#475569",
              fontSize:11, fontWeight:500, letterSpacing:"0.04em", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
              borderBottom: activeTab===t?"1.5px solid #3b82f6":"1.5px solid transparent",
            }}>{TAB_LABELS[t]}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab==="overview" && (
          <div style={{ display:"grid", gap:12 }}>
            {C(<>
              {SL("Income")}
              <Slider label="Your Salary" value={yourSalary} min={50000} max={500000} step={1000} onChange={setYourSalary}/>
              <Slider label="Spouse Salary" value={spouseSalary} min={50000} max={500000} step={1000} onChange={setSpouseSalary}/>
              <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize:12, color:"#64748b" }}>Combined Base Salary</span>
                <span style={{ fontFamily:"'DM Mono',monospace", color:"#f1f5f9", fontSize:13, fontWeight:600 }}>{fmt(combinedBase)}</span>
              </div>
            </>)}

            {C(<>
              {SL("Retirement Contributions","#06b6d4")}
              <Slider label="Your 401(k)" value={your401k} min={0} max={23500} step={500} onChange={setYour401k} sublabel="2025 max: $23,500" color="#3b82f6"/>
              <Slider label="Spouse 401(k)" value={spouse401k} min={0} max={23500} step={500} onChange={setSpouse401k} sublabel="2025 max: $23,500" color="#3b82f6"/>
              <Slider label="Your Backdoor Roth IRA" value={yourRoth} min={0} max={7000} step={500} onChange={setYourRoth} sublabel="2025 max: $7,000" color="#06b6d4"/>
              <Slider label="Spouse Backdoor Roth IRA" value={spouseRoth} min={0} max={7000} step={500} onChange={setSpouseRoth} sublabel="2025 max: $7,000" color="#06b6d4"/>
              <Slider label="Employer Match %" value={matchPct} min={0} max={10} step={0.5} onChange={setMatchPct} format={v=>`${v}%`} color="#10b981"/>
              <div style={{ marginTop:10, padding:14, background:"rgba(6,182,212,0.07)", borderRadius:10, border:"1px solid rgba(6,182,212,0.16)" }}>
                {[["You contribute",fmt(totalRetirement),"#94a3b8",false],["Employer match (free!)",fmt(employerMatch),"#06b6d4",false],["Total to retirement/yr",fmt(totalRetirement+employerMatch),"#06b6d4",true]].map(([l,v,c,bold],i)=>(
                  <div key={l} style={{ display:"flex", justifyContent:"space-between", ...(bold?{borderTop:"1px solid rgba(255,255,255,0.07)",paddingTop:8,marginTop:8}:{marginBottom:6}) }}>
                    <span style={{ fontSize:bold?13:12, color:bold?"#f1f5f9":"#64748b", fontWeight:bold?600:400 }}>{l}</span>
                    <span style={{ fontFamily:"'DM Mono',monospace", color:c, fontSize:bold?14:13, fontWeight:bold?700:400 }}>{v}</span>
                  </div>
                ))}
              </div>
            </>)}

            {C(<>
              {SL("Starting Balances (Today)","#f59e0b")}
              <CurrencyInput label="Cash / Emergency Fund" value={startingCash} onChange={setStartingCash} sublabel="stays liquid"/>
              <CurrencyInput label="Current 401(k) Balance" value={starting401k} onChange={setStarting401k}/>
              <CurrencyInput label="Current Roth IRA Balance" value={startingRoth} onChange={setStartingRoth}/>
              <CurrencyInput label="Current Brokerage Balance" value={startingBrokerage} onChange={setStartingBrokerage}/>
              <div style={{ marginTop:10, padding:12, background:"rgba(245,158,11,0.07)", borderRadius:10, border:"1px solid rgba(245,158,11,0.16)", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:"#94a3b8" }}>Total Starting Wealth</span>
                <span style={{ fontFamily:"'DM Mono',monospace", color:"#fbbf24", fontSize:14, fontWeight:700 }}>{fmt(startingCash+starting401k+startingRoth+startingBrokerage)}</span>
              </div>
            </>)}
          </div>
        )}

        {/* ── EXPENSES ── */}
        {activeTab==="expenses" && (
          <div style={{ display:"grid", gap:12 }}>
            {C(<>
              {SL("Monthly Expenses","#f59e0b")}
              {expenses.map((e,i)=>{
                const COLS=["#3b82f6","#06b6d4","#10b981","#f59e0b","#8b5cf6","#ec4899","#f87171","#94a3b8"];
                return (
                  <div key={e.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:3, height:36, borderRadius:2, background:COLS[i%COLS.length], flexShrink:0 }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:"#64748b", marginBottom:3 }}>{e.label}</div>
                      <div style={{ position:"relative" }}>
                        <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#475569", fontFamily:"'DM Mono',monospace", fontSize:13 }}>$</span>
                        <input type="number" value={e.amount} min={0} onChange={ev=>updateExp(e.id,Number(ev.target.value)||0)}
                          style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"7px 10px 7px 22px", color:"#f1f5f9", fontFamily:"'DM Mono',monospace", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
                      </div>
                    </div>
                    <button onClick={()=>removeExp(e.id)} style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:8, color:"#f87171", cursor:"pointer", padding:"7px 10px", fontSize:12, marginTop:14, flexShrink:0 }}>✕</button>
                  </div>
                );
              })}
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.07)", paddingTop:14, marginTop:4 }}>
                <div style={{ fontSize:10, color:"#334155", marginBottom:8, letterSpacing:"0.08em", textTransform:"uppercase" }}>Add Category</div>
                <div style={{ display:"flex", gap:8 }}>
                  <input placeholder="e.g. Travel" value={newLabel} onChange={e=>setNewLabel(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&addExp()}
                    style={{ flex:2, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 12px", color:"#f1f5f9", fontFamily:"'DM Sans',sans-serif", fontSize:13, outline:"none" }}/>
                  <div style={{ position:"relative", flex:1 }}>
                    <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"#475569", fontFamily:"'DM Mono',monospace", fontSize:12 }}>$</span>
                    <input type="number" placeholder="0" value={newAmt||""} onChange={e=>setNewAmt(Number(e.target.value)||0)} min={0}
                      style={{ width:"100%", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, padding:"8px 10px 8px 20px", color:"#f1f5f9", fontFamily:"'DM Mono',monospace", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
                  </div>
                  <button onClick={addExp} style={{ background:"rgba(59,130,246,0.18)", border:"1px solid rgba(59,130,246,0.3)", borderRadius:8, color:"#93c5fd", cursor:"pointer", padding:"8px 14px", fontSize:13 }}>+ Add</button>
                </div>
              </div>
            </>)}

            {C(<>
              {SL("Cash Flow Summary","#10b981")}
              {[
                ["Bi-Weekly Take-Home",fmt(biweeklyTakeHome),"#f1f5f9"],
                ["Monthly Take-Home",fmt(annualTakeHome/12),"#94a3b8"],
                ["Monthly Expenses",`-${fmt(totalMonthlyExp)}`,"#f87171"],
                ["Monthly Surplus/Deficit",fmt(annualSurplus/12),annualSurplus>=0?"#34d399":"#f87171"],
              ].map(([l,v,c])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ fontSize:12, color:"#64748b" }}>{l}</span>
                  <span style={{ fontFamily:"'DM Mono',monospace", color:c, fontSize:13, fontWeight:600 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:14, padding:14, background: annualSurplus>=0?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)", borderRadius:10, border:`1px solid ${annualSurplus>=0?"rgba(16,185,129,0.2)":"rgba(239,68,68,0.2)"}` }}>
                <div style={{ fontSize:10, color:annualSurplus>=0?"#6ee7b7":"#fca5a5", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6, fontFamily:"'DM Mono',monospace" }}>
                  {annualSurplus>=0?"Annual Brokerage Contribution":"⚠ Annual Shortfall"}
                </div>
                <div style={{ fontSize:26, fontWeight:700, fontFamily:"'DM Mono',monospace", color:annualSurplus>=0?"#34d399":"#f87171" }}>{annualSurplus>=0?fmt(annualBrokerage):fmt(annualSurplus)}</div>
                <div style={{ fontSize:11, color:"#475569", marginTop:4 }}>
                  {annualSurplus>=0?"surplus auto-invested in taxable brokerage":"reduce expenses or contribution amounts"}
                </div>
              </div>

              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:10, color:"#334155", marginBottom:10, letterSpacing:"0.08em", textTransform:"uppercase" }}>Spending Breakdown</div>
                {[...expenses].sort((a,b)=>b.amount-a.amount).map((e,i)=>{
                  const pct=totalMonthlyExp>0?(e.amount/totalMonthlyExp*100).toFixed(1):0;
                  const COLS=["#3b82f6","#06b6d4","#10b981","#f59e0b","#8b5cf6","#ec4899","#f87171","#94a3b8"];
                  return (
                    <div key={e.id} style={{ marginBottom:9 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                        <span style={{ fontSize:11, color:"#64748b" }}>{e.label}</span>
                        <span style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:"#94a3b8" }}>{fmt(e.amount)} <span style={{ color:"#334155" }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height:3, background:"#1e293b", borderRadius:2 }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:COLS[i%COLS.length], borderRadius:2, transition:"width 0.4s" }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>)}
          </div>
        )}

        {/* ── TAXES ── */}
        {activeTab==="breakdown" && (
          <div style={{ display:"grid", gap:12 }}>
            {C(<>
              {SL("Tax Breakdown")}
              {[["Federal Income Tax",fedTax,"#3b82f6"],["Social Security",ss,"#6366f1"],["Medicare",medicare,"#8b5cf6"],["CA State Tax (9.3%)",caTax,"#06b6d4"],["CA SDI",caSDI,"#0891b2"]].map(([label,val,color])=>{
                const pct=(val/combinedBase*100).toFixed(1);
                return (
                  <div key={label} style={{ marginBottom:13 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:12, color:"#94a3b8" }}>{label}</span>
                      <span style={{ fontSize:11, fontFamily:"'DM Mono',monospace", color:"#f1f5f9" }}>{fmt(val)} <span style={{ color:"#334155" }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height:4, background:"#1e293b", borderRadius:2 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:2, transition:"width 0.5s" }}/>
                    </div>
                  </div>
                );
              })}
              <div style={{ borderTop:"1px solid rgba(255,255,255,0.08)", paddingTop:12, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:13, fontWeight:600 }}>Total Tax Burden</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:700, color:"#f87171" }}>{fmt(totalTax)}</span>
              </div>
            </>)}
            {C(<>
              {SL("Take-Home Comparison","#06b6d4")}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
                {[["Current (4%)",currentBiweekly,false],["Optimized",biweeklyTakeHome,true]].map(([l,v,a])=>(
                  <div key={l} style={{ padding:14, borderRadius:12, background:a?"rgba(59,130,246,0.1)":"rgba(255,255,255,0.03)", border:`1px solid ${a?"rgba(59,130,246,0.25)":"rgba(255,255,255,0.06)"}` }}>
                    <div style={{ fontSize:10, color:"#64748b", marginBottom:5 }}>{l}</div>
                    <div style={{ fontSize:20, fontWeight:700, fontFamily:"'DM Mono',monospace", color:a?"#93c5fd":"#64748b" }}>{fmt(v)}</div>
                    <div style={{ fontSize:10, color:"#334155", marginTop:2 }}>bi-weekly</div>
                  </div>
                ))}
              </div>
              <BarChart current={currentBiweekly} optimized={biweeklyTakeHome}/>
              <div style={{ marginTop:12, padding:12, background:"rgba(16,185,129,0.07)", borderRadius:10, border:"1px solid rgba(16,185,129,0.16)", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:"#6ee7b7" }}>Annual Tax Savings</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:15, fontWeight:700, color:"#34d399" }}>+{fmt(taxSavings)}</span>
              </div>
              <div style={{ marginTop:8, fontSize:11, color:"#334155", textAlign:"center" }}>
                Marginal rate: <span style={{ color:"#94a3b8", fontFamily:"'DM Mono',monospace" }}>{(getMarginal(taxableIncome)*100).toFixed(0)}%</span> · every 401k dollar saves <span style={{ color:"#94a3b8", fontFamily:"'DM Mono',monospace" }}>{(getMarginal(taxableIncome)*100).toFixed(0)}¢</span> federal tax
              </div>
            </>)}
          </div>
        )}

        {/* ── PROJECTION ── */}
        {activeTab==="projection" && (
          <div style={{ display:"grid", gap:12 }}>
            {C(<>
              {SL("Projection Settings")}
              <Slider label="Years to Retirement" value={years} min={5} max={40} step={1} onChange={setYears} format={v=>`${v} yrs`}/>
              <Slider label="Expected Annual Return" value={returnRate} min={3} max={12} step={0.5} onChange={setReturnRate} format={v=>`${v}%`} color="#10b981"/>
              <div style={{ marginTop:10, padding:12, background:"rgba(16,185,129,0.06)", borderRadius:10, border:"1px solid rgba(16,185,129,0.14)", display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:"#64748b" }}>Annual Brokerage Contribution</span>
                <span style={{ fontFamily:"'DM Mono',monospace", color:annualBrokerage>0?"#34d399":"#f87171", fontSize:13, fontWeight:600 }}>{annualBrokerage>0?fmt(annualBrokerage):"$0 (no surplus)"}</span>
              </div>
            </>)}

            {C(<>
              {SL("Wealth Growth Over Time","#06b6d4")}
              <GrowthChart data={projData} years={years} viewMode={chartView} setViewMode={setChartView}/>
            </>)}

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <MetricCard label="Without Optimizing" value={currentProjected} sub="4% only"/>
              <MetricCard label="Fully Optimized" value={finalData.total} accent sub="all accounts"/>
            </div>

            {C(<>
              {SL("Final Balance by Account","#10b981")}
              {[
                ["401(k) + Employer Match",finalData.k401,"#3b82f6"],
                ["Roth IRA (tax-free)",finalData.roth,"#06b6d4"],
                ["Taxable Brokerage",finalData.brokerage,"#10b981"],
                ["Cash / Emergency Fund",finalData.cash,"#f59e0b"],
              ].map(([label,val,color])=>(
                <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8,height:8,borderRadius:2,background:color }}/>
                    <span style={{ fontSize:12, color:"#94a3b8" }}>{label}</span>
                  </div>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:13, fontWeight:600, color:"#f1f5f9" }}>{fmtK(val)}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:10, marginTop:2 }}>
                <span style={{ fontSize:13, fontWeight:700 }}>Total Net Worth</span>
                <span style={{ fontFamily:"'DM Mono',monospace", fontSize:15, fontWeight:700, color:"#93c5fd" }}>{fmtK(finalData.total)}</span>
              </div>
            </>)}

            <div style={{ padding:18, background:"linear-gradient(135deg,rgba(16,185,129,0.1),rgba(6,182,212,0.1))", border:"1px solid rgba(16,185,129,0.18)", borderRadius:16, textAlign:"center" }}>
              <div style={{ fontSize:10, color:"#6ee7b7", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:8, fontFamily:"'DM Mono',monospace" }}>Extra Wealth vs. Status Quo</div>
              <div style={{ fontSize:32, fontWeight:700, fontFamily:"'DM Mono',monospace", color:"#34d399", letterSpacing:"-0.03em" }}>{fmtK(finalData.total-currentProjected)}</div>
              <div style={{ fontSize:11, color:"#475569", marginTop:5 }}>additional wealth over {years} years at {returnRate}% annual return</div>
            </div>
          </div>
        )}

        <div style={{ marginTop:24, textAlign:"center", fontSize:10, color:"#1e293b", lineHeight:1.8 }}>
          2025 tax brackets · CA 9.3% state rate · Not financial advice · Consult a CFP
        </div>
      </div>
    </div>
  );
}
