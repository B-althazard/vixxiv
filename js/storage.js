const STORAGE_KEYS = {
  CONFIG: 'whoregen_config',
  HISTORY: 'whoregen_history',
  CUSTOM_PRESETS: 'whoregen_custom_presets',
  UNDO_STACK: 'whoregen_undo',
  REDO_STACK: 'whoregen_redo'
};

const MAX_HISTORY = 50;
const MAX_UNDO = 30;

function get(key, fallback = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function set(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

export function saveConfig(config) {
  set(STORAGE_KEYS.CONFIG, config);
}

export function loadConfig() {
  return get(STORAGE_KEYS.CONFIG, null);
}

export function addToHistory(prompt) {
  const history = get(STORAGE_KEYS.HISTORY, []);
  const entry = {
    prompt,
    timestamp: Date.now(),
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)
  };
  history.unshift(entry);
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
  set(STORAGE_KEYS.HISTORY, history);
}

export function getHistory() {
  return get(STORAGE_KEYS.HISTORY, []);
}

export function clearHistory() {
  set(STORAGE_KEYS.HISTORY, []);
}

export function deleteHistoryEntry(id) {
  const history = get(STORAGE_KEYS.HISTORY, []);
  const filtered = history.filter(h => h.id !== id);
  set(STORAGE_KEYS.HISTORY, filtered);
}

export function saveCustomPresets(presets) {
  set(STORAGE_KEYS.CUSTOM_PRESETS, presets);
}

export function loadCustomPresets() {
  return get(STORAGE_KEYS.CUSTOM_PRESETS, []);
}

export function pushUndo(state) {
  const stack = get(STORAGE_KEYS.UNDO_STACK, []);
  stack.push(state);
  if (stack.length > MAX_UNDO) stack.shift();
  set(STORAGE_KEYS.UNDO_STACK, stack);
  set(STORAGE_KEYS.REDO_STACK, []);
}

export function popUndo() {
  const stack = get(STORAGE_KEYS.UNDO_STACK, []);
  const state = stack.pop();
  set(STORAGE_KEYS.UNDO_STACK, stack);
  return state;
}

export function pushRedo(state) {
  const stack = get(STORAGE_KEYS.REDO_STACK, []);
  stack.push(state);
  set(STORAGE_KEYS.REDO_STACK, stack);
}

export function popRedo() {
  const stack = get(STORAGE_KEYS.REDO_STACK, []);
  const state = stack.pop();
  set(STORAGE_KEYS.REDO_STACK, stack);
  return state;
}

export function canUndo() {
  return (get(STORAGE_KEYS.UNDO_STACK, []).length > 0);
}

export function canRedo() {
  return (get(STORAGE_KEYS.REDO_STACK, []).length > 0);
}

export function clearUndoRedo() {
  set(STORAGE_KEYS.UNDO_STACK, []);
  set(STORAGE_KEYS.REDO_STACK, []);
}
