/**
 * classNames — Utility for conditionally joining classNames
 * Stateless utility function
 */
export function classNames(...classes) {
  return classes
    .filter(Boolean)
    .flat()
    .join(" ");
}

export function cx(...args) {
  return classNames(...args);
}
