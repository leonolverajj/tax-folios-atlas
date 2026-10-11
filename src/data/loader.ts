/**
 * Country registry + lazy loading.
 *
 * Countries are discovered with import.meta.glob over `countries/<id>/`, so
 * adding a folder is all that is needed to add a country: no renderer or
 * registry code changes.
 */
import {
  countrySchema,
  flattenRevenue,
  layoutSchema,
  presentationSchema,
  revenueFileSchema,
  sourcesFileSchema,
  structureSchema,
  taxesFileSchema,
  type CountryBundle,
  type CountryMeta,
  type Layout,
  type Structure,
} from './schema';

const metaModules = import.meta.glob('/countries/*/country.json', { eager: true, import: 'default' }) as Record<string, unknown>;
const taxesLoaders = import.meta.glob('/countries/*/taxes.json', { import: 'default' });
const revenueLoaders = import.meta.glob('/countries/*/revenue.json', { import: 'default' });
const sourcesLoaders = import.meta.glob('/countries/*/sources.json', { import: 'default' });
const presentationLoaders = import.meta.glob('/countries/*/presentation.json', { import: 'default' });
const structureLoaders = import.meta.glob('/countries/*/structure.json', { import: 'default' });
const backgroundUrls = import.meta.glob('/countries/*/background.webp', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

// Countries marked "draft" are work in progress: visible while developing (npm run dev), hidden from the built site.
export const registry: CountryMeta[] = Object.entries(metaModules)
  .map(([, raw]) => countrySchema.parse(raw))
  .filter((c) => c.researchStatus !== 'draft' || import.meta.env.DEV)
  .sort((a, b) => a.names.en.localeCompare(b.names.en));

export const registryById = new Map(registry.map((c) => [c.id, c]));
export const registryByNumeric = new Map(registry.map((c) => [c.isoNumeric, c]));

const pick = (loaders: Record<string, () => Promise<unknown>>, id: string, file: string): (() => Promise<unknown>) => {
  const key = `/countries/${id}/${file}`;
  const fn = loaders[key];
  if (!fn) throw new Error(`Missing data file for country "${id}" (${key})`);
  return fn;
};

export const LAYOUT_DRAFT_KEY = (id: string) => `tfa:layout-draft:${id}:v1`;

/** In dev the layout comes from the dev API (always fresh from disk); in production from the built asset. */
export async function fetchPublishedLayout(id: string): Promise<Layout> {
  let url: string | undefined;
  if (import.meta.env.DEV) url = `/__tfa/layout/${id}`;
  else url = (await import('./layoutUrls')).layoutUrls[`/countries/${id}/layout.json`];
  if (!url) throw new Error(`No layout.json for ${id}`);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not load layout for ${id} (HTTP ${res.status})`);
  return layoutSchema.parse(await res.json());
}

export function readLayoutDraft(id: string): Layout | null {
  try {
    const raw = localStorage.getItem(LAYOUT_DRAFT_KEY(id));
    if (!raw) return null;
    return layoutSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

/**
 * Countries that have the harmonised OECD layer in `profiles/` but no folio yet: the queue for
 * the next folios. Only their names are read here (the trees screen lists them as "not drawn yet");
 * the figures stay in the files until the folio is built.
 */
const profileNames = import.meta.glob('/profiles/*.json', { eager: true, import: 'names' }) as Record<string, { en: string }>;
export const queuedCountries: { id: string; name: string }[] = Object.entries(profileNames)
  .map(([path, n]) => ({ id: path.split('/').pop()!.replace(/\.json$/, ''), name: n.en }))
  .filter((c) => !registryById.has(c.id))
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Just what the skill-tree screen needs from a folio: the hierarchy, the revenue and the labels.
 * It leaves out sources, layout and background so that loading every country stays light.
 */
export async function loadTreeBundle(id: string): Promise<CountryBundle> {
  const meta = registryById.get(id);
  if (!meta) throw new Error(`Unknown country "${id}"`);
  const [taxes, revenue, presentation, structure] = await Promise.all([
    pick(taxesLoaders, id, 'taxes.json')(),
    pick(revenueLoaders, id, 'revenue.json')(),
    pick(presentationLoaders, id, 'presentation.json')(),
    loadStructure(id),
  ]);
  const revenueFile = revenueFileSchema.parse(revenue);
  return {
    meta,
    instruments: taxesFileSchema.parse(taxes).instruments,
    observations: flattenRevenue(revenueFile),
    unavailable: revenueFile.unavailable,
    sources: [],
    presentation: presentationSchema.parse(presentation),
    layout: { version: 1, canvas: { width: 1600, height: 1000 }, positions: {}, radii: {} },
    structure,
  };
}

/** The harmonised cross-country layer of one country, or undefined if it has none yet. */
export async function loadStructure(id: string): Promise<Structure | undefined> {
  const fn = structureLoaders[`/countries/${id}/structure.json`];
  return fn ? structureSchema.parse(await fn()) : undefined;
}

export async function loadCountry(id: string, opts: { useDraft?: boolean } = {}): Promise<CountryBundle> {
  const meta = registryById.get(id);
  if (!meta) throw new Error(`Unknown country "${id}"`);
  const [taxes, revenue, sources, presentation, publishedLayout, structure] = await Promise.all([
    pick(taxesLoaders, id, 'taxes.json')(),
    pick(revenueLoaders, id, 'revenue.json')(),
    pick(sourcesLoaders, id, 'sources.json')(),
    pick(presentationLoaders, id, 'presentation.json')(),
    fetchPublishedLayout(id),
    loadStructure(id),
  ]);
  const revenueFile = revenueFileSchema.parse(revenue);
  const draft = opts.useDraft ? readLayoutDraft(id) : null;
  return {
    meta,
    instruments: taxesFileSchema.parse(taxes).instruments,
    observations: flattenRevenue(revenueFile),
    unavailable: revenueFile.unavailable,
    sources: sourcesFileSchema.parse(sources).sources,
    presentation: presentationSchema.parse(presentation),
    layout: draft ?? publishedLayout,
    structure,
    // `?nobg` renders the bare live folio (used in the background-art workflow to compare art against real geometry).
    backgroundUrl: new URLSearchParams(location.search).has('nobg') ? undefined : backgroundUrls[`/countries/${id}/background.webp`],
  };
}

export async function loadPublishedLayout(id: string): Promise<Layout> {
  return fetchPublishedLayout(id);
}
