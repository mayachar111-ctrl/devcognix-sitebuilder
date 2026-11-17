/**
 * Minimal RFC 6902 JSON Patch (add, remove, replace, move, copy, test) with
 * RFC 6901 pointers. Small and dependency-free so it runs the same on the
 * server (compiling edits) and in the browser (applying them).
 */
export type Operation =
  | { op: "add" | "replace" | "test"; path: string; value: unknown }
  | { op: "remove"; path: string }
  | { op: "move" | "copy"; from: string; path: string };

type Container = Record<string, unknown> | unknown[];

const unescape = (s: string) => s.replace(/~1/g, "/").replace(/~0/g, "~");
export const pointer = (...parts: (string | number)[]) => "/" + parts.map((p) => String(p).replace(/~/g, "~0").replace(/\//g, "~1")).join("/");

function parse(path: string): string[] {
  if (path === "") return [];
  if (!path.startsWith("/")) throw new Error(`Invalid JSON pointer "${path}"`);
  return path.slice(1).split("/").map(unescape);
}

function parentOf(doc: unknown, path: string): [Container, string] {
  const parts = parse(path);
  if (!parts.length) throw new Error("Operations on the document root are not supported");
  let cur: unknown = doc;
  for (const p of parts.slice(0, -1)) {
    if (cur === null || typeof cur !== "object") throw new Error(`Path not found: ${path}`);
    cur = Array.isArray(cur) ? cur[Number(p)] : (cur as Record<string, unknown>)[p];
  }
  if (cur === null || typeof cur !== "object") throw new Error(`Path not found: ${path}`);
  return [cur as Container, parts[parts.length - 1]];
}

function arrayIndex(arr: unknown[], key: string, forAdd: boolean): number {
  if (key === "-" && forAdd) return arr.length;
  if (!/^(0|[1-9]\d*)$/.test(key)) throw new Error(`Bad array index "${key}"`);
  const i = Number(key);
  if (i > arr.length || (!forAdd && i >= arr.length)) throw new Error(`Index ${i} out of range`);
  return i;
}

function get(doc: unknown, path: string): unknown {
  let cur: unknown = doc;
  for (const p of parse(path)) {
    if (cur === null || typeof cur !== "object") throw new Error(`Path not found: ${path}`);
    cur = Array.isArray(cur) ? cur[arrayIndex(cur, p, false)] : (cur as Record<string, unknown>)[p];
  }
  return cur;
}

const clone = <T,>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));

/** Applies one operation, mutating `doc`. Throws on an invalid operation. */
export function applyOperation(doc: unknown, op: Operation): void {
  switch (op.op) {
    case "add": {
      const [parent, key] = parentOf(doc, op.path);
      if (Array.isArray(parent)) parent.splice(arrayIndex(parent, key, true), 0, clone(op.value));
      else parent[key] = clone(op.value);
      return;
    }
    case "replace": {
      const [parent, key] = parentOf(doc, op.path);
      if (Array.isArray(parent)) parent[arrayIndex(parent, key, false)] = clone(op.value);
      else {
        if (!(key in parent)) throw new Error(`Path not found: ${op.path}`);
        parent[key] = clone(op.value);
      }
      return;
    }
    case "remove": {
      const [parent, key] = parentOf(doc, op.path);
      if (Array.isArray(parent)) parent.splice(arrayIndex(parent, key, false), 1);
      else {
        if (!(key in parent)) throw new Error(`Path not found: ${op.path}`);
        delete parent[key];
      }
      return;
    }
    case "move":
    case "copy": {
      const value = clone(get(doc, op.from));
      if (op.op === "move") applyOperation(doc, { op: "remove", path: op.from });
      applyOperation(doc, { op: "add", path: op.path, value });
      return;
    }
    case "test":
      if (JSON.stringify(get(doc, op.path)) !== JSON.stringify(op.value)) throw new Error(`Test failed at ${op.path}`);
      return;
  }
}

/** Applies a whole patch atomically: returns a new document, input untouched. */
export function applyPatch<T>(doc: T, patch: Operation[]): T {
  const out = clone(doc);
  for (const op of patch) applyOperation(out, op);
  return out;
}
