// Check if the given object is a class
export function isClass(obj) {
  return typeof obj === 'function' && /^class\s/.test(Function.prototype.toString.call(obj));
}

// Check if the given object is a function
export function isFunction(obj) {
  return typeof obj === 'function';
}
