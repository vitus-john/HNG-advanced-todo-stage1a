# Frontend Wizards Stage 1A - Advanced Todo Card

This project implements Stage 1A: a single interactive and stateful Todo Card built with plain HTML, CSS, and JavaScript.

## Live URL

- Live: https://hng-advanced-todo-stage1a.vercel.app/

## Repository URL

- Repo: https://github.com/vitus-john/HNG-advanced-todo-stage1a

## Run locally

1. Open the project folder in VS Code.
2. Open `index.html` directly in a browser, or run it with Live Server.

## What changed from Stage 0

Stage 0 was extended with richer interactivity and synchronized UI state.

1. Editing mode
- Edit mode opens a form and supports save/cancel.
- Save updates title, description, priority, and due date.
- Cancel restores the pre-edit snapshot.
- Implemented required test ids:
  - `test-todo-edit-form`
  - `test-todo-edit-title-input`
  - `test-todo-edit-description-input`
  - `test-todo-edit-priority-select`
  - `test-todo-edit-due-date-input`
  - `test-todo-save-button`
  - `test-todo-cancel-button`

2. Status transitions and sync rules
- Added `test-todo-status-control` with: Pending, In Progress, Done.
- Status display remains present as `test-todo-status`.
- Checkbox and status stay synchronized:
  - Checking checkbox -> Done
  - Setting status to Done -> checkbox checked
  - Unchecking after Done -> Pending

3. Priority indicator enhancement
- Kept `test-todo-priority`.
- Added `test-todo-priority-indicator` using a visual rail/accent.
- Low, Medium, and High priorities each have distinct visual styling.

4. Expand/collapse behavior
- Added `test-todo-expand-toggle` and `test-todo-collapsible-section`.
- Long descriptions are collapsed by default.
- Toggle reveals/hides full content and updates `aria-expanded`.

5. Time management enhancements
- Kept `test-todo-time-remaining`.
- Added `test-todo-overdue-indicator`.
- Time labels are granular (days, hours, minutes).
- Overdue state shows explicit indicator and visual accent.
- Timer updates every 30 seconds.
- When status is Done, timer stops and label becomes "Completed".

6. Visual state changes
- Done: strike-through title + muted card appearance.
- In Progress: distinct status styling.
- High priority: stronger visual emphasis.
- Overdue: red accent and warning pill.

## Design decisions

- Kept a single in-memory state object for predictable state sync.
- Used one render pipeline (`renderTodo`) to keep UI updates consistent.
- Added light/dark theme toggle for usability without changing test ids.
- Preserved all existing Stage 0 test ids while introducing Stage 1A ids.

## Accessibility notes

- Form controls have explicit labels.
- Expand/collapse is a semantic button with `aria-expanded` and `aria-controls`.
- Status and time updates are announced via polite live regions.
- Visible `:focus-visible` styles are provided for keyboard users.
- Edit form includes keyboard focus trapping.
- Focus returns to the trigger element when edit mode closes.

## Known limitations

- Data is not persisted; refresh resets the card.
- Delete action is UI-only for this single-card stage.
- No automated test suite is included in this repo.

## Submission link

- https://docs.google.com/forms/d/e/1FAIpQLSfyENWbGf9qRkmDj77BIEAPkO0WwIqDpeR6_dte026HA-KuWQ/viewform