# Progress Tracker

Update this file whenever the current phase, active feature , or implementation state changes

## Current Phase

- In progress

## Current Goal

- Proceed to the next feature implementation unit.

## Completed

- Feature Spec 01: Design system and UI primitives setup.
- Feature Spec 02: Editor navbar, floating project sidebar shell, and reusable dialog pattern component.
- Feature Spec 03: Clerk provider integration, auth routes, protected-first proxy, root redirect flow, and editor user menu.
- Feature Spec 04: Editor home CTA, project create/rename/delete dialogs, owner-only sidebar project actions, and mobile sidebar scrim close behavior.
- Feature Spec 05: Prisma project/collaborator models, Prisma singleton client with Accelerate/direct branching, and initial migration.
- Feature Spec 06: Authenticated backend project API routes for list/create/rename/delete with owner-only mutation guards.
- Feature Spec 07: Editor home sidebar and dialogs wired to real project data and project mutation APIs.
- Feature Spec 08: Editor workspace shell with access control and layout placeholders.
- Feature Spec 09: Share dialog (owners can invite/remove collaborators, collaborators view-only).
- Feature Spec 10: Liveblocks realtime collaboration setup.
- Feature Spec 11: Base collaborative canvas (Liveblocks room wrapper + React Flow sync + shared canvas types).
- Feature Spec 12: Shape panel drag-and-drop node creation on the collaborative canvas.

## In Progress

- None currently.

## Next Up

- Proceed to the next feature implementation unit.

## Open Questions

- None currently.

## Architecture Decisions

- Adopted a protected-first `proxy.ts` strategy where only `/`, sign-in, and sign-up routes are public; all other routes require Clerk authentication.

## Session Notes

- Verified `context/current-issues.md` against current editor code and fixed confirmed regressions: canvas was boxed by top border + workspace card strip, layout sidebars were shrinking canvas instead of floating over it, and sidebar close state could leave a 1px remnant.
- Updated `editor-layout` so main canvas area stays full-width while both side panels float above it (`fixed` overlays with elevated styling instead of layout columns/margins).
- Updated `project-sidebar` hidden transform to move fully off-screen (`-translate-x-[calc(100%+1px)]`) so no peeking edge remains when closed.
- Updated `workspace-canvas` to remove card framing, keep the canvas flush (`bg-base`, no top border), and wire drag/drop handlers on both wrapper and `ReactFlow` pane for reliable node drops.
- Removed the workspace top metadata strip in `editor-workspace-client` so the dotted canvas fills the editor area naturally.
- Completed Feature Spec 11 from `context/feature-specs/11-base-canvas.md`.
- Completed Feature Spec 12 from `context/feature-specs/12-shape-panel.md`.
- Added a floating bottom-center shape panel (`components/editor/shape-panel.tsx`) with draggable buttons for rectangle, diamond, circle, pill, cylinder, and hexagon.
- Added shape drag payload utilities in `types/canvas.ts` (shape + default size serialization/parsing), including sensible shape defaults and shared MIME key.
- Added canvas wrapper `dragover`/`drop` handling in `components/editor/workspace-canvas.tsx` to parse payloads, convert client coordinates via React Flow `screenToFlowPosition`, and add nodes with empty labels, default color, and dragged shape.
- Node IDs now use the required shape + timestamp + counter pattern at drop time.
- Added basic custom canvas node renderer (`components/editor/canvas-basic-node.tsx`) and registered it as the `canvasNode` type so newly dropped nodes render immediately.
- Confirmed `bun run build` succeeds with Feature Spec 12 changes.
- Replaced the workspace canvas placeholder with `components/editor/workspace-canvas.tsx`, wiring `LiveblocksProvider`, `RoomProvider` (current room ID), `ClientSideSuspense` loading fallback, and a connection-error fallback boundary.
- Wired React Flow to Liveblocks with `useLiveblocksFlow` (suspense mode, empty initial nodes/edges) and rendered the base canvas with loose connection mode, `fitView`, `MiniMap`, and dotted `Background`.
- Added shared canvas contracts in `types/canvas.ts`, including node data (`label`, `color`, `shape`) and custom type identifiers (`canvasNode`, `canvasEdge`).
- Updated `components/editor/editor-workspace-client.tsx` and `app/editor/[roomId]/page.tsx` to pass the route room ID into the new canvas wrapper.
- Added global React Flow stylesheet import in `app/layout.tsx` (`@xyflow/react/dist/style.css`) for canvas rendering.
- Confirmed `bun run build` succeeds with Feature Spec 11 changes.
- Verified Feature Spec 10 against `context/feature-specs/10-liveblock-setup.md`; `liveblocks.config.ts`, `lib/liveblocks.ts`, and `POST /api/liveblocks-auth` match the required behavior (project access check, room ensure, user metadata on session token, and 403 on unauthorized access).
- Confirmed `bun run build` succeeds with the Liveblocks setup in place.
- Updated `lib/prisma.ts` to normalize PostgreSQL connection URLs to explicit `sslmode=verify-full` by default (except when `uselibpqcompat=true` is explicitly set), removing the runtime SSL mode deprecation warning risk from ambiguous modes.
- Logged active issue from `context/current-issues.md`: runtime security warning about implicit SSL mode aliasing in `pg`/`pg-connection-string` that changes in upcoming major versions.
- Added Prisma helper scripts in `package.json` that run Prisma CLI through `npx node@20` to work around a Node 22 + Prisma 7.8.0 ESM loading issue on Windows.
- Updated Prisma client output path to `../app/generated/prisma` in `prisma/schema.prisma` so generated client files resolve to the repo-level `app/generated/prisma` directory.
- Updated `prisma.config.ts` to load `.env.local` first (then `.env`) so existing project environment variables are used by Prisma commands.
- Added `components/editor/editor-navbar.tsx` with left/center/right sections and sidebar toggle icon state.
- Added `components/editor/project-sidebar.tsx` as a floating, slide-in overlay with tabs and placeholder states.
- Added `components/editor/dialog-pattern.tsx` to standardize title, description, and footer action layout for future dialogs.
- Added `components/editor/editor-layout.tsx` to compose navbar + floating sidebar in a reusable editor page shell.
- Wrapped `app/layout.tsx` with `ClerkProvider` using Clerk `dark` theme and appearance variables mapped to app CSS variables.
- Added reusable auth shell at `components/auth/auth-shell.tsx` and created `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx`.
- Added `proxy.ts` at project root with protected-first route guarding based on existing Clerk sign-in/sign-up env vars.
- Updated `/` to redirect authenticated users to `/editor` and unauthenticated users to sign-in.
- Moved editor shell to `app/editor/page.tsx` and added Clerk `UserButton` to the editor navbar.
- Lint and build now pass with the auth integration changes.
- Added `components/editor/use-project-dialogs.ts` to manage project dialog state, form state, loading state, and mock project mutations.
- Added `components/editor/project-dialogs.tsx` with Create, Rename, and Delete dialogs wired to editor actions.
- Updated `components/editor/project-sidebar.tsx` with owner-only rename/delete actions, shared project visibility rules, and a mobile backdrop scrim that closes the sidebar when tapped.
- Updated `app/editor/page.tsx` with the editor-home empty state content and wired `New Project` actions to the create dialog.
- Updated `prisma.config.ts` schema path to `prisma` to enable multi-file Prisma schema loading with `prisma/models/*`.
- Added `prisma/models/project.prisma` with `Project` and `ProjectCollaborator` models, `ProjectStatus` enum, required relations, constraints, and indexes.
- Added `lib/prisma.ts` cached singleton that uses `accelerateUrl` for `prisma+postgres://` and `PrismaPg` adapter for direct PostgreSQL connections.
- Created and applied initial migration `20260504044419_add_project_models` and regenerated Prisma client output in `app/generated/prisma`.
- Added `app/api/projects/route.ts` (GET/POST) and `app/api/projects/[projectId]/route.ts` (PATCH/DELETE) with Clerk auth checks, owner authorization for rename/delete, default create name fallback, and explicit `401`/`403` responses.
- Added `lib/project-data.ts` helper to fetch owned and shared projects server-side for `/editor` using Clerk auth + collaborator email matching.
- Converted `app/editor/page.tsx` into a server component that fetches project data and passes it into `components/editor/editor-home-client.tsx`.
- Implementing Feature Spec 09: Share dialog — added `components/editor/share-dialog.tsx`, UI in `components/editor/editor-workspace-client.tsx`, and new API route `app/api/projects/[projectId]/collaborators/route.ts` for listing/inviting/removing collaborators (owner-only for invite/remove).
- Refined Feature Spec 09 UI: redesigned share dialog with improved hierarchy, owner badge row, collaborator avatars/initials fallback, inline error states, and copy-link feedback; updated collaborators API GET access checks so only owner/collaborators can view and exposed role-aware payload for read-only collaborator experience.
- Added `hooks/use-project-actions.ts` to manage create/rename/delete dialog state and call `POST /api/projects`, `PATCH /api/projects/[id]`, and `DELETE /api/projects/[id]`.
- Wired create to slugify name + short suffix for room ID, create with aligned project ID/room ID, and navigate to `/editor/[projectId]` on success.
- Wired rename to refresh on success and delete to redirect to `/editor` when removing the active workspace (otherwise refresh).
- Updated create dialog preview to show room ID preview, rename dialog prefill behavior, and delete dialog project name binding with real project data.
- Updated `app/api/projects/route.ts` create handler to accept optional validated custom project IDs and reject invalid or duplicate IDs.
- Updated `liveblocks.config.ts` Presence and UserMeta typing to include cursor position, `isThinking`, and session user metadata (`displayName`, `avatarUrl`, `cursorColor`).
- Added `lib/liveblocks.ts` with a cached `@liveblocks/node` client and deterministic cursor-color helper derived from a fixed palette and user ID hash.
- Added `app/api/liveblocks-auth/route.ts` (`POST`) to require Clerk auth, verify project access via `checkProjectAccess`, ensure the project room exists, and return a Liveblocks session token scoped to the project room with user metadata attached.
- Redesigned the complete editor dashboard visual hierarchy across `editor-navbar`, `project-sidebar`, `editor-layout`, `editor-home-client`, and `editor-workspace-client` to use a cohesive dark workspace style with layered panels, stronger spacing rhythm, and a consistent top-level dashboard structure.
- Improved workspace presentation with a dedicated right-side assistant/spec panel, upgraded canvas loading/error surfaces, and refined project metadata strip above the canvas.
- Updated project list rows to be directly navigable links in the sidebar and aligned action affordances with clearer active-state styling.
- Fixed editor view token mismatches in `access-denied.tsx` and removed the `share-dialog` effect-driven state update causing the React hooks lint error.
