/**
 * RFC 6902 JSON Patch utility
 * Supports: add, remove, replace, move, copy, test operations
 */

export type PatchOperation = 
  | { op: 'add'; path: string; value: unknown }
  | { op: 'remove'; path: string }
  | { op: 'replace'; path: string; value: unknown }
  | { op: 'move'; from: string; path: string }
  | { op: 'copy'; from: string; path: string }
  | { op: 'test'; path: string; value: unknown };

/**
 * Parse a JSON Pointer path into segments
 */
function parsePath(path: string): string[] {
  if (path === '') return [];
  if (!path.startsWith('/')) {
    throw new Error(`Invalid JSON Pointer: ${path}`);
  }
  return path.slice(1).split('/').map(segment => 
    segment.replace(/~1/g, '/').replace(/~0/g, '~')
  );
}

/**
 * Get value at path in object
 */
function getValueAtPath(obj: unknown, path: string): unknown {
  const segments = parsePath(path);
  let current: unknown = obj;
  
  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (Array.isArray(current)) {
      const index = segment === '-' ? current.length : parseInt(segment, 10);
      current = current[index];
    } else if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }
  
  return current;
}

/**
 * Set value at path in object (mutates the object)
 */
function setValueAtPath(obj: unknown, path: string, value: unknown): void {
  const segments = parsePath(path);
  if (segments.length === 0) {
    throw new Error('Cannot set root value');
  }
  
  let current: unknown = obj;
  
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (Array.isArray(current)) {
      const index = parseInt(segment, 10);
      if (current[index] === undefined) {
        // Create object or array based on next segment
        current[index] = isNaN(parseInt(segments[i + 1], 10)) ? {} : [];
      }
      current = current[index];
    } else if (typeof current === 'object' && current !== null) {
      const record = current as Record<string, unknown>;
      if (record[segment] === undefined) {
        record[segment] = isNaN(parseInt(segments[i + 1], 10)) ? {} : [];
      }
      current = record[segment];
    }
  }
  
  const lastSegment = segments[segments.length - 1];
  if (Array.isArray(current)) {
    const index = lastSegment === '-' ? current.length : parseInt(lastSegment, 10);
    current[index] = value;
  } else if (typeof current === 'object' && current !== null) {
    (current as Record<string, unknown>)[lastSegment] = value;
  }
}

/**
 * Remove value at path in object (mutates the object)
 */
function removeValueAtPath(obj: unknown, path: string): void {
  const segments = parsePath(path);
  if (segments.length === 0) {
    throw new Error('Cannot remove root value');
  }
  
  let current: unknown = obj;
  
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i];
    if (Array.isArray(current)) {
      current = current[parseInt(segment, 10)];
    } else if (typeof current === 'object' && current !== null) {
      current = (current as Record<string, unknown>)[segment];
    }
  }
  
  const lastSegment = segments[segments.length - 1];
  if (Array.isArray(current)) {
    const index = parseInt(lastSegment, 10);
    current.splice(index, 1);
  } else if (typeof current === 'object' && current !== null) {
    delete (current as Record<string, unknown>)[lastSegment];
  }
}

/**
 * Apply a single patch operation to an object (mutates the object)
 */
function applyOperation(obj: unknown, operation: PatchOperation): void {
  switch (operation.op) {
    case 'add':
    case 'replace':
      setValueAtPath(obj, operation.path, operation.value);
      break;
      
    case 'remove':
      removeValueAtPath(obj, operation.path);
      break;
      
    case 'move': {
      const value = getValueAtPath(obj, operation.from);
      removeValueAtPath(obj, operation.from);
      setValueAtPath(obj, operation.path, value);
      break;
    }
    
    case 'copy': {
      const value = getValueAtPath(obj, operation.from);
      setValueAtPath(obj, operation.path, JSON.parse(JSON.stringify(value)));
      break;
    }
    
    case 'test': {
      const actual = getValueAtPath(obj, operation.path);
      if (JSON.stringify(actual) !== JSON.stringify(operation.value)) {
        throw new Error(`Test failed: expected ${JSON.stringify(operation.value)}, got ${JSON.stringify(actual)}`);
      }
      break;
    }
  }
}

/**
 * Apply an array of JSON Patch operations to an object
 * Returns a new object with the patches applied
 */
export function applyPatches<T>(obj: T, patches: PatchOperation[]): T {
  // Deep clone to avoid mutating the original
  const result = JSON.parse(JSON.stringify(obj)) as T;
  
  for (const patch of patches) {
    applyOperation(result, patch);
  }
  
  return result;
}

/**
 * Validate that patches array is valid
 */
export function validatePatches(patches: unknown): patches is PatchOperation[] {
  if (!Array.isArray(patches)) return false;
  
  for (const patch of patches) {
    if (typeof patch !== 'object' || patch === null) return false;
    if (!('op' in patch) || !('path' in patch)) return false;
    
    const op = (patch as { op: string }).op;
    if (!['add', 'remove', 'replace', 'move', 'copy', 'test'].includes(op)) {
      return false;
    }
    
    // Check required fields based on operation
    if (['add', 'replace', 'test'].includes(op) && !('value' in patch)) {
      return false;
    }
    if (['move', 'copy'].includes(op) && !('from' in patch)) {
      return false;
    }
  }
  
  return true;
}
