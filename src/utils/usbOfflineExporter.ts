import { MONUMENT_PUZZLES } from '../types/game';

/**
 * Generates a 100% self-contained single-file HTML bundle of the entire
 * LearnLink: KINETIX 37-Game Brain Workout & English Sentence Scramble Portal.
 * Runs directly from a USB flash drive (file://) with ZERO internet connection,
 * ZERO external CDN dependencies, built-in Web Audio chimes, built-in Canvas
 * confetti, Web Speech English pronunciation, and full Bilingual EN/ID support.
 */
export function buildStandaloneUsbOfflineHtml(): string {
  // Serialize all 37 puzzles safely so </script> can never break inline script parsing
  const serializedGames = JSON.stringify(MONUMENT_PUZZLES).replace(
    /<\//g,
    '<\\/'
  );

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<title>LearnLink: KINETIX Brain Workout Portal (Offline USB Edition)</title>
<style>
  :root {
    --navy: #0B2249;
    --navy-mid: #12336B;
    --navy-soft: #1B4284;
    --turq: #14B8C4;
    --turq-dark: #0D949E;
    --turq-light: #CCF5F8;
    --bg: #F2F9FB;
    --surface: #FFFFFF;
    --surface-2: #E8F5F8;
    --border: #C5E4EC;
    --text: #0B2249;
    --muted: #466284;
    --cell-empty: #E6F2F6;
    --cell-empty-border: #C5DFE8;
    --ok: #059669;
    --ok-bg: #D1FAE5;
  }
  body.dark {
    --bg: #071731;
    --surface: #0D244B;
    --surface-2: #122E5E;
    --border: #1E447D;
    --text: #FFFFFF;
    --muted: #A9C8E8;
    --cell-empty: #112A54;
    --cell-empty-border: #1D4178;
    --ok-bg: #064E3B;
  }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body {
    margin: 0;
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    transition: background .2s, color .2s;
  }
  header {
    background: var(--navy);
    color: #fff;
    padding: 8px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border-bottom: 2px solid var(--turq);
    position: sticky;
    top: 0;
    z-index: 20;
  }
  .brand { font-weight: 800; font-size: 15px; letter-spacing: -.01em; display: flex; align-items: center; gap: 8px; white-space: nowrap; }
  .brand-dot { width: 10px; height: 10px; border-radius: 3px; background: var(--turq); display: inline-block; }
  .header-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  button, select {
    font-family: inherit;
    cursor: pointer;
    border: none;
    border-radius: 8px;
    font-weight: 700;
    font-size: 12px;
    transition: transform .12s, background .15s, opacity .15s;
  }
  button:active { transform: scale(.97); }
  .btn-nav { background: rgba(255,255,255,.12); color: #fff; padding: 6px 10px; }
  .btn-nav:hover { background: rgba(255,255,255,.22); }
  .btn-turq { background: var(--turq); color: #062134; padding: 6px 11px; }
  .btn-turq:hover { background: #26CCD8; }
  .btn-navy { background: var(--navy); color: #fff; padding: 6px 11px; }
  .btn-soft { background: var(--surface-2); color: var(--text); border: 1px solid var(--border); padding: 6px 10px; }
  .btn-ok { background: #10B981; color: #052E16; padding: 6px 11px; }
  .btn-danger { background: rgba(244,63,94,.14); color: #E11D48; border: 1px solid rgba(244,63,94,.35); padding: 6px 10px; }
  body.dark .btn-danger { color: #FDA4AF; }
  main {
    flex: 1;
    width: 100%;
    max-width: 560px;
    margin: 0 auto;
    padding: 8px 10px 14px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .hud-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .row { display: flex; align-items: center; justify-content: space-between; gap: 6px; flex-wrap: wrap; }
  .stats { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; font-weight: 700; display: flex; gap: 10px; align-items: center; }
  .stat-turq { color: var(--turq-dark); }
  body.dark .stat-turq { color: #2DD4BF; }
  select.game-picker {
    flex: 1;
    min-width: 180px;
    background: var(--surface-2);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 6px 8px;
    font-size: 12px;
    border-radius: 8px;
  }
  .board-wrap {
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 16px;
    padding: 8px;
    box-shadow: 0 6px 20px rgba(11,34,73,.08);
  }
  .board {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
    aspect-ratio: 1 / 1;
    width: 100%;
  }
  .cell {
    border-radius: 7px;
    background: var(--cell-empty);
    border: 1.5px solid var(--cell-empty-border);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-weight: 900;
    font-size: clamp(14px, 4.2vw, 22px);
    user-select: none;
    transition: transform .12s, background .15s, border-color .15s;
    cursor: pointer;
  }
  .cell.selected {
    background: var(--turq) !important;
    color: #062134 !important;
    border-color: #fff !important;
    transform: scale(1.06);
    box-shadow: 0 0 0 2px var(--navy);
  }
  .cell.correct {
    background: #10B981 !important;
    color: #042F2E !important;
    border-color: #6EE7B7 !important;
  }
  .cell.misplaced {
    background: var(--navy-mid);
    color: #FFFFFF;
    border-color: var(--turq);
  }
  .cell .peek {
    position: absolute;
    top: 1px;
    left: 3px;
    font-size: 8px;
    font-weight: 700;
    opacity: .8;
    color: var(--turq-light);
  }
  .cell .check {
    position: absolute;
    bottom: 1px;
    right: 2px;
    font-size: 8px;
    font-weight: 900;
  }
  .cell.guide {
    border-style: dashed;
    border-color: var(--turq);
    background: rgba(20,184,196,.16);
  }
  .sentence-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 9px 11px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .sentence-en { font-weight: 800; font-size: 13px; color: var(--navy); }
  body.dark .sentence-en { color: #5EEAD4; }
  .sentence-id { font-size: 12px; color: var(--muted); font-weight: 600; }
  .chips { display: flex; flex-wrap: wrap; gap: 5px; }
  .chip {
    background: var(--surface-2);
    border: 1px solid var(--border);
    color: var(--text);
    border-radius: 7px;
    padding: 4px 7px;
    font-size: 11px;
    font-weight: 700;
  }
  .chip.done {
    background: var(--ok-bg);
    border-color: #10B981;
    color: #065F46;
  }
  body.dark .chip.done { color: #A7F3D0; }
  .tray {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .tray-slot {
    background: var(--surface);
    border: 2px solid var(--border);
    border-radius: 12px;
    padding: 8px;
    min-height: 76px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .tray-slot.active { border-color: var(--turq); background: var(--surface-2); }
  .mini-grid { display: grid; gap: 2px; }
  .mini-cell { width: 13px; height: 13px; border-radius: 3px; }
  .progress-bar { height: 6px; background: var(--surface-2); border-radius: 99px; overflow: hidden; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--navy-mid), var(--turq)); transition: width .25s; }
  .modal-bg {
    position: fixed; inset: 0; background: rgba(7,23,49,.78);
    display: none; align-items: center; justify-content: center; padding: 14px; z-index: 50;
  }
  .modal-bg.open { display: flex; }
  .modal {
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 16px;
    max-width: 480px;
    width: 100%;
    padding: 16px;
    max-height: 85vh;
    overflow-y: auto;
  }
  footer {
    background: var(--navy);
    color: #CBE7F0;
    padding: 8px 14px;
    font-size: 11px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }
  canvas#confetti {
    position: fixed; inset: 0; pointer-events: none; z-index: 60;
  }
</style>
</head>
<body>
<canvas id="confetti"></canvas>
<header>
  <div class="brand"><span class="brand-dot"></span> LearnLink · KINETIX Offline USB</div>
  <div class="header-actions">
    <button class="btn-nav" id="langBtn" title="Switch Language">🇮🇩+🇬🇧</button>
    <button class="btn-nav" id="themeBtn" title="Light / Dark Navy">🌙</button>
    <button class="btn-turq" id="guideModalBtn">📖 Guide</button>
  </div>
</header>

<main>
  <div class="hud-card">
    <div class="row">
      <div class="stats">
        <span>PTS: <strong id="scoreVal">0</strong></span>
        <span class="stat-turq">Done: <strong id="doneVal">0</strong>/37</span>
        <span id="pctVal">0%</span>
      </div>
      <div class="row" style="gap:4px;">
        <button class="btn-soft" id="prevBtn">◀</button>
        <button class="btn-turq" id="nextBtn">Next ▶</button>
      </div>
    </div>
    <div class="row">
      <select class="game-picker" id="gameSelect"></select>
    </div>
    <div class="progress-bar"><div class="progress-fill" id="progressFill" style="width:0%"></div></div>
    <div class="row" id="controlRow"></div>
  </div>

  <div class="board-wrap">
    <div class="board" id="board"></div>
  </div>

  <div id="bottomDock"></div>
</main>

<div class="modal-bg" id="guideModal">
  <div class="modal">
    <div class="row" style="margin-bottom:8px;">
      <strong id="modalTitle" style="font-size:16px;"></strong>
      <button class="btn-soft" id="closeModalBtn">✕</button>
    </div>
    <div id="modalBody" style="font-size:13px;line-height:1.55;"></div>
  </div>
</div>

<footer>
  <span>&copy; 2026 LearnLink Educational Learning System. All rights reserved.</span>
  <span>Offline USB Edition · 37 Bilingual Brain Games</span>
</footer>

<script>
const GAMES = ${serializedGames};
const GRID = 8;
let lang = localStorage.getItem('ll_usb_lang') || 'bilingual';
let isDark = localStorage.getItem('ll_usb_dark') === '1';
let score = Number(localStorage.getItem('ll_usb_score') || 0);
let completedIds = JSON.parse(localStorage.getItem('ll_usb_done') || '[]');
let gameIdx = Math.max(0, GAMES.findIndex(g => g.id === 'sentence_find_airport'));

let letterGrid = [];
let selectedSwap = null;
let showPeek = false;

let blockGrid = Array.from({length: GRID}, () => Array(GRID).fill(0));
let tray = [];
let selectedTrayIdx = 0;
let showGuide = false;

const SHAPES = [
  { name: 'Dot', cells: [[1]] },
  { name: 'Bar 2', cells: [[1,1]] },
  { name: 'Bar 3', cells: [[1,1,1]] },
  { name: 'L-3', cells: [[1,0],[1,1]] },
  { name: '2x2', cells: [[1,1],[1,1]] },
  { name: 'T-4', cells: [[1,1,1],[0,1,0]] }
];

// Built-in Web Audio Chimes (100% Offline)
let audioCtx = null;
function playTone(freqs, dur = 0.14) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    freqs.forEach((f, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = f;
      const t = audioCtx.currentTime + idx * 0.085;
      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    });
  } catch(e) {}
}

function speakEnglish(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.88;
    window.speechSynthesis.speak(u);
  } catch(e) {}
}

// Built-in Canvas Confetti (100% Offline)
function burstConfetti() {
  const c = document.getElementById('confetti');
  const ctx = c.getContext('2d');
  c.width = window.innerWidth;
  c.height = window.innerHeight;
  const cols = ['#0B2249', '#14B8C4', '#2DD4BF', '#FFFFFF', '#F59E0B', '#10B981'];
  const parts = Array.from({length: 70}, () => ({
    x: c.width * 0.5, y: c.height * 0.45,
    vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 12 - 3,
    s: Math.random() * 6 + 4, col: cols[Math.floor(Math.random() * cols.length)], a: 1
  }));
  let frame = 0;
  function tick() {
    ctx.clearRect(0, 0, c.width, c.height);
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.a -= 0.015;
      if (p.a > 0) {
        ctx.globalAlpha = p.a;
        ctx.fillStyle = p.col;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
    });
    if (++frame < 75) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, c.width, c.height);
  }
  tick();
}

function shuffleLetters(targetGrid) {
  const coords = [];
  const chars = [];
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const ch = targetGrid[r]?.[c] || '';
      if (ch) { coords.push({r, c, ch}); chars.push(ch); }
    }
  }
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === coords[i].ch) {
      const k = (i + 1) % chars.length;
      [chars[i], chars[k]] = [chars[k], chars[i]];
    }
  }
  const out = Array.from({length: GRID}, () => Array(GRID).fill(''));
  coords.forEach((p, idx) => out[p.r][p.c] = chars[idx]);
  return out;
}

function rotateCells(cells) {
  const R = cells.length, C = cells[0].length;
  const out = Array.from({length: C}, () => Array(R).fill(0));
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) out[c][R - 1 - r] = cells[r][c];
  return out;
}

function canPlace(grid, cells, sr, sc) {
  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[0].length; c++) {
      if (cells[r][c]) {
        const nr = sr + r, nc = sc + c;
        if (nr < 0 || nr >= GRID || nc < 0 || nc >= GRID || grid[nr][nc] !== 0) return false;
      }
    }
  }
  return true;
}

function refillTray(game) {
  tray = [0, 1, 2].map(() => {
    const base = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      name: base.name,
      cells: base.cells.map(r => [...r]),
      colorIdx: 1 + Math.floor(Math.random() * 4)
    };
  });
  selectedTrayIdx = 0;
}

function loadGame(idx) {
  gameIdx = (idx + GAMES.length) % GAMES.length;
  const g = GAMES[gameIdx];
  selectedSwap = null;
  if (g.letterGrid) {
    letterGrid = shuffleLetters(g.letterGrid);
  } else {
    blockGrid = Array.from({length: GRID}, () => Array(GRID).fill(0));
    refillTray(g);
  }
  render();
}

function saveProgress() {
  localStorage.setItem('ll_usb_score', String(score));
  localStorage.setItem('ll_usb_done', JSON.stringify(completedIds));
}

function markCompleted(g) {
  if (!completedIds.includes(g.id)) completedIds.push(g.id);
  score += g.bonusPoints || 300;
  saveProgress();
  playTone([523, 659, 784, 1046], 0.22);
  burstConfetti();
  if (g.sentenceEn) speakEnglish(g.sentenceEn);
}

function getProgress(g) {
  if (g.letterGrid) {
    let ok = 0, total = 0;
    for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) {
      const t = g.letterGrid[r]?.[c] || '';
      if (t) { total++; if (letterGrid[r][c] === t) ok++; }
    }
    return { ok, total, pct: total ? Math.round(ok / total * 100) : 0 };
  } else {
    let ok = 0, total = 0;
    for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) {
      if (g.blueprint[r][c] > 0) { total++; if (blockGrid[r][c] > 0) ok++; }
    }
    return { ok, total, pct: total ? Math.round(ok / total * 100) : 0 };
  }
}

function populatePicker() {
  const sel = document.getElementById('gameSelect');
  sel.innerHTML = '';
  const cats = ['Scramble Words', 'Animals', 'Cars & Rides', 'Fruits & Treats', 'Scramble Blocks', 'Landmarks'];
  cats.forEach(cat => {
    const grp = document.createElement('optgroup');
    grp.label = cat;
    GAMES.forEach((g, idx) => {
      if (g.category === cat) {
        const opt = document.createElement('option');
        opt.value = String(idx);
        const done = completedIds.includes(g.id) ? ' ✓' : '';
        opt.textContent = g.emoji + ' ' + (lang === 'id' ? g.nameId : g.name) + done;
        if (idx === gameIdx) opt.selected = true;
        grp.appendChild(opt);
      }
    });
    sel.appendChild(grp);
  });
}

function render() {
  document.body.classList.toggle('dark', isDark);
  document.getElementById('themeBtn').textContent = isDark ? '☀️' : '🌙';
  document.getElementById('langBtn').textContent = lang === 'bilingual' ? '🇮🇩+🇬🇧' : lang === 'id' ? '🇮🇩 ID' : '🇬🇧 EN';

  const g = GAMES[gameIdx];
  const prog = getProgress(g);
  document.getElementById('scoreVal').textContent = score.toLocaleString();
  document.getElementById('doneVal').textContent = String(completedIds.length);
  document.getElementById('pctVal').textContent = prog.pct + '%';
  document.getElementById('progressFill').style.width = prog.pct + '%';
  populatePicker();

  // Controls row
  const ctrl = document.getElementById('controlRow');
  ctrl.innerHTML = '';
  if (g.letterGrid) {
    const btnFix = document.createElement('button');
    btnFix.className = 'btn-ok';
    btnFix.textContent = lang === 'id' ? '✨ Bantu 1 Huruf' : '✨ Fix 1 Letter';
    btnFix.onclick = () => {
      for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) {
        const target = g.letterGrid[r][c];
        if (target && letterGrid[r][c] !== target) {
          for (let r2 = 0; r2 < GRID; r2++) for (let c2 = 0; c2 < GRID; c2++) {
            if (letterGrid[r2][c2] === target && g.letterGrid[r2][c2] !== target) {
              const tmp = letterGrid[r][c];
              letterGrid[r][c] = letterGrid[r2][c2];
              letterGrid[r2][c2] = tmp;
              playTone([587, 880]);
              if (getProgress(g).pct === 100) markCompleted(g);
              render();
              return;
            }
          }
        }
      }
    };
    const btnShuf = document.createElement('button');
    btnShuf.className = 'btn-soft';
    btnShuf.textContent = lang === 'id' ? '🔀 Acak' : '🔀 Shuffle';
    btnShuf.onclick = () => { letterGrid = shuffleLetters(g.letterGrid); selectedSwap = null; render(); };

    const btnPeek = document.createElement('button');
    btnPeek.className = showPeek ? 'btn-turq' : 'btn-soft';
    btnPeek.textContent = lang === 'id' ? '👁 Kunci' : '👁 Peek';
    btnPeek.onclick = () => { showPeek = !showPeek; render(); };

    const btnSpeak = document.createElement('button');
    btnSpeak.className = 'btn-navy';
    btnSpeak.textContent = '🔊 Speak';
    btnSpeak.onclick = () => speakEnglish(g.sentenceEn || g.name);

    ctrl.append(btnFix, btnShuf, btnPeek, btnSpeak);
  } else {
    const btnRot = document.createElement('button');
    btnRot.className = 'btn-turq';
    btnRot.textContent = lang === 'id' ? '↻ Putar' : '↻ Rotate';
    btnRot.onclick = () => {
      const piece = tray[selectedTrayIdx];
      if (piece) { piece.cells = rotateCells(piece.cells); playTone([440]); render(); }
    };
    const btnAuto = document.createElement('button');
    btnAuto.className = 'btn-ok';
    btnAuto.textContent = lang === 'id' ? '✨ Pasang 1' : '✨ Auto-Place';
    btnAuto.onclick = () => {
      for (let r = 0; r < GRID; r++) for (let c = 0; c < GRID; c++) {
        if (g.blueprint[r][c] > 0 && blockGrid[r][c] === 0) {
          blockGrid[r][c] = g.blueprint[r][c];
          score += 20;
          playTone([523, 784]);
          if (getProgress(g).pct === 100) markCompleted(g);
          saveProgress();
          render();
          return;
        }
      }
    };
    const btnGuide = document.createElement('button');
    btnGuide.className = showGuide ? 'btn-turq' : 'btn-soft';
    btnGuide.textContent = lang === 'id' ? '👁 Panduan' : '👁 Guide';
    btnGuide.onclick = () => { showGuide = !showGuide; render(); };

    const btnClear = document.createElement('button');
    btnClear.className = 'btn-danger';
    btnClear.textContent = lang === 'id' ? '🗑 Ulang' : '🗑 Clear';
    btnClear.onclick = () => { blockGrid = Array.from({length: GRID}, () => Array(GRID).fill(0)); refillTray(g); render(); };

    ctrl.append(btnRot, btnAuto, btnGuide, btnClear);
  }

  // Render 8x8 Board
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (let r = 0; r < GRID; r++) {
    for (let c = 0; c < GRID; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      if (g.letterGrid) {
        const target = g.letterGrid[r][c] || '';
        const cur = letterGrid[r][c] || '';
        if (target) {
          const isOk = cur === target;
          const isSel = selectedSwap && selectedSwap.r === r && selectedSwap.c === c;
          cell.classList.add(isSel ? 'selected' : isOk ? 'correct' : 'misplaced');
          cell.textContent = cur;
          if (showPeek && !isOk) {
            const p = document.createElement('span'); p.className = 'peek'; p.textContent = target; cell.appendChild(p);
          }
          if (isOk) {
            const k = document.createElement('span'); k.className = 'check'; k.textContent = '✓'; cell.appendChild(k);
          }
          cell.onclick = () => {
            if (!selectedSwap) {
              selectedSwap = {r, c};
              playTone([420], 0.08);
            } else if (selectedSwap.r === r && selectedSwap.c === c) {
              selectedSwap = null;
            } else {
              const tmp = letterGrid[selectedSwap.r][selectedSwap.c];
              letterGrid[selectedSwap.r][selectedSwap.c] = letterGrid[r][c];
              letterGrid[r][c] = tmp;
              const hit = letterGrid[r][c] === g.letterGrid[r][c] || letterGrid[selectedSwap.r][selectedSwap.c] === g.letterGrid[selectedSwap.r][selectedSwap.c];
              if (hit) { score += 15; saveProgress(); playTone([523, 659]); }
              else playTone([360], 0.09);
              selectedSwap = null;
              if (getProgress(g).pct === 100) markCompleted(g);
            }
            render();
          };
        } else {
          cell.style.opacity = '0.32';
          cell.style.cursor = 'default';
        }
      } else {
        const val = blockGrid[r][c];
        const bp = g.blueprint[r][c];
        if (val > 0) {
          cell.style.background = g.colors[(val - 1) % 4];
          cell.style.borderColor = '#FFFFFF88';
        } else if (showGuide && bp > 0) {
          cell.classList.add('guide');
        }
        cell.onclick = () => {
          const piece = tray[selectedTrayIdx];
          if (!piece) return;
          if (canPlace(blockGrid, piece.cells, r, c)) {
            for (let pr = 0; pr < piece.cells.length; pr++)
              for (let pc = 0; pc < piece.cells[0].length; pc++)
                if (piece.cells[pr][pc]) blockGrid[r + pr][c + pc] = g.blueprint[r + pr][c + pc] || piece.colorIdx;
            tray[selectedTrayIdx] = null;
            score += 25;
            playTone([523, 659]);
            if (tray.every(t => !t)) { playTone([523, 659, 784]); refillTray(g); }
            else selectedTrayIdx = tray.findIndex(t => !!t);
            if (getProgress(g).pct === 100) markCompleted(g);
            saveProgress();
            render();
          } else {
            playTone([220], 0.1);
          }
        };
      }
      board.appendChild(cell);
    }
  }

  // Bottom Dock
  const dock = document.getElementById('bottomDock');
  dock.innerHTML = '';
  if (g.letterGrid) {
    const box = document.createElement('div');
    box.className = 'sentence-box';
    const en = document.createElement('div');
    en.className = 'sentence-en';
    en.textContent = '🇬🇧 ' + (g.sentenceEn || g.name);
    const id = document.createElement('div');
    id.className = 'sentence-id';
    id.textContent = '🇮🇩 ' + (g.sentenceId || g.descriptionId);
    box.append(en, id);
    if (g.wordTranslations && g.wordTranslations.length) {
      const chips = document.createElement('div');
      chips.className = 'chips';
      g.wordTranslations.forEach(wt => {
        let ok = true;
        for (let cc = wt.startCol; cc <= wt.endCol; cc++) {
          if (letterGrid[wt.row]?.[cc] !== g.letterGrid[wt.row]?.[cc]) ok = false;
        }
        const b = document.createElement('button');
        b.className = 'chip' + (ok ? ' done' : '');
        b.textContent = (ok ? '✓ ' : '') + wt.en + ' (' + wt.id + ')';
        b.onclick = () => speakEnglish(wt.en);
        chips.appendChild(b);
      });
      box.appendChild(chips);
    }
    dock.appendChild(box);
  } else {
    const tr = document.createElement('div');
    tr.className = 'tray';
    tray.forEach((piece, idx) => {
      const slot = document.createElement('div');
      slot.className = 'tray-slot' + (idx === selectedTrayIdx ? ' active' : '');
      if (piece) {
        const mg = document.createElement('div');
        mg.className = 'mini-grid';
        mg.style.gridTemplateColumns = 'repeat(' + piece.cells[0].length + ', 13px)';
        piece.cells.forEach(row => row.forEach(v => {
          const mc = document.createElement('div');
          mc.className = 'mini-cell';
          mc.style.background = v ? g.colors[(piece.colorIdx - 1) % 4] : 'transparent';
          mg.appendChild(mc);
        }));
        slot.appendChild(mg);
        slot.onclick = () => { selectedTrayIdx = idx; playTone([440], 0.06); render(); };
      } else {
        slot.textContent = '✓';
        slot.style.opacity = '0.4';
      }
      tr.appendChild(slot);
    });
    dock.appendChild(tr);
  }
}

document.getElementById('gameSelect').onchange = e => loadGame(Number(e.target.value));
document.getElementById('prevBtn').onclick = () => loadGame(gameIdx - 1);
document.getElementById('nextBtn').onclick = () => loadGame(gameIdx + 1);
document.getElementById('themeBtn').onclick = () => {
  isDark = !isDark;
  localStorage.setItem('ll_usb_dark', isDark ? '1' : '0');
  render();
};
document.getElementById('langBtn').onclick = () => {
  lang = lang === 'bilingual' ? 'id' : lang === 'id' ? 'en' : 'bilingual';
  localStorage.setItem('ll_usb_lang', lang);
  render();
};
document.getElementById('guideModalBtn').onclick = () => {
  const g = GAMES[gameIdx];
  document.getElementById('modalTitle').textContent = g.emoji + ' ' + g.name + ' · ' + g.nameId;
  document.getElementById('modalBody').innerHTML =
    '<p><strong>🇬🇧 How to Play:</strong> ' + g.howItWorksEn + '</p>' +
    '<p><strong>🇮🇩 Cara Bermain:</strong> ' + g.howItWorksId + '</p>' +
    '<p><strong>🧠 Brain Workout:</strong> ' + g.brainSkillEn + ' (' + g.brainSkillId + ')</p>';
  document.getElementById('guideModal').classList.add('open');
};
document.getElementById('closeModalBtn').onclick = () => {
  document.getElementById('guideModal').classList.remove('open');
};
document.getElementById('guideModal').onclick = e => {
  if (e.target.id === 'guideModal') e.target.classList.remove('open');
};

loadGame(gameIdx);
</script>
</body>
</html>`;
}

export function triggerUsbOfflineDownload(): void {
  const html = buildStandaloneUsbOfflineHtml();
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'LearnLink-Brain-Workout-Offline-USB.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}
