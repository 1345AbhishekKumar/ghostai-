# Feature Spec 20: AI Sidebar Shell

Implement a dedicated right-side sidebar for AI interactions and technical specification management.

## Requirements

### Layout and Toggling

1.  **Floating Overlay**: The AI sidebar must be a floating overlay on the right side of the workspace, matching the visual style of the left project sidebar.
2.  **Toggle Support**: Add a toggle state to the editor workspace. Wire the `Bot` icon in the navbar to toggle the sidebar visibility.
3.  **Animations**: Use smooth slide-in and slide-out transitions (`translate-x`) and opacity fades.
4.  **Responsive**: The sidebar should be visible by default on large screens but can be toggled closed to maximize canvas space.

### Content Tabs

The sidebar must use a tabbed interface with two main sections:

1.  **Assistant**:
    -   A scrollable area for chat history.
    -   A welcome card with suggested prompts (e.g., "Design a microservices architecture...", "Add a Redis cache...").
    -   A fixed bottom input area with a `Textarea` for typing prompts.
    -   Action buttons for "Send" and "AI Sparkles".
2.  **Specs**:
    -   A scrollable area listing generated technical specifications.
    -   An empty state showing a "No specs generated yet" message.
    -   A "Generate Spec" button (disabled for now).

### Visual Style

-   Use `Tabs` with a `line` variant for a clean, technical look.
-   Background should use `bg-card/88` with `backdrop-blur` and a subtle border.
-   Use `ScrollArea` for scrollable content to maintain the dark workspace aesthetic.
-   Accent colors should use `--accent-ai` (indigo-purple) for AI-related actions.

## Implementation Details

-   **Component**: `components/editor/ai-sidebar.tsx`
-   **State**: Managed in `components/editor/editor-workspace-client.tsx`
-   **Layout**: `components/editor/editor-layout.tsx` updated to support `isRightPanelOpen` prop and the new sidebar overlay.

## Check When Done

-   [x] AI sidebar exists and is accessible via the navbar toggle.
-   [x] Sidebar slides in/out with smooth animations.
-   [x] "Assistant" and "Specs" tabs are functional.
-   [x] Chat input is present and handles state correctly.
-   [x] Visual style aligns with `ui-context.md` (dark workspace, layered surfaces).
-   [x] `bun run build` passes.
