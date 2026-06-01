# griot-math

> Living memory mathematics for JavaScript — West African griot oral tradition as decay, genealogy, and federated memory.

## What This Does

`griot-math` models oral memory systems inspired by West African griots. Stories have importance weights that decay exponentially over time but are boosted by retelling. It tracks story genealogy, generates praise names (lossy compression), performs call-and-response similarity matching, and supports federated memory networks. Use it for caching with cultural decay, knowledge graphs, or distributed memory.

## The Cultural Root

See the Python version (`griot-math` on PyPI) for the full cultural background. Griots maintain oral histories where frequently told stories survive — memory as exponential decay with reinforcement.

## Install

```bash
npm install griot-math
```

## Quick Start

```typescript
import { Griot, generatePraiseName, callAndResponse, Federation } from "griot-math";

const griot = new Griot();
const s1 = griot.addStory({ name: "The founding", weight: 1.0, tags: ["history"] });
const s2 = griot.addStory({ name: "The flood", weight: 0.8, parentId: s1, tags: ["disaster"] });

griot.tellStory(s1);  // Boost weight
griot.tellStory(s1);
griot.applyDecay(3600);  // 1 hour decay

const strengths = griot.memoryStrengths();
const score = griot.traditionScore();

// Praise names
const praise = generatePraiseName(griot, [s1, s2], "Keeper of Origins");

// Federation
const g2 = new Griot();
g2.addStory({ name: "Another tale", weight: 0.5 });
const fed = new Federation([griot, g2]);
fed.syncStory(0, 1, s2);
```

## API Reference

### `Griot`
- `addStory({ name, weight, parentId?, tags? }) → string`
- `findStory(name) → Story | undefined`
- `tellStory(name) → number`
- `applyDecay(elapsedMs) → void`
- `memoryStrengths() → number[]`
- `traditionScore() → number`

### `generatePraiseName(griot, storyIds, name) → PraiseName`
### `callAndResponse(caller, responder, callerStoryName) → CallResponse`
### `genealogy(griot, storyName) → Story[]`
### `descendants(griot, storyName) → Story[]`
### `Federation(griots)` — `syncStory()`, `mergeMemories()`, `coverage()`

## License

MIT
