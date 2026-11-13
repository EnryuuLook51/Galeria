import type { Project } from '../types';

export const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** "rdmp" encuentra "roadmap": todas las letras en orden. */
function subsequence(needle: string, hay: string): boolean {
  let i = 0;
  for (const ch of hay) if (ch === needle[i] && ++i === needle.length) return true;
  return needle.length === 0;
}

export function host(url: string): string {
  try {
    return new URL(url).host.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/** Puntaje de un término contra un proyecto; 0 = no coincide. */
function scoreTerm(term: string, p: Project): number {
  const name = norm(p.name);
  if (name.startsWith(term)) return 100;
  if (name.split(/[\s\-—_]+/).some((w) => w.startsWith(term))) return 80;
  if (name.includes(term)) return 60;
  if (p.tags.some((t) => norm(t).startsWith(term))) return 50;
  if (norm(host(p.url)).includes(term) || norm(p.repo).includes(term)) return 40;
  if (norm(p.description).includes(term) || norm(p.path).includes(term)) return 25;
  if (term.length >= 3 && subsequence(term, name.replace(/\s+/g, ''))) return 15;
  return 0;
}

export function search(projects: Project[], query: string): Project[] {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  const byRecent = (a: Project, b: Project) =>
    Number(!!b.pinned) - Number(!!a.pinned) || b.updated.localeCompare(a.updated);

  if (!terms.length) return [...projects].sort(byRecent);

  return projects
    .map((p) => {
      let total = 0;
      for (const t of terms) {
        const s = scoreTerm(t, p);
        if (!s) return null;
        total += s;
      }
      return { p, total };
    })
    .filter((x): x is { p: Project; total: number } => x !== null)
    .sort((a, b) => b.total - a.total || byRecent(a.p, b.p))
    .map((x) => x.p);
}
