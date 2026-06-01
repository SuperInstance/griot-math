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
/** Create a new griot. */
export declare function createGriot(id: string, decayRate?: number): Griot;
/** Add a story to the griot's memory. */
export declare function addStory(griot: Griot, id: string, title: string, content: string, parents?: string[], tags?: string[], weight?: number): Story;
/** Tell a story — reinforces memory. */
export declare function tellStory(griot: Griot, storyId: string): Story | null;
/** Apply memory decay — forget stories that haven't been told. */
export declare function applyDecay(griot: Griot, currentTime?: number): string[];
/** Compute memory strength for all stories. */
export declare function memoryStrengths(griot: Griot, currentTime?: number): MemoryTrace[];
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
export declare function generatePraiseName(griot: Griot, storyIds: string[], name: string): PraiseName | null;
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
export declare function callAndResponse(caller: Griot, responder: Griot, calledStoryId: string, tagMatchThreshold?: number): CallResponse | null;
/** Get the full genealogy of a story (all ancestors). */
export declare function genealogy(griot: Griot, storyId: string): string[][];
/** Get all descendants of a story. */
export declare function descendants(griot: Griot, storyId: string): string[];
/** Compute the oral tradition score — how well-preserved the memory is. */
export declare function traditionScore(griot: Griot): number;
