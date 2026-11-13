# Mis proyectos

Índice personal para encontrar un proyecto y abrirlo sin acordarte de su URL.
React + Vite + TypeScript · Tailwind · pnpm.

```bash
pnpm install
pnpm dev      # http://localhost:5173
pnpm build    # dist/
```

## Uso

- Escribe para buscar (nombre, etiquetas, dominio, descripción, carpeta). Tolera tildes y abreviaturas (`rdmp` → Roadmap).
- `/` o `Ctrl+K` enfocan la búsqueda · `↑ ↓` eligen · `Enter` abre · `Esc` limpia.
- Fija arriba los que más usas con el alfiler.

## Dónde viven los datos

- `src/data/projects.json` es la lista base que se publica.
- Lo que añades o editas desde la app se guarda en el navegador (`localStorage`).
- Para que un cambio llegue a todos tus dispositivos: **Exportar** → reemplaza `src/data/projects.json` → commit y push. Vercel vuelve a publicar solo.
- Si añades un proyecto nuevo al JSON, aparece también en navegadores que ya tienen datos guardados.

## Vercel

Importa el repo en vercel.com. Detecta Vite: build `pnpm build`, salida `dist`.
