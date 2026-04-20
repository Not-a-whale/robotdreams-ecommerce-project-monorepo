/**
 * Server-side only (RSC, Server Actions, Route Handlers). Prefer `BACKEND_URL`
 * in Docker (e.g. http://api:3000) so fetches do not use localhost inside the container.
 */
export const SERVER_BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:3000';

/** Browser navigation and client absolute URLs — must be reachable from the user’s machine. */
export const PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';