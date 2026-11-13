import { useEffect, useRef, useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { slugify } from '../lib/store';
import { STATUS_LABEL, type Project, type Status } from '../types';

interface Props {
  initial: Project | null;
  takenIds: string[];
  onSave: (p: Project) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const empty: Project = {
  id: '',
  name: '',
  url: '',
  repo: '',
  description: '',
  tags: [],
  status: 'online',
  path: '',
  updated: '',
};

function fixUrl(u: string): string {
  const t = u.trim();
  if (!t) return '';
  return /^[a-z]+:\/\//i.test(t) ? t : `https://${t}`;
}

export function ProjectForm({ initial, takenIds, onSave, onDelete, onClose }: Props) {
  const [p, setP] = useState<Project>(initial ?? empty);
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [confirmDel, setConfirmDel] = useState(false);
  const first = useRef<HTMLInputElement>(null);
  const isNew = !initial;

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = <K extends keyof Project>(k: K, v: Project[K]) => setP((x) => ({ ...x, [k]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    let id = p.id;
    if (isNew) {
      const baseId = slugify(p.name);
      id = baseId;
      for (let n = 2; takenIds.includes(id); n++) id = `${baseId}-${n}`;
    }
    onSave({
      ...p,
      id,
      name: p.name.trim(),
      url: fixUrl(p.url),
      repo: fixUrl(p.repo),
      description: p.description.trim(),
      path: p.path.trim(),
      tags: [...new Set(tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean))],
    });
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6" onMouseDown={onClose}>
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-paper p-5 shadow-2xl sm:rounded-2xl sm:p-7"
        aria-label={isNew ? 'Añadir proyecto' : 'Editar proyecto'}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium">{isNew ? 'Añadir proyecto' : 'Editar proyecto'}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-md hover:bg-paper-deep">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4">
          <Field label="Nombre">
            <input ref={first} required value={p.name} onChange={(e) => set('name', e.target.value)} className={input} placeholder="Roadmap CS" />
          </Field>
          <Field label="URL pública" hint="Lo que abre el botón «Abrir»">
            <input value={p.url} onChange={(e) => set('url', e.target.value)} className={input} placeholder="roadmap.vercel.app" inputMode="url" />
          </Field>
          <Field label="Repositorio">
            <input value={p.repo} onChange={(e) => set('repo', e.target.value)} className={input} placeholder="github.com/usuario/repo" inputMode="url" />
          </Field>
          <Field label="Descripción" hint="Escribe las palabras con las que lo buscarías">
            <textarea value={p.description} onChange={(e) => set('description', e.target.value)} rows={3} className={`${input} resize-y`} />
          </Field>
          <Field label="Etiquetas" hint="Separadas por comas">
            <input value={tags} onChange={(e) => setTags(e.target.value)} className={input} placeholder="react, portafolio, estudio" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Estado">
              <select value={p.status} onChange={(e) => set('status', e.target.value as Status)} className={input}>
                {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Carpeta local">
              <input value={p.path} onChange={(e) => set('path', e.target.value)} className={input} placeholder="Desktop/apps/..." />
            </Field>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
          {!isNew ? (
            confirmDel ? (
              <span className="flex items-center gap-2 font-mono text-[12px]">
                ¿Seguro?
                <button type="button" onClick={() => onDelete(p.id)} className="rounded-md bg-rust-dark px-3 py-1.5 text-paper">
                  Sí, borrar
                </button>
                <button type="button" onClick={() => setConfirmDel(false)} className="px-2 py-1.5 underline">
                  No
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmDel(true)} className="inline-flex items-center gap-1.5 font-mono text-[12px] text-rust-dark hover:underline">
                <Trash2 size={14} /> Borrar
              </button>
            )
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 font-mono text-[12px] uppercase tracking-wider hover:bg-paper-deep">
              Cancelar
            </button>
            <button type="submit" className="rounded-md bg-ink px-4 py-2 font-mono text-[12px] uppercase tracking-wider text-paper hover:bg-ink-soft">
              Guardar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const input =
  'w-full rounded-md border border-ink/25 bg-paper px-3 py-2 font-body text-[17px] text-ink placeholder:text-graphite focus:border-ink focus:outline-none';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="flex items-baseline justify-between gap-3 font-mono text-[11px] uppercase tracking-label text-graphite-dark">
        {label}
        {hint && <span className="normal-case tracking-normal">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
