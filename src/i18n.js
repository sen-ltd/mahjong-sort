/**
 * i18n.js — Japanese / English UI strings
 */

export const TRANSLATIONS = {
  ja: {
    title: '麻雀並べ替え',
    subtitle: '手牌を正しい順序に並べましょう',
    newHand: '新しい手牌',
    checkOrder: '確認する',
    hintMode: 'ヒント表示',
    hideHint: 'ヒント非表示',
    timer: 'タイム',
    bestTimes: 'ベストタイム',
    correct: '正解！',
    incorrect: 'まだ並べ替えが必要です',
    mode: 'モード',
    modeAll: '全牌種',
    modeSimplified: '数牌のみ',
    tiles: '牌',
    count13: '13枚',
    count14: '14枚',
    theme: 'テーマ',
    hintLabel: '正しい順序',
    seconds: '秒',
    noRecord: '記録なし',
    rankLabel: (n) => `${n}位`,
    man: '萬子',
    pin: '筒子',
    sou: '索子',
    honor: '字牌',
    suits: {
      man: '萬',
      pin: '筒',
      sou: '索',
      honor: '字',
    },
  },
  en: {
    title: 'Mahjong Sort',
    subtitle: 'Arrange tiles in the correct order',
    newHand: 'New Hand',
    checkOrder: 'Check',
    hintMode: 'Show Hint',
    hideHint: 'Hide Hint',
    timer: 'Time',
    bestTimes: 'Best Times',
    correct: 'Correct!',
    incorrect: 'Not sorted yet',
    mode: 'Mode',
    modeAll: 'All tiles',
    modeSimplified: 'Numbers only',
    tiles: 'tiles',
    count13: '13 tiles',
    count14: '14 tiles',
    theme: 'Theme',
    hintLabel: 'Correct order',
    seconds: 's',
    noRecord: 'No record',
    rankLabel: (n) => `#${n}`,
    man: 'Characters',
    pin: 'Circles',
    sou: 'Bamboo',
    honor: 'Honors',
    suits: {
      man: 'm',
      pin: 'p',
      sou: 's',
      honor: 'z',
    },
  },
};

let currentLang = 'ja';

export function setLang(lang) {
  if (lang === 'ja' || lang === 'en') currentLang = lang;
}

export function getLang() {
  return currentLang;
}

export function t(key, ...args) {
  const dict = TRANSLATIONS[currentLang];
  const val = dict[key];
  if (typeof val === 'function') return val(...args);
  return val ?? key;
}
