const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) return false;
  return Object.getPrototypeOf(value) === Object.prototype;
};

export const areStringArraysEqual = (left: string[], right: string[]) => {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
};

export const isDeepEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    if (left.length !== right.length) return false;
    return left.every((value, index) => isDeepEqual(value, right[index]));
  }

  if (isPlainObject(left) || isPlainObject(right)) {
    if (!isPlainObject(left) || !isPlainObject(right)) return false;

    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;

    return leftKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(right, key)
        ? isDeepEqual(left[key], right[key])
        : false,
    );
  }

  return false;
};
