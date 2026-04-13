/**
 * main.js — DOM, drag/drop, timer, best-times, game flow
 */

import { generateHand, sortTiles, isCorrectOrder } from './mahjong.js';
import { t, setLang, getLang, TRANSLATIONS } from './i18n.js';

// ── State ─────────────────────────────────────────────────────────────────────

const state = {
  tiles: [],          // current hand (ordered by player)
  sorted: [],         // correct answer
  simplified: false,  // numbers-only mode
  count: 13,          // hand size (13 or 14)
  startTime: null,
  timerHandle: null,
  elapsed: 0,
  solved: false,
  hintVisible: false,
  darkMode: false,
  lang: 'ja',
};

// ── DOM refs ──────────────────────────────────────────────────────────────────

const $ = id => document.getElementById(id);

// ── Timer ─────────────────────────────────────────────────────────────────────

function startTimer() {
  stopTimer();
  state.startTime = Date.now();
  state.elapsed = 0;
  state.timerHandle = setInterval(() => {
    if (!state.solved) {
      state.elapsed = ((Date.now() - state.startTime) / 1000).toFixed(1);
      updateTimerDisplay();
    }
  }, 100);
}

function stopTimer() {
  if (state.timerHandle) {
    clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
}

function updateTimerDisplay() {
  const el = $('timer-value');
  if (el) el.textContent = `${state.elapsed}${t('seconds')}`;
}

// ── Best times ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'mahjong-sort-best-times';

function getBestTimes() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveBestTime(seconds) {
  const times = getBestTimes();
  times.push(parseFloat(seconds));
  times.sort((a, b) => a - b);
  const top5 = times.slice(0, 5);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top5));
  return top5;
}

function renderBestTimes() {
  const el = $('best-times-list');
  if (!el) return;
  const times = getBestTimes();
  if (times.length === 0) {
    el.innerHTML = `<li class="no-record">${t('noRecord')}</li>`;
    return;
  }
  el.innerHTML = times
    .map((s, i) => `<li><span class="rank">${t('rankLabel', i + 1)}</span><span class="time">${s}${t('seconds')}</span></li>`)
    .join('');
}

// ── Tile rendering ────────────────────────────────────────────────────────────

function createTileEl(tile, index) {
  const div = document.createElement('div');
  div.className = `tile suit-${tile.suit}`;
  div.dataset.index = index;
  div.dataset.tileId = tile.id;
  div.draggable = true;

  // Main label
  const label = document.createElement('span');
  label.className = 'tile-label';
  label.textContent = tile.display;
  div.appendChild(label);

  return div;
}

// ── Drag and drop ─────────────────────────────────────────────────────────────

let dragSrcIndex = null;
let touchStartIndex = null;
let touchPlaceholder = null;

function setupDragDrop(container) {
  container.addEventListener('dragstart', e => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    dragSrcIndex = parseInt(tile.dataset.index, 10);
    tile.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });

  container.addEventListener('dragend', e => {
    const tile = e.target.closest('.tile');
    if (tile) tile.classList.remove('dragging');
    document.querySelectorAll('.tile.drag-over').forEach(t => t.classList.remove('drag-over'));
  });

  container.addEventListener('dragover', e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const tile = e.target.closest('.tile');
    document.querySelectorAll('.tile.drag-over').forEach(t => t.classList.remove('drag-over'));
    if (tile) tile.classList.add('drag-over');
  });

  container.addEventListener('drop', e => {
    e.preventDefault();
    const tile = e.target.closest('.tile');
    if (!tile) return;
    const destIndex = parseInt(tile.dataset.index, 10);
    if (dragSrcIndex === null || dragSrcIndex === destIndex) return;

    // Swap tiles in state
    const arr = state.tiles;
    [arr[dragSrcIndex], arr[destIndex]] = [arr[destIndex], arr[dragSrcIndex]];
    dragSrcIndex = null;
    renderHand();
    checkAutoSolve();
  });

  // Touch support
  container.addEventListener('touchstart', e => {
    const tile = e.target.closest('.tile');
    if (!tile) return;
    touchStartIndex = parseInt(tile.dataset.index, 10);
    tile.classList.add('touch-held');
  }, { passive: true });

  container.addEventListener('touchend', e => {
    document.querySelectorAll('.tile.touch-held').forEach(t => t.classList.remove('touch-held'));

    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dest = el ? el.closest('.tile') : null;
    if (!dest || touchStartIndex === null) { touchStartIndex = null; return; }

    const destIndex = parseInt(dest.dataset.index, 10);
    if (touchStartIndex !== destIndex) {
      const arr = state.tiles;
      [arr[touchStartIndex], arr[destIndex]] = [arr[destIndex], arr[touchStartIndex]];
      renderHand();
      checkAutoSolve();
    }
    touchStartIndex = null;
  }, { passive: true });
}

// ── Hint ──────────────────────────────────────────────────────────────────────

function renderHint() {
  const container = $('hint-container');
  if (!container) return;
  container.innerHTML = '';
  if (!state.hintVisible) return;

  const label = document.createElement('p');
  label.className = 'hint-label';
  label.textContent = t('hintLabel');
  container.appendChild(label);

  const row = document.createElement('div');
  row.className = 'tile-row hint-row';
  for (let i = 0; i < state.sorted.length; i++) {
    const el = createTileEl(state.sorted[i], i);
    el.draggable = false;
    el.classList.add('hint-tile');
    row.appendChild(el);
  }
  container.appendChild(row);
}

// ── Hand rendering ────────────────────────────────────────────────────────────

function renderHand() {
  const container = $('tile-row');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < state.tiles.length; i++) {
    container.appendChild(createTileEl(state.tiles[i], i));
  }
  // Update dataset indices after re-render (already set in createTileEl)
}

// ── Auto-solve detection ──────────────────────────────────────────────────────

function checkAutoSolve() {
  if (isCorrectOrder(state.tiles)) {
    solveSuccess();
  }
}

function solveSuccess() {
  stopTimer();
  state.solved = true;
  const elapsed = parseFloat(state.elapsed);
  saveBestTime(elapsed);
  renderBestTimes();

  const msg = $('message');
  if (msg) {
    msg.textContent = `${t('correct')} ${elapsed}${t('seconds')}`;
    msg.className = 'message success';
  }

  // Highlight all tiles
  document.querySelectorAll('#tile-row .tile').forEach(t => t.classList.add('correct'));
}

// ── Check button ──────────────────────────────────────────────────────────────

function handleCheck() {
  if (state.solved) return;
  const msg = $('message');
  if (isCorrectOrder(state.tiles)) {
    solveSuccess();
  } else {
    if (msg) {
      msg.textContent = t('incorrect');
      msg.className = 'message error';
      setTimeout(() => { if (msg) msg.textContent = ''; }, 1500);
    }
  }
}

// ── New hand ──────────────────────────────────────────────────────────────────

function newHand() {
  stopTimer();
  state.solved = false;
  state.hintVisible = false;
  state.elapsed = 0;

  const raw = generateHand(state.count, state.simplified);
  state.sorted = sortTiles(raw);

  // Shuffle for display (ensure not already sorted)
  let shuffled = [...raw];
  let attempts = 0;
  while (isCorrectOrder(shuffled) && attempts < 20) {
    shuffled = shuffled.sort(() => Math.random() - 0.5);
    attempts++;
  }
  // If still sorted after 20 attempts (very unlikely), do a simple swap
  if (isCorrectOrder(shuffled) && shuffled.length >= 2) {
    [shuffled[0], shuffled[shuffled.length - 1]] = [shuffled[shuffled.length - 1], shuffled[0]];
  }
  state.tiles = shuffled;

  const hintBtn = $('hint-btn');
  if (hintBtn) hintBtn.textContent = t('hintMode');

  const hintContainer = $('hint-container');
  if (hintContainer) hintContainer.innerHTML = '';

  const msg = $('message');
  if (msg) { msg.textContent = ''; msg.className = 'message'; }

  renderHand();
  updateTimerDisplay();
  startTimer();
}

// ── UI rendering ──────────────────────────────────────────────────────────────

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
}

function updateLangButtons() {
  $('btn-ja').classList.toggle('active', state.lang === 'ja');
  $('btn-en').classList.toggle('active', state.lang === 'en');
}

// ── Init ──────────────────────────────────────────────────────────────────────

export function init() {
  // Theme from localStorage
  const savedTheme = localStorage.getItem('mahjong-sort-theme');
  if (savedTheme === 'dark') {
    state.darkMode = true;
    document.body.classList.add('dark');
  }

  // Lang from localStorage
  const savedLang = localStorage.getItem('mahjong-sort-lang');
  if (savedLang === 'en') { state.lang = 'en'; setLang('en'); }

  applyTranslations();
  updateLangButtons();
  renderBestTimes();

  const tileRow = $('tile-row');
  if (tileRow) setupDragDrop(tileRow);

  // Buttons
  $('new-hand-btn')?.addEventListener('click', newHand);

  $('check-btn')?.addEventListener('click', handleCheck);

  $('hint-btn')?.addEventListener('click', () => {
    state.hintVisible = !state.hintVisible;
    const hintBtn = $('hint-btn');
    if (hintBtn) hintBtn.textContent = state.hintVisible ? t('hideHint') : t('hintMode');
    renderHint();
  });

  $('theme-btn')?.addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark', state.darkMode);
    localStorage.setItem('mahjong-sort-theme', state.darkMode ? 'dark' : 'light');
  });

  $('btn-ja')?.addEventListener('click', () => {
    state.lang = 'ja'; setLang('ja');
    localStorage.setItem('mahjong-sort-lang', 'ja');
    applyTranslations();
    updateLangButtons();
    renderBestTimes();
    renderHint();
  });

  $('btn-en')?.addEventListener('click', () => {
    state.lang = 'en'; setLang('en');
    localStorage.setItem('mahjong-sort-lang', 'en');
    applyTranslations();
    updateLangButtons();
    renderBestTimes();
    renderHint();
  });

  $('mode-select')?.addEventListener('change', e => {
    state.simplified = e.target.value === 'simplified';
    newHand();
  });

  $('count-select')?.addEventListener('change', e => {
    state.count = parseInt(e.target.value, 10);
    newHand();
  });

  newHand();
}

// Auto-init when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
