/**
 * classNames — Conditional CSS class joining utility
 * WHAT:  Accepts any number of arguments (strings, arrays, falsy values),
 *        filters out falsy entries, flattens arrays, and joins with space.
 * HOW:   Each argument is truthiness-filtered, then .flat() handles nested
 *        arrays, and .join(" ") produces the final class string.
 *        cx() is an alias for convenience / muscle memory compatibility.
 * WHY:   Avoids template-literal class strings cluttered with && ternaries.
 *        classNames("btn", isActive && "btn--active") is cleaner than
 *        `btn ${isActive ? "btn--active" : ""}`. Loosely based on the
 *        popular jedwatson/classnames API.
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
