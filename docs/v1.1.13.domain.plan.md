# DevThink v1.1.13 flat domain plan

## Final web tree

```text
web/
  App.tsx
  control.shell.tsx
  gateway.ts
  identity.ts
  const.ts
  index.css
  index.html
  home/
  providers/
  projects/
  routes/
  usage/
  notfound/
```

The root contains the single static application entry and explicitly named cross-domain contracts only. Each interaction visual, local type or behavior is owned by the page domain that renders it. There is no generic components, pages, app, contexts, hooks, lib, primitives or public directory.

## Ownership map

| Existing responsibility | New owner | Reason |
| --- | --- | --- |
| React mount, error boundary, route switch, dark class, toast and tooltip providers | `App.tsx` | One browser bootstrap and one application boundary. |
| Shared shell for providers, projects, routes and usage | `control.shell.tsx` | A flat, named control-workspace frame; it is not a generic infrastructure directory. |
| Button/card wrappers in Home and NotFound | Native semantic elements in their page domains | Their behavior and design are simple and page-specific. |
| Map stable callback and class join | `routes/map.tsx` | Each helper is used only by the Routes map. |
| IME, breakpoint and dialog helpers | Removed with unused generated UI wrappers | No active product view uses them after primitive removal. |
| Theme context and `next-themes` adapter | Removed | Paired Home preferences own the workbench `data-theme`; the root only provides a static default class. |
| Empty public marker and shadcn generator manifest | Removed | The static build does not require tracked public source or a generator configuration that points at deleted directories. |

## Interaction parity contract

| Product capability | Browser surface | CLI or Ink equivalent | Data owner |
| --- | --- | --- | --- |
| Chat and session tabs | Home route, tabs and command rail | Interactive workspace and chat command | Local CLI database |
| Provider selection | Providers route and paired gateway action | `providers` and `config` commands | Local CLI config and auth store |
| Projects, routes and usage | Named control routes | Matching control views and commands | Local database and gateway read models |
| Presentation settings | Paired Home settings surface | `config set` and `/settings` | Local `devthink.db` preferences |
| Pairing | Browser pairing panel | Pairing commands | Local CLI identity store |

Provider credentials, auth records, filesystem access and gateway lifecycle remain intentionally CLI-only. The browser never gains a secret-bearing equivalent.
