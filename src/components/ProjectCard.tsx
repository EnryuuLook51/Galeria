import { forwardRef } from 'react';
import { ArrowUpRight, Copy, FolderOpen, Github, Pencil, Pin } from 'lucide-react';
import { host } from '../lib/search';
import { STATUS_LABEL, type Project } from '../types';

interface Props {
  project: Project;
  active: boolean;
  onHover: () => void;
  onOpen: () => void;
  onCopy: (text: string, what: string) => void;
  onEdit: () => void;
  onPin: () => void;
  onTag: (tag: string) => void;
}

const STATUS_STYLE: Record<Project['status'], string> = {
  online: 'bg-sage-dark',
  local: 'bg-graphite-dark',
  wip: 'bg-rust',
};

export const ProjectCard = forwardRef<HTMLLIElement, Props>(function ProjectCard(
  { project: p, active, onHover, onOpen, onCopy, onEdit, onPin, onTag },
  ref,
) {
  const target = p.url || p.repo;

  return (
    <li
      ref={ref}
      onMouseEnter={onHover}
      className={`group relative border-b border-ink/15 px-3 py-5 transition-colors sm:px-5 ${
        active ? 'bg-paper-deep' : 'hover:bg-paper-deep/60'
      }`}
    >
      {active && <span aria-hidden className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-rust" />}

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 flex-1 basis-72">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-display text-2xl font-medium leading-tight tracking-tight">
              {target ? (
                <a href={target} target="_blank" rel="noopener noreferrer" className="decoration-rust decoration-2 underline-offset-4 hover:underline">
                  {p.name}
                </a>
              ) : (
                p.name
              )}
            </h2>
            {p.pinned && <Pin size={14} className="-rotate-12 fill-rust text-rust" aria-label="Fijado" />}
            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-label text-graphite-dark">
              <i className={`h-2 w-2 rounded-full ${STATUS_STYLE[p.status]}`} />
              {STATUS_LABEL[p.status]}
            </span>
          </div>

          <p className="mt-1 font-mono text-[13px] text-ink-soft">
            {p.url ? (
              <span className="text-rust-dark">{host(p.url)}</span>
            ) : p.path ? (
              <span className="text-graphite-dark">~/{p.path}</span>
            ) : (
              <span className="text-graphite-dark">sin URL todavía</span>
            )}
          </p>

          {p.description && <p className="mt-2 max-w-[62ch] text-[17px] leading-snug text-ink-soft">{p.description}</p>}

          {p.tags.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <li key={t}>
                  <button
                    onClick={() => onTag(t)}
                    className="rounded-full border border-ink/20 px-2.5 py-0.5 font-mono text-[11px] text-ink-soft hover:border-rust hover:text-rust-dark"
                  >
                    {t}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          {target && (
            <button
              onClick={onOpen}
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 font-mono text-[12px] uppercase tracking-wider text-paper hover:bg-ink-soft"
            >
              Abrir <ArrowUpRight size={15} />
            </button>
          )}
          {p.url && (
            <IconBtn label="Copiar URL" onClick={() => onCopy(p.url, 'URL')}>
              <Copy size={16} />
            </IconBtn>
          )}
          {p.repo && p.url && (
            <a
              href={p.repo}
              target="_blank"
              rel="noopener noreferrer"
              title="Repositorio"
              aria-label="Repositorio"
              className="grid h-9 w-9 place-items-center rounded-md border border-ink/20 text-ink-soft hover:border-ink hover:text-ink"
            >
              <Github size={16} />
            </a>
          )}
          {p.path && !p.url && (
            <IconBtn label="Copiar carpeta" onClick={() => onCopy(p.path, 'carpeta')}>
              <FolderOpen size={16} />
            </IconBtn>
          )}
          <IconBtn label={p.pinned ? 'Desfijar' : 'Fijar arriba'} onClick={onPin}>
            <Pin size={16} className={p.pinned ? 'fill-rust text-rust' : ''} />
          </IconBtn>
          <IconBtn label="Editar" onClick={onEdit}>
            <Pencil size={16} />
          </IconBtn>
        </div>
      </div>
    </li>
  );
});

function IconBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-md border border-ink/20 text-ink-soft hover:border-ink hover:text-ink"
    >
      {children}
    </button>
  );
}
