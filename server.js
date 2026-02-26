import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const tasks = new Map();
const esc = s => s.replace(/"/g, '\\"').replace(/\n/g, '\\n');

app.post('/api/music/generate', (req, res) => {
  const { prompt, lyrics } = req.body;
  if (!prompt || !lyrics) return res.status(400).json({ error: 'prompt和lyrics不能为空' });
  if (prompt.length < 10) return res.status(400).json({ error: 'prompt至少10字符' });
  if (lyrics.length < 10) return res.status(400).json({ error: 'lyrics至少10字符' });
  const id = `m${Date.now().toString(36)}`;
  const task = { id, type:'music', prompt, lyrics, status:'generating', url:null, createdAt:Date.now(), error:null };
  tasks.set(id, task);
  exec(`mcporter call minimax.music_generation prompt="${esc(prompt)}" lyrics="${esc(lyrics)}" output_directory="/tmp" 2>&1`,
    { timeout:180000 }, (e, out) => {
      if(e){ task.status='failed'; task.error=e.message; return }
      const m=out.match(/https?:\/\/[^\s"]+\.mp3[^\s"]*/);
      if(m){ task.url=m[0]; task.status='done' } else { task.status='failed'; task.error='未获取到URL' }
    });
  res.json({ id, status:'generating' });
});

app.post('/api/tts/generate', (req, res) => {
  const { text, voiceId, emotion, speed } = req.body;
  if (!text) return res.status(400).json({ error: 'text不能为空' });
  const id = `t${Date.now().toString(36)}`;
  const task = { id, type:'tts', text, voiceId, status:'generating', url:null, createdAt:Date.now(), error:null };
  tasks.set(id, task);
  let cmd = `mcporter call minimax.text_to_audio text="${esc(text)}" output_directory="/tmp"`;
  if(voiceId) cmd += ` voice_id="${voiceId}"`;
  if(emotion) cmd += ` emotion="${emotion}"`;
  if(speed) cmd += ` speed:${speed}`;
  exec(cmd+' 2>&1', { timeout:60000 }, (e, out) => {
    if(e){ task.status='failed'; task.error=e.message; return }
    const m=out.match(/https?:\/\/[^\s"]+\.mp3[^\s"]*/);
    if(m){ task.url=m[0]; task.status='done' } else { task.status='failed'; task.error='未获取到URL' }
  });
  res.json({ id, status:'generating' });
});

app.post('/api/image/generate', (req, res) => {
  const { prompt, aspectRatio } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt不能为空' });
  const id = `i${Date.now().toString(36)}`;
  const task = { id, type:'image', prompt, status:'generating', url:null, createdAt:Date.now(), error:null };
  tasks.set(id, task);
  let cmd = `mcporter call minimax.text_to_image prompt="${esc(prompt)}" output_directory="/tmp"`;
  if(aspectRatio) cmd += ` aspect_ratio="${aspectRatio}"`;
  exec(cmd+' 2>&1', { timeout:120000 }, (e, out) => {
    if(e){ task.status='failed'; task.error=e.message; return }
    const m=out.match(/https?:\/\/[^\s"'\]]+/);
    if(m){ task.url=m[0]; task.status='done' } else { task.status='failed'; task.error='未获取到URL' }
  });
  res.json({ id, status:'generating' });
});

app.get('/api/task/:id', (req, res) => {
  const t = tasks.get(req.params.id);
  if(!t) return res.status(404).json({ error:'Not found' });
  res.json(t);
});

app.get('/api/tasks', (req, res) => {
  let list = [...tasks.values()].sort((a,b)=>b.createdAt-a.createdAt);
  if(req.query.type) list = list.filter(t=>t.type===req.query.type);
  res.json(list.slice(0,50));
});

app.listen(3456, '0.0.0.0', () => console.log('🎵 API running on :3456'));
