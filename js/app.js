// ═══════════════════════════════════════════════════════
// STORAGE (inlined from storage.js)
// ═══════════════════════════════════════════════════════
const STORAGE_KEYS = {
  CONFIG: 'whoregen_config',
  HISTORY: 'whoregen_history',
  CUSTOM_PRESETS: 'whoregen_custom_presets',
  UNDO_STACK: 'whoregen_undo',
  REDO_STACK: 'whoregen_redo'
};
const MAX_HISTORY = 50;
const MAX_UNDO = 30;

function _get(key, fallback) {
  try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback || null; }
  catch { return fallback || null; }
}
function _set(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) { console.warn('ls write fail:', e); }
}

function saveConfig(c) { _set(STORAGE_KEYS.CONFIG, c); }
function loadConfig() { return _get(STORAGE_KEYS.CONFIG); }

function addToHistory(prompt) {
  const h = _get(STORAGE_KEYS.HISTORY, []);
  h.unshift({ prompt, timestamp: Date.now(), id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) });
  if (h.length > MAX_HISTORY) h.length = MAX_HISTORY;
  _set(STORAGE_KEYS.HISTORY, h);
}
function getHistory() { return _get(STORAGE_KEYS.HISTORY, []); }
function clearHistory() { _set(STORAGE_KEYS.HISTORY, []); }
function deleteHistoryEntry(id) {
  _set(STORAGE_KEYS.HISTORY, _get(STORAGE_KEYS.HISTORY, []).filter(h => h.id !== id));
}

function saveCustomPresets(p) { _set(STORAGE_KEYS.CUSTOM_PRESETS, p); }
function loadCustomPresets() { return _get(STORAGE_KEYS.CUSTOM_PRESETS, []); }

function pushUndo(state) {
  const s = _get(STORAGE_KEYS.UNDO_STACK, []);
  s.push(state);
  if (s.length > MAX_UNDO) s.shift();
  _set(STORAGE_KEYS.UNDO_STACK, s);
  _set(STORAGE_KEYS.REDO_STACK, []);
}
function popUndo() {
  const s = _get(STORAGE_KEYS.UNDO_STACK, []);
  const st = s.pop(); _set(STORAGE_KEYS.UNDO_STACK, s); return st;
}
function pushRedo(state) {
  const s = _get(STORAGE_KEYS.REDO_STACK, []); s.push(state); _set(STORAGE_KEYS.REDO_STACK, s);
}
function popRedo() {
  const s = _get(STORAGE_KEYS.REDO_STACK, []);
  const st = s.pop(); _set(STORAGE_KEYS.REDO_STACK, s); return st;
}
function canUndo() { return _get(STORAGE_KEYS.UNDO_STACK, []).length > 0; }
function canRedo() { return _get(STORAGE_KEYS.REDO_STACK, []).length > 0; }

// ═══════════════════════════════════════════════════════
// TOAST (inlined from toast.js)
// ═══════════════════════════════════════════════════════
let _toastContainer = null;
const _typeStyles = {
  info: 'background:rgba(20,0,5,0.95);color:#ffebf0;border-left:4px solid #e11d48;',
  success: 'background:rgba(6,78,59,0.95);color:#a7f3d0;border-left:4px solid #10b981;',
  error: 'background:rgba(127,29,29,0.95);color:#fecaca;border-left:4px solid #ef4444;',
  warning: 'background:rgba(124,45,18,0.95);color:#fed7aa;border-left:4px solid #f97316;',
  copy: 'background:rgba(6,78,59,0.95);color:#a7f3d0;border-left:4px solid #10b981;'
};

function toast(message, type, duration) {
  type = type || 'info';
  duration = duration === undefined ? 2500 : duration;
  if (!_toastContainer) {
    _toastContainer = document.createElement('div');
    _toastContainer.id = 'toast-container';
    _toastContainer.style.cssText = 'position:fixed;bottom:120px;right:30px;z-index:10000;display:flex;flex-direction:column;gap:10px;align-items:flex-end;pointer-events:none;';
    document.body.appendChild(_toastContainer);
  }
  const el = document.createElement('div');
  el.textContent = message;
  el.style.cssText = 'padding:14px 24px;border-radius:10px;font-weight:600;font-size:0.95rem;pointer-events:auto;cursor:pointer;transform:translateX(120%);transition:transform 0.35s ease,opacity 0.35s ease;max-width:340px;word-wrap:break-word;' + (_typeStyles[type] || _typeStyles.info);
  _toastContainer.appendChild(el);
  requestAnimationFrame(function(){ el.style.transform = 'translateX(0)'; });
  function dismiss() { el.style.transform='translateX(120%)'; el.style.opacity='0'; setTimeout(function(){ el.remove(); },350); }
  el.addEventListener('click', dismiss);
  if (duration > 0) setTimeout(dismiss, duration);
  return dismiss;
}

// ═══════════════════════════════════════════════════════
// PROMPT BUILDER (inlined from prompt.js)
// ═══════════════════════════════════════════════════════
function buildPrompt(v) {
  var parts = [];
  parts.push(v.imageStyle);
  parts.push(v.cameraSettings);
  parts.push(v.perspective);
  parts.push(v.lighting);
  parts.push('a whore with ' + v.hairStyle + ', ' + v.eyes + ', ' + v.face + ', ' + v.lips + ', ' + v.makeup);
  parts.push(v.bodyType + ' with ' + v.bust + ' and ' + v.ass);
  if (v.clothingStyle !== 'completely naked whore') {
    if (v.material && v.material !== 'none') parts.push('wearing ' + v.clothingStyle + ' made of ' + v.material);
    else parts.push('wearing ' + v.clothingStyle);
  } else { parts.push('completely naked'); }
  parts.push(v.pussy);
  if (v.cum !== 'clean whore') parts.push(v.cum);
  parts.push(v.pose);
  var level = parseInt(v.realismLevel) || 10;
  if (level >= 9) parts.push('100% realistic, photorealistic, hyperrealistic, raw photography, no digital art');
  else if (level >= 7) parts.push('highly realistic, photographic, authentic');
  else parts.push('realistic, photographic');
  parts.push('sharp focus, high resolution, detailed skin texture, natural lighting, professional photography');
  return parts.join(', ');
}

function getStats(prompt) {
  var words = prompt.trim().split(/\s+/).length;
  var chars = prompt.length;
  var tags = (prompt.match(/,/g) || []).length;
  return { words: words, chars: chars, tags: tags };
}

// ═══════════════════════════════════════════════════════
// APP (main logic)
// ═══════════════════════════════════════════════════════
(function() {
  var allPresets = [];

  var $ = function(id) { return document.getElementById(id); };
  var promptDisplay = $('promptDisplay');
  var wordCount = $('wordCount');
  var charCount = $('charCount');
  var tagCount = $('tagCount');
  var realismSlider = $('realismLevel');
  var realismValue = $('realismValue');
  var presetsGrid = $('presetsGrid');

  var fields = [
    'hairStyle','eyes','face','lips','makeup',
    'bodyType','bust','ass',
    'clothingStyle','material',
    'pussy','cum','pose',
    'lighting','imageStyle','perspective','cameraSettings'
  ];

  function getFormValues() {
    var vals = { realismLevel: realismSlider.value };
    fields.forEach(function(f) { var el = $(f); if (el) vals[f] = el.value; });
    return vals;
  }

  function setFormValues(vals) {
    Object.keys(vals).forEach(function(k) { var el = $(k); if (el) el.value = vals[k]; });
    realismValue.textContent = vals.realismLevel;
    renderPrompt();
  }

  function snapshotState() {
    return JSON.parse(JSON.stringify(getFormValues()));
  }

  function renderPrompt() {
    var vals = getFormValues();
    var prompt = buildPrompt(vals);
    promptDisplay.textContent = prompt;
    var stats = getStats(prompt);
    wordCount.textContent = stats.words + ' words';
    charCount.textContent = stats.chars + ' characters';
    tagCount.textContent = stats.tags + ' details';
    saveConfig(vals);
  }

  // ── Presets ──────────────────────────────────────
  function loadPresets() {
    allPresets = window.whorePresets || [];
    renderPresetButtons();
  }

  function renderPresetButtons() {
    var customPresets = loadCustomPresets();
    presetsGrid.innerHTML = '';

    allPresets.forEach(function(preset, i) {
      presetsGrid.appendChild(createPresetBtn(preset, false, 'builtin-' + i));
    });

    customPresets.forEach(function(preset, i) {
      presetsGrid.appendChild(createPresetBtn(preset, true, 'custom-' + i));
    });

    var addBtn = document.createElement('button');
    addBtn.className = 'preset-btn preset-add-btn';
    addBtn.innerHTML = '<i class="fas fa-plus preset-icon"></i><div class="preset-name">Save Current</div><div class="preset-desc">Save current config as preset</div>';
    addBtn.addEventListener('click', saveCurrentAsPreset);
    presetsGrid.appendChild(addBtn);
  }

  function createPresetBtn(preset, isCustom, id) {
    var btn = document.createElement('button');
    btn.className = 'preset-btn';
    btn.dataset.id = id;
    var deleteHtml = isCustom ? '<button class="preset-delete-btn" data-id="' + id + '" title="Delete preset"><i class="fas fa-times"></i></button>' : '';
    btn.innerHTML = deleteHtml + '<i class="fas ' + (preset.icon || 'fa-star') + ' preset-icon"></i><div class="preset-name">' + preset.name + '</div><div class="preset-desc">' + (preset.description || '') + '</div>';

    btn.addEventListener('click', function(e) {
      if (e.target.closest('.preset-delete-btn')) return;
      pushUndo(snapshotState());
      setFormValues(preset.settings);
      document.querySelector('[data-target="looks"]').click();
      setTimeout(function() { copyToClipboard(); }, 100);
      btn.style.transform = 'scale(0.95)';
      setTimeout(function() { btn.style.transform = ''; }, 200);
    });

    if (isCustom) {
      var delBtn = btn.querySelector('.preset-delete-btn');
      delBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteCustomPreset(id);
      });
    }
    return btn;
  }

  function saveCurrentAsPreset() {
    var name = prompt('Preset name:');
    if (!name || !name.trim()) return;
    var desc = prompt('Short description:') || '';
    var icon = prompt('Font Awesome icon (e.g. fa-star):') || 'fa-star';
    var customPresets = loadCustomPresets();
    customPresets.push({ name: name.trim(), description: desc.trim(), icon: icon.trim(), settings: getFormValues() });
    saveCustomPresets(customPresets);
    renderPresetButtons();
    toast('Preset saved!', 'success');
  }

  function deleteCustomPreset(id) {
    var idx = parseInt(id.split('-')[1]);
    var customPresets = loadCustomPresets();
    customPresets.splice(idx, 1);
    saveCustomPresets(customPresets);
    renderPresetButtons();
    toast('Preset deleted', 'info');
  }

  // ── Actions ──────────────────────────────────────
  function randomizeAll() {
    pushUndo(snapshotState());
    fields.forEach(function(f) {
      var el = $(f);
      if (el && el.tagName === 'SELECT') el.selectedIndex = Math.floor(Math.random() * el.options.length);
    });
    var rv = Math.floor(Math.random() * 10) + 1;
    realismSlider.value = rv;
    realismValue.textContent = rv;
    renderPrompt();
    toast('Randomized!', 'info', 1200);
  }

  function applyVariation() {
    pushUndo(snapshotState());
    var tweakCount = 2 + Math.floor(Math.random() * 3);
    var shuffled = fields.slice().sort(function() { return Math.random() - 0.5; });
    for (var i = 0; i < tweakCount && i < shuffled.length; i++) {
      var el = $(shuffled[i]);
      if (el && el.tagName === 'SELECT') el.selectedIndex = Math.floor(Math.random() * el.options.length);
    }
    renderPrompt();
    toast('Variation applied', 'info', 1200);
  }

  function resetAll() {
    pushUndo(snapshotState());
    fields.forEach(function(f) {
      var el = $(f);
      if (el && el.tagName === 'SELECT') el.selectedIndex = 0;
    });
    realismSlider.value = 10;
    realismValue.textContent = 10;
    renderPrompt();
    toast('Reset to defaults', 'info', 1200);
  }

  function copyToClipboard() {
    var text = promptDisplay.textContent;
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function() {
          addToHistory(text);
          toast('Prompt copied!', 'copy', 2000);
        });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        addToHistory(text);
        toast('Prompt copied!', 'copy', 2000);
      }
    } catch(e) { toast('Copy failed', 'error'); }
  }

  function undo() {
    if (!canUndo()) { toast('Nothing to undo', 'warning', 1200); return; }
    pushRedo(snapshotState());
    setFormValues(popUndo());
    toast('Undone', 'info', 1000);
  }

  function redo() {
    if (!canRedo()) { toast('Nothing to redo', 'warning', 1200); return; }
    pushUndo(snapshotState());
    setFormValues(popRedo());
    toast('Redone', 'info', 1000);
  }

  function exportPresets() {
    var data = { version: 1, customPresets: loadCustomPresets(), exportedAt: new Date().toISOString() };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'whoregen-presets-' + Date.now() + '.json';
    a.click();
    URL.revokeObjectURL(url);
    toast('Presets exported', 'success');
  }

  function importPresets() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', function() {
      var file = input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var data = JSON.parse(e.target.result);
          if (!data.customPresets || !Array.isArray(data.customPresets)) throw new Error('Invalid');
          var existing = loadCustomPresets();
          var merged = existing.concat(data.customPresets);
          saveCustomPresets(merged);
          renderPresetButtons();
          toast('Imported ' + data.customPresets.length + ' presets', 'success');
        } catch(err) { toast('Import failed: invalid file', 'error'); }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function escapeAttr(s) { return s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function showHistory() {
    var history = getHistory();
    if (history.length === 0) { toast('No history yet', 'info'); return; }
    var existing = $('history-panel');
    if (existing) { existing.remove(); return; }

    var panel = document.createElement('div');
    panel.id = 'history-panel';
    panel.style.cssText = 'position:fixed;top:0;right:0;width:420px;max-width:100vw;height:100vh;background:rgba(10,0,5,0.98);border-left:2px solid #3f1212;z-index:9999;overflow-y:auto;padding:20px;box-shadow:-5px 0 30px rgba(0,0,0,0.8);';

    var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><h2 style="color:#e11d48;margin:0;font-size:1.3rem;">Prompt History</h2><div style="display:flex;gap:10px;"><button id="clearHistoryBtn" style="background:rgba(225,29,72,0.15);color:#e11d48;border:1px solid #3f1212;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:600;">Clear All</button><button id="closeHistoryBtn" style="background:transparent;color:#ffebf0;border:1px solid #3f1212;padding:8px 14px;border-radius:8px;cursor:pointer;font-weight:600;">Close</button></div></div>';

    history.forEach(function(entry) {
      var date = new Date(entry.timestamp).toLocaleString();
      html += '<div style="background:rgba(20,0,5,0.8);border:1px solid #3f1212;border-radius:8px;padding:12px;margin-bottom:10px;" class="history-entry" data-id="' + entry.id + '"><div style="font-size:0.8rem;color:#ffa8ba;margin-bottom:6px;">' + date + '</div><div style="font-family:monospace;font-size:0.85rem;color:#ffebf0;line-height:1.4;max-height:60px;overflow:hidden;text-overflow:ellipsis;">' + escapeHtml(entry.prompt.substring(0, 200)) + '</div><div style="display:flex;gap:8px;margin-top:8px;"><button class="history-copy-btn" data-prompt="' + escapeAttr(entry.prompt) + '" style="background:rgba(225,29,72,0.15);color:#e11d48;border:1px solid #3f1212;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:0.8rem;">Copy</button><button class="history-delete-btn" data-id="' + entry.id + '" style="background:transparent;color:#ffa8ba;border:1px solid #3f1212;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:0.8rem;">Delete</button></div></div>';
    });

    panel.innerHTML = html;
    document.body.appendChild(panel);

    panel.querySelector('#closeHistoryBtn').addEventListener('click', function() { panel.remove(); });
    panel.querySelector('#clearHistoryBtn').addEventListener('click', function() { clearHistory(); panel.remove(); toast('History cleared', 'info'); });

    panel.querySelectorAll('.history-copy-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var text = btn.dataset.prompt;
        if (navigator.clipboard) navigator.clipboard.writeText(text);
        toast('Copied from history', 'copy', 1500);
      });
    });

    panel.querySelectorAll('.history-delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        deleteHistoryEntry(btn.dataset.id);
        btn.closest('.history-entry').remove();
        toast('Entry deleted', 'info', 1000);
      });
    });
  }

  // ── Init ─────────────────────────────────────────
  function init() {
    var saved = loadConfig();
    if (saved) setFormValues(saved);

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var target = btn.getAttribute('data-target');
        document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        document.querySelectorAll('.tab-content').forEach(function(c) { c.classList.remove('active'); });
        btn.classList.add('active');
        var el = $(target);
        if (el) el.classList.add('active');
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') { e.preventDefault(); copyToClipboard(); }
      if (e.key === 'r' && !e.ctrlKey && !e.metaKey) { randomizeAll(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    });

    // Load presets (from global whorePresets set by presets.js)
    loadPresets();
    if (saved) setFormValues(saved);
    else renderPrompt();

    // Event bindings
    realismSlider.addEventListener('input', function() { realismValue.textContent = realismSlider.value; renderPrompt(); });
    fields.forEach(function(f) { var el = $(f); if (el) el.addEventListener('change', renderPrompt); });

    $('randomBtn').addEventListener('click', randomizeAll);
    $('copyBtn').addEventListener('click', copyToClipboard);
    $('quickCopyBtn').addEventListener('click', copyToClipboard);
    $('regenerateBtn').addEventListener('click', function() { renderPrompt(); toast('Prompt regenerated', 'info', 1200); });

    var historyBtn = $('historyBtn'); if (historyBtn) historyBtn.addEventListener('click', showHistory);
    var variationBtn = $('variationBtn'); if (variationBtn) variationBtn.addEventListener('click', applyVariation);
    var resetBtn = $('resetBtn'); if (resetBtn) resetBtn.addEventListener('click', resetAll);
    var exportBtn = $('exportBtn'); if (exportBtn) exportBtn.addEventListener('click', exportPresets);
    var importBtn = $('importBtn'); if (importBtn) importBtn.addEventListener('click', importPresets);
    var undoBtn = $('undoBtn'); if (undoBtn) undoBtn.addEventListener('click', undo);
    var redoBtn = $('redoBtn'); if (redoBtn) redoBtn.addEventListener('click', redo);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
