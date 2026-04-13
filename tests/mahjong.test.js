import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  ALL_TILES,
  generateHand,
  tileOrder,
  sortTiles,
  isCorrectOrder,
  compareTiles,
  getTileKey,
} from '../src/mahjong.js';

// ── ALL_TILES ─────────────────────────────────────────────────────────────────

describe('ALL_TILES', () => {
  it('has exactly 34 unique tile types', () => {
    assert.equal(ALL_TILES.length, 34);
  });

  it('contains 9 man tiles', () => {
    const man = ALL_TILES.filter(t => t.suit === 'man');
    assert.equal(man.length, 9);
  });

  it('contains 9 pin tiles', () => {
    const pin = ALL_TILES.filter(t => t.suit === 'pin');
    assert.equal(pin.length, 9);
  });

  it('contains 9 sou tiles', () => {
    const sou = ALL_TILES.filter(t => t.suit === 'sou');
    assert.equal(sou.length, 9);
  });

  it('contains 7 honor tiles', () => {
    const honor = ALL_TILES.filter(t => t.suit === 'honor');
    assert.equal(honor.length, 7);
  });

  it('all tiles have unique ids', () => {
    const ids = ALL_TILES.map(t => t.id);
    const unique = new Set(ids);
    assert.equal(unique.size, 34);
  });

  it('sortIndex runs 0-33 consecutively', () => {
    const indices = ALL_TILES.map(t => t.sortIndex).sort((a, b) => a - b);
    for (let i = 0; i < 34; i++) {
      assert.equal(indices[i], i);
    }
  });
});

// ── tileOrder ─────────────────────────────────────────────────────────────────

describe('tileOrder', () => {
  it('returns values in [0, 33]', () => {
    for (const t of ALL_TILES) {
      const o = tileOrder(t);
      assert.ok(o >= 0 && o <= 33, `tileOrder(${t.id}) = ${o} out of range`);
    }
  });

  it('man tiles come before pin tiles', () => {
    const man9 = ALL_TILES.find(t => t.suit === 'man' && t.value === 9);
    const pin1 = ALL_TILES.find(t => t.suit === 'pin' && t.value === 1);
    assert.ok(tileOrder(man9) < tileOrder(pin1));
  });

  it('pin tiles come before sou tiles', () => {
    const pin9 = ALL_TILES.find(t => t.suit === 'pin' && t.value === 9);
    const sou1 = ALL_TILES.find(t => t.suit === 'sou' && t.value === 1);
    assert.ok(tileOrder(pin9) < tileOrder(sou1));
  });

  it('sou tiles come before honor tiles', () => {
    const sou9 = ALL_TILES.find(t => t.suit === 'sou' && t.value === 9);
    const east = ALL_TILES.find(t => t.value === 'E');
    assert.ok(tileOrder(sou9) < tileOrder(east));
  });

  it('honor order is E < S < W < N < White < Green < Red', () => {
    const get = v => ALL_TILES.find(t => t.value === v);
    const honors = ['E', 'S', 'W', 'N', 'White', 'Green', 'Red'].map(get);
    for (let i = 1; i < honors.length; i++) {
      assert.ok(tileOrder(honors[i - 1]) < tileOrder(honors[i]),
        `${honors[i-1].value} should precede ${honors[i].value}`);
    }
  });
});

// ── compareTiles ──────────────────────────────────────────────────────────────

describe('compareTiles', () => {
  it('returns negative when a < b', () => {
    const a = ALL_TILES.find(t => t.suit === 'man' && t.value === 1);
    const b = ALL_TILES.find(t => t.suit === 'man' && t.value === 2);
    assert.ok(compareTiles(a, b) < 0);
  });

  it('returns 0 for identical tiles', () => {
    const a = ALL_TILES[5];
    assert.equal(compareTiles(a, a), 0);
  });

  it('returns positive when a > b', () => {
    // East (sortIndex 27) comes after sou-9 (sortIndex 26)
    const sou9 = ALL_TILES.find(t => t.suit === 'sou' && t.value === 9);
    const east = ALL_TILES.find(t => t.value === 'E');
    // east > sou9  →  compareTiles(east, sou9) > 0
    assert.ok(compareTiles(east, sou9) > 0);
    // sou9 < east  →  compareTiles(sou9, east) < 0
    assert.ok(compareTiles(sou9, east) < 0);
  });

  it('is antisymmetric: sign(compareTiles(a,b)) == -sign(compareTiles(b,a))', () => {
    const a = ALL_TILES[3];
    const b = ALL_TILES[20];
    const ab = compareTiles(a, b);
    const ba = compareTiles(b, a);
    assert.ok(Math.sign(ab) === -Math.sign(ba));
  });
});

// ── sortTiles ─────────────────────────────────────────────────────────────────

describe('sortTiles', () => {
  it('returns a sorted copy', () => {
    const hand = [
      ALL_TILES.find(t => t.suit === 'sou' && t.value === 5),
      ALL_TILES.find(t => t.suit === 'man' && t.value === 3),
      ALL_TILES.find(t => t.value === 'Red'),
      ALL_TILES.find(t => t.suit === 'pin' && t.value === 7),
    ];
    const sorted = sortTiles(hand);
    assert.ok(isCorrectOrder(sorted), 'sortTiles result is not in correct order');
  });

  it('does not mutate the original array', () => {
    const hand = [ALL_TILES[10], ALL_TILES[0], ALL_TILES[5]];
    const original = [...hand];
    sortTiles(hand);
    assert.deepEqual(hand, original);
  });

  it('handles already-sorted input', () => {
    const hand = [ALL_TILES[0], ALL_TILES[1], ALL_TILES[2]];
    const sorted = sortTiles(hand);
    assert.ok(isCorrectOrder(sorted));
  });
});

// ── isCorrectOrder ────────────────────────────────────────────────────────────

describe('isCorrectOrder', () => {
  it('returns true for a sorted hand', () => {
    const hand = [
      ALL_TILES.find(t => t.suit === 'man' && t.value === 1),
      ALL_TILES.find(t => t.suit === 'man' && t.value === 9),
      ALL_TILES.find(t => t.suit === 'pin' && t.value === 3),
      ALL_TILES.find(t => t.suit === 'sou' && t.value === 7),
      ALL_TILES.find(t => t.value === 'E'),
    ];
    assert.equal(isCorrectOrder(hand), true);
  });

  it('returns false for unsorted hand', () => {
    const hand = [
      ALL_TILES.find(t => t.suit === 'sou' && t.value === 9),
      ALL_TILES.find(t => t.suit === 'man' && t.value === 1),
    ];
    assert.equal(isCorrectOrder(hand), false);
  });

  it('returns true for single-tile hand', () => {
    assert.equal(isCorrectOrder([ALL_TILES[0]]), true);
  });

  it('returns true for empty hand', () => {
    assert.equal(isCorrectOrder([]), true);
  });

  it('returns false even when one pair is out of order', () => {
    const hand = [
      ALL_TILES[0],
      ALL_TILES[2],
      ALL_TILES[1], // out of order
    ];
    assert.equal(isCorrectOrder(hand), false);
  });
});

// ── generateHand ──────────────────────────────────────────────────────────────

describe('generateHand', () => {
  it('returns exactly 13 tiles by default', () => {
    const hand = generateHand(13);
    assert.equal(hand.length, 13);
  });

  it('returns exactly 14 tiles when requested', () => {
    const hand = generateHand(14);
    assert.equal(hand.length, 14);
  });

  it('allows duplicate tile types (real mahjong deck)', () => {
    // Run many times; at some point we should see duplicates
    let foundDuplicate = false;
    for (let trial = 0; trial < 100; trial++) {
      const hand = generateHand(13);
      const ids = hand.map(t => t.id);
      if (new Set(ids).size < ids.length) { foundDuplicate = true; break; }
    }
    // This is probabilistic but virtually certain with 100 trials and 13 draws from 34 types
    assert.ok(foundDuplicate, 'Expected duplicate tiles in at least one of 100 hands');
  });

  it('simplified mode returns only number tiles', () => {
    for (let i = 0; i < 10; i++) {
      const hand = generateHand(13, true);
      for (const tile of hand) {
        assert.notEqual(tile.suit, 'honor', 'Found honor tile in simplified mode');
      }
    }
  });

  it('normal mode can include honor tiles', () => {
    let foundHonor = false;
    for (let i = 0; i < 50 && !foundHonor; i++) {
      const hand = generateHand(13, false);
      if (hand.some(t => t.suit === 'honor')) foundHonor = true;
    }
    assert.ok(foundHonor, 'Expected honor tile in at least one of 50 hands');
  });

  it('tiles are valid tile objects with required fields', () => {
    const hand = generateHand(13);
    for (const tile of hand) {
      assert.ok(tile.id, 'Missing id');
      assert.ok(tile.suit, 'Missing suit');
      assert.ok(tile.display, 'Missing display');
      assert.ok(typeof tile.sortIndex === 'number', 'Missing sortIndex');
    }
  });
});

// ── getTileKey ────────────────────────────────────────────────────────────────

describe('getTileKey', () => {
  it('returns correct key for man tiles', () => {
    const m1 = ALL_TILES.find(t => t.suit === 'man' && t.value === 1);
    assert.equal(getTileKey(m1), 'm1');
    const m9 = ALL_TILES.find(t => t.suit === 'man' && t.value === 9);
    assert.equal(getTileKey(m9), 'm9');
  });

  it('returns correct key for pin tiles', () => {
    const p5 = ALL_TILES.find(t => t.suit === 'pin' && t.value === 5);
    assert.equal(getTileKey(p5), 'p5');
  });

  it('returns correct key for sou tiles', () => {
    const s9 = ALL_TILES.find(t => t.suit === 'sou' && t.value === 9);
    assert.equal(getTileKey(s9), 's9');
  });

  it('returns z1 for East (East=first honor)', () => {
    const east = ALL_TILES.find(t => t.value === 'E');
    assert.equal(getTileKey(east), 'z1');
  });

  it('returns z7 for Red (Chun=last honor)', () => {
    const red = ALL_TILES.find(t => t.value === 'Red');
    assert.equal(getTileKey(red), 'z7');
  });

  it('produces unique keys for all 34 tile types', () => {
    const keys = ALL_TILES.map(getTileKey);
    const unique = new Set(keys);
    assert.equal(unique.size, 34, 'Tile keys are not all unique');
  });
});
