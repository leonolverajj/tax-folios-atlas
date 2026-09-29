/** Node-side loader for country folders (used by validate, layouts, backgrounds, verify). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  countrySchema,
  flattenRevenue,
  layoutSchema,
  presentationSchema,
  profileSchema,
  revenueFileSchema,
  sourcesFileSchema,
  structureSchema,
  taxesFileSchema,
  type CountryBundle,
  type ProfileFile,
} from '../../src/data/schema';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const COUNTRIES_DIR = path.join(ROOT, 'countries');

export const FILES = ['country.json', 'taxes.json', 'revenue.json', 'sources.json', 'presentation.json', 'layout.json'] as const;

export function listCountryIds(): string[] {
  return fs
    .readdirSync(COUNTRIES_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(COUNTRIES_DIR, d.name, 'country.json')))
    .map((d) => d.name)
    .sort();
}

export const PROFILES_DIR = path.join(ROOT, 'profiles');

/** Ids of the profile-only countries (harmonised layer, no folio yet). */
export function listProfileIds(): string[] {
  if (!fs.existsSync(PROFILES_DIR)) return [];
  return fs
    .readdirSync(PROFILES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}

export function loadProfileFile(id: string): ProfileFile {
  const file = path.join(PROFILES_DIR, `${id}.json`);
  try {
    return profileSchema.parse(readJson(file));
  } catch (e) {
    const err = e as { issues?: { path: (string | number)[]; message: string }[]; message: string };
    const detail = err.issues ? err.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n') : err.message;
    throw new Error(`profiles/${id}.json failed schema validation:\n${detail}`);
  }
}

export function readJson(file: string): unknown {
  const text = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON in ${path.relative(ROOT, file)}: ${(e as Error).message}`);
  }
}

export function countryDir(id: string): string {
  return path.join(COUNTRIES_DIR, id);
}

export function writeJson(file: string, data: unknown): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

/** Loads and parses (with zod) every file of a country. Throws a readable error on schema failure. */
export function loadBundle(id: string, opts: { layoutOptional?: boolean } = {}): CountryBundle {
  const dir = countryDir(id);
  const parse = <T>(schema: { parse: (v: unknown) => T }, file: string): T => {
    try {
      return schema.parse(readJson(path.join(dir, file)));
    } catch (e) {
      const err = e as { issues?: { path: (string | number)[]; message: string }[]; message: string };
      const detail = err.issues ? err.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n') : err.message;
      throw new Error(`${id}/${file} failed schema validation:\n${detail}`);
    }
  };
  const meta = parse(countrySchema, 'country.json');
  const taxes = parse(taxesFileSchema, 'taxes.json');
  const revenueFile = parse(revenueFileSchema, 'revenue.json');
  const sources = parse(sourcesFileSchema, 'sources.json');
  const presentation = parse(presentationSchema, 'presentation.json');
  let layout;
  const layoutPath = path.join(dir, 'layout.json');
  if (fs.existsSync(layoutPath)) layout = parse(layoutSchema, 'layout.json');
  else if (opts.layoutOptional) layout = { version: 1 as const, canvas: { width: 1600, height: 1000 }, positions: {}, radii: {} };
  else throw new Error(`${id}/layout.json is missing (run "npm run layouts:init")`);
  const structurePath = path.join(dir, 'structure.json');
  const structure = fs.existsSync(structurePath) ? parse(structureSchema, 'structure.json') : undefined;
  let observations;
  try {
    observations = flattenRevenue(revenueFile);
  } catch (e) {
    const err = e as { issues?: { path: (string | number)[]; message: string }[]; message: string };
    const detail = err.issues ? err.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n') : err.message;
    throw new Error(`${id}/revenue.json rows failed validation after applying group defaults:\n${detail}`);
  }
  return {
    meta,
    instruments: taxes.instruments,
    observations,
    unavailable: revenueFile.unavailable,
    sources: sources.sources,
    presentation,
    layout,
    structure,
  };
}
