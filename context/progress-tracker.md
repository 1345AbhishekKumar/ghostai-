# Progress Tracker

Update this file whenever the current phase, active feature , or implementation state changes

## Current Phase

- Bug fixing and stability improvements.

## Current Goal

- Fix runtime issues: Liveblocks storage type mismatch, canvas rendering, autosave 404 handling, and specs route 404.

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
- Feature Spec 13: Proper node shape renderer (CSS/SVG) and shape drag ghost preview.
- Feature Spec 14: Canvas node resizing and inline label editing connected to collaborative state.
- Feature Spec 15: Floating color toolbar for node background and text color pairs.
- Feature Spec 16: Custom edge rendering, connection handles, and inline label editing.
- Feature Spec 17: Starter template library.
- Feature Spec 18: Present Avatars & Cursor.
- Feature Spec 19: Canvas Ergonomics (Zoom, Undo/Redo, Shortcuts).
- Trigger.dev SDK installed and root scaffold added with `trigger.config.ts` plus a starter task example.
- Feature Spec 20: AI Sidebar Shell (Assistant and Spec tabs, toggling, chat UI).
- Feature Spec 21: Canvas Autosave (Vercel Blob persistence, initial load logic, debounced hook, status indicator).
- Feature Spec 22: Design Agent API logic (Trigger.dev task wiring, TaskRun tracking, and token issuance).
- Feature Spec 23: AI Design Agent Logic (Trigger.dev task implementing Gemini + Liveblocks mutations, real-time presence, and status tracking).
- Feature Spec 24: AI Presence State (Shared AI activity indicators, status feed, and cursor thinking indicators).
- Feature Spec 25: Sidebar Chat Feed (Collaborative real-time room chat using separate Liveblocks `ai-chat` feed).
- Feature Spec 26: Design Agent Frontend (Consolidated AI design API, real-time status tracking, and final AI message logic).
- Feature Spec 27: Technical Specification Generation Flow (Backend trigger route, token route, and Trigger.dev task).
- Feature Spec 28: Technical Specification Download (Prisma ProjectSpec model, Vercel Blob persistence, and secure download route).
- Feature Spec 29: Spec UI Integration (Spec list in AI sidebar, preview modal with Markdown content, and download actions).

## In Progress

- None currently.

## Next Up

- Final deployment preparation and end-to-end testing.

## Open Questions

- None currently.

## Architecture Decisions

- Adopted a protected-first `proxy.ts` strategy where only `/`, sign-in, and sign-up routes are public; all other routes require Clerk authentication.
- Used Vercel Blob for canvas JSON persistence and Prisma for metadata (Feature Spec 21).
- Moved Liveblocks `RoomProvider` to `EditorWorkspaceClient` to allow all editor components (Canvas and Sidebar) to share the same collaborative state (Feature Spec 24).
- Persisted generated specs with Vercel Blob and Prisma, providing a secure authenticated download route (Feature Spec 28).
- Implemented a list and preview UI for specs in the AI sidebar, reusing the secure download route for content fetching to avoid direct blob access (Feature Spec 29).

## Session Notes

- Bug Fix Session (2026-05-12): Fixed spec preview/download 404s in `GET /api/projects/[projectId]/specs/[specId]/download`.
  - Root cause: the route required both `projectId` + `specId` to match, so stale/mismatched project IDs in URL paths caused false `404` responses even when the spec existed.
  - Fix: resolve by `specId` first, then authorize access against `spec.projectId` and stream the file from Blob.

- Build/Lint Maintenance (2026-05-12): Updated `eslint.config.mjs` to ignore non-app workspace folders (`.agents/**`, `graphify-out/**`) so `bun run lint` only targets project source files and avoids rule-runtime crashes from template assets.

- Bug Fix Session (2026-05-12): Fixed runtime crash in `components/editor/ai-sidebar.tsx`.
  - Root cause: `sharedAiStatus` and `addMessage` were referenced but not defined after sidebar refactoring.
  - Fix: restored shared status parsing from Liveblocks `ai-status-feed` using `AiStatusSchema`, and restored collaborative chat write mutation via `useMutation` + `LiveObject` push to `ai-chat`.

- Bug Fix Session (2026-05-12): Fixed delayed spec list refresh in `AiSidebar`.
  - Root cause: spec list refresh in realtime `onComplete` depended on `completedRun.output` being present. Some completed runs reached the UI without output payload, so specs were only visible after page reload.
  - Fix: introduced explicit run-type tracking (`design` vs `spec`) and always refresh specs on spec-run completion, independent of output payload shape.
  - Reset run-type state on completion/error paths to keep assistant/spec run handling isolated.

- Bug Fix Session (2026-05-09): Fixed 4 runtime issues from `context/current-issues.md`.
  - **Problem 1 & 2 (Critical):** `INVALID_STORAGE_MUTATION_REQUEST: Invalid index: edge-gateway-to-cache` — Root cause: `useLiveblocksFlow` expects both `nodes` and `edges` as `LiveMap<string, ...>`. The `RoomProvider` was initializing `nodes` as `LiveObject({})` and `edges` as `LiveList([])`. Changed both to `LiveMap([])` in `editor-workspace-client.tsx`. Updated `design-agent.ts` to read edges as an object map (not array) and use map-style delete/update patterns.
  - **Problem 3 (DarkReader):** Hydration mismatch caused by the DarkReader browser extension injecting `style` attributes into SVG icons. Not fixable in application code — this is a browser extension side-effect acknowledged in the React error message.
  - **Problem 4 (Autosave 404):** Two causes: (a) autosave fired after project deletion — fixed by silently returning `idle` on 404; (b) specs route was returning 403 using `NextResponse` + old `checkProjectAccess` pattern — rewrote specs route to use `auth()` directly, return proper `404` for missing projects and `403` for forbidden access, consistent with other routes.

- Redesigned the Custom Authentication UI (`components/auth/custom-auth-ui.tsx`) using Clerk. Fixed the Smart CAPTCHA console warning by adding the required `<div id="clerk-captcha"></div>` to ensure the bot protection widget has a rendering target.

- Completed Feature Spec 29 (Spec UI Integration).
- Created `GET /api/projects/[projectId]/specs` to list project specifications with synthesized filenames.
- Implemented `SpecPreviewModal` component using shadcn/ui `Dialog` and `ScrollArea` for Markdown-formatted text preview.
- Updated `AiSidebar` to include the `Specs` tab with a scrollable list, metadata display, and integrated preview/download actions.
- Wired the "Generate Spec" button in the sidebar to the `/api/ai/spec` trigger flow with real-time status monitoring via `ai-status-feed`.
- Verified that `bun run build` (and `npm run build`) succeeds.
- Completed Feature Spec 28 (Technical Specification Download).
- Added `ProjectSpec` model to Prisma and ran migration.
- Updated `trigger/generate-spec.ts` to upload generated Markdown to Vercel Blob and save metadata to Prisma.
- Created `GET /api/projects/[projectId]/specs/[specId]/download` with project access verification.
- Verified that `bun run build` succeeds.
- Completed Feature Spec 27 (Technical Specification Generation Flow).
- Added `trigger/generate-spec.ts` using `schemaTask` and Gemini `gemini-1.5-pro` to generate Markdown specs.
- Created `POST /api/ai/spec` to trigger the task and track ownership via `TaskRun`.
- Created `POST /api/ai/spec/token` to issue public Trigger.dev tokens for run monitoring.
- Verified that `bun run build` succeeds.
- Completed Feature Spec 26 (Design Agent Frontend).
- Completed Feature Spec 25 (Sidebar Chat Feed).
- Added `ChatMessageSchema` to `types/tasks.ts`.
- Updated `liveblocks.config.ts` to include `ai-chat` storage.
- Updated `EditorWorkspaceClient` to initialize `ai-chat` as an empty `LiveList`.
- Updated `AiSidebar` to render chat messages, handle sending via `useMutation`, and scroll to bottom automatically.
- Verified that `bun run build` succeeds.
- Completed Feature Spec 24 (AI Presence State).
- Added `ai-status-feed` to Liveblocks Storage for shared AI progress visibility.
- Updated `WorkspaceCanvas` to show a thinking spinner in live cursor badges when a participant's `thinking` presence is true.
- Refactored `EditorWorkspaceClient` to wrap both the canvas and AI sidebar in a single `RoomProvider`, enabling shared storage access.
- Updated `AiSidebar` to subscribe to the shared `ai-status-feed` and disable chat inputs while the AI is working.
- Updated `designAgent` task to publish its progress to the shared `ai-status-feed` in addition to updating presence and metadata.
- Fixed React Flow error #008 by moving to a single loose-handle set in `components/editor/canvas-basic-node.tsx` (`top/right/bottom/left` source handles only) and normalizing legacy `source-*`/`target-*` handle IDs to neutral IDs in `components/editor/workspace-canvas.tsx` for both connect-time and loaded/rendered edges.
- Adjusted canvas autosave to match the private Vercel Blob store: uploads now use private access and reads go through the blob SDK instead of unauthenticated fetch.
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
- Added `proxy.ts` at project root with protected-first body guarding based on existing Clerk sign-in/sign-up env vars.
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
- Completed Feature Spec 13 from `context/feature-specs/13-node-shape.md`.
- Replaced placeholder node rendering in `components/editor/canvas-basic-node.tsx` with shape-aware rendering: CSS-based rectangle/pill/circle plus scalable SVG diamond/hexagon/cylinder variants.
- Kept node handles and collaborative flow wiring intact while adding shape-aware border behavior (subtle at rest, brighter when selected).
- Added shape drag ghost preview wiring between `components/editor/shape-panel.tsx` and `components/editor/workspace-canvas.tsx`, with cursor-follow behavior and cleanup on drop/cancel.
- Confirmed `bun run build` succeeds with Feature Spec 13 changes.
- Added `hooks/use-project-actions.ts` to manage create/rename/delete dialog state and call `POST /api/projects`, `PATCH /api/projects/[id]`, and `DELETE /api/projects/[id]`.
- Wired create to slugify name + short suffix for room ID, create with aligned project ID/room ID, and navigate to `/editor/[projectId]` on success.
- Wired rename to refresh on success and delete to redirect to `/editor` when removing the active workspace (otherwise refresh).
- Updated create dialog preview to show room ID preview, rename dialog prefill behavior, and delete dialog project name binding with real project data.
- Updated `app/api/projects/route.ts` create handler to accept optional validated custom project IDs and reject invalid or duplicate IDs.
- Updated `liveblocks.config.ts` Presence and UserMeta typing to include cursor position, `isThinking`, and session user metadata (`displayName`, `avatarUrl`, `cursorColor`).
- Added `lib/liveblocks.ts` with a cached `@liveblocks/node` client and deterministic cursor-color helper derived from a fixed palette and user ID hash.
- Added `app/api/liveblocks-auth/route.ts` (`POST`) to require Clerk auth, verify project access via `checkProjectAccess`, ensure the project room exists, and return a Liveblocks session token scoped to the project room with user metadata attached.
- Redesigned the complete editor dashboard visual hierarchy across `editor-navbar`, `project-sidebar`, `editor-layout`, `editor-home-client`, and `editor-workspace-client` to use a cohesive dark workspace style with layered panels, stronger spacing rhythm, and a consistent top-level dashboard structure.
- Improved workspace editor with a dedicated right-side assistant/spec panel, upgraded canvas loading/error surfaces, and refined project metadata strip above the canvas.
- Updated project list rows to be directly navigable links in the sidebar and aligned action affordances with clearer active-state styling.
- Fixed editor view token mismatches in `access-denied.tsx` and removed the `share-dialog` effect-driven state update causing the React hooks lint error.
- Completed Feature Spec 14 from `context/feature-specs/14-node-editing.md`.
- Added resizing using `NodeResizer` from `@xyflow/react` to `components/editor/canvas-basic-node.tsx` with a `minWidth` and `minHeight` array. Selected nodes will present subtle resize handlers using classes matching the dark canvas UI (`!h-2.5 !w-2.5 !bg-white/80`).
- Added inline label editing seamlessly in `CanvasShapeSurface` by capturing `doubleClick` on the internal node surface allowing state-driven textarea rendering while retaining centering.
- Editing text updates the label synchronously avoiding manual pan/drag interferences via `nodrag nopan` classes.
- Used `Math.max(1, editValue.split('\n').length)` rows mapping inside the `textarea` block to properly size content fields up to dynamic vertical heights without introducing scrollbars or layout shifts.
- Intersecting state closures on `Escape` or `Shift+Enter` keystrokes.
- Verified that `bun run build` succeeds completely without TS errors indicating safe `@xyflow/react` and layout modifications.
- Completed Feature Spec 15 from `context/feature-specs/15-node-color-toolbar.md`.
- Added a floating color toolbar to `components/editor/canvas-basic-node.tsx` above selected nodes with `nodrag nopan` utility classes.
- Wired color picking to update `data.color` via `updateNodeData` and trigger synchronous `getTextColor` update applied to node surfaces.
- Kept palette confined to predefined variants from `NODE_COLORS` array enforcing strict color contrast paired combinations.
- Added visual interaction hover glow shadows matched to node text colors leveraging absolute layered `div`s.
- Completed Feature Spec 18: Starter template library. Implemented `starter-templates.ts` data definitions and `starter-templates-modal.tsx` with import functionality. Wired import button to editor navbar and state-synchronized node/edge replacement.
- Fixed editor hydration mismatch by deferring Clerk `UserButton` rendering to the client.
- Moved `ReactFlowProvider` to wrap the editor workspace client so `useReactFlow` consumers share the correct provider and template imports work reliably.
- Completed Feature Spec 19 (Canvas Ergonomics): Added a floating control bar for zoom and undo/redo, wired to React Flow and Liveblocks. Added useKeyboardShortcuts hook for canvas shortcuts, ignoring editable fields. Removed the MiniMap from the bottom right.
- Completed Feature Spec 20 (AI Sidebar Shell): Added a dedicated right-side AI sidebar with Assistant and Specs tabs. Implemented toggling from the navbar, chat-like interface for the assistant, and a scrollable spec list placeholder. Refactored EditorLayout to manage the right panel as a floating overlay with slide-in animations.
- Completed Feature Spec 21 (Canvas Autosave): Installed `@vercel/blob`, created `PUT`/`GET` `/api/projects/[projectId]/canvas` to store and retrieve canvas state using the Prisma project record's `canvasJsonPath`, added `useCanvasAutosave` hook with debouncing, implemented load-on-mount logic in `workspace-canvas`, and rendered a status indicator in the navbar.
- Completed Feature Spec 22: Design Agent API logic. Implemented `POST /api/projects/[projectId]/design` with token validation, triggered `trigger.run`, and stored `TokenUse` in the DB. Set up task run status polling in `lib/trigger-tasks.ts`.
- Completed Feature Spec 23: AI Design Agent Logic. Implemented `trigger.task` `designAgent` using `gemini-2.0-flash-exp-image`, published status to `ai-status-feed`, and wrote `canvasJsonPath` + spec + node metadata to project Blob storage. Added `runId` tracking in `projectData` (DB). Cleaned up legacy mock fetch code.
- Verified build, server, and client (cursor/avatar rendering, chat input disabled while thinking) all pass with Feature Spec 23 in place.
- Fixed React Flow error #008 by moving to a single loose-handle set in `components/editor/canvas-basic-node.tsx` (`top/right/bottom/left` source handles only) and normalizing legacy `source-*`/`target-*` handle IDs to neutral IDs in `components/editor/workspace-canvas.tsx` for both connect-time and loaded/rendered edges.
- Adjusted canvas autosave to match the private Vercel Blob store: uploads now use private access and reads go through the blob SDK instead of unauthenticated fetch.
- Removed the workspace top metadata strip in `editor-workspace-client` so the dotted canvas fills the editor area naturally.
- Completed Feature Spec 24: AI Presence State. Added `ai-status-feed` to Liveblocks Storage for shared AI progress visibility. Updated `WorkspaceCanvas` to show a thinking spinner in live cursor badges when a participant's `thinking` presence is true. Refactored `EditorWorkspaceClient` to wrap both the canvas and AI sidebar in a single `RoomProvider`, enabling shared storage access. Updated `AiSidebar` to subscribe to the shared `ai-status-feed` and disable chat inputs while the AI is working. Updated `designAgent` task to publish its progress to the shared `ai-status-feed` in addition to updating presence and metadata. Verified that `bun run build` succeeds.
- Completed Feature Spec 25: Sidebar Chat Feed. Added `ChatMessageSchema` to `types/tasks.ts`. Updated `liveblocks.config.ts` to include `ai-chat` storage. Updated `EditorWorkspaceClient` to initialize `ai-chat` as an empty `LiveList`. Updated `AiSidebar` to render chat messages, handle sending via `useMutation`, and scroll to bottom automatically. Verified that `bun run build` succeeds.
- Completed Feature Spec 26: Design Agent Frontend. Integrated design agent API with realtime polling, status display, and final message formatting. Verified that `bun run build` succeeds.
-Completed feature spec 27: Technical Specification Generation Flow.
    - Added `trigger/generate-spec.ts` using `schemaTask` and Gemini `gemini-1.5-pro` to generate Markdown specs.
    - Created `POST /api/ai/spec` to trigger the task and track ownership via `TaskRun`.
    - Created `POST /api/ai/spec/token` to issue public Trigger.dev tokens for run monitoring.
    - Verified that `bun run build` succeeds.
-Completed feature spec 28: Technical Specification Download (Prisma ProjectSpec model, Vercel Blob persistence, and secure download route).
    - Added `ProjectSpec` model to Prisma and ran migration.
    - Updated `trigger/generate-spec.ts` to upload generated Markdown to Vercel Blob and save metadata to Prisma.
    - Created `GET /api/projects/[projectId]/specs/[specId]/download` with project access verification.
    - Verified that `bun run build` succeeds.
-Completed feature spec 29: Spec UI Integration (Spec list in AI sidebar, preview modal with Markdown content, and download actions).
    - Created `GET /api/projects/[projectId]/specs` to list project specifications with synthesized filenames.
    - Created `GET /api/projects/[projectId]/specs/[specId]/download` with project access verification.
    - Implemented `SpecPreviewModal` component using shadcn/ui `Dialog` and `ScrollArea` for Markdown-formatted text preview.
    - Updated `AiSidebar` to include the `Specs` tab with a scrollable list, metadata display, and integrated preview/download actions.
    - Wired the "Generate Spec" button in the sidebar to the `/api/ai/spec` trigger flow with real-time status monitoring via `ai-status-feed`.
    - Verified that `bun run build` (and `npm run build`) succeeds.
    - Spec preview modal upgraded to use `react-markdown` (v10) for proper rendered Markdown output — headings, lists, code blocks, tables, and blockquotes now styled via Tailwind arbitrary selectors on the article wrapper.
