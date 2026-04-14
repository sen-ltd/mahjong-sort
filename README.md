# 麻雀並べ替え — Mahjong Sort

Japanese mahjong tile sorting practice game. Arrange a shuffled hand into the correct order as fast as possible.

## Features

- **13 or 14 tiles** drawn from a realistic 136-tile deck (4 copies of each type)
- **Drag & drop** reordering (mouse + touch)
- **Timer** — measures sorting speed to one decimal place
- **Best times** — top 5 stored in `localStorage`
- **Hint mode** — shows the correct target order
- **Two modes**: All tiles (萬子・筒子・索子・字牌) or Numbers only
- **Japanese / English UI** toggle
- **Dark / light theme** (persisted in `localStorage`)

## Tile order

Correct sorting order follows standard Japanese mahjong convention:

| Suit | Tiles | Range |
|------|-------|-------|
| 萬子 (Characters) | 1m – 9m | 0–8 |
| 筒子 (Circles) | 1p – 9p | 9–17 |
| 索子 (Bamboo) | 1s – 9s | 18–26 |
| 字牌 (Honors) | 東南西北白發中 | 27–33 |

## Getting started

```bash
# Serve locally (no build step required)
npm run serve
# → http://localhost:8080
```

## Tests

```bash
npm test
```

Tests cover tile definitions, ordering, hand generation, and helper functions using Node.js built-in test runner.

## Structure

```
mahjong-sort/
├── index.html          # Entry point
├── style.css           # All styles (CSS custom properties, dark mode)
├── src/
│   ├── main.js         # DOM, drag/drop, game flow
│   ├── mahjong.js      # Tile model, ordering, hand generation
│   └── i18n.js         # ja/en translations
├── tests/
│   └── mahjong.test.js # 15+ unit tests
└── assets/             # Screenshots
```

## License

MIT © 2026 SEN LLC (SEN 合同会社)

<!-- sen-publish:links -->
## Links

- 🌐 Demo: https://sen.ltd/portfolio/mahjong-sort/
- 📝 dev.to: https://dev.to/sendotltd/a-mahjong-tile-sorting-practice-game-34-tiles-strict-ordering-timer-based-4a3m
<!-- /sen-publish:links -->
