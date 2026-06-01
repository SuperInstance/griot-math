"use strict";
/**
 * Griot Mathematics — Living Memory Systems
 *
 * Inspired by West African griot tradition: storytellers who are
 * living archives of genealogy, history, and knowledge.
 *
 * This module implements the mathematics of oral tradition:
 * - Stories as data structures with genealogical links
 * - Memory decay and reinforcement (use it or lose it)
 * - Call-and-response protocols for distributed memory
 * - Praise name compression (dense semantic encoding)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGriot = createGriot;
exports.addStory = addStory;
exports.tellStory = tellStory;
exports.applyDecay = applyDecay;
exports.memoryStrengths = memoryStrengths;
exports.generatePraiseName = generatePraiseName;
exports.callAndResponse = callAndResponse;
exports.genealogy = genealogy;
exports.descendants = descendants;
exports.traditionScore = traditionScore;
// ============================================================
// Griot Memory Engine
// ============================================================
/** Create a new griot. */
function createGriot(id, decayRate = 0.01) {
    return {
        id,
        stories: new Map(),
        generation: 0,
        decayRate,
    };
}
/** Add a story to the griot's memory. */
function addStory(griot, id, title, content, parents = [], tags = [], weight = 1.0) {
    const story = {
        id,
        title,
        content,
        lastTold: Date.now(),
        tellCount: 0,
        parents,
        children: [],
        weight,
        tags,
    };
    // Register with parents
    for (const parentId of parents) {
        const parent = griot.stories.get(parentId);
        if (parent && !parent.children.includes(id)) {
            parent.children.push(id);
        }
    }
    griot.stories.set(id, story);
    return story;
}
/** Tell a story — reinforces memory. */
function tellStory(griot, storyId) {
    const story = griot.stories.get(storyId);
    if (!story)
        return null;
    story.tellCount++;
    story.lastTold = Date.now();
    // Reinforce parent stories too (ancestral memory)
    for (const parentId of story.parents) {
        const parent = griot.stories.get(parentId);
        if (parent) {
            parent.tellCount++;
            parent.lastTold = Date.now();
        }
    }
    return story;
}
/** Apply memory decay — forget stories that haven't been told. */
function applyDecay(griot, currentTime = Date.now()) {
    const forgotten = [];
    for (const [id, story] of griot.stories) {
        const timeSinceTold = currentTime - story.lastTold;
        const decayAmount = griot.decayRate * (timeSinceTold / (1000 * 60 * 60 * 24)); // days
        story.weight = Math.max(0, story.weight - decayAmount);
        if (story.weight < 0.01 && story.tellCount === 0) {
            forgotten.push(id);
            griot.stories.delete(id);
        }
    }
    return forgotten;
}
/** Compute memory strength for all stories. */
function memoryStrengths(griot, currentTime = Date.now()) {
    const traces = [];
    for (const [id, story] of griot.stories) {
        const timeSinceTold = currentTime - story.lastTold;
        const decay = Math.exp(-griot.decayRate * timeSinceTold / (1000 * 60 * 60));
        const reinforcement = 1 + Math.log1p(story.tellCount);
        const strength = story.weight * decay * reinforcement;
        traces.push({
            storyId: id,
            strength,
            lastAccessed: story.lastTold,
            accessCount: story.tellCount,
        });
    }
    return traces.sort((a, b) => b.strength - a.strength);
}
/** Generate a praise name that compresses related stories. */
function generatePraiseName(griot, storyIds, name) {
    // Verify all stories exist
    const stories = [];
    for (const id of storyIds) {
        const s = griot.stories.get(id);
        if (!s)
            return null;
        stories.push(s);
    }
    const totalContent = stories.reduce((sum, s) => sum + s.content.length, 0);
    const compressionRatio = totalContent > 0 ? name.length / totalContent : 0;
    const totalSemanticWeight = stories.reduce((sum, s) => sum + s.weight, 0);
    const density = name.length > 0 ? totalSemanticWeight / name.length : 0;
    return {
        name,
        storyIds,
        compressionRatio,
        density,
    };
}
/** Perform a call-and-response between two griots. */
function callAndResponse(caller, responder, calledStoryId, tagMatchThreshold = 0.3) {
    const called = caller.stories.get(calledStoryId);
    if (!called)
        return null;
    // Find best matching story in responder's memory
    let bestMatch = null;
    let bestSimilarity = 0;
    for (const [, story] of responder.stories) {
        const commonTags = called.tags.filter(t => story.tags.includes(t));
        const unionTags = new Set([...called.tags, ...story.tags]).size;
        const similarity = unionTags > 0 ? commonTags.length / unionTags : 0;
        if (similarity > bestSimilarity && similarity >= tagMatchThreshold) {
            bestSimilarity = similarity;
            bestMatch = story;
        }
    }
    if (!bestMatch)
        return null;
    return {
        caller: caller.id,
        responder: responder.id,
        calledStory: calledStoryId,
        responseStory: bestMatch.id,
        similarity: bestSimilarity,
    };
}
// ============================================================
// Genealogy
// ============================================================
/** Get the full genealogy of a story (all ancestors). */
function genealogy(griot, storyId) {
    const story = griot.stories.get(storyId);
    if (!story)
        return [];
    const paths = [];
    function dfs(currentId, path) {
        const current = griot.stories.get(currentId);
        if (!current || current.parents.length === 0) {
            paths.push([...path]);
            return;
        }
        for (const parentId of current.parents) {
            path.push(parentId);
            dfs(parentId, path);
            path.pop();
        }
    }
    dfs(storyId, [storyId]);
    return paths;
}
/** Get all descendants of a story. */
function descendants(griot, storyId) {
    const result = [];
    const visited = new Set();
    function dfs(id) {
        if (visited.has(id))
            return;
        visited.add(id);
        const story = griot.stories.get(id);
        if (!story)
            return;
        for (const childId of story.children) {
            result.push(childId);
            dfs(childId);
        }
    }
    dfs(storyId);
    return result;
}
/** Compute the oral tradition score — how well-preserved the memory is. */
function traditionScore(griot) {
    if (griot.stories.size === 0)
        return 0;
    let totalWeight = 0;
    let reinforcedWeight = 0;
    for (const story of griot.stories.values()) {
        totalWeight += story.weight;
        if (story.tellCount > 0) {
            reinforcedWeight += story.weight * (1 + Math.log1p(story.tellCount));
        }
    }
    return totalWeight > 0 ? reinforcedWeight / totalWeight : 0;
}
