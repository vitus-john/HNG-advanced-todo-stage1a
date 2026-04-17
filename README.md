# Frontend Wizards Stage 1

This project contains both required Stage 1 tasks:

- Stage 1A: Advanced Todo Card (Interactive and Stateful)

## Live URL

Add your hosted URL here after deployment:

- Live: `<your-live-url>`

## Repository URL

Add your GitHub repository URL:

- Repo: `<your-repo-url>`

## Run locally

Because this is plain HTML/CSS/JS, open `index.html` directly in a browser, or use a local server.

Example with VS Code Live Server:

1. Open the folder in VS Code.
2. Start Live Server on `index.html`.

## Stage 1A (Advanced Todo Card) - What changed from Stage 0

Implemented the required interactive and stateful upgrades:

- Edit mode with full form and required test IDs:
  - `test-todo-edit-form`
  - `test-todo-edit-title-input`
  - `test-todo-edit-description-input`
  - `test-todo-edit-priority-select`
  - `test-todo-edit-due-date-input`
  - `test-todo-save-button`
  - `test-todo-cancel-button`
- Status control (`test-todo-status-control`) with allowed values:
  - Pending
  - In Progress
  - Done
- Status synchronization rules implemented:
  - Checking checkbox sets status to Done
  - Setting status to Done checks checkbox
  - Unchecking after Done returns status to Pending
- Priority indicator added (`test-todo-priority-indicator`) with visual changes for Low/Medium/High
- Expand/collapse behavior for long descriptions:
  - `test-todo-expand-toggle`
  - `test-todo-collapsible-section`
  - Uses `aria-expanded` + `aria-controls`
- Enhanced time management:
  - `test-todo-time-remaining`
  - `test-todo-overdue-indicator`
  - Granular messages (days/hours/minutes)
  - Overdue messaging and visual red accent
  - If status is Done, time switches to `Completed` and timer stops
- Visual state styling added:
  - Done: strike-through + muted card style
  - In Progress: distinct style
  - High priority: stronger visual emphasis
  - Overdue: red accent

## Accessibility notes

- All edit form fields have explicit labels and matching `for` attributes.
- Status control has an accessible name via label and `aria-label`.
- Expand/collapse control uses `aria-expanded` and `aria-controls` linked to collapsible region id.
- Time updates use polite live regions where appropriate.
- Focus styles are visible for keyboard users.
- Form focus trapping is implemented while the edit form is open.
- Focus returns to the Edit trigger when edit mode closes.

## Responsive behavior

Designed for:

- Mobile (320px): vertical stacking, form fields stack cleanly
- Tablet (768px): improved spacing and two-column form details
- Desktop (1024px+): richer layout with avatar/content split and aligned controls

The layout avoids overflow with long titles and long description text via wrapping and collapsible content.

## Known limitations

- Delete action currently hides the todo card in UI only (no undo, no persistence).
- Data is in-memory and resets on page refresh.

## Submission checklist

Before submission, update this README with:

- Hosted live URL
- Final repository URL
- Any extra notes for evaluators

Submission form:

- [Submission Form](https://docs.google.com/forms/d/e/1FAIpQLSfyENWbGf9qRkmDj77BIEAPkO0WwIqDpeR6_dte026HA-KuWQ/viewform)
