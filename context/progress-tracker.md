# Progress Tracker

Update this file whenever the current phase, active feature , or implementation state changes

## Current Phase

- In progress

## Current Goal

- Feature Spec 05 complete. Prepare the next feature implementation unit.

## Completed

- Feature Spec 01: Design system and UI primitives setup.
- Feature Spec 02: Editor navbar, floating project sidebar shell, and reusable dialog pattern component.
- Feature Spec 03: Clerk provider integration, auth routes, protected-first proxy, root redirect flow, and editor user menu.
- Feature Spec 04: Editor home CTA, project create/rename/delete dialogs, owner-only sidebar project actions, and mobile sidebar scrim close behavior.
- Feature Spec 05: Prisma project/collaborator models, Prisma singleton client with Accelerate/direct branching, and initial migration.

## In Progress

- No active implementation step.

## Next Up

- Begin authenticated project API routes and wire project persistence to editor actions.

## Open Questions

- Next.js docs directory `node_modules/next/dist/docs` is missing in this repo. Confirm where the relevant guide lives.

## Architecture Decisions

- Adopted a protected-first `proxy.ts` strategy where only `/`, sign-in, and sign-up routes are public; all other routes require Clerk authentication.

## Session Notes

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
