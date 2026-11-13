import { useCallback, useEffect, useState } from 'react';
import seed from '../data/projects.json';
import type { Project } from '../types';

const KEY = 'proyectos:v1';
const base = seed as Project[];

interface Saved {
  projects: Project[];
  /** ids del JSON base que borraste desde la app, para que no reaparezcan. */
  removed: string[];
}

function load(): Saved {
  let saved: Saved = { projects: [], removed: [] };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) saved = { ...saved, ...JSON.parse(raw) };
  } catch {
    /* almacenamiento bloqueado o corrupto: se usa solo el JSON */
  }
  // Los proyectos nuevos de projects.json aparecen aunque ya tengas datos guardados.
  const known = new Set([...saved.projects.map((p) => p.id), ...saved.removed]);
  return { ...saved, projects: [...saved.projects, ...base.filter((p) => !known.has(p.id))] };
}

export function useProjects() {
  const [state, setState] = useState<Saved>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* sin almacenamiento: los cambios duran hasta recargar */
    }
  }, [state]);

  const save = useCallback((p: Project) => {
    const stamped = { ...p, updated: new Date().toISOString().slice(0, 10) };
    setState((s) => {
      const exists = s.projects.some((x) => x.id === p.id);
      return {
        ...s,
        projects: exists ? s.projects.map((x) => (x.id === p.id ? stamped : x)) : [stamped, ...s.projects],
      };
    });
  }, []);

  const remove = useCallback((id: string) => {
    setState((s) => ({
      projects: s.projects.filter((x) => x.id !== id),
      removed: base.some((b) => b.id === id) ? [...new Set([...s.removed, id])] : s.removed,
    }));
  }, []);

  const togglePin = useCallback((id: string) => {
    setState((s) => ({ ...s, projects: s.projects.map((x) => (x.id === id ? { ...x, pinned: !x.pinned } : x)) }));
  }, []);

  const replaceAll = useCallback((projects: Project[]) => {
    setState({ projects, removed: base.map((b) => b.id).filter((id) => !projects.some((p) => p.id === id)) });
  }, []);

  const reset = useCallback(() => setState({ projects: [...base], removed: [] }), []);

  return { projects: state.projects, save, remove, togglePin, replaceAll, reset };
}

export function slugify(s: string): string {
  return (
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'proyecto'
  );
}
