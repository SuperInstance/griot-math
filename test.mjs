import { createGriot, addStory, tellStory, applyDecay, memoryStrengths,
  generatePraiseName, callAndResponse, genealogy, descendants, traditionScore } from './dist/index.js';

let pass = 0, fail = 0;
function assert(cond, msg) { if (!cond) { fail++; console.error(`FAIL: ${msg}`); } else { pass++; } }

// Test 1: Create griot
const g = createGriot('test');
assert(g.id === 'test', 'griot id');
assert(g.stories.size === 0, 'empty stories');

// Test 2: Add story
const s = addStory(g, 's1', 'First', 'Once upon a time', [], ['myth'], 1.0);
assert(s.id === 's1', 'story id');
assert(g.stories.size === 1, 'one story');

// Test 3: Tell story
tellStory(g, 's1');
tellStory(g, 's1');
assert(g.stories.get('s1').tellCount === 2, 'tell count');

// Test 4: Parent-child
addStory(g, 'parent', 'Parent', 'P');
const child = addStory(g, 'child', 'Child', 'C', ['parent']);
assert(child.parents.includes('parent'), 'has parent');
assert(g.stories.get('parent').children.includes('child'), 'parent knows child');

// Test 5: Tell child reinforces parent
tellStory(g, 'child');
assert(g.stories.get('parent').tellCount === 1, 'parent reinforced');

// Test 6: Tell nonexistent
assert(tellStory(g, 'nope') === null, 'null for missing');

// Test 7: Memory decay
const g2 = createGriot('decay', 0.5);
addStory(g2, 'weak', 'W', 'W', [], [], 0.02);
const future = Date.now() + 10 * 24 * 60 * 60 * 1000;
const forgotten = applyDecay(g2, future);
assert(forgotten.includes('weak'), 'weak story forgotten');

// Test 8: Memory strengths
const g3 = createGriot('str');
addStory(g3, 'old', 'O', 'O', [], [], 1.0);
addStory(g3, 'new', 'N', 'N', [], [], 1.0);
tellStory(g3, 'new'); tellStory(g3, 'new');
const strengths = memoryStrengths(g3);
assert(strengths.length === 2, 'two traces');
assert(strengths[0].strength >= strengths[1].strength, 'sorted');

// Test 9: Praise name
addStory(g, 's2', 'Legend', 'Long content here');
const pn = generatePraiseName(g, ['s1', 's2'], 'The Great Name');
assert(pn !== null, 'praise name created');
assert(pn.name === 'The Great Name', 'name');
assert(pn.compressionRatio > 0, 'compression');

// Test 10: Praise name missing
assert(generatePraiseName(g, ['nope'], 'X') === null, 'null for missing');

// Test 11: Call and response
const g4 = createGriot('g4');
const g5 = createGriot('g5');
addStory(g4, 'call', 'C', 'C', [], ['war', 'hero']);
addStory(g5, 'resp', 'R', 'R', [], ['war', 'battle']);
const cr = callAndResponse(g4, g5, 'call');
assert(cr !== null, 'call response found');
assert(cr.responseStory === 'resp', 'response id');

// Test 12: No match
const g6 = createGriot('g6');
const g7 = createGriot('g7');
addStory(g6, 'c', 'C', 'C', [], ['peace']);
addStory(g7, 'r', 'R', 'R', [], ['war']);
assert(callAndResponse(g6, g7, 'c', 0.9) === null, 'no match');

// Test 13: Genealogy
const gg = createGriot('gen');
addStory(gg, 'grand', 'G', 'G');
addStory(gg, 'parent', 'P', 'P', ['grand']);
addStory(gg, 'child', 'C', 'C', ['parent']);
const paths = genealogy(gg, 'child');
assert(paths.length > 0, 'has paths');
assert(paths[0].includes('child'), 'starts with child');

// Test 14: Descendants
const desc = descendants(gg, 'grand');
assert(desc.includes('parent'), 'parent is descendant');
assert(desc.includes('child'), 'child is descendant');

// Test 15: Tradition score
assert(traditionScore(createGriot('empty')) === 0, 'empty score');
const g8 = createGriot('ts');
addStory(g8, 's', 'S', 'C', [], [], 1.0);
const before = traditionScore(g8);
tellStory(g8, 's');
const after = traditionScore(g8);
assert(after >= before, 'score increases');

// Test 16: Decay reduces weight
const g9 = createGriot('d', 0.5);
addStory(g9, 'x', 'X', 'X', [], [], 1.0);
applyDecay(g9, Date.now() + 5 * 24 * 60 * 60 * 1000);
assert(g9.stories.get('x').weight < 1.0, 'weight decayed');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
