/**
 * mahjong.js — Tile definitions, ordering, and hand generation
 * Covers standard Japanese mahjong (リーチ麻雀) tile set.
 */

/**
 * Tile structure:
 *   { id, suit, value, display, sortIndex }
 *
 * suit: 'man' | 'pin' | 'sou' | 'honor'
 * value: 1-9 for number tiles; 'E','S','W','N','White','Green','Red' for honors
 * display: human-readable label (e.g. "1m", "5p", "9s", "東", "白")
 * sortIndex: 0-33 canonical position
 */

// ── Tile definitions ──────────────────────────────────────────────────────────

const SUITS = ['man', 'pin', 'sou'];
const SUIT_SUFFIX = { man: 'm', pin: 'p', sou: 's' };

const HONOR_VALUES = ['E', 'S', 'W', 'N', 'White', 'Green', 'Red'];
const HONOR_DISPLAY = {
  E: '東',
  S: '南',
  W: '西',
  N: '北',
  White: '白',
  Green: '發',
  Red: '中',
};

/** All 34 unique tile types (index = sortIndex 0-33). */
export const ALL_TILES = (() => {
  const tiles = [];

  // Number tiles: man 1-9, pin 1-9, sou 1-9
  for (const suit of SUITS) {
    for (let v = 1; v <= 9; v++) {
      const idx = tiles.length;
      tiles.push({
        id: `${suit}-${v}`,
        suit,
        value: v,
        display: `${v}${SUIT_SUFFIX[suit]}`,
        sortIndex: idx,
      });
    }
  }

  // Honor tiles: E S W N White Green Red
  for (const val of HONOR_VALUES) {
    const idx = tiles.length;
    tiles.push({
      id: `honor-${val}`,
      suit: 'honor',
      value: val,
      display: HONOR_DISPLAY[val],
      sortIndex: idx,
    });
  }

  return tiles; // 34 entries
})();

// Fast lookup: id → tile
const TILE_BY_ID = Object.fromEntries(ALL_TILES.map(t => [t.id, t]));

// ── Key helpers ───────────────────────────────────────────────────────────────

/**
 * Returns a compact string key for a tile type.
 * man → "m1".."m9", pin → "p1".."p9", sou → "s1".."s9"
 * honors → "z1".."z7"  (East=z1 … Red=z7)
 */
export function getTileKey(tile) {
  if (tile.suit === 'honor') {
    return `z${HONOR_VALUES.indexOf(tile.value) + 1}`;
  }
  return `${SUIT_SUFFIX[tile.suit]}${tile.value}`;
}

/** Numeric sort key for a tile (0-33). */
export function tileOrder(tile) {
  return tile.sortIndex;
}

/** Comparison function for use with Array.sort(). */
export function compareTiles(a, b) {
  return tileOrder(a) - tileOrder(b);
}

/** Return a sorted copy of the tiles array. */
export function sortTiles(tiles) {
  return [...tiles].sort(compareTiles);
}

/** True iff tiles are already in correct (sorted) order. */
export function isCorrectOrder(tiles) {
  for (let i = 1; i < tiles.length; i++) {
    if (compareTiles(tiles[i - 1], tiles[i]) > 0) return false;
  }
  return true;
}

// ── Hand generation ───────────────────────────────────────────────────────────

/**
 * Generate a random hand of `count` tiles drawn from the full 136-tile set
 * (4 copies of each of the 34 types). Duplicates are allowed just as in
 * real mahjong.
 *
 * @param {number} count - Number of tiles to draw (typically 13 or 14)
 * @param {boolean} [simplified=false] - If true, only number tiles (no honors)
 * @returns {Array<Object>} Array of tile objects (may include duplicates)
 */
export function generateHand(count = 13, simplified = false) {
  const pool = simplified
    ? ALL_TILES.filter(t => t.suit !== 'honor')
    : ALL_TILES;

  // Build a 4-copy pool and shuffle via Fisher-Yates
  const deck = [];
  for (const tile of pool) {
    for (let i = 0; i < 4; i++) deck.push(tile);
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck.slice(0, count);
}
