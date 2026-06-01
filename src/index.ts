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

// ============================================================
// Core Types
// ============================================================

/** A single story in the griot's memory. */
export interface Story {
  /** Unique identifier. */
  id: string;
  /** Story title / praise name. */
  title: string;
  /** The narrative content. */
  content: string;
  /** When this story was last told. */
  lastTold: number;
  /** How many times this story has been told. */
  tellCount: number;
  /** Parent stories (genealogy). */
  parents: string[];
  /** Child stories (derivatives). */
  children: string[];
  /** Semantic weight (importance). */
  weight: number;
  /** Tags / categories. */
  tags: string[];
}

/** A griot (living memory keeper). */
export interface Griot {
  /** Griot identifier. */
  id: string;
  /** All stories in memory. */
  stories: Map<string, Story>;
  /** Current generation (for genealogy tracking). */
  generation: number;
  /** Memory decay rate (0 = perfect, 1 = instant forget). */
  decayRate: number;
}

/** A memory trace — how strongly a story is remembered. */
export interface MemoryTrace {
  storyId: string;
  strength: number;
  lastAccessed: number;
  accessCount: number;
}

// ============================================================
// Griot Memory Engine
// ============================================================

/** Create a new griot. */
export function createGriot(id: string, decayRate: number = 0.01): Griot {
  return {
    id,
    stories: new Map(),
    generation: 0,
    decayRate,
  };
}

/** Add a story to the griot's memory. */
export function addStory(
  griot: Griot,
  id: string,
  title: string,
  content: string,
  parents: string[] = [],
  tags: string[] = [],
  weight: number = 1.0,
): Story {
  const story: Story = {
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
export function tellStory(griot: Griot, storyId: string): Story | null {
  const story = griot.stories.get(storyId);
  if (!story) return null;

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
export function applyDecay(griot: Griot, currentTime: number = Date.now()): string[] {
  const forgotten: string[] = [];

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
export function memoryStrengths(griot: Griot, currentTime: number = Date.now()): MemoryTrace[] {
  const traces: MemoryTrace[] = [];

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

// ============================================================
// Praise Name Compression
// ============================================================

/** A praise name — dense semantic encoding of a story. */
export interface PraiseName {
  /** The name itself. */
  name: string;
  /** Encoded story IDs. */
  storyIds: string[];
  /** Compression ratio. */
  compressionRatio: number;
  /** Semantic density (bits of meaning per character). */
  density: number;
}

/** Generate a praise name that compresses related stories. */
export function generatePraiseName(
  griot: Griot,
  storyIds: string[],
  name: string,
): PraiseName | null {
  // Verify all stories exist
  const stories: Story[] = [];
  for (const id of storyIds) {
    const s = griot.stories.get(id);
    if (!s) return null;
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

// ============================================================
// Call and Response
// ============================================================

/** A call-and-response exchange between griots. */
export interface CallResponse {
  /** The calling griot. */
  caller: string;
  /** The responding griot. */
  responder: string;
  /** Story the caller invoked. */
  calledStory: string;
  /** Story the responder replied with. */
  responseStory: string;
  /** Semantic similarity between call and response. */
  similarity: number;
}

/** Perform a call-and-response between two griots. */
export function callAndResponse(
  caller: Griot,
  responder: Griot,
  calledStoryId: string,
  tagMatchThreshold: number = 0.3,
): CallResponse | null {
  const called = caller.stories.get(calledStoryId);
  if (!called) return null;

  // Find best matching story in responder's memory
  let bestMatch: Story | null = null;
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

  if (!bestMatch) return null;

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
export function genealogy(griot: Griot, storyId: string): string[][] {
  const story = griot.stories.get(storyId);
  if (!story) return [];

  const paths: string[][] = [];

  function dfs(currentId: string, path: string[]) {
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
export function descendants(griot: Griot, storyId: string): string[] {
  const result: string[] = [];
  const visited = new Set<string>();

  function dfs(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const story = griot.stories.get(id);
    if (!story) return;
    for (const childId of story.children) {
      result.push(childId);
      dfs(childId);
    }
  }

  dfs(storyId);
  return result;
}

/** Compute the oral tradition score — how well-preserved the memory is. */
export function traditionScore(griot: Griot): number {
  if (griot.stories.size === 0) return 0;

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
