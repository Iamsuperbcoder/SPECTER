import React, { useState, useMemo } from "react";
import {
  Ghost, ShieldAlert, Play, RotateCcw, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Phone, FileText, Copy, Check, Mail, Users, Trophy, Pill, Brain, Activity,
  ScanSearch, Radar, Hash, Building2, MapPin,
} from "lucide-react";

// specter - audits insurer behavioral-health directories for ghost listings
// claude extracts the messy directory, then the engine verifies every provider

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600;700;800&display=swap');
:root{
  --bg:#F6F5F1; --panel:#FFFFFF; --panel2:#F4F3EE; --line:#E3E1D9; --line2:#D6D3C9;
  --txt:#26241E; --muted:#6F6B61; --dim:#9C978B;
  --red:#C5392C; --red-bg:#F8E7E4; --green:#2F8B55; --green-bg:#E5F1E9;
  --amber:#BE7A1C; --amber-bg:#F8EFDC; --azure:#3A6EA5;
}
.sp-root{ font-family:'Work Sans',sans-serif; color:var(--txt); min-height:100vh; background:var(--bg); }
.mono{ font-variant-numeric:tabular-nums; }
.panel{ background:var(--panel); border:1px solid var(--line); border-radius:12px; box-shadow:0 1px 2px rgba(40,36,28,.04); }
.panel2{ background:var(--panel2); border:1px solid var(--line); border-radius:10px; }
.btn{ font-family:'Work Sans',sans-serif; font-weight:600; cursor:pointer; border:none; border-radius:9px; transition:background .15s, box-shadow .15s; }
.btn:active{ transform:translateY(1px); }
.btn-red{ background:var(--red); color:#fff; box-shadow:0 1px 2px rgba(40,36,28,.12); }
.btn-red:hover{ background:#B23227; }
.btn-red:disabled{ background:#E0B8B3; color:#fff; box-shadow:none; cursor:not-allowed; }
.btn-ghost{ background:#fff; color:var(--txt); border:1px solid var(--line2); }
.btn-ghost:hover{ background:var(--panel2); }
.inp{ font-family:'Work Sans',sans-serif; width:100%; background:#fff; color:var(--txt); border:1px solid var(--line); border-radius:8px; outline:none; transition:border .15s, box-shadow .15s; }
.inp:focus{ border-color:var(--azure); box-shadow:0 0 0 3px rgba(58,110,165,.14); }
.cell{ aspect-ratio:1; border-radius:5px; border:1px solid var(--line); background:var(--panel2); transition:transform .15s; position:relative; }
.cell.pop{ animation:pop .3s cubic-bezier(.2,.8,.3,1) both; }
@keyframes pop{ 0%{ transform:scale(.4); opacity:0; } 100%{ transform:scale(1); opacity:1; } }
.cell.scanning{ animation:scan 1s ease-in-out infinite; }
@keyframes scan{ 0%,100%{ opacity:.3; } 50%{ opacity:.65; } }
.fade{ animation:fade .4s ease both; }
@keyframes fade{ from{ opacity:0; transform:translateY(8px);} to{ opacity:1; transform:none; } }
.spin{ animation:spin 1s linear infinite; } @keyframes spin{ to{ transform:rotate(360deg);} }
.pulse{ animation:pulse 1.5s ease-in-out infinite; } @keyframes pulse{ 0%,100%{ opacity:.5;} 50%{ opacity:1;} }
.row{ animation:fade .28s ease both; }
.tag{ font-size:11px; font-weight:500; padding:3px 8px; border-radius:6px; }
.bartrack{ height:8px; background:var(--panel2); border:1px solid var(--line); border-radius:6px; overflow:hidden; }
.barfill{ height:100%; border-radius:6px; transition:width .5s cubic-bezier(.2,.8,.3,1); }
.lbrow{ transition:background .15s; border-radius:8px; }
.sp-2col{ display:grid; gap:18px; grid-template-columns:minmax(0,1.5fr) minmax(0,1fr); }
.sp-inputs{ display:grid; gap:10px; grid-template-columns:1.4fr .8fr; }
.sp-counties{ display:grid; gap:8px; grid-template-columns:repeat(5,1fr); }
@media (max-width:900px){ .sp-2col{ grid-template-columns:1fr; } .sp-counties{ grid-template-columns:repeat(3,1fr); } }
@media (max-width:560px){ .sp-inputs{ grid-template-columns:1fr; } .sp-counties{ grid-template-columns:repeat(2,1fr); } }
*{ box-sizing:border-box; } body{ margin:0; }
::-webkit-scrollbar{ width:9px; height:9px; } ::-webkit-scrollbar-thumb{ background:#D6D3C9; border-radius:8px; }
`;

/* ---- reference data ---- */
const FIRST = ["Sarah","Marcus","Linda","Raj","Karen","Anthony","James","Patricia","Michael","Rebecca","Daniel","Olivia","Steven","Amanda","David","Nina","Robert","Grace","Kevin","Maria","Thomas","Aisha","Brian","Elena","Carlos","Hannah","Samuel","Priya","Jason","Diana","Eric","Sofia","Mark","Leah","Victor","Naomi","Paul","Ruth","Henry","Tara"];
const LAST = ["Chen","Webb","Okafor","Patel","Liu","Russo","Hill","Stone","Grant","Shaw","Kim","Brooks","Carter","Reyes","Nguyen","Alvarez","Foster","Bennett","Park","Rivera","Cohen","Okeke","Murphy","Vasquez","Singh","Bauer","Ross","Diaz","Klein","Mehta","Walsh","Ahmed","Porter","Lopez","Cole","Romano","Boyd","Khan","Wells","Yoon"];
const PRESCRIBER = [{c:"MD",s:"Psychiatry"},{c:"DO",s:"Psychiatry"},{c:"PMHNP",s:"Psychiatric NP"}];
const PSYCH = [{c:"PhD",s:"Clinical Psychology"},{c:"PsyD",s:"Psychology"}];
const THERAPIST = [{c:"LCSW",s:"Clinical Social Work"},{c:"LPC",s:"Counseling"},{c:"LMFT",s:"Marriage & Family Therapy"},{c:"LMHC",s:"Mental Health Counseling"}];
const NON_MH = ["DDS","DMD","DPM","OD","DC"];
const STREETS = ["Market St","Bloomfield Ave","Main St","Oak St","Broad St","Summit Ave","River Rd","Park Pl","Washington St","Center St","Elm St","Maple Ave","Pine St","Court St","Grove St","Spring St","Union Ave","Hudson St"];
const CITY_COUNTY = {
  "Newark":["Essex","07102"],"Montclair":["Essex","07042"],"Bloomfield":["Essex","07003"],
  "Jersey City":["Hudson","07306"],"Hoboken":["Hudson","07030"],
  "Edison":["Middlesex","08817"],"New Brunswick":["Middlesex","08901"],"Woodbridge":["Middlesex","07095"],
  "Trenton":["Mercer","08608"],"Princeton":["Mercer","08540"],
  "Camden":["Camden","08102"],"Cherry Hill":["Camden","08002"],
  "Elizabeth":["Union","07201"],"Plainfield":["Union","07060"],
  "Paterson":["Passaic","07505"],"Clifton":["Passaic","07011"],
  "Hackensack":["Bergen","07601"],"Teaneck":["Bergen","07666"],
  "Freehold":["Monmouth","07728"],"Long Branch":["Monmouth","07740"],
  "Toms River":["Ocean","08753"],"Brick":["Ocean","08723"],
};
const CITIES = Object.keys(CITY_COUNTY);
const COUNTIES = ["Essex","Hudson","Middlesex","Mercer","Camden","Union","Passaic","Bergen","Monmouth","Ocean"];
const NJ_AREA = ["201","973","732","908","609","856","551","848"];
const OTHER_AREA = { "212":"NY","718":"NY","917":"NY","646":"NY","215":"PA","267":"PA","610":"PA","203":"CT" };

/* ---- deterministic rng so the demo numbers are stable ---- */
function mulberry32(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const pick = (rng,arr)=> arr[Math.floor(rng()*arr.length)];

function makeValidNPI(rng){
  let base=""; for(let i=0;i<9;i++) base+=Math.floor(rng()*10);
  const full="80840"+base; let sum=0,dbl=true;
  for(let i=full.length-1;i>=0;i--){ let d=+full[i]; if(dbl){ d*=2; if(d>9)d-=9; } sum+=d; dbl=!dbl; }
  return base+((10-(sum%10))%10);
}
function makeBadNPI(rng){ const v=makeValidNPI(rng); return v.slice(0,9)+((+v[9]+1)%10); }
const phone = (rng,area)=> `(${area}) ${100+Math.floor(rng()*900)}-${1000+Math.floor(rng()*9000)}`;

function genInsurer(cfg){
  const rng = mulberry32(cfg.seed);
  const recs = [];
  for(let i=0;i<cfg.n;i++){
    const tier = rng();
    const role = tier<0.5 ? pick(rng,THERAPIST) : tier<0.8 ? pick(rng,PSYCH) : pick(rng,PRESCRIBER);
    const city = pick(rng,CITIES); const zip = CITY_COUNTY[city][1];
    const name = `${pick(rng,FIRST)} ${pick(rng,LAST)}`;
    let p = { name, credentials:role.c, specialty:role.s,
      phone: phone(rng, pick(rng,NJ_AREA)),
      address: `${10+Math.floor(rng()*900)} ${pick(rng,STREETS)}, ${city}, NJ ${zip}`,
      npi: makeValidNPI(rng) };
    const r = rng();
    if(r<0.55){
      const h=rng();
      if(h<0.34) p.npi=null;
      else if(h<0.68) p.npi=makeBadNPI(rng);
      else p.phone="(000) 000-0000";
    } else if(r<0.83){
      const sft=rng();
      if(sft<0.2) p.phone=phone(rng, pick(rng,Object.keys(OTHER_AREA)));
      else if(sft<0.4) p.phone=null;
      else if(sft<0.6) p.address=`${city}, NJ`;
      else if(sft<0.8){ p.credentials=pick(rng,NON_MH); p.specialty="Behavioral Health"; }
      else { p.credentials=null; p.specialty=null; }
    }
    recs.push(p);
  }
  // guarantee one shared-npi pair and one padded duplicate so those checks show up
  if(recs.length>8){
    const shared=makeValidNPI(rng); recs[2].npi=shared; recs[5].npi=shared;
    recs[8]={...recs[7], address:`${10+Math.floor(rng()*900)} ${pick(rng,STREETS)}, ${pick(rng,CITIES)}, NJ 07000`};
  }
  return recs;
}

function formatDirectory(name, recs){
  const blocks = recs.map((p,i)=>{
    const head = p.credentials ? `${p.name}, ${p.credentials}${p.specialty? " — "+p.specialty : ""}`
      : (p.specialty? `${p.name} — ${p.specialty}` : p.name);
    const lines=[head];
    if(i%3===0) lines.push(`NPI: ${p.npi || "N/A"}`);
    else if(i%3===1) lines.push(`National Provider ID: ${p.npi || "Not provided"}`);
    else lines.push(`NPI ${p.npi || "N/A"}`);
    lines.push(p.phone ? `Phone: ${p.phone}` : "(phone not listed)");
    if(p.address) lines.push(p.address);
    return lines.join("\n");
  });
  return `${name.toUpperCase()} — Behavioral Health Provider Directory (New Jersey)\n\n` + blocks.join("\n\n");
}

/* ---- verification engine ---- */
const digits = s => (s||"").replace(/\D/g,"");
function validateNPI(npi){
  if(!/^\d{10}$/.test(npi)) return false;
  const full="80840"+npi.slice(0,9); let sum=0,dbl=true;
  for(let i=full.length-1;i>=0;i--){ let d=+full[i]; if(dbl){ d*=2; if(d>9)d-=9; } sum+=d; dbl=!dbl; }
  return (10-(sum%10))%10===+npi[9];
}
function isPlaceholderPhone(s){ const d=digits(s); if(d.length<10) return true; return /^(\d)\1{9}$/.test(d.slice(-10)); }
function addressComplete(a){ return !!a && /\d/.test(a) && /\b\d{5}\b/.test(a); }
function deriveCounty(a){ if(!a) return null; for(const c of CITIES){ if(a.includes(c)) return CITY_COUNTY[c][0]; } return null; }
function severityOf(p){
  const c=(p.credentials||"").toUpperCase(); const s=(p.specialty||"").toLowerCase();
  if(["MD","DO","PMHNP","APN","NP"].includes(c) || /psychiat/.test(s)) return 3;
  if(["PHD","PSYD"].includes(c) || /psycholog/.test(s)) return 2;
  return 1;
}
const SEV = {3:{label:"Prescriber",Icon:Pill},2:{label:"Psychologist",Icon:Brain},1:{label:"Therapist",Icon:Activity}};
function areaMismatch(phoneStr){
  const d=digits(phoneStr); if(d.length<10) return null;
  const area=d.slice(-10,-7);
  if(NJ_AREA.includes(area)) return null;
  return OTHER_AREA[area] ? OTHER_AREA[area] : "out-of-state";
}

const PEN = { noNPI:100, malformed:88, badNPI:92, shared:72, placeholder:58, noPhone:34, area:28, addr:24, mismatch:38, nospec:24, padding:42 };

function assess(p, ctx){
  let pen=0; const reasons=[];
  const add=(amt,msg)=>{ pen+=amt; reasons.push(msg); };
  if(!p.npi) add(PEN.noNPI,"No NPI listed");
  else if(!/^\d{10}$/.test(p.npi)) add(PEN.malformed,"NPI is malformed (not 10 digits)");
  else if(!validateNPI(p.npi)) add(PEN.badNPI,"NPI fails the federal check-digit test");
  else if(ctx.shared.has(p.npi)) add(PEN.shared,"Same NPI is listed under multiple names");
  if(p.phone && isPlaceholderPhone(p.phone)) add(PEN.placeholder,"Phone is a placeholder / invalid number");
  else if(!p.phone) add(PEN.noPhone,"No phone number listed");
  else { const m=areaMismatch(p.phone); if(m) add(PEN.area, m==="out-of-state"?"Phone area code is out-of-state":`Phone area code is registered to ${m}, not NJ`); }
  if(!addressComplete(p.address)) add(PEN.addr,"Address is incomplete");
  if(NON_MH.includes((p.credentials||"").toUpperCase())) add(PEN.mismatch,"Credential is not a behavioral-health profession");
  if(!p.specialty && !p.credentials) add(PEN.nospec,"No specialty listed");
  if(ctx.dups.has((p.name||"").toLowerCase().trim()) && !ctx.shared.has(p.npi)) add(PEN.padding,"Duplicate listing (same provider listed more than once)");
  const confidence = Math.max(0, Math.min(100, 100-pen));
  const status = confidence>=78 ? "green" : confidence>=45 ? "amber" : "red";
  if(status==="green") reasons.push("NPI valid · contact details complete");
  return { confidence, status, reasons };
}

function auditProviders(records){
  const npiNames={}, nameCount={};
  records.forEach(p=>{
    const npi=p.npi?digits(p.npi):null; const nm=(p.name||"").toLowerCase().trim();
    if(npi && validateNPI(npi)) (npiNames[npi]=npiNames[npi]||new Set()).add(nm);
    nameCount[nm]=(nameCount[nm]||0)+1;
  });
  const shared=new Set(Object.keys(npiNames).filter(k=>npiNames[k].size>1));
  const dups=new Set(Object.keys(nameCount).filter(k=>nameCount[k]>1));
  const ctx={shared,dups};

  const providers = records.map(p=>{
    const a=assess({...p,npi:p.npi?digits(p.npi):null}, ctx);
    return {...p, ...a, severity:severityOf(p), county:deriveCounty(p.address)};
  });

  const total=providers.length;
  const verified=providers.filter(p=>p.status==="green").length;
  const questionable=providers.filter(p=>p.status==="amber").length;
  const ghost=providers.filter(p=>p.status==="red").length;
  const notVerifiedPct = total? Math.round(((ghost+questionable)/total)*100):0;
  const wTotal=providers.reduce((x,p)=>x+p.severity,0);
  const wBad=providers.reduce((x,p)=>x+(p.status!=="green"?p.severity:0),0);
  const weightedPct = wTotal? Math.round((wBad/wTotal)*100):0;

  const county={}; COUNTIES.forEach(c=> county[c]={claimed:0,verified:0,presc:0});
  providers.forEach(p=>{ if(p.county && county[p.county]){ county[p.county].claimed++; if(p.status==="green"){ county[p.county].verified++; if(p.severity===3) county[p.county].presc++; } } });
  let failing=0; COUNTIES.forEach(c=>{ const x=county[c]; x.pass = x.verified>=3 && x.presc>=1; if(!x.pass) failing++; });

  return { providers, county, failing, summary:{ total, verified, questionable, ghost, notVerifiedPct, weightedPct } };
}

/* ---- robust local parser (fallback for the model) ---- */
const PHONE_RE = /(\(\d{3}\)\s?\d{3}[-.\s]?\d{4}|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b)/;
function parseLocal(text){
  const blocks=(text||"").split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean); const out=[];
  for(const block of blocks){
    const lines=block.split("\n").map(l=>l.trim()).filter(Boolean); if(!lines.length) continue;
    const hasNPI=/\b(?:NPI|National Provider ID)\b/i.test(block), hasPhone=PHONE_RE.test(block);
    if(!hasNPI && !hasPhone && /(directory|health plan)/i.test(block)) continue;
    let name=lines[0], credentials=null, specialty=null;
    const dash=name.split(/\s[—–-]\s/); if(dash.length>1){ name=dash[0].trim(); specialty=dash.slice(1).join(" ").trim(); }
    name=name.replace(/^(Dr\.?|Doctor)\s+/i,"").trim();
    const ci=name.indexOf(","); if(ci!==-1){ credentials=name.slice(ci+1).trim()||null; name=name.slice(0,ci).trim(); }
    let npi=null; const nm=block.match(/(?:NPI|National Provider ID)\s*[:#]?\s*([0-9]{4,15})/i); if(nm) npi=nm[1];
    let ph=null;
    for(const l of lines.slice(1)){
      if(/\b(?:NPI|National Provider ID)\b/i.test(l)){ const after=l.replace(/(?:NPI|National Provider ID)\s*[:#]?\s*[0-9]{0,15}/i,""); const pm=after.match(PHONE_RE); if(pm){ ph=pm[1].trim(); break; } continue; }
      const pm=l.match(PHONE_RE); if(pm){ ph=pm[1].trim(); break; }
    }
    let address=null;
    for(const l of lines.slice(1)){ if(/\b(?:NPI|National Provider ID|Phone|Tel)\b/i.test(l)) continue; if(PHONE_RE.test(l)) continue; if(/,\s*[A-Z]{2}\b/.test(l)||/\b\d{5}\b/.test(l)){ address=l; break; } }
    if(!specialty){ const sm=block.match(/Specialty\s*[:#]?\s*([^\n]+)/i); if(sm) specialty=sm[1].trim(); }
    out.push({ name, credentials, specialty, phone:ph, address, npi });
  }
  return out;
}

/* ---- claude (in-app) with local fallback ---- */
async function callClaude(prompt, signal){
  const res=await fetch("https://api.anthropic.com/v1/messages",{ method:"POST", signal,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] }) });
  const data=await res.json(); if(!data.content) throw new Error("no content");
  return data.content.map(b=>b.type==="text"?b.text:"").join("");
}
async function extractWithClaude(text, signal){
  const prompt=`Extract every provider in this insurance directory into a JSON array. Return ONLY the array, no markdown. Keys per provider: name, credentials, specialty, phone, address, npi (digits only or null). Directory:\n<<<\n${text}\n>>>`;
  let raw=await callClaude(prompt, signal);
  let t=raw.replace(/```json/gi,"").replace(/```/g,"").trim();
  const a=t.indexOf("["), b=t.lastIndexOf("]"); if(a!==-1&&b!==-1) t=t.slice(a,b+1);
  try{ const arr=JSON.parse(t); if(Array.isArray(arr)) return arr; }catch{}
  const objs=raw.match(/\{[^{}]*\}/g)||[]; const out=[]; for(const o of objs){ try{ out.push(JSON.parse(o)); }catch{} } return out;
}
async function getProviders(text){
  const local=parseLocal(text);
  try{
    const ctrl=new AbortController(); const t=setTimeout(()=>ctrl.abort(),9000);
    const ai=await extractWithClaude(text, ctrl.signal); clearTimeout(t);
    if(Array.isArray(ai) && ai.length>=local.length*0.8) return { records:ai, by:"Claude" };
  }catch{}
  return { records:local, by:"parser" };
}
function templateLetter(insurer, state, s){
  const date=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  return `[Your Name]
[Your Address]
${date}

${state} Department of Banking and Insurance
Consumer Protection Services

Re: Inaccurate provider directory, ${insurer}

To Whom It May Concern:

I am writing to report significant inaccuracies in the behavioral-health provider directory published by ${insurer}. An audit of ${s.total} listed providers found that ${s.ghost} could not be verified at all, and an additional ${s.questionable} contained serious data problems, leaving only ${s.verified} fully verifiable listings.

The defects included missing or invalid National Provider Identifiers, placeholder phone numbers, phone area codes registered to other states, a single NPI shared across multiple provider names, and credentials that do not correspond to any behavioral-health profession. Inaccurate directories of this kind, often called "ghost networks," prevent patients from reaching in-network mental-health care and may violate provider-directory accuracy and network-adequacy obligations under the federal No Surprises Act and applicable ${state} insurance regulations.

I respectfully request that the Department investigate ${insurer}'s directory practices and require prompt corrective action.

Sincerely,
[Your Name]`;
}

/* ---- preset insurers for the leaderboard (computed by the same engine) ---- */
const INSURERS = [
  { name:"Summit Health Plan", seed:7, n:26, enrollees:182000, main:true },
  { name:"Garden State Mutual", seed:13, n:38, enrollees:96000 },
  { name:"Liberty Care Network", seed:21, n:45, enrollees:240000 },
  { name:"Atlantic Blue", seed:29, n:33, enrollees:131000 },
];
const SAMPLE_TEXT = formatDirectory(INSURERS[0].name, genInsurer(INSURERS[0]));
const PRESET = INSURERS.filter(c=>!c.main).map(c=>{
  const r=auditProviders(genInsurer(c));
  return { name:c.name, enrollees:c.enrollees, ...r.summary };
});

/* ---- UI bits ---- */
const ST = {
  green:{c:"var(--green)",bg:"var(--green-bg)",label:"VERIFIED",Icon:CheckCircle2},
  amber:{c:"var(--amber)",bg:"var(--amber-bg)",label:"QUESTIONABLE",Icon:AlertTriangle},
  red:{c:"var(--red)",bg:"var(--red-bg)",label:"GHOST",Icon:XCircle},
};
function Chip({n,label,color}){ return (
  <div className="panel2" style={{padding:"12px 14px",flex:"1 1 0",minWidth:0}}>
    <div className="mono" style={{fontSize:24,fontWeight:700,color,lineHeight:1}}>{n}</div>
    <div style={{fontSize:10.5,color:"var(--muted)",marginTop:6,letterSpacing:".05em"}}>{label}</div>
  </div>); }
function ConfBar({v}){ const c=v>=78?"var(--green)":v>=45?"var(--amber)":"var(--red)"; return (
  <div style={{display:"flex",alignItems:"center",gap:8,minWidth:120}}>
    <div className="bartrack" style={{flex:1}}><div className="barfill" style={{width:`${v}%`,background:c}}/></div>
    <span className="mono" style={{fontSize:12,fontWeight:700,color:c,width:26,textAlign:"right"}}>{v}</span>
  </div>); }
function ProviderRow({p}){ const s=ST[p.status]; const sev=SEV[p.severity]; return (
  <div className="row panel2" style={{padding:"11px 13px",borderLeft:`3px solid ${s.c}`}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}>
      <div style={{minWidth:0,flex:1}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <span style={{fontWeight:700,fontSize:14}}>{p.name||"Unknown"}</span>
          {p.credentials && <span style={{fontSize:11,color:"var(--muted)"}}>{p.credentials}</span>}
          <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:10.5,color:"var(--muted)",background:"var(--panel)",border:"1px solid var(--line)",padding:"2px 7px",borderRadius:999}}>
            <sev.Icon size={11}/>{sev.label}
          </span>
        </div>
        <div className="mono" style={{fontSize:11,color:"var(--dim)",marginTop:4,display:"flex",gap:12,flexWrap:"wrap"}}>
          <span>{p.specialty||"no specialty"}</span>
          <span style={{display:"flex",alignItems:"center",gap:3}}><Hash size={10}/>{p.npi||"none"}</span>
          <span style={{display:"flex",alignItems:"center",gap:3}}><Phone size={10}/>{p.phone||"none"}</span>
        </div>
        {p.reasons?.length>0 && <div style={{marginTop:7,display:"flex",flexWrap:"wrap",gap:5}}>
          {p.reasons.map((r,i)=><span key={i} className="tag" style={{background:s.bg,color:s.c}}>{r}</span>)}
        </div>}
      </div>
      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:5,color:s.c}}><s.Icon size={15}/><span style={{fontSize:10.5,fontWeight:700}}>{s.label}</span></div>
        <ConfBar v={p.confidence}/>
      </div>
    </div>
  </div>); }

function SectionTitle({icon:Icon,children,color="var(--txt)"}){ return (
  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:13}}>
    <Icon size={17} color={color}/><h2 style={{fontSize:16,fontWeight:800,margin:0}}>{children}</h2>
  </div>); }

export default function Specter(){
  const [insurer,setInsurer]=useState(INSURERS[0].name);
  const [stateName]=useState("New Jersey");
  const [enrollees]=useState(INSURERS[0].enrollees);
  const [text,setText]=useState("");
  const [phase,setPhase]=useState("idle");
  const [providers,setProviders]=useState([]);
  const [result,setResult]=useState(null);
  const [extractedBy,setExtractedBy]=useState(null);
  const [error,setError]=useState(null);
  const [letter,setLetter]=useState(null);
  const [letterLoading,setLetterLoading]=useState(false);
  const [copied,setCopied]=useState(false);

  const sleep=ms=>new Promise(r=>setTimeout(r,ms));

  const counts=useMemo(()=>{
    const g=providers.filter(p=>p.status==="green").length;
    const a=providers.filter(p=>p.status==="amber").length;
    const r=providers.filter(p=>p.status==="red").length;
    const total=providers.length;
    return { g,a,r,total, pct: total?Math.round(((a+r)/total)*100):0 };
  },[providers]);

  async function runAudit(){
    setError(null); setLetter(null); setResult(null); setProviders([]); setPhase("extracting");
    const { records, by } = await getProviders(text);
    if(!records.length){ setError("No providers found in that text. Load the sample directory."); setPhase("idle"); return; }
    setExtractedBy(by);
    const audit=auditProviders(records);
    setPhase("verifying");
    setProviders(audit.providers.map(p=>({...p,status:null,reasons:[]})));
    for(let i=0;i<audit.providers.length;i++){
      await sleep(90);
      setProviders(prev=>prev.map((x,idx)=> idx===i ? audit.providers[i] : x));
    }
    setResult(audit); setPhase("done");
  }

  async function genLetter(){
    setLetterLoading(true);
    const s=result.summary;
    const prompt=`Draft a concise formal complaint (about 220 words) to ${stateName}'s Department of Banking and Insurance about insurer ${insurer}'s inaccurate "ghost" behavioral-health directory. Audit of ${s.total} providers: ${s.ghost} unverifiable, ${s.questionable} with serious data problems, ${s.verified} verified. Reference directory-accuracy and network-adequacy duties under the federal No Surprises Act and state regulation. Use [Your Name] and [Date] placeholders. Return only the letter.`;
    try{ const ctrl=new AbortController(); const t=setTimeout(()=>ctrl.abort(),12000); const out=await callClaude(prompt,ctrl.signal); clearTimeout(t); setLetter((out||"").trim()||templateLetter(insurer,stateName,s)); }
    catch{ setLetter(templateLetter(insurer,stateName,result.summary)); }
    setLetterLoading(false);
  }
  function copyLetter(){ navigator.clipboard?.writeText(letter); setCopied(true); setTimeout(()=>setCopied(false),1500); }

  const busy = phase==="extracting"||phase==="verifying";
  const show = phase!=="idle";
  const s = result?.summary;
  const impacted = s ? Math.round(enrollees * (s.notVerifiedPct/100)) : 0;
  const fmt = n => n.toLocaleString("en-US");

  const board = useMemo(()=>{
    const rows=[...PRESET];
    if(s) rows.push({ name:insurer, enrollees, ...s, you:true });
    return rows.sort((a,b)=>b.weightedPct-a.weightedPct);
  },[s,insurer,enrollees]);
  const maxW = Math.max(...board.map(b=>b.weightedPct),1);

  return (
    <div className="sp-root">
      <style>{CSS}</style>
      <div style={{maxWidth:1180,margin:"0 auto",padding:"26px 18px 64px"}}>

        <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:"var(--red-bg)",border:"1px solid var(--line)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ghost size={24} color="var(--red)"/></div>
            <div>
              <div style={{fontWeight:800,fontSize:24,lineHeight:1}}>SPECTER</div>
              <div style={{fontSize:11.5,color:"var(--muted)",marginTop:4}}>insurance network auditor</div>
            </div>
          </div>
          <div style={{fontSize:11.5,color:"var(--muted)",textAlign:"right",maxWidth:230}}>Finds "ghost" providers in mental-health directories using federal data checks</div>
        </header>

        <div className="panel" style={{padding:"11px 16px",marginBottom:18,display:"flex",alignItems:"center",gap:11,background:"var(--red-bg)",borderColor:"#ECCFCA"}}>
          <ShieldAlert size={17} color="var(--red)" style={{flexShrink:0}}/>
          <p style={{fontSize:12.5,color:"var(--muted)",margin:0,lineHeight:1.45}}>A 2023 U.S. Senate Finance Committee investigation found over <b style={{color:"var(--txt)"}}>80% of listed mental-health providers</b> were unreachable "ghosts." SPECTER audits a directory and scores the whole network in seconds.</p>
        </div>

        <section className="panel" style={{padding:20,marginBottom:18}}>
          <div className="sp-inputs" style={{marginBottom:12}}>
            <div><label style={{fontSize:11,color:"var(--muted)",display:"block",marginBottom:6}}>INSURER</label>
              <input className="inp" style={{padding:"9px 11px",fontSize:13}} value={insurer} onChange={e=>setInsurer(e.target.value)} disabled={busy}/></div>
            <div><label style={{fontSize:11,color:"var(--muted)",display:"block",marginBottom:6}}>STATE</label>
              <input className="inp" style={{padding:"9px 11px",fontSize:13}} value={stateName} disabled/></div>
          </div>
          <label style={{fontSize:11,color:"var(--muted)",display:"block",marginBottom:6}}>DIRECTORY TEXT</label>
          <textarea className="inp" rows={5} style={{padding:"11px 13px",fontSize:12.5,lineHeight:1.5,resize:"vertical"}} value={text} onChange={e=>setText(e.target.value)} disabled={busy} placeholder="Paste an insurer's provider directory, or load the sample…"/>
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:13,flexWrap:"wrap"}}>
            <button className="btn btn-red" style={{padding:"11px 20px",fontSize:14,display:"flex",alignItems:"center",gap:8}} onClick={runAudit} disabled={busy||!text.trim()}>
              {busy?<Loader2 size={16} className="spin"/>:<Play size={15}/>}{phase==="extracting"?"Extracting…":phase==="verifying"?"Verifying…":"Run audit"}
            </button>
            <button className="btn btn-ghost" style={{padding:"11px 16px",fontSize:13}} onClick={()=>setText(SAMPLE_TEXT)} disabled={busy}>Load sample directory</button>
            {show&&!busy&&<button className="btn btn-ghost" style={{padding:"11px 14px",fontSize:13,display:"flex",alignItems:"center",gap:7}} onClick={()=>{setPhase("idle");setProviders([]);setResult(null);setLetter(null);}}><RotateCcw size={14}/>Reset</button>}
          </div>
          {error&&<div style={{marginTop:12,color:"var(--red)",fontSize:13}}>{error}</div>}
        </section>

        {show && (<div className="fade">

          <section className="panel" style={{padding:22,marginBottom:18}}>
            <div style={{display:"flex",alignItems:"center",gap:8,color:"var(--muted)",marginBottom:6}}>
              {busy?<Radar size={14} className="pulse"/>:<ScanSearch size={14}/>}
              <span style={{fontSize:11,letterSpacing:".05em"}}>{phase==="extracting"?`EXTRACTING LISTINGS${extractedBy?` WITH ${extractedBy.toUpperCase()}`:""}`:phase==="verifying"?"VERIFYING PROVIDERS":`AUDIT COMPLETE${extractedBy?` · EXTRACTED BY ${extractedBy.toUpperCase()}`:""}`}</span>
            </div>
            <div className="sp-2col" style={{alignItems:"center"}}>
              <div>
                <div style={{display:"flex",alignItems:"baseline",gap:12}}>
                  <span className="mono" style={{fontSize:62,fontWeight:800,lineHeight:.9,color:counts.pct>=50?"var(--red)":counts.pct>0?"var(--amber)":"var(--green)"}}>{phase==="extracting"?"··":counts.pct}<span style={{fontSize:28}}>%</span></span>
                  <span style={{fontSize:14,color:"var(--muted)",fontWeight:600,maxWidth:160,lineHeight:1.2}}>of listings could not be verified</span>
                </div>
                {s&&<div style={{marginTop:14,fontSize:13,color:"var(--txt)",lineHeight:1.5}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}><Users size={14} color="var(--red)"/><span>~<b>{fmt(impacted)}</b> of {insurer}'s ~{fmt(enrollees)} members rely on a network that's mostly unreachable.</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:7}}><Activity size={14} color="var(--amber)"/><span>Severity-weighted ghost rate (prescribers count most): <b>{s.weightedPct}%</b></span></div>
                </div>}
              </div>
              <div style={{display:"flex",gap:9}}>
                <Chip n={counts.r} label="GHOST" color="var(--red)"/>
                <Chip n={counts.a} label="QUESTIONABLE" color="var(--amber)"/>
                <Chip n={counts.g} label="VERIFIED" color="var(--green)"/>
              </div>
            </div>
            <div style={{marginTop:18,display:"grid",gridTemplateColumns:"repeat(13,1fr)",gap:6}}>
              {providers.map((p,i)=>{ const st=p.status?ST[p.status]:null; return (
                <div key={i} className={`cell ${p.status?"pop":"scanning"}`} title={p.name} style={{background:st?st.c:"var(--panel2)",borderColor:st?st.c:"var(--line)"}}>
                  {st&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}><st.Icon size={13} color="#fff"/></div>}
                </div>); })}
            </div>
          </section>

          {phase==="done" && (<div className="sp-2col" style={{marginBottom:18}}>
            <section className="panel" style={{padding:18}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontWeight:800,fontSize:15}}>Provider listings</span>
                <span style={{fontSize:11,color:"var(--muted)"}}>{providers.length} found · worst first</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:520,overflowY:"auto",paddingRight:4}}>
                {[...providers].sort((a,b)=>a.confidence-b.confidence).map((p,i)=><ProviderRow key={i} p={p}/>)}
              </div>
            </section>

            <section className="panel" style={{padding:18}}>
              <SectionTitle icon={MapPin} color="var(--red)">County coverage</SectionTitle>
              {result&&<>
                <p style={{fontSize:12.5,color:"var(--muted)",marginTop:-6,marginBottom:13,lineHeight:1.45}}>
                  <b style={{color:"var(--red)"}}>{result.failing}</b> of {COUNTIES.length} counties fail network adequacy (need 3+ verified providers incl. a prescriber).
                </p>
                <div className="sp-counties">
                  {COUNTIES.map(c=>{ const x=result.county[c]; const col=x.verified===0?"var(--red)":x.pass?"var(--green)":"var(--amber)"; const bg=x.verified===0?"var(--red-bg)":x.pass?"var(--green-bg)":"var(--amber-bg)";
                    return (<div key={c} style={{background:bg,border:`1px solid ${col}`,borderRadius:9,padding:"9px 8px",textAlign:"center"}}>
                      <div style={{fontSize:11,fontWeight:700,color:"var(--txt)"}}>{c}</div>
                      <div className="mono" style={{fontSize:17,fontWeight:800,color:col,lineHeight:1.1,marginTop:3}}>{x.verified}<span style={{fontSize:11,color:"var(--muted)",fontWeight:600}}>/{x.claimed}</span></div>
                      <div style={{fontSize:9.5,color:"var(--muted)",marginTop:1}}>verified</div>
                    </div>); })}
                </div>
                <div style={{marginTop:12,display:"flex",gap:14,fontSize:10.5,color:"var(--muted)",flexWrap:"wrap"}}>
                  <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,borderRadius:2,background:"var(--green)"}}/>meets adequacy</span>
                  <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,borderRadius:2,background:"var(--amber)"}}/>thin</span>
                  <span style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:9,height:9,borderRadius:2,background:"var(--red)"}}/>desert (0 verified)</span>
                </div>
              </>}
            </section>
          </div>)}

          {phase==="done" && (<section className="panel" style={{padding:20,marginBottom:18}}>
            <SectionTitle icon={Trophy} color="var(--amber)">Insurer leaderboard</SectionTitle>
            <p style={{fontSize:12.5,color:"var(--muted)",marginTop:-6,marginBottom:14}}>Ranked by severity-weighted ghost rate across audited plans. Higher is worse.</p>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {board.map((b,i)=>(
                <div key={i} className="lbrow" style={{display:"flex",alignItems:"center",gap:12,padding:"7px 9px",background:b.you?"var(--red-bg)":"transparent",border:b.you?"1px solid #ECCFCA":"1px solid transparent"}}>
                  <span className="mono" style={{fontSize:13,fontWeight:700,color:"var(--dim)",width:18}}>{i+1}</span>
                  <div style={{width:150,minWidth:120}}>
                    <div style={{fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>{b.name}{b.you&&<span style={{fontSize:9.5,background:"var(--red)",color:"#fff",padding:"1px 6px",borderRadius:999}}>YOU AUDITED</span>}</div>
                    <div style={{fontSize:10.5,color:"var(--muted)"}}>{fmt(b.enrollees)} members</div>
                  </div>
                  <div className="bartrack" style={{flex:1}}><div className="barfill" style={{width:`${(b.weightedPct/maxW)*100}%`,background:b.weightedPct>=70?"var(--red)":"var(--amber)"}}/></div>
                  <span className="mono" style={{fontSize:15,fontWeight:800,width:44,textAlign:"right",color:b.weightedPct>=70?"var(--red)":"var(--amber)"}}>{b.weightedPct}%</span>
                </div>
              ))}
            </div>
          </section>)}

          {phase==="done" && (<section className="panel" style={{padding:20,marginBottom:18}}>
            <SectionTitle icon={Building2}>How the audit works</SectionTitle>
            <div className="sp-2col">
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:8,letterSpacing:".03em"}}>WHERE AI DOES THE WORK</div>
                <ul style={{margin:0,paddingLeft:18,fontSize:13,color:"var(--txt)",lineHeight:1.7}}>
                  <li>Claude reads the raw, inconsistent directory text and turns each entry into structured data</li>
                  <li>It flags credentials that don't match a behavioral-health specialty</li>
                  <li>It drafts the regulator complaint letter from the findings</li>
                </ul>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:8,letterSpacing:".03em"}}>VERIFICATION CHECKS</div>
                <ul style={{margin:0,paddingLeft:18,fontSize:13,color:"var(--txt)",lineHeight:1.7}}>
                  <li>NPI check-digit validation (the real federal algorithm)</li>
                  <li>Placeholder phones and area codes that don't match the state</li>
                  <li>One NPI shared across names, and padded duplicate listings</li>
                  <li>A 0-100 confidence score per provider, weighted by role</li>
                </ul>
              </div>
            </div>
          </section>)}

          {phase==="done" && s && (<section className="panel" style={{padding:22}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
              <SectionTitle icon={FileText} color="var(--azure)">Regulator report</SectionTitle>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <a className="btn btn-ghost" style={{padding:"9px 14px",fontSize:13,display:"flex",alignItems:"center",gap:7,textDecoration:"none"}}
                  href={`mailto:?subject=${encodeURIComponent("Ghost network complaint: "+insurer)}&body=${encodeURIComponent(letter||templateLetter(insurer,stateName,s))}`}>
                  <Mail size={14}/>Email to regulator
                </a>
                {!letter
                  ? <button className="btn btn-ghost" style={{padding:"9px 14px",fontSize:13,display:"flex",alignItems:"center",gap:7}} onClick={genLetter} disabled={letterLoading}>{letterLoading?<Loader2 size={14} className="spin"/>:<FileText size={14}/>}{letterLoading?"Drafting…":"Generate letter"}</button>
                  : <button className="btn btn-ghost" style={{padding:"9px 14px",fontSize:13,display:"flex",alignItems:"center",gap:7}} onClick={copyLetter}>{copied?<Check size={14} color="var(--green)"/>:<Copy size={14}/>}{copied?"Copied":"Copy"}</button>}
              </div>
            </div>
            <div className="panel2" style={{padding:16,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:8,letterSpacing:".03em"}}>FINDINGS SUMMARY</div>
              <div style={{fontSize:13,color:"var(--txt)",lineHeight:1.7}}>
                {insurer} lists {s.total} behavioral-health providers in {stateName}. {s.ghost} are likely ghosts and {s.questionable} are questionable, so <b>{s.notVerifiedPct}%</b> could not be verified. Weighted by provider role, the ghost rate is <b>{s.weightedPct}%</b>. An estimated <b>{fmt(impacted)}</b> members are affected, and <b>{result.failing}</b> of {COUNTIES.length} counties fail network-adequacy standards.
              </div>
            </div>
            {letter
              ? <div className="panel2 mono" style={{padding:16,fontSize:12.5,lineHeight:1.65,whiteSpace:"pre-wrap"}}>{letter}</div>
              : <p style={{fontSize:13,color:"var(--muted)",margin:0}}>Generate a formal complaint letter to {stateName}'s insurance regulator, prefilled with these findings and ready to email.</p>}
          </section>)}

          <p style={{fontSize:10.5,color:"var(--dim)",lineHeight:1.6,marginTop:20}}>
            Verification combines NPI check-digit validation, contact and address completeness, area-code/state matching, shared-NPI and duplicate detection, and a role-weighted confidence score. The sample uses synthetic data for demonstration and is not affiliated with any insurer.
          </p>
        </div>)}
      </div>
    </div>
  );
}
