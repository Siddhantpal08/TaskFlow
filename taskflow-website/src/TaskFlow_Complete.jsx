import { useState, useRef, useEffect } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&family=Lora:ital,wght@0,400;0,600;0,700;1,400&display=swap');`;

/* ── THEMES ──────────────────────────────────────────────────────────── */
const DARK = {
  bg:"#060B12", surf:"#0C1420", card:"#0F1C2E", border:"#182A42",
  accent:"#00E5CC", accentDim:"#00E5CC14", accentGlow:"0 0 28px #00E5CC44",
  red:"#FF3D5A", amber:"#FFAA00", green:"#00D67B", purple:"#B083FF",
  t1:"#E2EFFF", t2:"#6A88AA", t3:"#2E4A68",
  nav:"#080E18", mono:"'IBM Plex Mono',monospace", disp:"'Outfit',sans-serif",
  shadow:"0 8px 32px #00000066", inset:"#060B12",
  noteBg:"#0C1420", noteCard:"#0F1C2E", noteBorder:"#182A42",
  noteText:"#E2EFFF", noteSubText:"#6A88AA", noteMuted:"#2E4A68",
  noteHover:"#00E5CC0A", noteActive:"#00E5CC14",
  codeBg:"#020609", codeText:"#00E5CC",
  calloutBg:"#0F1C2E", calloutBorder:"#FFAA0033", calloutText:"#FFAA00",
  quoteBorder:"#B083FF", quoteText:"#9A88CC",
};
const LIGHT = {
  bg:"#EFF3FA", surf:"#FFFFFF", card:"#FFFFFF", border:"#D8E2F0",
  accent:"#007A6A", accentDim:"#007A6A12", accentGlow:"0 0 24px #007A6A22",
  red:"#DC2626", amber:"#D97706", green:"#059669", purple:"#7C3AED",
  t1:"#0D1B2E", t2:"#4A607A", t3:"#9AAEC8",
  nav:"#FFFFFF", mono:"'IBM Plex Mono',monospace", disp:"'Outfit',sans-serif",
  shadow:"0 4px 20px #00000012", inset:"#EFF3FA",
  noteBg:"#F9FAFB", noteCard:"#FFFFFF", noteBorder:"#E5E7EB",
  noteText:"#111827", noteSubText:"#6B7280", noteMuted:"#9CA3AF",
  noteHover:"#F3F4F6", noteActive:"#EDE9FE",
  codeBg:"#1E1E2E", codeText:"#A6E3A1",
  calloutBg:"#FFFBEB", calloutBorder:"#FDE68A", calloutText:"#92400E",
  quoteBorder:"#8B5CF6", quoteText:"#6B7280",
};

/* ── DATA ────────────────────────────────────────────────────────────── */
const USERS = [
  {id:1,name:"Siddhant Pal",   av:"SP",color:"#00E5CC"},
  {id:2,name:"Shubham Mendhe",av:"SM",color:"#B083FF"},
  {id:3,name:"Priya Sharma",  av:"PS",color:"#00D67B"},
  {id:4,name:"Rahul Verma",   av:"RV",color:"#FFAA00"},
];
const TASKS = [
  {id:1,title:"Design MySQL schema",        st:"done",   pri:"high",  by:1,to:1,due:"Feb 18",delegated:false,desc:"Create normalized tables for Users, Tasks, Notes, Events, Notifications with FK constraints."},
  {id:2,title:"Build REST API (Node.js)",   st:"active", pri:"high",  by:2,to:1,due:"Feb 22",delegated:false,desc:"Express routes for auth, task CRUD, delegation logic. JWT middleware on all protected routes."},
  {id:3,title:"JWT authentication system",  st:"pending",pri:"medium",by:1,to:2,due:"Feb 24",delegated:false,desc:"bcrypt password hashing + JWT token issuance and validation middleware."},
  {id:4,title:"React dashboard UI",         st:"pending",pri:"high",  by:1,to:3,due:"Feb 26",delegated:true, desc:"Main dashboard with stats, task list, calendar, team overview. Vite + React + dark/light mode."},
  {id:5,title:"  └─ Sidebar nav component",st:"active", pri:"medium",by:3,to:4,due:"Feb 23",delegated:false,desc:"Delegated sub-task: collapsible sidebar with route-based active states."},
  {id:6,title:"Firebase push notifications",st:"pending",pri:"low",  by:2,to:1,due:"Mar 01",delegated:false,desc:"FCM setup for React Native. Notification triggers on task assign, delegate, complete."},
  {id:7,title:"FullCalendar integration",   st:"pending",pri:"low",  by:1,to:2,due:"Mar 05",delegated:false,desc:"Calendar view for tasks by due date + events with month/week toggle."},
];
const EVENTS = [
  {id:1,title:"Project Presentation",date:"Feb 28",time:"10:00 AM",c:"#FF3D5A"},
  {id:2,title:"Sprint Review",       date:"Feb 22",time:"2:00 PM", c:"#00E5CC"},
  {id:3,title:"Code Review Session", date:"Feb 24",time:"4:30 PM", c:"#00D67B"},
];
const NOTIFS = [
  {id:1,txt:"Shubham assigned 'Build REST API' to you", time:"10m",read:false,sym:"⬡"},
  {id:2,txt:"Priya delegated 'Sidebar nav' to Rahul",  time:"1h", read:false,sym:"↗"},
  {id:3,txt:"Rahul accepted 'Sidebar nav component'",  time:"3h", read:true, sym:"✓"},
  {id:4,txt:"New event: Sprint Review on Feb 22 @ 2pm",time:"1d", read:true, sym:"◈"},
];

/* ── NOTES / PAGES DATA ──────────────────────────────────────────────── */
const mkId = () => Math.random().toString(36).slice(2,9);
const mkBlock = (type="p",content="",extra={}) => ({id:mkId(),type,content,checked:false,...extra});
const EMOJIS = ["📝","📚","🗂️","💡","🎯","🔬","⚡","🌿","🎨","🔧","📊","🚀","🧠","💼","🌍","🔐","📐","🎵","🏗️","✨"];

const INIT_PAGES = {
  root:{id:"root",title:"Notes",emoji:"📝",parentId:null,childIds:["np1","np2","np3"],blocks:[],updatedAt:"Just now"},
  np1:{id:"np1",title:"BCA Project — TaskFlow",emoji:"🚀",parentId:"root",childIds:["np1a","np1b"],
    blocks:[
      mkBlock("h1","BCA Project — TaskFlow"),
      mkBlock("callout","This document tracks the full development of TaskFlow — a peer-to-peer task management system built for BCA VI Semester."),
      mkBlock("h2","Project Status"),
      mkBlock("todo","Design MySQL database schema",{checked:true}),
      mkBlock("todo","Build REST API with Node.js + Express"),
      mkBlock("todo","Implement JWT authentication"),
      mkBlock("todo","Build React frontend dashboard"),
      mkBlock("todo","Add Firebase push notifications"),
      mkBlock("h2","Tech Stack"),
      mkBlock("p","Frontend: React + Vite · Backend: Node.js + Express · Database: MySQL · Mobile: React Native"),
    ],updatedAt:"Feb 20, 2025"},
  np1a:{id:"np1a",title:"Database Schema",emoji:"🗄️",parentId:"np1",childIds:[],
    blocks:[
      mkBlock("h1","Database Schema"),
      mkBlock("p","MySQL relational schema for the TaskFlow system with self-referencing FK for delegation chains."),
      mkBlock("h2","Tasks Table"),
      mkBlock("code","CREATE TABLE tasks (\n  task_id    INT PRIMARY KEY AUTO_INCREMENT,\n  title      VARCHAR(255) NOT NULL,\n  status     ENUM('pending','in_progress','completed') DEFAULT 'pending',\n  priority   ENUM('low','medium','high') DEFAULT 'medium',\n  parent_task_id INT REFERENCES tasks(task_id),\n  assigned_by    INT REFERENCES users(user_id),\n  assigned_to    INT REFERENCES users(user_id),\n  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP\n);"),
      mkBlock("quote","parent_task_id is a self-referencing FK that enables unlimited task delegation chains — the architectural core of TaskFlow."),
    ],updatedAt:"Feb 19, 2025"},
  np1b:{id:"np1b",title:"API Documentation",emoji:"⚡",parentId:"np1",childIds:["np1b1"],
    blocks:[
      mkBlock("h1","API Documentation"),
      mkBlock("p","REST API endpoints for the TaskFlow backend (Node.js + Express)."),
      mkBlock("h2","Task Endpoints"),
      mkBlock("code","GET    /api/tasks              → list tasks for current user\nPOST   /api/tasks              → create and assign a task\nPATCH  /api/tasks/:id/status   → update task status\nPOST   /api/tasks/:id/delegate → delegate task to another user"),
      mkBlock("callout","All endpoints require Authorization: Bearer <token> header except /auth/register and /auth/login."),
    ],updatedAt:"Feb 20, 2025"},
  np1b1:{id:"np1b1",title:"Auth Endpoints",emoji:"🔐",parentId:"np1b",childIds:[],
    blocks:[
      mkBlock("h1","Auth Endpoints"),
      mkBlock("code","POST /api/auth/register  → create account\nPOST /api/auth/login     → returns JWT token\nPOST /api/auth/logout    → invalidate session"),
      mkBlock("h2","JWT Middleware"),
      mkBlock("p","All protected routes validate the Bearer token using jsonwebtoken. bcrypt is used for password hashing with a salt factor of 12."),
    ],updatedAt:"Feb 18, 2025"},
  np2:{id:"np2",title:"Meeting Notes",emoji:"📋",parentId:"root",childIds:[],
    blocks:[
      mkBlock("h1","Meeting Notes"),
      mkBlock("h2","Feb 20, 2025 — Architecture Review"),
      mkBlock("p","Attendees: Siddhant Pal, Shubham Mendhe, Dr. Sunita Dwivedi"),
      mkBlock("todo","Removed fixed role hierarchy — any user can assign to any user",{checked:true}),
      mkBlock("todo","Delegation depth is unlimited (parent_task_id self-reference)",{checked:true}),
      mkBlock("todo","Notifications: email via NodeMailer + mobile push via Firebase FCM"),
      mkBlock("todo","Dark/light mode toggle using React context + CSS variables"),
      mkBlock("h2","Action Items"),
      mkBlock("todo","Siddhant: finalize DB schema by Feb 21"),
      mkBlock("todo","Shubham: set up Node.js project structure"),
    ],updatedAt:"Feb 20, 2025"},
  np3:{id:"np3",title:"Research & Ideas",emoji:"💡",parentId:"root",childIds:[],
    blocks:[
      mkBlock("h1","Research & Ideas"),
      mkBlock("callout","The global task management software market is valued at over $4 billion and growing at ~14% annually."),
      mkBlock("h2","Comparable Products"),
      mkBlock("p","Studied for reference: Todoist, Asana, Linear, Notion, ClickUp"),
      mkBlock("quote","TaskFlow fills the gap between overly simple to-do apps and heavyweight enterprise tools — targeting students and small teams."),
      mkBlock("h2","Future Features"),
      mkBlock("todo","Real-time collaboration (Socket.io)"),
      mkBlock("todo","In-app chat between task participants"),
      mkBlock("todo","PDF/Excel export (pdfkit, exceljs)"),
      mkBlock("todo","AI task suggestions"),
    ],updatedAt:"Feb 18, 2025"},
};

/* ── BLOCK TYPES ─────────────────────────────────────────────────────── */
const BLOCK_TYPES = [
  {type:"p",      icon:"¶",   label:"Text",       desc:"Plain paragraph"},
  {type:"h1",     icon:"H1",  label:"Heading 1",  desc:"Large title"},
  {type:"h2",     icon:"H2",  label:"Heading 2",  desc:"Section heading"},
  {type:"h3",     icon:"H3",  label:"Heading 3",  desc:"Sub-heading"},
  {type:"todo",   icon:"☐",   label:"To-do",      desc:"Checkbox item"},
  {type:"quote",  icon:"❝",   label:"Quote",      desc:"Block quote"},
  {type:"callout",icon:"💡",  label:"Callout",    desc:"Info callout box"},
  {type:"code",   icon:"</>", label:"Code",       desc:"Code block"},
  {type:"divider",icon:"—",   label:"Divider",    desc:"Horizontal line"},
];

/* ── MICRO COMPONENTS ────────────────────────────────────────────────── */
function Av({u,sz=32}) {
  return <div style={{width:sz,height:sz,borderRadius:"50%",flexShrink:0,
    background:`linear-gradient(135deg,${u.color}25,${u.color}50)`,
    border:`1.5px solid ${u.color}55`,display:"flex",alignItems:"center",
    justifyContent:"center",fontSize:sz*.31,fontWeight:700,color:u.color,
    fontFamily:"'Outfit'",letterSpacing:"-0.5px"}}>{u.av}</div>;
}
function Tag({label,color}) {
  return <span style={{padding:"2px 9px",borderRadius:20,fontSize:10.5,fontWeight:600,
    color,background:color+"20",fontFamily:"'Outfit'",letterSpacing:"0.2px",
    whiteSpace:"nowrap"}}>{label}</span>;
}
function PriTag({p,t}) {
  const m={high:[t.red,"High"],medium:[t.amber,"Med"],low:[t.green,"Low"]};
  const[c,l]=m[p]||[t.t2,p];
  return <Tag label={l} color={c}/>;
}
function StTag({s,t}) {
  const m={done:[t.green,"Done"],active:[t.accent,"Active"],pending:[t.t2,"Pending"]};
  const[c,l]=m[s]||[t.t2,s];
  return <Tag label={l} color={c}/>;
}
function I({d,sz=16,c="currentColor",sw=1.8}) {
  return <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none"
    stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/></svg>;
}
const IC = {
  dash:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  task:"M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11",
  note:"M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8",
  cal: "M8 2v4 M16 2v4 M3 10h18 M21 8v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2z",
  team:"M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  bell:"M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  plus:"M12 5v14 M5 12h14",
  srch:"M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  x:   "M18 6L6 18 M6 6l12 12",
  chk: "M20 6L9 17l-5-5",
  send:"M22 2L11 13 M22 2L15 22 8 13 2 4z",
  arr: "M5 12h14 M12 5l7 7-7 7",
  sun: "M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 5a7 7 0 100 14A7 7 0 0012 5z",
  moon:"M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  del: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  edt: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  lnk: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  out: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  chev:"M9 18l6-6-6-6",
  tri: "M3 6 L12 18 L21 6 Z",
  dot3:"M12 5a1 1 0 100 2 1 1 0 000-2z M12 11a1 1 0 100 2 1 1 0 000-2z M12 17a1 1 0 100 2 1 1 0 000-2z",
  trash:"M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6",
};

/* ══════════════════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [dark, setDark]   = useState(true);
  const [page, setPage]   = useState("dashboard");
  const [notif, setNotif] = useState(false);
  const [task, setTask]   = useState(null);
  const [modal, setModal] = useState(false);
  // Notes state
  const [pages, setPages]       = useState(INIT_PAGES);
  const [notePageId, setNotePageId] = useState("np1");
  const [expanded, setExpanded] = useState({root:true,np1:true});
  const t = dark ? DARK : LIGHT;

  const css = `
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Outfit',sans-serif}
    ::-webkit-scrollbar{width:3px}
    ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}
    input,textarea,[contenteditable]{outline:none}
    input:focus,textarea:focus{border-color:${t.accent}!important;box-shadow:0 0 0 3px ${t.accentDim}!important}
    @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    @keyframes slideRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    @keyframes popIn{from{opacity:0;transform:translate(-50%,-47%) scale(.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
    @keyframes glow{0%,100%{opacity:1}50%{opacity:.35}}
    .fadeUp{animation:fadeUp .3s ease forwards}
    .slideRight{animation:slideRight .25s ease forwards}
    .slideDown{animation:slideDown .18s ease forwards}
    .popIn{animation:popIn .22s ease forwards}
    .glw{animation:glow 2.2s ease infinite}
    .hvr:hover{background:${t.accentDim}!important}
    .hvrC:hover{transform:translateY(-2px);box-shadow:${t.accentGlow}!important}
    .hvrB:hover{opacity:.85;transform:translateY(-1px)}
    .hvrI:hover{color:${t.accent}!important}
    .pill:hover{border-color:${t.accent}!important;color:${t.accent}!important}
    .nsi:hover{background:${t.noteHover}!important}
    .nsi:hover .nsa{opacity:1!important}
    .blkr:hover .blkh{opacity:1!important}
    [contenteditable]:empty:before{content:attr(data-ph);color:${t.t3};pointer-events:none}
    transition-all{transition:all .18s ease}
  `;

  // Notes helpers
  const addNotePage = (parentId) => {
    const id = mkId();
    const emoji = EMOJIS[Math.floor(Math.random()*EMOJIS.length)];
    setPages(prev=>({
      ...prev,
      [id]:{id,title:"Untitled",emoji,parentId,childIds:[],
        blocks:[mkBlock("h1","Untitled"),mkBlock("p","")],updatedAt:"Just now"},
      [parentId]:{...prev[parentId],childIds:[...(prev[parentId].childIds||[]),id]}
    }));
    setExpanded(prev=>({...prev,[parentId]:true}));
    setNotePageId(id);
    setPage("notes");
  };
  const deleteNotePage = (id) => {
    const pg = pages[id];
    if(!pg||id==="root") return;
    setPages(prev=>{
      const next={...prev};
      if(pg.parentId&&next[pg.parentId])
        next[pg.parentId]={...next[pg.parentId],childIds:next[pg.parentId].childIds.filter(c=>c!==id)};
      const del=(pid)=>{const p=next[pid];if(!p)return;p.childIds?.forEach(del);delete next[pid];};
      del(id);
      return next;
    });
    if(notePageId===id) setNotePageId(pg.parentId==="root"?"np1":pg.parentId);
  };
  const updateNotePage = (id,changes) => setPages(prev=>({...prev,[id]:{...prev[id],...changes,updatedAt:"Just now"}}));

  const navigateNote = (id) => { setNotePageId(id); setPage("notes"); };

  return (
    <>
      <style>{FONTS}{css}</style>
      <div style={{display:"flex",height:"100vh",width:"100%",background:t.bg,
        color:t.t1,fontFamily:t.disp,overflow:"hidden"}}>

        <Sidebar t={t} page={page} setPage={setPage}
          pages={pages} expanded={expanded} setExpanded={setExpanded}
          notePageId={notePageId} navigateNote={navigateNote}
          addNotePage={addNotePage} deleteNotePage={deleteNotePage}/>

        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <Topbar t={t} dark={dark} setDark={setDark} notif={notif}
            setNotif={setNotif} page={page} setModal={setModal}/>
          <main style={{flex:1,overflow:"auto"}} className="fadeUp" key={page}>
            {page==="dashboard" && <Dashboard t={t} setPage={setPage} setTask={setTask}/>}
            {page==="tasks"     && <Tasks     t={t} setTask={setTask}/>}
            {page==="notes"     && <NotesPage t={t} pages={pages} notePageId={notePageId}
                                    navigateNote={navigateNote} updateNotePage={updateNotePage}
                                    addNotePage={addNotePage} deleteNotePage={deleteNotePage}/>}
            {page==="calendar"  && <Cal       t={t}/>}
            {page==="team"      && <Team      t={t}/>}
          </main>
        </div>

        {notif && <NotifPanel  t={t} onClose={()=>setNotif(false)}/>}
        {task  && <TaskDrawer  t={t} task={task} onClose={()=>setTask(null)}/>}
        {modal && <AssignModal t={t} onClose={()=>setModal(false)}/>}
      </div>
    </>
  );
}

/* ── SIDEBAR ─────────────────────────────────────────────────────────── */
function Sidebar({t,page,setPage,pages,expanded,setExpanded,notePageId,navigateNote,addNotePage,deleteNotePage}) {
  const nav=[
    {id:"dashboard",label:"Dashboard",ic:IC.dash},
    {id:"tasks",    label:"Tasks",    ic:IC.task},
    {id:"calendar", label:"Calendar", ic:IC.cal},
    {id:"team",     label:"Team",     ic:IC.team},
  ];
  const rootPage = pages["root"];
  const toggleExp = (id,e) => {e.stopPropagation();setExpanded(p=>({...p,[id]:!p[id]}));};

  return (
    <div style={{width:220,background:t.nav,borderRight:`1px solid ${t.border}`,
      display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>

      {/* Logo */}
      <div style={{padding:"18px 16px 14px",borderBottom:`1px solid ${t.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:14}}>
          <div style={{width:32,height:32,borderRadius:9,flexShrink:0,
            background:`linear-gradient(135deg,${t.accent},#009688)`,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:t.accentGlow}}>
            <I d={IC.lnk} sz={15} c="#000" sw={2.4}/>
          </div>
          <span style={{fontSize:17,fontWeight:800,letterSpacing:"-0.5px",color:t.t1}}>
            Task<span style={{color:t.accent}}>Flow</span>
          </span>
        </div>
        {/* Main nav */}
        <div style={{display:"flex",flexDirection:"column",gap:1}}>
          {nav.map(n=>{
            const a=page===n.id;
            return <button key={n.id} onClick={()=>setPage(n.id)} className="pill"
              style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",
                borderRadius:8,border:"none",cursor:"pointer",textAlign:"left",
                fontFamily:t.disp,fontSize:13,fontWeight:a?600:400,
                background:a?t.accentDim:"transparent",color:a?t.accent:t.t2,
                borderLeft:`2px solid ${a?t.accent:"transparent"}`,transition:"all .15s"}}>
              <I d={n.ic} sz={14} c={a?t.accent:t.t3} sw={a?2.2:1.8}/>{n.label}
            </button>;
          })}
        </div>
      </div>

      {/* Notes tree */}
      <div style={{flex:1,overflow:"auto",padding:"10px 8px"}}>
        {/* Notes header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
          padding:"4px 8px",marginBottom:4}}>
          <span style={{fontSize:10,fontWeight:600,color:t.t3,
            textTransform:"uppercase",letterSpacing:"0.7px"}}>Notes</span>
          <button onClick={()=>addNotePage("root")} title="New page"
            style={{width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",
              border:"none",background:"transparent",cursor:"pointer",color:t.t3,
              borderRadius:4,transition:"all .15s"}}
            onMouseEnter={e=>e.currentTarget.style.color=t.accent}
            onMouseLeave={e=>e.currentTarget.style.color=t.t3}>
            <I d={IC.plus} sz={13} c="currentColor"/>
          </button>
        </div>

        {/* Notes tree - Notes section triggers "notes" page */}
        {rootPage?.childIds?.map(id=>(
          <NoteTreeItem key={id} pageId={id} pages={pages} expanded={expanded}
            toggleExp={toggleExp} activeId={notePageId} isNotePage={page==="notes"}
            navigateNote={navigateNote} addNotePage={addNotePage}
            deleteNotePage={deleteNotePage} depth={0} t={t}/>
        ))}
      </div>

      {/* User */}
      <div style={{padding:"10px 12px",borderTop:`1px solid ${t.border}`}}>
        <div style={{padding:"8px",borderRadius:9,background:t.card,
          border:`1px solid ${t.border}`,display:"flex",alignItems:"center",gap:9}}>
          <Av u={USERS[0]} sz={30}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:700,color:t.t1,
              whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Siddhant Pal</div>
            <div style={{fontSize:10,color:t.t3,fontFamily:t.mono}}>BCA VI</div>
          </div>
          <I d={IC.out} sz={13} c={t.t3}/>
        </div>
      </div>
    </div>
  );
}

/* ── NOTE TREE ITEM ─────────────────────────────────────────────────── */
function NoteTreeItem({pageId,pages,expanded,toggleExp,activeId,isNotePage,
  navigateNote,addNotePage,deleteNotePage,depth,t}) {
  const pg = pages[pageId];
  if(!pg) return null;
  const isActive = isNotePage && activeId===pageId;
  const isExp = expanded[pageId];
  const hasKids = pg.childIds?.length>0;

  return (
    <div>
      <div className="nsi" style={{display:"flex",alignItems:"center",borderRadius:7,
        cursor:"pointer",background:isActive?t.noteActive:"transparent",
        marginBottom:1,transition:"background .12s",paddingLeft:depth*14}}>
        <button onClick={e=>toggleExp(pageId,e)}
          style={{width:18,height:26,display:"flex",alignItems:"center",justifyContent:"center",
            border:"none",background:"transparent",cursor:"pointer",color:t.t3,
            flexShrink:0,opacity:hasKids?1:0,pointerEvents:hasKids?"auto":"none"}}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5"
            style={{transform:isExp?"rotate(90deg)":"rotate(0deg)",transition:"transform .15s"}}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
        <div style={{flex:1,display:"flex",alignItems:"center",gap:5,
          padding:"4px 4px 4px 2px",minWidth:0}}
          onClick={()=>navigateNote(pageId)}>
          <span style={{fontSize:13,flexShrink:0}}>{pg.emoji||"📄"}</span>
          <span style={{fontSize:12.5,color:isActive?t.accent:t.t2,fontWeight:isActive?600:400,
            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",flex:1}}>
            {pg.title||"Untitled"}
          </span>
        </div>
        <div className="nsa" style={{display:"flex",opacity:0,transition:"opacity .15s",
          gap:1,paddingRight:4,flexShrink:0}}>
          <button onClick={e=>{e.stopPropagation();addNotePage(pageId)}}
            style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",
              border:"none",background:"transparent",cursor:"pointer",borderRadius:4,color:t.t3}}
            onMouseEnter={e=>e.currentTarget.style.background=t.border}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <I d={IC.plus} sz={11} c="currentColor"/>
          </button>
          <button onClick={e=>{e.stopPropagation();deleteNotePage(pageId)}}
            style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",
              border:"none",background:"transparent",cursor:"pointer",borderRadius:4,color:t.t3}}
            onMouseEnter={e=>{e.currentTarget.style.background="#FF3D5A22";e.currentTarget.style.color=t.red}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=t.t3}}>
            <I d={IC.trash} sz={11} c="currentColor"/>
          </button>
        </div>
      </div>
      {isExp && hasKids && pg.childIds.map(cid=>(
        <NoteTreeItem key={cid} pageId={cid} pages={pages} expanded={expanded}
          toggleExp={toggleExp} activeId={activeId} isNotePage={isNotePage}
          navigateNote={navigateNote} addNotePage={addNotePage}
          deleteNotePage={deleteNotePage} depth={depth+1} t={t}/>
      ))}
    </div>
  );
}

/* ── TOPBAR ──────────────────────────────────────────────────────────── */
function Topbar({t,dark,setDark,notif,setNotif,page,setModal}) {
  const [q,setQ]=useState("");
  const labels={dashboard:"Dashboard",tasks:"My Tasks",notes:"Notes",calendar:"Calendar",team:"Team"};
  const unread=NOTIFS.filter(n=>!n.read).length;
  return (
    <div style={{display:"flex",alignItems:"center",gap:14,padding:"13px 26px",
      borderBottom:`1px solid ${t.border}`,background:t.nav,flexShrink:0}}>
      <div style={{minWidth:0}}>
        <div style={{fontSize:17,fontWeight:800,letterSpacing:"-0.4px",color:t.t1}}>{labels[page]}</div>
        <div style={{fontSize:10,color:t.t3,fontFamily:t.mono,marginTop:1}}>
          {new Date().toLocaleDateString("en-IN",{weekday:"short",month:"short",day:"numeric",year:"numeric"})}
        </div>
      </div>
      <div style={{flex:1,maxWidth:340,margin:"0 auto",display:"flex",alignItems:"center",
        gap:9,background:t.inset,border:`1px solid ${t.border}`,borderRadius:9,padding:"7px 13px"}}>
        <I d={IC.srch} sz={14} c={t.t3}/>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search…"
          style={{flex:1,background:"transparent",border:"none",color:t.t1,fontSize:12.5,fontFamily:t.disp}}/>
        <span style={{fontSize:9,color:t.t3,fontFamily:t.mono,background:t.card,padding:"2px 6px",borderRadius:4}}>⌘K</span>
      </div>
      <button onClick={()=>setModal(true)} className="hvrB"
        style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:9,
          border:"none",cursor:"pointer",fontFamily:t.disp,fontSize:12.5,fontWeight:700,
          background:`linear-gradient(135deg,${t.accent},#009688)`,color:"#000",
          boxShadow:t.accentGlow,transition:"all .18s"}}>
        <I d={IC.plus} sz={14} c="#000" sw={2.5}/>Assign Task
      </button>
      <button onClick={()=>setDark(!dark)} className="hvrI"
        style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:9,
          padding:8,cursor:"pointer",display:"flex",color:t.t2,transition:"all .2s"}}>
        <I d={dark?IC.sun:IC.moon} sz={15} c={t.t2}/>
      </button>
      <button onClick={()=>setNotif(p=>!p)} className="hvrI"
        style={{background:notif?t.accentDim:t.card,border:`1px solid ${notif?t.accent:t.border}`,
          borderRadius:9,padding:8,cursor:"pointer",display:"flex",position:"relative",transition:"all .2s"}}>
        <I d={IC.bell} sz={15} c={notif?t.accent:t.t2}/>
        {unread>0&&<div style={{position:"absolute",top:6,right:6,width:7,height:7,
          borderRadius:"50%",background:t.red,border:`2px solid ${t.nav}`}}/>}
      </button>
    </div>
  );
}

/* ── DASHBOARD ───────────────────────────────────────────────────────── */
function Dashboard({t,setPage,setTask}) {
  const done=TASKS.filter(x=>x.st==="done").length;
  const total=TASKS.length;
  const stats=[
    {label:"Total Tasks",val:total,      note:"this sprint",    c:t.accent},
    {label:"Completed",  val:done,       note:`${Math.round(done/total*100)}% rate`,c:t.green},
    {label:"Delegated",  val:TASKS.filter(x=>x.delegated).length,note:"active chains",c:t.amber},
    {label:"Due Soon",   val:2,          note:"action needed",  c:t.red},
  ];
  return (
    <div style={{padding:"22px 26px",display:"flex",flexDirection:"column",gap:20}}>
      <div style={{background:`linear-gradient(135deg,${t.accent}12,${t.accent}06)`,
        border:`1px solid ${t.accent}28`,borderRadius:14,padding:"18px 22px",
        display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontSize:21,fontWeight:800,letterSpacing:"-0.5px",color:t.t1}}>
            Good morning, Siddhant 👋
          </div>
          <div style={{fontSize:13,color:t.t2,marginTop:3}}>
            <span style={{color:t.red,fontWeight:600}}>2 tasks due today</span>
            {" · "}<span style={{color:t.accent,fontWeight:600}}>3 awaiting your action</span>
          </div>
        </div>
        <div style={{fontFamily:t.mono,fontSize:10,color:t.t3,textAlign:"right",lineHeight:2}}>
          <div style={{color:t.accent}}>TaskFlow v1.0</div><div>BCA VI · 2024–25</div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {stats.map((s,i)=>(
          <div key={i} className="hvrC" style={{background:t.card,border:`1px solid ${t.border}`,
            borderRadius:12,padding:"16px 18px",cursor:"default",boxShadow:t.shadow,transition:"all .2s"}}>
            <div style={{fontSize:34,fontWeight:900,color:s.c,letterSpacing:"-2px",lineHeight:1}}>{s.val}</div>
            <div style={{fontSize:13,fontWeight:600,color:t.t1,marginTop:5}}>{s.label}</div>
            <div style={{fontSize:10,color:t.t3,fontFamily:t.mono,marginTop:2}}>{s.note}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 285px",gap:18}}>
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,overflow:"hidden",boxShadow:t.shadow}}>
          <div style={{padding:"13px 18px",borderBottom:`1px solid ${t.border}`,
            display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13.5,fontWeight:700,color:t.t1}}>Recent Tasks</span>
            <button onClick={()=>setPage("tasks")} style={{background:"none",border:"none",cursor:"pointer",
              color:t.accent,fontSize:12,fontWeight:600,fontFamily:t.disp,display:"flex",alignItems:"center",gap:4}}>
              All <I d={IC.arr} sz={11} c={t.accent}/>
            </button>
          </div>
          {TASKS.slice(0,5).map(tk=>(
            <div key={tk.id} className="hvr" onClick={()=>setTask(tk)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"11px 18px",
                borderBottom:`1px solid ${t.border}`,cursor:"pointer",background:"transparent",transition:"background .15s"}}>
              <div style={{width:5,height:5,borderRadius:"50%",flexShrink:0,
                background:tk.st==="done"?t.green:tk.st==="active"?t.accent:t.border}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:tk.title.startsWith(" ")?11.5:13,fontWeight:500,color:t.t1,
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                  textDecoration:tk.st==="done"?"line-through":"none",opacity:tk.st==="done"?.45:1,
                  fontFamily:tk.title.startsWith(" ")?t.mono:t.disp}}>{tk.title}</div>
                <div style={{fontSize:10.5,color:t.t3,fontFamily:t.mono,marginTop:1}}>
                  due {tk.due} · by {USERS.find(u=>u.id===tk.by)?.name.split(" ")[0]}
                </div>
              </div>
              <div style={{display:"flex",gap:5,flexShrink:0}}>
                <PriTag p={tk.pri} t={t}/><StTag s={tk.st} t={t}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,overflow:"hidden",boxShadow:t.shadow}}>
            <div style={{padding:"12px 15px",borderBottom:`1px solid ${t.border}`,fontSize:13,fontWeight:700,color:t.t1}}>Upcoming</div>
            {EVENTS.map(ev=>(
              <div key={ev.id} style={{padding:"10px 15px",borderBottom:`1px solid ${t.border}`,display:"flex",gap:11,alignItems:"center"}}>
                <div style={{width:34,borderRadius:7,padding:"3px 0",textAlign:"center",
                  background:ev.c+"14",border:`1px solid ${ev.c}28`,flexShrink:0}}>
                  <div style={{fontSize:8,fontWeight:700,color:ev.c,fontFamily:t.mono}}>{ev.date.split(" ")[0].toUpperCase()}</div>
                  <div style={{fontSize:15,fontWeight:900,color:ev.c,lineHeight:1.1}}>{ev.date.split(" ")[1]}</div>
                </div>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:t.t1}}>{ev.title}</div>
                  <div style={{fontSize:10.5,color:t.t3,fontFamily:t.mono,marginTop:1}}>{ev.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 15px",boxShadow:t.shadow}}>
            <div style={{fontSize:13,fontWeight:700,color:t.t1,marginBottom:12}}>Team</div>
            {USERS.map(u=>(
              <div key={u.id} style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}>
                <Av u={u} sz={28}/>
                <div style={{flex:1,fontSize:12,fontWeight:500,color:t.t1}}>{u.name.split(" ")[0]}</div>
                <div className="glw" style={{width:6,height:6,borderRadius:"50%",background:t.green}}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── TASKS PAGE ──────────────────────────────────────────────────────── */
function Tasks({t,setTask}) {
  const [fil,setFil]=useState("all");
  const tabs=["all","pending","active","done","delegated"];
  const count=f=>f==="all"?TASKS.length:f==="delegated"?TASKS.filter(x=>x.delegated).length:TASKS.filter(x=>x.st===f).length;
  const list=TASKS.filter(tk=>fil==="all"?true:fil==="delegated"?tk.delegated:tk.st===fil);
  return (
    <div style={{padding:"22px 26px"}}>
      <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
        {tabs.map(f=>{const a=fil===f;return(
          <button key={f} onClick={()=>setFil(f)} className="pill"
            style={{padding:"6px 14px",borderRadius:20,cursor:"pointer",fontFamily:t.disp,
              fontSize:12,fontWeight:a?600:400,border:`1px solid ${a?t.accent:t.border}`,
              background:a?t.accentDim:t.card,color:a?t.accent:t.t2,transition:"all .15s",
              display:"flex",alignItems:"center",gap:6}}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
            <span style={{fontSize:10,background:a?t.accent+"28":t.border,
              color:a?t.accent:t.t3,padding:"1px 6px",borderRadius:10}}>{count(f)}</span>
          </button>);
        })}
      </div>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,overflow:"hidden",boxShadow:t.shadow}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 130px 100px 80px 88px",
          padding:"10px 18px",borderBottom:`1px solid ${t.border}`,
          fontSize:10,fontWeight:600,color:t.t3,textTransform:"uppercase",letterSpacing:"0.7px",fontFamily:t.mono}}>
          <span>Task</span><span>Assigned By</span><span>Due</span><span>Priority</span><span>Status</span>
        </div>
        {list.map(tk=>(
          <div key={tk.id} className="hvr" onClick={()=>setTask(tk)}
            style={{display:"grid",gridTemplateColumns:"1fr 130px 100px 80px 88px",
              padding:"12px 18px",borderBottom:`1px solid ${t.border}`,
              alignItems:"center",cursor:"pointer",background:"transparent",transition:"background .15s"}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:16,height:16,borderRadius:4,flexShrink:0,
                border:`1.5px solid ${tk.st==="done"?t.green:t.border}`,
                background:tk.st==="done"?t.green+"20":"transparent",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                {tk.st==="done"&&<I d={IC.chk} sz={9} c={t.green} sw={3}/>}
              </div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:tk.title.startsWith(" ")?11.5:13,fontWeight:500,color:t.t1,
                  textDecoration:tk.st==="done"?"line-through":"none",opacity:tk.st==="done"?.45:1,
                  fontFamily:tk.title.startsWith(" ")?t.mono:t.disp,
                  whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{tk.title}</div>
                {tk.delegated&&<span style={{fontSize:10,color:t.amber}}>↗ delegated</span>}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <Av u={USERS.find(u=>u.id===tk.by)||USERS[0]} sz={20}/>
              <span style={{fontSize:11.5,color:t.t2}}>{(USERS.find(u=>u.id===tk.by)||USERS[0]).name.split(" ")[0]}</span>
            </div>
            <span style={{fontFamily:t.mono,fontSize:11,color:t.t3}}>{tk.due}</span>
            <PriTag p={tk.pri} t={t}/>
            <StTag s={tk.st} t={t}/>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   NOTES PAGE — full Notion-like nested editor
══════════════════════════════════════════════════════════════════════ */
function NotesPage({t,pages,notePageId,navigateNote,updateNotePage,addNotePage,deleteNotePage}) {
  const pg = pages[notePageId];
  if(!pg) return null;

  const [blocks,setBlocks] = useState(pg.blocks||[mkBlock("p","")]);
  const [slash,setSlash]   = useState(null); // {idx, x, y, filter}
  const [emojiOpen,setEmojiOpen] = useState(false);
  const titleRef = useRef();

  // Resync blocks when page changes
  useEffect(()=>{
    setBlocks(pages[notePageId]?.blocks||[mkBlock("p","")]);
    setSlash(null);
  },[notePageId]);

  const save = (nb) => { setBlocks(nb); updateNotePage(notePageId,{blocks:nb}); };
  const addBlk=(afterIdx,type="p",content="")=>{
    const b=mkBlock(type,content);
    const nb=[...blocks];nb.splice(afterIdx+1,0,b);save(nb);
    setTimeout(()=>document.getElementById("blk-"+(afterIdx+1))?.focus(),30);
  };
  const updBlk=(idx,ch)=>{const nb=[...blocks];nb[idx]={...nb[idx],...ch};save(nb);};
  const delBlk=(idx)=>{
    if(blocks.length<=1){updBlk(0,{content:""});return;}
    const nb=blocks.filter((_,i)=>i!==idx);save(nb);
    setTimeout(()=>document.getElementById("blk-"+(Math.max(0,idx-1)))?.focus(),30);
  };

  const insertSlashType=(type)=>{
    if(slash===null) return;
    const nb=[...blocks];
    nb[slash.idx]={...nb[slash.idx],content:nb[slash.idx].content.replace(/\/[^\n]*$/,"")};
    const b=mkBlock(type,"");nb.splice(slash.idx+1,0,b);save(nb);
    setSlash(null);
    setTimeout(()=>document.getElementById("blk-"+(slash.idx+1))?.focus(),30);
  };

  // Breadcrumb
  const crumbs=[];
  let cur=notePageId;
  while(cur&&pages[cur]){crumbs.unshift(pages[cur]);cur=pages[cur].parentId;}
  const subPages=(pg.childIds||[]).map(id=>pages[id]).filter(Boolean);

  return (
    <div style={{display:"flex",height:"100%",overflow:"hidden"}}>

      {/* ── Page editor area ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Breadcrumb bar */}
        <div style={{display:"flex",alignItems:"center",padding:"9px 28px",
          borderBottom:`1px solid ${t.border}`,background:t.nav,flexShrink:0,gap:0}}>
          {crumbs.map((p,i)=>(
            <div key={p.id} style={{display:"flex",alignItems:"center"}}>
              {i>0&&<span style={{color:t.t3,fontSize:11,margin:"0 5px"}}>/</span>}
              <button onClick={()=>navigateNote(p.id)}
                style={{display:"flex",alignItems:"center",gap:4,padding:"3px 7px",
                  borderRadius:6,border:"none",background:"transparent",cursor:"pointer",
                  color:i<crumbs.length-1?t.t2:t.t1,fontFamily:t.disp,
                  fontSize:12,fontWeight:i===crumbs.length-1?600:400,transition:"background .12s"}}
                onMouseEnter={e=>{if(i<crumbs.length-1)e.currentTarget.style.background=t.noteHover}}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{fontSize:11}}>{p.emoji||"📄"}</span>{p.title||"Untitled"}
              </button>
            </div>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={()=>addNotePage(notePageId)}
              style={{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",
                borderRadius:7,border:`1px solid ${t.border}`,background:"transparent",
                cursor:"pointer",color:t.t2,fontSize:11.5,fontFamily:t.disp,transition:"all .15s"}}
              onMouseEnter={e=>e.currentTarget.style.background=t.noteHover}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <I d={IC.plus} sz={12} c="currentColor"/>Add sub-page
            </button>
            <span style={{fontSize:10,color:t.t3,fontFamily:t.mono}}>
              Updated {pg.updatedAt}
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflow:"auto"}} onClick={()=>setEmojiOpen(false)}>
          {/* Cover accent strip */}
          <div style={{height:5,background:`linear-gradient(to right,${t.accent},${t.purple})`,flexShrink:0}}/>

          <div style={{maxWidth:720,margin:"0 auto",padding:"32px 60px 80px",position:"relative"}}>

            {/* Emoji */}
            <div style={{position:"relative",display:"inline-block",marginBottom:6}}>
              <button onClick={e=>{e.stopPropagation();setEmojiOpen(p=>!p)}}
                style={{fontSize:52,background:"none",border:"none",cursor:"pointer",
                  lineHeight:1,padding:4,borderRadius:8,transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=t.noteHover}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                {pg.emoji||"📄"}
              </button>
              {emojiOpen&&(
                <div className="slideDown" style={{position:"absolute",top:"100%",left:0,zIndex:60,
                  background:t.card,border:`1px solid ${t.border}`,borderRadius:12,
                  padding:10,boxShadow:t.shadow,display:"grid",
                  gridTemplateColumns:"repeat(8,1fr)",gap:3,width:230}}
                  onClick={e=>e.stopPropagation()}>
                  {EMOJIS.map(em=>(
                    <button key={em} onClick={()=>{updateNotePage(notePageId,{emoji:em});setEmojiOpen(false)}}
                      style={{fontSize:19,background:"none",border:"none",cursor:"pointer",
                        padding:4,borderRadius:6,transition:"background .1s"}}
                      onMouseEnter={e=>e.currentTarget.style.background=t.noteHover}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <div contentEditable suppressContentEditableWarning ref={titleRef}
              data-ph="Untitled"
              onBlur={e=>updateNotePage(notePageId,{title:e.target.innerText||"Untitled"})}
              onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();document.getElementById("blk-0")?.focus();}}}
              style={{fontSize:38,fontWeight:700,color:t.noteText,lineHeight:1.2,
                marginBottom:20,fontFamily:"'Lora',serif",wordBreak:"break-word",
                minHeight:46,cursor:"text"}}>
              {pg.title}
            </div>

            {/* Meta */}
            <div style={{display:"flex",gap:20,marginBottom:28,paddingBottom:18,
              borderBottom:`1px solid ${t.noteBorder}`}}>
              {[["Created",pg.updatedAt],["Blocks",blocks.length+" blocks"],
                ["Sub-pages",(pg.childIds?.length||0)+" pages"]].map(([l,v])=>(
                <div key={l}>
                  <div style={{fontSize:9.5,color:t.noteMuted,textTransform:"uppercase",
                    letterSpacing:"0.5px",marginBottom:2,fontFamily:t.mono}}>{l}</div>
                  <div style={{fontSize:12,color:t.noteSubText}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Blocks */}
            <div style={{display:"flex",flexDirection:"column",gap:1}}>
              {blocks.map((blk,idx)=>(
                <NoteBlock key={blk.id} blk={blk} idx={idx} t={t}
                  onUpdate={ch=>updBlk(idx,ch)}
                  onDelete={()=>delBlk(idx)}
                  onAddAfter={(type)=>addBlk(idx,type)}
                  onSlash={(rect,filter)=>setSlash({idx,x:rect.left,y:rect.bottom+4,filter})}
                  onSlashClose={()=>setSlash(null)}/>
              ))}
            </div>

            {/* Sub-pages section */}
            {subPages.length>0&&(
              <div style={{marginTop:36}}>
                <div style={{fontSize:10,fontWeight:600,color:t.noteMuted,
                  textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:10,fontFamily:t.mono}}>
                  Sub-pages
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
                  {subPages.map(sp=>(
                    <div key={sp.id} onClick={()=>navigateNote(sp.id)}
                      style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",
                        borderRadius:10,border:`1px solid ${t.noteBorder}`,cursor:"pointer",
                        background:t.noteCard,transition:"all .15s"}}
                      onMouseEnter={e=>{e.currentTarget.style.background=t.noteHover;e.currentTarget.style.borderColor=t.accent+"44";}}
                      onMouseLeave={e=>{e.currentTarget.style.background=t.noteCard;e.currentTarget.style.borderColor=t.noteBorder;}}>
                      <span style={{fontSize:22}}>{sp.emoji||"📄"}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:600,color:t.noteText,
                          whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                          {sp.title||"Untitled"}
                        </div>
                        <div style={{fontSize:10.5,color:t.noteMuted,marginTop:1,fontFamily:t.mono}}>
                          {sp.childIds?.length>0?`${sp.childIds.length} sub-pages · `:""}Updated {sp.updatedAt}
                        </div>
                      </div>
                      <I d={IC.chev} sz={13} c={t.t3}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add sub-page CTA */}
            <button onClick={()=>addNotePage(notePageId)}
              style={{marginTop:14,display:"flex",alignItems:"center",justifyContent:"center",
                gap:7,padding:"9px 14px",borderRadius:9,border:`1px dashed ${t.noteBorder}`,
                background:"transparent",cursor:"pointer",color:t.noteMuted,fontSize:12.5,
                fontFamily:t.disp,width:"100%",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.color=t.noteText;e.currentTarget.style.borderColor=t.accent+"55";}}
              onMouseLeave={e=>{e.currentTarget.style.color=t.noteMuted;e.currentTarget.style.borderColor=t.noteBorder;}}>
              <I d={IC.plus} sz={13} c="currentColor"/>
              Add a sub-page inside "{pg.title||"this page"}"
            </button>
          </div>
        </div>
      </div>

      {/* Slash command menu */}
      {slash&&<SlashMenu t={t} filter={slash.filter} pos={{x:slash.x,y:slash.y}}
        onSelect={insertSlashType} onClose={()=>setSlash(null)}/>}
    </div>
  );
}

/* ── NOTE BLOCK ──────────────────────────────────────────────────────── */
function NoteBlock({blk,idx,t,onUpdate,onDelete,onAddAfter,onSlash,onSlashClose}) {
  const ref = useRef();
  const [hov,setHov] = useState(false);
  const [menuOpen,setMenuOpen] = useState(false);

  const handleKey = (e) => {
    if(e.key==="Enter"&&blk.type!=="code"){e.preventDefault();onAddAfter("p");}
    if(e.key==="Backspace"&&(e.currentTarget.innerText===""||blk.content==="")){
      e.preventDefault();onDelete();
    }
  };
  const handleInput = (e) => {
    const txt=e.currentTarget.innerText||"";
    onUpdate({content:txt});
    const li=txt.lastIndexOf("/");
    if(li!==-1){
      const filter=txt.slice(li+1);
      const rect=ref.current?.getBoundingClientRect();
      onSlash(rect,filter);
    } else { onSlashClose(); }
  };

  // DIVIDER
  if(blk.type==="divider") return(
    <div className="blkr" style={{position:"relative",padding:"6px 0"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        onDelete={onDelete} t={t}/>
      <hr style={{border:"none",borderTop:`1.5px solid ${t.noteBorder}`,margin:"4px 0"}}/>
    </div>
  );

  // CODE
  if(blk.type==="code") return(
    <div className="blkr" style={{position:"relative",margin:"4px 0"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        onDelete={onDelete} t={t}/>
      <div style={{background:t.codeBg,borderRadius:10,overflow:"hidden",
        border:`1px solid ${t.border}`}}>
        <div style={{padding:"7px 14px",borderBottom:`1px solid ${t.noteBorder}22`,
          display:"flex",alignItems:"center",gap:5}}>
          {["#ff5f57","#ffbd2e","#28c840"].map(c=>(
            <div key={c} style={{width:9,height:9,borderRadius:"50%",background:c}}/>
          ))}
          <span style={{marginLeft:6,fontSize:10.5,color:t.t3,fontFamily:t.mono}}>code</span>
        </div>
        <textarea value={blk.content} onChange={e=>onUpdate({content:e.target.value})}
          onKeyDown={e=>e.key==="Tab"&&(e.preventDefault(),onUpdate({content:blk.content+"  "}))}
          style={{width:"100%",background:"transparent",border:"none",color:t.codeText,
            fontFamily:t.mono,fontSize:12.5,lineHeight:1.7,padding:"10px 16px",
            resize:"none",minHeight:80,outline:"none",display:"block"}}
          rows={Math.max(3,(blk.content.match(/\n/g)||[]).length+2)}/>
      </div>
    </div>
  );

  // CALLOUT
  if(blk.type==="callout") return(
    <div className="blkr" style={{position:"relative",margin:"4px 0"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        onDelete={onDelete} t={t}/>
      <div style={{display:"flex",gap:11,padding:"11px 14px",borderRadius:10,
        background:t.calloutBg,border:`1px solid ${t.calloutBorder}`}}>
        <span style={{fontSize:17,flexShrink:0,marginTop:1}}>💡</span>
        <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
          data-ph="Add a callout…" onInput={handleInput} onKeyDown={handleKey}
          style={{flex:1,fontSize:13.5,color:t.calloutText,lineHeight:1.65,
            fontFamily:t.disp,wordBreak:"break-word"}}>
          {blk.content}
        </div>
      </div>
    </div>
  );

  // QUOTE
  if(blk.type==="quote") return(
    <div className="blkr" style={{position:"relative",margin:"4px 0"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        onDelete={onDelete} t={t}/>
      <div style={{display:"flex"}}>
        <div style={{width:3,borderRadius:3,background:t.quoteBorder,flexShrink:0}}/>
        <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
          data-ph="Add a quote…" onInput={handleInput} onKeyDown={handleKey}
          style={{flex:1,fontSize:15,color:t.quoteText,lineHeight:1.7,
            fontFamily:"'Lora',serif",fontStyle:"italic",padding:"4px 16px",
            wordBreak:"break-word"}}>
          {blk.content}
        </div>
      </div>
    </div>
  );

  // TODO
  if(blk.type==="todo") return(
    <div className="blkr" style={{position:"relative"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        onDelete={onDelete} t={t}/>
      <div style={{display:"flex",alignItems:"flex-start",gap:9,padding:"3px 0"}}>
        <button onClick={()=>onUpdate({checked:!blk.checked})}
          style={{width:16,height:16,borderRadius:4,flexShrink:0,marginTop:3,
            border:`1.5px solid ${blk.checked?t.accent:t.noteBorder}`,
            background:blk.checked?t.accent:"transparent",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
          {blk.checked&&<I d={IC.chk} sz={9} c={dark?"#000":"#fff"} sw={3}/>}
        </button>
        <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
          data-ph="To-do…" onInput={handleInput} onKeyDown={handleKey}
          style={{flex:1,fontSize:14,lineHeight:1.65,wordBreak:"break-word",
            color:blk.checked?t.noteMuted:t.noteText,fontFamily:t.disp,
            textDecoration:blk.checked?"line-through":"none",transition:"all .2s"}}>
          {blk.content}
        </div>
      </div>
    </div>
  );

  // TEXT BLOCKS
  const styles={
    h1:{fontSize:28,fontWeight:700,lineHeight:1.25,fontFamily:"'Lora',serif",
        color:t.noteText,paddingTop:18,paddingBottom:3},
    h2:{fontSize:20,fontWeight:700,lineHeight:1.3,fontFamily:t.disp,
        color:t.noteText,paddingTop:12,paddingBottom:2},
    h3:{fontSize:16,fontWeight:600,lineHeight:1.4,fontFamily:t.disp,
        color:t.noteText,paddingTop:8,paddingBottom:1},
    p: {fontSize:14.5,fontWeight:400,lineHeight:1.8,fontFamily:t.disp,
        color:t.noteSubText,paddingTop:1,paddingBottom:1},
  };
  const st=styles[blk.type]||styles.p;
  return(
    <div className="blkr" style={{position:"relative"}}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <BlockHandle hov={hov} menuOpen={menuOpen} setMenuOpen={setMenuOpen}
        onDelete={onDelete} t={t}/>
      <div id={`blk-${idx}`} ref={ref} contentEditable suppressContentEditableWarning
        data-ph={blk.type==="h1"?"Heading 1":blk.type==="h2"?"Heading 2":
                 blk.type==="h3"?"Heading 3":"Write something, or '/' for commands…"}
        onInput={handleInput} onKeyDown={handleKey}
        style={{...st,wordBreak:"break-word",cursor:"text",outline:"none",minHeight:st.fontSize+10}}>
        {blk.content}
      </div>
    </div>
  );
}

/* ── BLOCK HANDLE ────────────────────────────────────────────────────── */
function BlockHandle({hov,menuOpen,setMenuOpen,onDelete,t}) {
  return(
    <div className="blkh" style={{position:"absolute",left:-44,top:"50%",transform:"translateY(-50%)",
      display:"flex",alignItems:"center",gap:2,opacity:hov?1:0,transition:"opacity .15s",zIndex:10}}>
      <span style={{fontSize:14,color:t.t3,cursor:"grab",padding:"2px 3px",
        borderRadius:4,lineHeight:1,userSelect:"none"}}
        onMouseEnter={e=>e.currentTarget.style.background=t.noteHover}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>⠿</span>
      <div style={{position:"relative"}}>
        <button onClick={()=>setMenuOpen(p=>!p)}
          style={{width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",
            border:"none",background:"transparent",cursor:"pointer",borderRadius:4,color:t.t3}}
          onMouseEnter={e=>e.currentTarget.style.background=t.noteHover}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none"/>
            <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/>
            <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none"/>
          </svg>
        </button>
        {menuOpen&&(
          <>
            <div onClick={()=>setMenuOpen(false)} style={{position:"fixed",inset:0,zIndex:200}}/>
            <div className="slideDown" style={{position:"absolute",left:"100%",top:0,zIndex:201,
              background:t.card,border:`1px solid ${t.border}`,borderRadius:9,
              boxShadow:t.shadow,width:130,overflow:"hidden"}}>
              {[{l:"Delete",danger:true,fn:onDelete}].map(item=>(
                <button key={item.l} onClick={()=>{item.fn();setMenuOpen(false)}}
                  style={{width:"100%",padding:"8px 12px",border:"none",
                    background:"transparent",cursor:"pointer",fontSize:12.5,
                    color:item.danger?t.red:t.t1,fontFamily:t.disp,textAlign:"left",transition:"background .1s"}}
                  onMouseEnter={e=>e.currentTarget.style.background=item.danger?t.red+"15":t.noteHover}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  {item.l}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── SLASH MENU ──────────────────────────────────────────────────────── */
function SlashMenu({t,filter,pos,onSelect,onClose}) {
  const [sel,setSel]=useState(0);
  const filtered=BLOCK_TYPES.filter(b=>
    !filter||b.label.toLowerCase().includes(filter.toLowerCase())||
    b.type.toLowerCase().includes(filter.toLowerCase()));

  useEffect(()=>{
    const h=e=>{
      if(e.key==="Escape") onClose();
      if(e.key==="ArrowDown"){e.preventDefault();setSel(s=>Math.min(s+1,filtered.length-1));}
      if(e.key==="ArrowUp"){e.preventDefault();setSel(s=>Math.max(s-1,0));}
      if(e.key==="Enter"&&filtered[sel]){e.preventDefault();onSelect(filtered[sel].type);}
    };
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[sel,filtered,onSelect,onClose]);

  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:998}}/>
      <div className="slideDown" style={{position:"fixed",left:Math.min(pos.x,window.innerWidth-250),
        top:pos.y,zIndex:999,background:t.card,border:`1px solid ${t.border}`,
        borderRadius:10,boxShadow:t.shadow,width:240,overflow:"hidden",maxHeight:320,overflowY:"auto"}}>
        <div style={{padding:"5px 10px",fontSize:9.5,color:t.t3,fontWeight:600,
          textTransform:"uppercase",letterSpacing:"0.5px",borderBottom:`1px solid ${t.border}`,
          fontFamily:t.mono}}>Block types</div>
        {filtered.map((bt,i)=>(
          <div key={bt.type} onClick={()=>onSelect(bt.type)}
            style={{display:"flex",alignItems:"center",gap:9,padding:"7px 10px",cursor:"pointer",
              background:i===sel?t.accentDim:"transparent",transition:"background .1s"}}
            onMouseEnter={()=>setSel(i)}>
            <div style={{width:26,height:26,borderRadius:6,background:t.surf,border:`1px solid ${t.border}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:10.5,fontWeight:700,color:t.accent,fontFamily:t.mono,flexShrink:0}}>
              {bt.icon}
            </div>
            <div>
              <div style={{fontSize:12.5,fontWeight:600,color:t.t1}}>{bt.label}</div>
              <div style={{fontSize:10.5,color:t.t3}}>{bt.desc}</div>
            </div>
          </div>
        ))}
        {filtered.length===0&&<div style={{padding:"14px 10px",color:t.t3,fontSize:12.5,textAlign:"center"}}>
          No match</div>}
      </div>
    </>
  );
}

/* ── CALENDAR ────────────────────────────────────────────────────────── */
function Cal({t}) {
  const days=["MON","TUE","WED","THU","FRI","SAT","SUN"];
  const evMap={22:{title:"Sprint Review",c:t.accent},24:{title:"Code Review",c:t.green},28:{title:"Presentation",c:t.red}};
  const dotMap={22:t.red,24:t.amber,26:t.accent};const TODAY=20;
  return(
    <div style={{padding:"22px 26px",display:"flex",gap:18}}>
      <div style={{flex:1}}>
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,overflow:"hidden",boxShadow:t.shadow}}>
          <div style={{padding:"14px 20px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontSize:17,fontWeight:800,letterSpacing:"-0.4px",color:t.t1}}>
              February <span style={{color:t.accent}}>2025</span>
            </div>
            <div style={{display:"flex",gap:2}}>
              {["Month","Week"].map(v=>(
                <button key={v} style={{padding:"5px 12px",borderRadius:7,border:"none",cursor:"pointer",
                  fontFamily:t.disp,fontSize:12,background:v==="Month"?t.accentDim:"transparent",
                  color:v==="Month"?t.accent:t.t3}}>{v}</button>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 14px"}}>
            {days.map(d=><div key={d} style={{padding:"10px 4px",textAlign:"center",fontSize:10,
              fontWeight:700,color:t.t3,letterSpacing:"0.8px",fontFamily:t.mono}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,background:t.border,padding:"0 14px 14px"}}>
            {[...Array(4)].map((_,i)=><div key={`b${i}`} style={{background:t.card,minHeight:74}}/>)}
            {Array.from({length:28},(_,i)=>i+1).map(d=>{
              const ev=evMap[d];const dot=dotMap[d];const now=d===TODAY;
              return(
                <div key={d} style={{background:t.card,minHeight:74,padding:6}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:now?t.accent:"transparent",
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,
                    fontWeight:now?800:400,color:now?"#000":d>TODAY?t.t2:t.t3,marginBottom:3}}>{d}</div>
                  {ev&&<div style={{background:ev.c+"18",border:`1px solid ${ev.c}33`,borderRadius:3,
                    padding:"2px 4px",fontSize:9,color:ev.c,fontWeight:600,overflow:"hidden",
                    whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{ev.title}</div>}
                  {dot&&!ev&&<div style={{width:5,height:5,borderRadius:"50%",background:dot,marginTop:2}}/>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{width:240,flexShrink:0}}>
        <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:15,boxShadow:t.shadow}}>
          <div style={{fontSize:13,fontWeight:700,color:t.t1,marginBottom:12}}>This Month</div>
          {EVENTS.map(ev=>(
            <div key={ev.id} style={{display:"flex",gap:10,padding:"9px 0",borderBottom:`1px solid ${t.border}`}}>
              <div style={{width:2.5,borderRadius:2,background:ev.c,flexShrink:0}}/>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:t.t1}}>{ev.title}</div>
                <div style={{fontSize:10,color:t.t3,fontFamily:t.mono,marginTop:1}}>{ev.date} · {ev.time}</div>
              </div>
            </div>
          ))}
          <button style={{width:"100%",marginTop:11,padding:"7px",borderRadius:8,
            border:`1px dashed ${t.border}`,background:"transparent",color:t.t3,
            fontSize:12,fontFamily:t.disp,cursor:"pointer",display:"flex",
            alignItems:"center",justifyContent:"center",gap:5}}>
            <I d={IC.plus} sz={12} c={t.t3}/> Add Event
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── TEAM ────────────────────────────────────────────────────────────── */
function Team({t}) {
  return(
    <div style={{padding:"22px 26px",display:"flex",flexDirection:"column",gap:18}}>
      <div style={{background:t.card,border:`1px solid ${t.border}`,borderRadius:12,padding:22,boxShadow:t.shadow}}>
        <div style={{fontSize:13.5,fontWeight:700,color:t.t1,marginBottom:2}}>Delegation Chain Visualizer</div>
        <div style={{fontSize:10.5,color:t.t3,fontFamily:t.mono,marginBottom:22}}>task: "React dashboard UI"</div>
        <div style={{display:"flex",alignItems:"center"}}>
          {[
            {u:USERS[1],role:"Created & Assigned", lbl:"ASSIGNER", active:false},
            {u:USERS[2],role:"Received & Delegated",lbl:"DELEGATOR",active:false},
            {u:USERS[3],role:"Currently Working",   lbl:"RECIPIENT",active:true},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",
                padding:"16px 22px",borderRadius:11,minWidth:140,
                background:s.active?t.accentDim:t.surf,
                border:`1px solid ${s.active?t.accent:t.border}`,
                boxShadow:s.active?t.accentGlow:"none"}}>
                <Av u={s.u} sz={46}/>
                <div style={{marginTop:9,fontSize:12.5,fontWeight:700,color:t.t1}}>{s.u.name.split(" ")[0]}</div>
                <div style={{fontSize:9.5,color:t.t3,fontFamily:t.mono,marginTop:1,textTransform:"uppercase",letterSpacing:"0.7px"}}>{s.lbl}</div>
                <div style={{marginTop:8,fontSize:10.5,padding:"3px 9px",borderRadius:20,
                  color:s.active?t.accent:t.t2,background:s.active?t.accentDim:t.card}}>{s.role}</div>
              </div>
              {i<2&&(
                <div style={{display:"flex",alignItems:"center",padding:"0 4px"}}>
                  <div style={{width:24,height:1.5,background:`linear-gradient(to right,#009688,${t.accent})`}}/>
                  <I d={IC.arr} sz={12} c={t.accent}/>
                </div>
              )}
            </div>
          ))}
          <div style={{marginLeft:10,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div className="glw" style={{width:9,height:9,borderRadius:"50%",background:t.green,boxShadow:`0 0 14px ${t.green}88`}}/>
            <span style={{fontSize:9,color:t.green,fontFamily:t.mono}}>LIVE</span>
          </div>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {USERS.map(u=>{
          const my=TASKS.filter(tk=>tk.to===u.id);
          const done=my.filter(tk=>tk.st==="done").length;
          const pct=my.length?Math.round(done/my.length*100):0;
          return(
            <div key={u.id} className="hvrC" style={{background:t.card,border:`1px solid ${t.border}`,
              borderRadius:12,padding:18,textAlign:"center",boxShadow:t.shadow,transition:"all .2s"}}>
              <div style={{display:"flex",justifyContent:"center",marginBottom:11}}><Av u={u} sz={48}/></div>
              <div style={{fontSize:13.5,fontWeight:700,color:t.t1}}>{u.name}</div>
              <div style={{fontSize:10,color:t.t3,fontFamily:t.mono,marginTop:2,marginBottom:14}}>
                {u.id===1?"You":"Team Member"}</div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:t.t3,marginBottom:4,fontFamily:t.mono}}>
                  <span>Progress</span><span style={{color:t.accent}}>{done}/{my.length}</span>
                </div>
                <div style={{height:3,background:t.border,borderRadius:2}}>
                  <div style={{height:"100%",borderRadius:2,width:`${pct}%`,
                    background:`linear-gradient(to right,#009688,${t.accent})`,transition:"width .6s"}}/>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,marginTop:12}}>
                <div className="glw" style={{width:6,height:6,borderRadius:"50%",background:t.green}}/>
                <span style={{fontSize:10,color:t.green,fontFamily:t.mono}}>online</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── NOTIF PANEL ─────────────────────────────────────────────────────── */
function NotifPanel({t,onClose}) {
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:40}}/>
      <div className="slideRight" style={{position:"fixed",top:58,right:14,width:320,zIndex:50,
        background:t.card,border:`1px solid ${t.border}`,borderRadius:12,
        boxShadow:"0 20px 50px #00000055",overflow:"hidden"}}>
        <div style={{padding:"12px 15px",borderBottom:`1px solid ${t.border}`,
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13.5,fontWeight:700,color:t.t1}}>Notifications</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}} className="hvrI">
            <I d={IC.x} sz={15} c={t.t2}/>
          </button>
        </div>
        {NOTIFS.map(n=>(
          <div key={n.id} style={{padding:"11px 15px",borderBottom:`1px solid ${t.border}`,
            display:"flex",gap:11,alignItems:"flex-start",background:!n.read?t.accentDim:"transparent"}}>
            <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:t.surf,
              border:`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:14,color:t.accent,fontFamily:t.mono}}>{n.sym}</div>
            <div style={{flex:1}}>
              <div style={{fontSize:12,color:t.t1,lineHeight:1.55}}>{n.txt}</div>
              <div style={{fontSize:10,color:t.t3,marginTop:2,fontFamily:t.mono}}>{n.time} ago</div>
            </div>
            {!n.read&&<div style={{width:6,height:6,borderRadius:"50%",background:t.accent,flexShrink:0,marginTop:4}}/>}
          </div>
        ))}
        <div style={{padding:"10px 15px",textAlign:"center"}}>
          <button style={{background:"none",border:"none",cursor:"pointer",color:t.accent,fontSize:12,fontWeight:600,fontFamily:t.disp}}>
            Mark all as read
          </button>
        </div>
      </div>
    </>
  );
}

/* ── TASK DRAWER ─────────────────────────────────────────────────────── */
function TaskDrawer({t,task,onClose}) {
  const by=USERS.find(u=>u.id===task.by)||USERS[0];
  const to=USERS.find(u=>u.id===task.to)||USERS[0];
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:40,backdropFilter:"blur(2px)"}}/>
      <div className="slideRight" style={{position:"fixed",top:0,right:0,height:"100vh",width:360,zIndex:50,
        background:t.surf,borderLeft:`1px solid ${t.border}`,display:"flex",flexDirection:"column",
        overflow:"hidden",boxShadow:"-20px 0 60px #00000044"}}>
        <div style={{padding:"15px 18px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,fontWeight:700,color:t.t1}}>Task Detail</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}} className="hvrI">
            <I d={IC.x} sz={17} c={t.t2}/>
          </button>
        </div>
        <div style={{flex:1,overflow:"auto",padding:18}}>
          <div style={{display:"flex",gap:7,marginBottom:14,flexWrap:"wrap"}}>
            <StTag s={task.st} t={t}/><PriTag p={task.pri} t={t}/>
            {task.delegated&&<Tag label="Delegated ↗" color={t.amber}/>}
          </div>
          <h2 style={{fontSize:16,fontWeight:800,color:t.t1,marginBottom:10,letterSpacing:"-0.3px",lineHeight:1.4}}>
            {task.title.trim()}</h2>
          <p style={{fontSize:12.5,color:t.t2,lineHeight:1.7,marginBottom:18,fontFamily:t.mono}}>{task.desc}</p>
          {[
            {label:"Assigned By",el:<div style={{display:"flex",alignItems:"center",gap:8}}><Av u={by} sz={22}/><span style={{fontSize:12.5,color:t.t1}}>{by.name}</span></div>},
            {label:"Assigned To",el:<div style={{display:"flex",alignItems:"center",gap:8}}><Av u={to} sz={22}/><span style={{fontSize:12.5,color:t.t1}}>{to.name}</span></div>},
            {label:"Due Date",el:<span style={{fontSize:12.5,color:t.t1,fontFamily:t.mono}}>{task.due}</span>},
          ].map(({label,el})=>(
            <div key={label} style={{marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${t.border}`}}>
              <div style={{fontSize:10,color:t.t3,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.6px",fontFamily:t.mono}}>{label}</div>
              {el}
            </div>
          ))}
          <div style={{display:"flex",flexDirection:"column",gap:9,marginTop:18}}>
            <button style={{padding:"10px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:t.disp,
              fontSize:13,fontWeight:700,background:`linear-gradient(135deg,${t.green},#009950)`,color:"#000",
              display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              <I d={IC.chk} sz={15} c="#000" sw={2.5}/>Mark Complete
            </button>
            <button style={{padding:"10px",borderRadius:9,cursor:"pointer",fontFamily:t.disp,fontSize:13,fontWeight:700,
              border:`1px solid ${t.amber}44`,background:t.amber+"12",color:t.amber,
              display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
              <I d={IC.del} sz={15} c={t.amber}/>Delegate Task
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── ASSIGN MODAL ────────────────────────────────────────────────────── */
function AssignModal({t,onClose}) {
  const [selUser,setSelUser]=useState(null);
  const [pri,setPri]=useState("medium");
  return(
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:40,backdropFilter:"blur(3px)"}}/>
      <div className="popIn" style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:440,zIndex:50,background:t.surf,border:`1px solid ${t.border}`,borderRadius:16,
        boxShadow:"0 32px 70px #00000066",overflow:"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${t.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:14.5,fontWeight:800,color:t.t1}}>Assign New Task</div>
            <div style={{fontSize:10,color:t.t3,fontFamily:t.mono,marginTop:1}}>Any user can assign to anyone — no fixed roles</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}} className="hvrI">
            <I d={IC.x} sz={17} c={t.t2}/>
          </button>
        </div>
        <div style={{padding:20,display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{fontSize:10,color:t.t3,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.6px",fontFamily:t.mono}}>Title</label>
            <input placeholder="e.g. Set up authentication module…"
              style={{width:"100%",background:t.inset,border:`1px solid ${t.border}`,borderRadius:8,
                padding:"9px 13px",color:t.t1,fontSize:13,fontFamily:t.disp}}/>
          </div>
          <div>
            <label style={{fontSize:10,color:t.t3,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.6px",fontFamily:t.mono}}>Description</label>
            <textarea rows={3} placeholder="Describe the task…"
              style={{width:"100%",background:t.inset,border:`1px solid ${t.border}`,borderRadius:8,
                padding:"9px 13px",color:t.t1,fontSize:12.5,fontFamily:t.mono,resize:"none"}}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={{fontSize:10,color:t.t3,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.6px",fontFamily:t.mono}}>Priority</label>
              <div style={{display:"flex",gap:5}}>
                {["low","medium","high"].map(p=>{
                  const c=p==="high"?t.red:p==="medium"?t.amber:t.green;
                  return <button key={p} onClick={()=>setPri(p)}
                    style={{flex:1,padding:"7px 4px",borderRadius:7,cursor:"pointer",fontFamily:t.disp,
                      fontSize:10.5,fontWeight:600,border:`1px solid ${pri===p?c:t.border}`,
                      background:pri===p?c+"18":"transparent",color:c,transition:"all .15s"}}>
                    {p.charAt(0).toUpperCase()+p.slice(1)}</button>;
                })}
              </div>
            </div>
            <div>
              <label style={{fontSize:10,color:t.t3,display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.6px",fontFamily:t.mono}}>Due Date</label>
              <input type="date" style={{width:"100%",background:t.inset,border:`1px solid ${t.border}`,
                borderRadius:8,padding:"7px 11px",color:t.t1,fontSize:12,fontFamily:t.mono}}/>
            </div>
          </div>
          <div>
            <label style={{fontSize:10,color:t.t3,display:"block",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.6px",fontFamily:t.mono}}>Assign To</label>
            <div style={{display:"flex",gap:8}}>
              {USERS.filter(u=>u.id!==1).map(u=>(
                <button key={u.id} onClick={()=>setSelUser(u.id)}
                  style={{flex:1,padding:"10px 5px",borderRadius:9,cursor:"pointer",
                    border:`1px solid ${selUser===u.id?u.color:t.border}`,
                    background:selUser===u.id?u.color+"14":t.inset,
                    display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all .15s"}}>
                  <Av u={u} sz={28}/>
                  <span style={{fontSize:10,color:t.t1,fontFamily:t.disp}}>{u.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
          <button className="hvrB"
            style={{width:"100%",padding:"11px",borderRadius:10,border:"none",cursor:"pointer",
              fontFamily:t.disp,fontSize:13.5,fontWeight:800,
              background:`linear-gradient(135deg,${t.accent},#009688)`,color:"#000",marginTop:2,
              display:"flex",alignItems:"center",justifyContent:"center",gap:8,
              boxShadow:t.accentGlow,transition:"all .18s"}}>
            <I d={IC.send} sz={15} c="#000" sw={2}/>Assign Task
          </button>
        </div>
      </div>
    </>
  );
}
