export type Status = 'online' | 'local' | 'wip';

export interface Project {
  id: string;
  name: string;
  /** URL pública (Vercel, etc.). Vacío si aún no está publicado. */
  url: string;
  /** Repositorio en GitHub u otro. */
  repo: string;
  description: string;
  tags: string[];
  status: Status;
  /** Carpeta en tu PC, para los proyectos que solo corren en local. */
  path: string;
  /** Fecha ISO de la última vez que lo editaste. */
  updated: string;
  pinned?: boolean;
}

export const STATUS_LABEL: Record<Status, string> = {
  online: 'Publicado',
  local: 'Solo local',
  wip: 'En progreso',
};
