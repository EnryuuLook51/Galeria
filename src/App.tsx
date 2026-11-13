import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download, Plus, RotateCcw, Search, Upload } from 'lucide-react';
import { ProjectCard } from './components/ProjectCard';
import { ProjectForm } from './components/ProjectForm';
import { norm, search } from './lib/search';
import { useProjects } from './lib/store';
import { STATUS_LABEL, type Project, type Status } from './types';

export default function App() {
  const { projects, save, remove, togglePin, replaceAll, reset } = useProjects();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const [active, setActive] = useState(0);
  const [editing, setEditing] = useState<Project | 'new' | null>(null);
  const [toast, setToast] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);

  const results = useMemo(
    () => search(projects, query).filter((p) => status === 'all' || p.status === status),
    [projects, query, status],
  );

  const topTags = useMemo(() => {
    const count = new Map<string, number>();
    projects.forEach((p) => p.tags.forEach((t) => count.set(t, (count.get(t) ?? 0) + 1)));
    return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 12).map(([t]) => t);
  }, [projects]);

  useEffect(() => setActive(0), [query, status]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? '' : t)), 1800);
  }, []);

  const open = useCallback((p: Project | undefined) => {
    const target = p && (p.url || p.repo);
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
  }, []);

  const copy = useCallback(
    async (text: string, what: string) => {
      try {
        await navigator.clipboard.writeText(text);
        flash(`${what} copiada`);
      } catch {
        flash('No se pudo copiar');
      }
    },
    [flash],
  );

  // "/" o Ctrl+K enfocan la búsqueda desde cualquier parte.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing) return;
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editing]);

  useEffect(() => {
    rowRefs.current[active]?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function onSearchKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      open(results[active]);
    } else if (e.key === 'Escape') {
      setQuery('');
    }
  }

  function addTag(tag: string) {
    const terms = norm(query).split(/\s+/).filter(Boolean);
    if (!terms.includes(norm(tag))) setQuery([query.trim(), tag].filter(Boolean).join(' '));
    inputRef.current?.focus();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(projects, null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'projects.json';
    a.click();
    URL.revokeObjectURL(a.href);
    flash('projects.json descargado');
  }

  async function importJson(file: File) {
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data) || !data.every((p) => p && typeof p.id === 'string' && typeof p.name === 'string')) throw new Error();
      replaceAll(
        data.map((p) => ({
          url: '',
          repo: '',
          description: '',
          tags: [],
          status: 'online',
          path: '',
          updated: '',
          ...p,
        })),
      );
      flash(`${data.length} proyectos importados`);
    } catch {
      flash('Ese archivo no es una lista de proyectos válida');
    }
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    projects.forEach((p) => (c[p.status] = (c[p.status] ?? 0) + 1));
    return c;
  }, [projects]);

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 pb-24 pt-10 sm:px-8 sm:pt-16">
      <header>
        <p className="font-hand text-2xl text-rust-dark">¿no te acuerdas de la URL?</p>
        <h1 className="font-display text-5xl font-light tracking-tight sm:text-6xl">
          mis proyectos<span className="text-rust">.</span>
        </h1>
      </header>

      <div className="sticky top-0 z-20 -mx-4 mt-8 bg-paper px-4 pb-3 pt-3 sm:-mx-8 sm:px-8">
        <label className="flex items-center gap-3 rounded-xl border-[1.5px] border-ink bg-paper px-4 py-3 shadow-[3px_3px_0_0_#242522] focus-within:shadow-[3px_3px_0_0_#D98252]">
          <Search size={22} className="shrink-0 text-graphite-dark" />
          <input
            ref={inputRef}
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearchKey}
            placeholder="Busca un proyecto…"
            aria-label="Buscar proyectos"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent font-body text-xl text-ink placeholder:text-graphite focus:outline-none"
          />
          <kbd className="hidden rounded border border-ink/25 px-1.5 font-mono text-[11px] text-graphite-dark sm:block">/</kbd>
        </label>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex flex-wrap gap-1" role="group" aria-label="Estado">
            {(['all', ...Object.keys(STATUS_LABEL)] as (Status | 'all')[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                aria-pressed={status === s}
                className={`rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider ${
                  status === s ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-paper-deep'
                }`}
              >
                {s === 'all' ? 'Todos' : STATUS_LABEL[s]} <span className="opacity-60">{counts[s] ?? 0}</span>
              </button>
            ))}
          </div>
          <p className="ml-auto hidden font-mono text-[11px] text-graphite-dark md:block">↑ ↓ elegir · Enter abrir · Esc limpiar</p>
        </div>

        {topTags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {topTags.map((t) => (
              <button
                key={t}
                onClick={() => addTag(t)}
                className="rounded-full border border-dashed border-ink/25 px-2.5 py-0.5 font-mono text-[11px] text-graphite-dark hover:border-rust hover:text-rust-dark"
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      <main className="mt-2">
        {results.length > 0 ? (
          <ul aria-label="Resultados" className="border-t border-ink/15">
            {results.map((p, i) => (
              <ProjectCard
                key={p.id}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                project={p}
                active={i === active}
                onHover={() => setActive(i)}
                onOpen={() => open(p)}
                onCopy={copy}
                onEdit={() => setEditing(p)}
                onPin={() => togglePin(p.id)}
                onTag={addTag}
              />
            ))}
          </ul>
        ) : (
          <div className="py-16 text-center">
            <p className="font-display text-2xl">Nada con «{query}».</p>
            <p className="mt-2 text-ink-soft">Prueba con menos palabras, o añádelo si es nuevo.</p>
            <button onClick={() => setEditing('new')} className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 font-mono text-[12px] uppercase tracking-wider text-paper">
              <Plus size={15} /> Añadir proyecto
            </button>
          </div>
        )}
      </main>

      <footer className="mt-10 flex flex-wrap items-center gap-2">
        <button onClick={() => setEditing('new')} className="inline-flex items-center gap-1.5 rounded-md bg-ink px-4 py-2 font-mono text-[12px] uppercase tracking-wider text-paper hover:bg-ink-soft">
          <Plus size={15} /> Añadir proyecto
        </button>
        <FootBtn onClick={exportJson} icon={<Download size={14} />}>
          Exportar
        </FootBtn>
        <FootBtn onClick={() => fileRef.current?.click()} icon={<Upload size={14} />}>
          Importar
        </FootBtn>
        <FootBtn
          onClick={() => {
            if (confirm('¿Volver a la lista original de projects.json? Se pierden los cambios hechos en este navegador.')) reset();
          }}
          icon={<RotateCcw size={14} />}
        >
          Restablecer
        </FootBtn>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importJson(f);
            e.target.value = '';
          }}
        />
        <p className="w-full pt-3 text-[15px] leading-snug text-graphite-dark">
          Los cambios se guardan en este navegador. Para tenerlos en todos tus dispositivos, exporta y reemplaza{' '}
          <code className="font-mono text-[13px]">src/data/projects.json</code> en el repo.
        </p>
      </footer>

      {editing && (
        <ProjectForm
          initial={editing === 'new' ? null : editing}
          takenIds={projects.map((p) => p.id)}
          onClose={() => setEditing(null)}
          onSave={(p) => {
            save(p);
            setEditing(null);
            flash('Guardado');
          }}
          onDelete={(id) => {
            remove(id);
            setEditing(null);
            flash('Borrado');
          }}
        />
      )}

      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 font-mono text-[12px] text-paper shadow-lg transition-all ${
          toast ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
        }`}
      >
        {toast}
      </div>
    </div>
  );
}

function FootBtn({ onClick, icon, children }: { onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 rounded-md border border-ink/25 px-3 py-2 font-mono text-[12px] uppercase tracking-wider text-ink-soft hover:border-ink hover:text-ink">
      {icon} {children}
    </button>
  );
}
