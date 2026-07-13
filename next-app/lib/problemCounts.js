// Ported from src/js/domHelper.js (isPrime + generateOptions).
// Kept as a small, framework-agnostic helper: problem count must be a
// non-prime number between 4 and 36 (inclusive) so the grid can be
// factored into a sensible rows x columns layout (see gridManager.js).

export const MIN_PROBLEM_COUNT = 4;
export const MAX_PROBLEM_COUNT = 36;
export const DEFAULT_PROBLEM_COUNT = MIN_PROBLEM_COUNT;

export function isPrime(n) {
  if (typeof n !== "number") {
    throw new Error("N must be a number");
  }
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      return false;
    }
  }
  return true;
}

export function getValidProblemCounts() {
  const counts = [];
  for (let i = MIN_PROBLEM_COUNT; i <= MAX_PROBLEM_COUNT; i++) {
    if (!isPrime(i)) {
      counts.push(i);
    }
  }
  return counts;
}
