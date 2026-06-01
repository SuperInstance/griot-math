const { createGriot, addStory, tellStory, applyDecay, memoryStrengths,
  generatePraiseName, callAndResponse, genealogy, descendants, traditionScore } = require('./dist/index.js');

let pass = 0, fail = 0;
function assert(cond, msg) { if (!cond) { fail++; console.error(`FAIL: ${msg}`); } else { pass++; } }

const g = createGriot('test');
assert(g.id === 'test', 'griot id');
assert(g.stories.size === 0, 'empty');

const s = addStory(g, 's1', 'First', 'Content', [], ['myth'], 1.0);
assert(s.id === 's1', 'story id');
assert(g.stories.size === 1, 'one story');

tellStory(g, 's1'); tellStory(g, 's1');
assert(g.stories.get('s1').tellCount === 2, 'tell count');

addStory(g, 'parent', 'Parent', 'P');
const child = addStory(g, 'child', 'Child', 'C', ['parent']);
assert(child.parents.includes('parent'), 'has parent');
assert(g.stories.get('parent').children.includes('child'), 'parent knows');
tellStory(g, 'child');
assert(g.stories.get('parent').tellCount === 1, 'reinforced');

assert(tellStory(g, 'nope') === null, 'null missing');

const g2 = createGriot('d', 0.1);
addStory(g2, 'w', 'W', 'W', [], [], 0.02);
const f = applyDecay(g2, Date.now() + 10*24*60*60*1000);
assert(f.includes('w'), 'forgotten');

const g3 = createGriot('s');
addStory(g3, 'a', 'A', 'A', [], [], 1.0);
addStory(g3, 'b', 'B', 'B', [], [], 1.0);
tellStory(g3, 'b'); tellStory(g3, 'b');
const str = memoryStrengths(g3);
assert(str.length === 2, 'traces');
assert(str[0].strength >= str[1].strength, 'sorted');

addStory(g, 's2', 'Legend', 'Long content');
const pn = generatePraiseName(g, ['s1', 's2'], 'Great');
assert(pn && pn.name === 'Great', 'praise name');
assert(pn.compressionRatio > 0, 'compression');
assert(generatePraiseName(g, ['no'], 'X') === null, 'null');

const g4 = createGriot('g4'), g5 = createGriot('g5');
addStory(g4, 'c', 'C', 'C', [], ['war', 'hero']);
addStory(g5, 'r', 'R', 'R', [], ['war', 'battle']);
const cr = callAndResponse(g4, g5, 'c');
assert(cr && cr.responseStory === 'r', 'response');

const g6 = createGriot('g6'), g7 = createGriot('g7');
addStory(g6, 'c', 'C', 'C', [], ['peace']);
addStory(g7, 'r', 'R', 'R', [], ['war']);
assert(callAndResponse(g6, g7, 'c', 0.9) === null, 'no match');

const gg = createGriot('gen');
addStory(gg, 'grand', 'G', 'G');
addStory(gg, 'p', 'P', 'P', ['grand']);
addStory(gg, 'c', 'C', 'C', ['p']);
const paths = genealogy(gg, 'c');
assert(paths.length > 0, 'paths');
const desc = descendants(gg, 'grand');
assert(desc.includes('p') && desc.includes('c'), 'descendants');

assert(traditionScore(createGriot('e')) === 0, 'empty score');

const g8 = createGriot('ts');
addStory(g8, 's', 'S', 'C', [], [], 1.0);
const b = traditionScore(g8); tellStory(g8, 's');
assert(traditionScore(g8) >= b, 'score up');

const g9 = createGriot('d', 0.1);
addStory(g9, 'x', 'X', 'X', [], [], 5.0);
applyDecay(g9, Date.now() + 1*24*60*60*1000);
assert(g9.stories.get('x').weight < 5.0, 'decayed');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
