import { useState, useEffect, useRef, useCallback } from 'react'
import { Music, Mic, Image as ImageIcon, Play, Pause, Loader2, Sparkles, Clock, Volume2, Download, AlertCircle, Wand2, ChevronDown, Disc3, Zap } from 'lucide-react'

const API = import.meta.env.VITE_API_BASE || ''

/* ════════════ DATA ════════════ */
const presets = [
  { e:'🎸', l:'流行', p:'流行音乐，轻快明亮，阳光温暖', ly:'[Verse]\n阳光洒在肩膀上\n微风带来花的香\n每一步都充满力量\n[Chorus]\n这一刻多么美好\n让我们一起歌唱' },
  { e:'🎹', l:'古典', p:'古典钢琴曲，优雅舒缓，月光下的沉思', ly:'[Intro]\n月光如水洒窗台\n[Verse]\n静静聆听夜的声音\n琴键轻触诉说心事\n[Chorus]\n在这宁静的夜里\n只有音乐与我相伴' },
  { e:'🎤', l:'说唱', p:'Hip-hop说唱，节奏感强，充满能量', ly:'[Verse]\n站在舞台的中央\n灯光照亮我的方向\n[Chorus]\n不放弃不退缩\n这就是我的态度\n用音乐改变世界' },
  { e:'🌙', l:'R&B', p:'R&B风格，慵懒浪漫，深夜情歌', ly:'[Verse]\n城市灯火渐渐暗淡\n只剩我和你的呢喃\n[Chorus]\n在这个深夜里\n只想和你在一起' },
  { e:'🎻', l:'国风', p:'中国风，古风曲调，水墨山水意境悠远', ly:'[Verse]\n山水之间云雾缭绕\n一曲琴音传千年\n[Chorus]\n明月照古今\n诗酒趁年华' },
  { e:'🤘', l:'摇滚', p:'摇滚音乐，热血激昂，电吉他轰鸣', ly:'[Verse]\n燃烧吧青春的火焰\n冲破一切的束缚\n[Chorus]\n这就是我们的时代\n活出最真实的自己' },
]
const voices = [
  {n:'少女',id:'female-shaonv'},{n:'青涩青年',id:'male-qn-qingse'},{n:'御姐',id:'female-yujie'},
  {n:'甜美女性',id:'female-tianmei'},{n:'可爱男童',id:'cute_boy'},{n:'Charming Lady',id:'Charming_Lady'},
  {n:'温润男声',id:'Chinese (Mandarin)_Gentleman'},{n:'甜美女声',id:'Chinese (Mandarin)_Sweet_Lady'},
]
const emos = ['happy','neutral','sad','angry','surprised']
const ratios = ['1:1','16:9','9:16','4:3','3:4']
const fmt = s => (!s||isNaN(s)) ? '0:00' : `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`

/* ════════════ COMPONENTS ════════════ */

/* ── Visualizer bars ── */
function Bars({ on }) {
  return <div className="flex items-end gap-[2px] h-8 justify-center">
    {Array.from({length:32}).map((_,i)=><div key={i} className="w-[2px] rounded-full origin-bottom"
      style={{height:'100%',transform:on?`scaleY(${.1+Math.random()*.9})`:'scaleY(.08)',
        background:'linear-gradient(0deg,#6366f1,#ec4899)',
        animation:on?`bar ${.3+Math.random()*.5}s ease-in-out infinite`:'none',
        animationDelay:`${i*30}ms`,transition:'transform .12s'}}/>)}
  </div>
}

/* ── Audio player ── */
function Player({ url, title }) {
  const a = useRef(null)
  const [on,setOn]=useState(false),[pct,setPct]=useState(0),[dur,setDur]=useState(0),[cur,setCur]=useState(0)
  const toggle = ()=>{if(!a.current)return;on?a.current.pause():a.current.play();setOn(!on)}
  const seek = e=>{const r=e.currentTarget.getBoundingClientRect();if(a.current&&dur)a.current.currentTime=(e.clientX-r.left)/r.width*dur}
  useEffect(()=>{
    const el=a.current;if(!el)return
    const t=()=>{setCur(el.currentTime);setPct(el.duration?(el.currentTime/el.duration)*100:0)}
    const l=()=>setDur(el.duration),ed=()=>setOn(false)
    el.addEventListener('timeupdate',t);el.addEventListener('loadedmetadata',l);el.addEventListener('ended',ed)
    return()=>{el.removeEventListener('timeupdate',t);el.removeEventListener('loadedmetadata',l);el.removeEventListener('ended',ed)}
  },[url])
  return <div className="mt-3 space-y-2.5">
    <audio ref={a} src={url} preload="metadata"/>
    <div className="flex items-center gap-3">
      <button onClick={toggle} className="w-10 h-10 rounded-full bg-gradient-to-br from-i to-pk flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-i/25 cursor-pointer shrink-0">
        {on?<Pause className="w-4 h-4 text-white"/>:<Play className="w-4 h-4 text-white ml-0.5"/>}
      </button>
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className="text-xs font-medium truncate">{title}</p>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-t3 font-mono w-6">{fmt(cur)}</span>
          <div className="flex-1 h-1 bg-surface-3 rounded-full cursor-pointer group" onClick={seek}>
            <div className="h-full bg-gradient-to-r from-i to-pk rounded-full relative transition-all" style={{width:`${pct}%`}}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow transition-opacity"/>
            </div>
          </div>
          <span className="text-[10px] text-t3 font-mono w-6 text-right">{fmt(dur)}</span>
        </div>
      </div>
      <a href={url} download className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="下载"><Download className="w-3.5 h-3.5 text-t3"/></a>
    </div>
    <Bars on={on}/>
  </div>
}

/* ── Task card ── */
function TaskCard({ task }) {
  const icons = {music:<Music className="w-4 h-4"/>,tts:<Volume2 className="w-4 h-4"/>,image:<ImageIcon className="w-4 h-4"/>}
  const labels = {music:'音乐',tts:'语音',image:'图片'}
  const stMap = {
    generating:{c:'text-am bg-am/10 border-am/20',l:'生成中',i:<Loader2 className="w-3 h-3 animate-[spin_.8s_linear_infinite]"/>},
    done:{c:'text-em bg-em/10 border-em/20',l:'完成',i:<Sparkles className="w-3 h-3"/>},
    failed:{c:'text-rd bg-rd/10 border-rd/20',l:'失败',i:<AlertCircle className="w-3 h-3"/>},
  }
  const s = stMap[task.status]
  return <div className="bg-surface-2/70 backdrop-blur-sm border border-line rounded-2xl p-4 hover:border-line-h transition-all duration-300" style={{animation:'fade-in .4s ease-out both'}}>
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-i/10 to-pk/10 border border-line flex items-center justify-center text-i shrink-0">{icons[task.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{task.prompt||task.text}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-[1px] rounded-full border ${s.c}`}>{s.i}{s.l}</span>
          <span className="text-[10px] text-t3 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5"/>{new Date(task.createdAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}</span>
          <span className="text-[10px] text-i/50 font-medium">{labels[task.type]}</span>
        </div>
      </div>
    </div>
    {task.lyrics && <div className="text-[11px] text-t3 bg-surface-1 rounded-lg p-2.5 mt-3 max-h-14 overflow-y-auto whitespace-pre-line font-mono leading-relaxed border border-line">{task.lyrics}</div>}
    {task.status==='done'&&task.url&&task.type!=='image' && <Player url={task.url} title={task.prompt||task.text}/>}
    {task.status==='done'&&task.type==='image'&&task.url && <div className="mt-3 rounded-xl overflow-hidden border border-line"><img src={task.url} alt="" className="w-full h-48 object-cover"/></div>}
    {task.status==='generating' && <div className="flex items-center justify-center py-5 gap-2"><div className="flex gap-[3px]">{[0,1,2,3].map(i=><div key={i} className="w-1 h-5 rounded-full bg-gradient-to-t from-i to-pk" style={{animation:`bar .6s ease-in-out infinite`,animationDelay:`${i*90}ms`}}/>)}</div><span className="text-xs text-t2">AI 创作中...</span></div>}
    {task.status==='failed' && <div className="flex items-start gap-1.5 text-[11px] text-rd bg-rd/5 border border-rd/10 rounded-lg p-2.5 mt-3"><AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5"/>{task.error||'生成失败'}</div>}
  </div>
}

/* ── Shared input styles ── */
const inp = "w-full bg-surface-1 border border-line rounded-xl px-3.5 py-2.5 text-sm placeholder:text-t3/40 focus:outline-none focus:border-i/30 focus:ring-1 focus:ring-i/10 transition-all resize-none"
const sel = "w-full bg-surface-1 border border-line rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-i/30 cursor-pointer appearance-none"

/* ════════════ PANELS ════════════ */
function MusicPanel({onGen}) {
  const [p,setP]=useState(''),[ly,setLy]=useState(''),[ld,setLd]=useState(false),[err,setErr]=useState('')
  const go=async()=>{
    if(!p||!ly)return setErr('请填写描述和歌词');if(p.length<10)return setErr('描述至少10字');if(ly.length<10)return setErr('歌词至少10字')
    setErr('');setLd(true)
    try{const r=await(await fetch(`${API}/api/music/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:p,lyrics:ly})})).json();if(r.error)return setErr(r.error);onGen({...r,type:'music',prompt:p,lyrics:ly,createdAt:Date.now()});setP('');setLy('')}catch(e){setErr(e.message)}finally{setLd(false)}
  }
  return <div className="space-y-5">
    <div>
      <p className="text-xs font-medium text-t2 mb-2">快速模板</p>
      <div className="grid grid-cols-3 gap-1.5">{presets.map((x,i)=><button key={i} onClick={()=>{setP(x.p);setLy(x.ly)}} className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs bg-surface-2 border border-line hover:border-line-h hover:bg-surface-3 transition-all cursor-pointer"><span className="text-base">{x.e}</span>{x.l}</button>)}</div>
    </div>
    <div>
      <div className="flex justify-between mb-1.5"><span className="text-xs font-medium text-t2">🎵 音乐描述</span><span className="text-[10px] text-t3">{p.length}/300</span></div>
      <textarea value={p} onChange={e=>setP(e.target.value)} maxLength={300} rows={2} placeholder="描述风格、情绪、场景…" className={inp}/>
    </div>
    <div>
      <div className="flex justify-between mb-1.5"><span className="text-xs font-medium text-t2">📝 歌词</span><span className="text-[10px] text-t3">{ly.length}/600</span></div>
      <textarea value={ly} onChange={e=>setLy(e.target.value)} maxLength={600} rows={6} placeholder={"[Verse]\n你的歌词\n[Chorus]\n副歌部分"} className={`${inp} font-mono text-[13px] leading-relaxed`}/>
    </div>
    {err&&<p className="text-xs text-rd flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{err}</p>}
    <button onClick={go} disabled={ld} className="w-full py-3 rounded-xl bg-gradient-to-r from-i via-v to-pk text-white text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[.98] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-i/20 cursor-pointer">
      {ld?<><Loader2 className="w-4 h-4 animate-[spin_.8s_linear_infinite]"/>提交中...</>:<><Sparkles className="w-4 h-4"/>开始创作</>}
    </button>
  </div>
}

function TTSPanel({onGen}) {
  const [txt,setTxt]=useState(''),[vid,setVid]=useState('female-shaonv'),[emo,setEmo]=useState('happy'),[spd,setSpd]=useState(1),[ld,setLd]=useState(false),[err,setErr]=useState('')
  const go=async()=>{
    if(!txt)return setErr('请输入文本');setErr('');setLd(true)
    try{const r=await(await fetch(`${API}/api/tts/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:txt,voiceId:vid,emotion:emo,speed:spd})})).json();if(r.error)return setErr(r.error);onGen({...r,type:'tts',text:txt,voiceId:vid,createdAt:Date.now()});setTxt('')}catch(e){setErr(e.message)}finally{setLd(false)}
  }
  return <div className="space-y-5">
    <div><p className="text-xs font-medium text-t2 mb-1.5">📢 输入文本</p><textarea value={txt} onChange={e=>setTxt(e.target.value)} rows={3} placeholder="输入想转语音的文本…" className={inp}/></div>
    <div className="grid grid-cols-2 gap-3">
      <div><p className="text-xs font-medium text-t2 mb-1.5">🎙️ 音色</p><div className="relative"><select value={vid} onChange={e=>setVid(e.target.value)} className={sel}>{voices.map(v=><option key={v.id} value={v.id}>{v.n}</option>)}</select><ChevronDown className="w-3.5 h-3.5 text-t3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/></div></div>
      <div><p className="text-xs font-medium text-t2 mb-1.5">😊 情感</p><div className="relative"><select value={emo} onChange={e=>setEmo(e.target.value)} className={sel}>{emos.map(e=><option key={e} value={e}>{e}</option>)}</select><ChevronDown className="w-3.5 h-3.5 text-t3 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/></div></div>
    </div>
    <div><div className="flex justify-between mb-1.5"><span className="text-xs font-medium text-t2">⚡ 语速</span><span className="text-[10px] text-t3">{spd.toFixed(1)}x</span></div><input type="range" min="0.5" max="2" step="0.1" value={spd} onChange={e=>setSpd(+e.target.value)} className="w-full accent-i cursor-pointer h-1"/></div>
    {err&&<p className="text-xs text-rd flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{err}</p>}
    <button onClick={go} disabled={ld} className="w-full py-3 rounded-xl bg-gradient-to-r from-cy via-i to-v text-white text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[.98] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-cy/20 cursor-pointer">
      {ld?<><Loader2 className="w-4 h-4 animate-[spin_.8s_linear_infinite]"/>生成中...</>:<><Volume2 className="w-4 h-4"/>生成语音</>}
    </button>
  </div>
}

function ImgPanel({onGen}) {
  const [p,setP]=useState(''),[r,setR]=useState('1:1'),[ld,setLd]=useState(false),[err,setErr]=useState('')
  const go=async()=>{
    if(!p)return setErr('请输入描述');setErr('');setLd(true)
    try{const res=await(await fetch(`${API}/api/image/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt:p,aspectRatio:r})})).json();if(res.error)return setErr(res.error);onGen({...res,type:'image',prompt:p,createdAt:Date.now()});setP('')}catch(e){setErr(e.message)}finally{setLd(false)}
  }
  return <div className="space-y-5">
    <div><p className="text-xs font-medium text-t2 mb-1.5">🎨 图片描述</p><textarea value={p} onChange={e=>setP(e.target.value)} rows={4} placeholder="赛博朋克城市夜景，霓虹灯闪烁…" className={inp}/></div>
    <div><p className="text-xs font-medium text-t2 mb-1.5">📐 比例</p><div className="flex gap-1.5">{ratios.map(x=><button key={x} onClick={()=>setR(x)} className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${x===r?'bg-i/10 border-i/25 text-i':'bg-surface-2 border-line text-t3 hover:border-line-h'}`}>{x}</button>)}</div></div>
    {err&&<p className="text-xs text-rd flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/>{err}</p>}
    <button onClick={go} disabled={ld} className="w-full py-3 rounded-xl bg-gradient-to-r from-pk via-v to-i text-white text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[.98] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-pk/20 cursor-pointer">
      {ld?<><Loader2 className="w-4 h-4 animate-[spin_.8s_linear_infinite]"/>生成中...</>:<><Wand2 className="w-4 h-4"/>生成图片</>}
    </button>
  </div>
}

/* ════════════ NAV ITEMS ════════════ */
const nav = [
  { id:'music', label:'音乐创作', icon:Music, grad:'from-i to-pk' },
  { id:'tts',   label:'语音合成', icon:Mic, grad:'from-cy to-i' },
  { id:'image', label:'图片生成', icon:ImageIcon, grad:'from-pk to-v' },
]

/* ════════════ APP ════════════ */
export default function App() {
  const [tab,setTab]=useState('music')
  const [tasks,setTasks]=useState([])
  const pr = useRef(null)

  useEffect(()=>{
    pr.current=setInterval(async()=>{
      const pend=tasks.filter(t=>t.status==='generating');if(!pend.length)return
      for(const t of pend){try{const r=await fetch(`${API}/api/task/${t.id}`);if(!r.ok)continue;const d=await r.json();if(d.status!=='generating')setTasks(p=>p.map(x=>x.id===t.id?{...x,...d}:x))}catch{}}
    },3000)
    return()=>clearInterval(pr.current)
  },[tasks])

  const onGen=useCallback(t=>setTasks(p=>[{...t,status:'generating'},...p]),[])
  const filtered=tasks.filter(t=>t.type===tab)
  const cur=nav.find(n=>n.id===tab)
  const Icon=cur.icon

  return <div className="min-h-screen flex">

    {/* ═══ SIDEBAR ═══ */}
    <aside className="w-[220px] shrink-0 bg-surface-1/80 backdrop-blur-xl border-r border-line flex flex-col sticky top-0 h-screen">
      {/* logo */}
      <div className="px-5 h-16 flex items-center gap-2.5 border-b border-line">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-i to-pk flex items-center justify-center shadow-lg shadow-i/20">
          <Disc3 className="w-4 h-4 text-white"/>
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight bg-gradient-to-r from-i via-v to-pk bg-clip-text" style={{WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ShadowMusic</p>
          <p className="text-[9px] text-t3 -mt-0.5 tracking-widest uppercase">AI Studio</p>
        </div>
      </div>

      {/* nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-[10px] font-semibold text-t3 uppercase tracking-wider px-3 mb-2">创作工具</p>
        {nav.map(n=>{
          const I=n.icon; const active=tab===n.id
          return <button key={n.id} onClick={()=>setTab(n.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${active?'bg-surface-3 text-t1 shadow-md':'text-t2 hover:text-t1 hover:bg-surface-2'}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${active?`bg-gradient-to-br ${n.grad} text-white shadow shadow-i/20`:'bg-surface-3/50 text-t3'}`}>
              <I className="w-4 h-4"/>
            </div>
            {n.label}
          </button>
        })}
      </nav>

      {/* footer */}
      <div className="px-5 py-4 border-t border-line">
        <div className="flex items-center gap-1.5 text-[10px] text-t3">
          <Zap className="w-3 h-3 text-em" style={{animation:'pulse 2s ease-in-out infinite'}}/>
          Powered by MiniMax
        </div>
      </div>
    </aside>

    {/* ═══ MAIN ═══ */}
    <div className="flex-1 min-w-0 flex flex-col">

      {/* top bar */}
      <header className="h-16 border-b border-line flex items-center px-8 sticky top-0 bg-surface-0/80 backdrop-blur-xl z-40">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${cur.grad} flex items-center justify-center text-white mr-3`}><Icon className="w-4 h-4"/></div>
        <h1 className="text-lg font-bold">{cur.label}</h1>
      </header>

      {/* content area */}
      <main className="flex-1 p-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">

            {/* creator panel */}
            <div className="xl:col-span-2">
              <div className="bg-surface-2/50 backdrop-blur-sm border border-line rounded-2xl p-6 xl:sticky xl:top-24">
                {tab==='music'&&<MusicPanel onGen={onGen}/>}
                {tab==='tts'&&<TTSPanel onGen={onGen}/>}
                {tab==='image'&&<ImgPanel onGen={onGen}/>}
              </div>
            </div>

            {/* results */}
            <div className="xl:col-span-3">
              <div className="flex items-center gap-2.5 mb-5">
                <h2 className="text-base font-semibold">创作记录</h2>
                <span className="text-[10px] text-t3 bg-surface-3 rounded-full px-2 py-0.5 font-medium">{filtered.length}</span>
              </div>
              {filtered.length===0 ? (
                <div className="bg-surface-2/30 border border-line rounded-2xl py-20 flex flex-col items-center text-center">
                  <div className="text-5xl mb-3" style={{animation:'float 3s ease-in-out infinite'}}>
                    {tab==='music'?'🎶':tab==='tts'?'🎙️':'🎨'}
                  </div>
                  <p className="text-sm text-t2 font-medium">还没有创作记录</p>
                  <p className="text-xs text-t3 mt-1">在左侧面板开始你的第一次创作</p>
                </div>
              ) : (
                <div className="space-y-4">{filtered.map(t=><TaskCard key={t.id} task={t}/>)}</div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* bottom bar */}
      <footer className="h-12 border-t border-line flex items-center justify-center">
        <p className="text-[11px] text-t3">ShadowMusic — Built by 影 🌑 · Powered by MiniMax AI</p>
      </footer>
    </div>
  </div>
}
