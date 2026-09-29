/**
 * Production-only: URLs of the built layout.json assets. Kept in its own module
 * and imported dynamically so that, during `npm run dev`, editing a layout file
 * never enters the Vite module graph (which would force a full page reload after
 * every layout save).
 */
export const layoutUrls = import.meta.glob('/countries/*/layout.json', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
