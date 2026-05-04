# Progress Tracker

Update this file whenever the current phase, active feature , or implementation state changes

## Current Phase

- In progress

## Current Goal

- Feature Spec 07 complete. Prepare the next feature implementation unit.

## Completed

- Feature Spec 01: Design system and UI primitives setup.
- Feature Spec 02: Editor navbar, floating project sidebar shell, and reusable dialog pattern component.
- Feature Spec 03: Clerk provider integration, auth routes, protected-first proxy, root redirect flow, and editor user menu.
- Feature Spec 04: Editor home CTA, project create/rename/delete dialogs, owner-only sidebar project actions, and mobile sidebar scrim close behavior.
- Feature Spec 05: Prisma project/collaborator models, Prisma singleton client with Accelerate/direct branching, and initial migration.
- Feature Spec 06: Authenticated backend project API routes for list/create/rename/delete with owner-only mutation guards.
- Feature Spec 07: Editor home sidebar and dialogs wired to real project data and project mutation APIs.

## In Progress

- No active implementation step.

## Next Up

- Proceed to the next feature implementation unit.

## Open Questions

- None currently.

## Architecture Decisions

- Adopted a protected-first `proxy.ts` strategy where only `/`, sign-in, and sign-up routes are public; all other routes require Clerk authentication.

## Session Notes

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
- Added `hooks/use-project-actions.ts` to manage create/rename/delete dialog state and call `POST /api/projects`, `PATCH /api/projects/[id]`, and `DELETE /api/projects/[id]`.
- Wired create to slugify name + short suffix for room ID, create with aligned project ID/room ID, and navigate to `/editor/[projectId]` on success.
- Wired rename to refresh on success and delete to redirect to `/editor` when removing the active workspace (otherwise refresh).
- Updated create dialog preview to show room ID preview, rename dialog prefill behavior, and delete dialog project name binding with real project data.
- Updated `app/api/projects/route.ts` create handler to accept optional validated custom project IDs and reject invalid or duplicate IDs.
