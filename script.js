const STATUS = {
	PENDING: "Pending",
	IN_PROGRESS: "In Progress",
	DONE: "Done"
};

const PRIORITY = {
	LOW: "Low",
	MEDIUM: "Medium",
	HIGH: "High"
};

const DESCRIPTION_COLLAPSE_THRESHOLD = 150;
const TODO_TICK_MS = 30000;
const MODE_TRANSITION_MS = 240;

const state = {
	todo: {
		title: "Ship Stage 1 Build",
		description:
			"Build both Stage 1 components with precise test IDs, keyboard accessibility, responsive layout, and reliable state synchronization. Include granular time updates and clear visual feedback for status and priority changes.",
		priority: PRIORITY.HIGH,
		status: STATUS.PENDING,
		dueAt: Date.now() + 4 * 60 * 60 * 1000
	},
	ui: {
		isEditing: false,
		isExpanded: false,
		canCollapse: true
	}
};

let todoTickId = null;
let lastFocusedTrigger = null;
let editSnapshot = null;
let saveIndicatorTimeoutId = null;

const els = {
	themeToggle: document.querySelector('[data-testid="theme-toggle-button"]'),
	todoCard: document.querySelector('[data-testid="test-todo-card"]'),
	todoEmptyState: document.querySelector('[data-testid="todo-empty-state"]'),
	footerYear: document.getElementById("footer-year"),
	todoLiveRegion: document.getElementById("todo-live-region"),
	title: document.querySelector('[data-testid="test-todo-title"]'),
	description: document.querySelector('[data-testid="test-todo-description"]'),
	statusText: document.querySelector('[data-testid="test-todo-status"]'),
	priorityText: document.querySelector('[data-testid="test-todo-priority"]'),
	dueTime: document.querySelector('[data-testid="todo-due-time-value"]'),
	timeRemaining: document.querySelector('[data-testid="test-todo-time-remaining"]'),
	overdueIndicator: document.querySelector('[data-testid="test-todo-overdue-indicator"]'),
	checkbox: document.querySelector('[data-testid="test-todo-checkbox"]'),
	statusControl: document.querySelector('[data-testid="test-todo-status-control"]'),
	expandToggle: document.querySelector('[data-testid="test-todo-expand-toggle"]'),
	expandToggleLabel: document.querySelector("#todo-expand-toggle .toggle-label"),
	collapsible: document.querySelector('[data-testid="test-todo-collapsible-section"]'),
	editButton: document.querySelector('[data-testid="test-todo-edit-button"]'),
	deleteButton: document.querySelector('[data-testid="test-todo-delete-button"]'),
	viewMode: document.getElementById("todo-view-mode"),
	editForm: document.querySelector('[data-testid="test-todo-edit-form"]'),
	editTitleInput: document.querySelector('[data-testid="test-todo-edit-title-input"]'),
	editDescriptionInput: document.querySelector('[data-testid="test-todo-edit-description-input"]'),
	editPrioritySelect: document.querySelector('[data-testid="test-todo-edit-priority-select"]'),
	editDueDateInput: document.querySelector('[data-testid="test-todo-edit-due-date-input"]'),
	saveButton: document.querySelector('[data-testid="test-todo-save-button"]'),
	cancelButton: document.querySelector('[data-testid="test-todo-cancel-button"]'),
	saveIndicator: document.getElementById("todo-save-indicator"),
	deleteModal: document.getElementById("todo-delete-modal"),
	deleteConfirmButton: document.getElementById("todo-delete-confirm"),
	deleteCancelButton: document.getElementById("todo-delete-cancel")
};

function setDynamicFooterYear() {
	if (!els.footerYear) {
		return;
	}
	els.footerYear.textContent = String(new Date().getFullYear());
}

function showEmptyStateMessage() {
	if (els.todoCard) {
		els.todoCard.style.display = "none";
	}

	if (els.todoEmptyState) {
		els.todoEmptyState.hidden = false;
	}

	if (todoTickId) {
		clearInterval(todoTickId);
		todoTickId = null;
	}

	if (els.todoLiveRegion) {
		els.todoLiveRegion.textContent = "Todo deleted. List is currently empty.";
	}
}

function showSaveIndicator() {
	if (!els.saveIndicator) {
		return;
	}

	els.saveIndicator.hidden = false;
	if (saveIndicatorTimeoutId) {
		clearTimeout(saveIndicatorTimeoutId);
	}

	saveIndicatorTimeoutId = setTimeout(() => {
		els.saveIndicator.hidden = true;
		saveIndicatorTimeoutId = null;
	}, 2200);
}

function openDeleteModal() {
	if (!els.deleteModal) {
		return;
	}
	els.deleteModal.hidden = false;
	els.deleteModal.setAttribute("aria-hidden", "false");
	if (els.deleteCancelButton) {
		els.deleteCancelButton.focus();
	}
}

function closeDeleteModal(restoreFocus = true) {
	if (!els.deleteModal) {
		return;
	}
	els.deleteModal.hidden = true;
	els.deleteModal.setAttribute("aria-hidden", "true");
	if (restoreFocus && els.deleteButton && els.todoCard.style.display !== "none") {
		els.deleteButton.focus();
	}
}

function applyTheme(theme) {
	document.body.classList.toggle("theme-dark", theme === "dark");
	if (els.themeToggle) {
		els.themeToggle.textContent = theme === "dark" ? "Light mode" : "Dark mode";
		els.themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
	}
}

function waitForModeTransition(element) {
	if (!element) {
		return Promise.resolve();
	}

	return new Promise((resolve) => {
		let done = false;
		const finalize = () => {
			if (done) {
				return;
			}
			done = true;
			element.removeEventListener("transitionend", onEnd);
			resolve();
		};

		const onEnd = (event) => {
			if (event.target === element) {
				finalize();
			}
		};

		element.addEventListener("transitionend", onEnd);
		setTimeout(finalize, MODE_TRANSITION_MS + 80);
	});
}

async function switchMode(targetMode) {
	const view = els.viewMode;
	const form = els.editForm;
	if (!view || !form) {
		return;
	}

	const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	if (targetMode === "edit") {
		if (prefersReducedMotion) {
			view.hidden = true;
			form.hidden = false;
			return;
		}

		form.hidden = false;
		form.classList.remove("mode-exit");
		view.classList.remove("mode-enter");

		requestAnimationFrame(() => {
			view.classList.add("mode-exit");
			form.classList.add("mode-enter");
		});

		await Promise.all([waitForModeTransition(view), waitForModeTransition(form)]);
		view.hidden = true;
		view.classList.remove("mode-exit");
		form.classList.remove("mode-enter");
		return;
	}

	if (prefersReducedMotion) {
		view.hidden = false;
		form.hidden = true;
		return;
	}

	view.hidden = false;
	view.classList.remove("mode-exit");
	form.classList.remove("mode-enter");

	requestAnimationFrame(() => {
		view.classList.add("mode-enter");
		form.classList.add("mode-exit");
	});

	await Promise.all([waitForModeTransition(view), waitForModeTransition(form)]);
	form.hidden = true;
	form.classList.remove("mode-exit");
	view.classList.remove("mode-enter");
}

function initTheme() {
	const savedTheme = localStorage.getItem("fw-theme");
	const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
	const initial = savedTheme || (prefersDark ? "dark" : "light");
	applyTheme(initial);

	if (els.themeToggle) {
		els.themeToggle.addEventListener("click", () => {
			const next = document.body.classList.contains("theme-dark") ? "light" : "dark";
			localStorage.setItem("fw-theme", next);
			applyTheme(next);
		});
	}
}

function asLocalInputValue(timestamp) {
	const date = new Date(timestamp);
	const pad = (value) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatReadableDue(timestamp) {
	return new Date(timestamp).toLocaleString([], {
		weekday: "short",
		month: "short",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}

function formatTimeDelta(dueAt, now) {
	const delta = dueAt - now;
	const absMs = Math.abs(delta);
	const totalMinutes = Math.max(1, Math.floor(absMs / 60000));
	const days = Math.floor(totalMinutes / (60 * 24));
	const hours = Math.floor(totalMinutes / 60);

	if (delta >= 0) {
		if (days >= 1) {
			return `Due in ${days} day${days > 1 ? "s" : ""}`;
		}

		if (hours >= 1) {
			return `Due in ${hours} hour${hours > 1 ? "s" : ""}`;
		}

		return `Due in ${totalMinutes} minute${totalMinutes > 1 ? "s" : ""}`;
	}

	if (days >= 1) {
		return `Overdue by ${days} day${days > 1 ? "s" : ""}`;
	}

	if (hours >= 1) {
		return `Overdue by ${hours} hour${hours > 1 ? "s" : ""}`;
	}

	return `Overdue by ${totalMinutes} minute${totalMinutes > 1 ? "s" : ""}`;
}

function applyVisualState() {
	const card = els.todoCard;
	const statusClass = state.todo.status.toLowerCase().replace(/\s+/g, "-");
	const priorityClass = state.todo.priority.toLowerCase();
	const isOverdue = Date.now() > state.todo.dueAt && state.todo.status !== STATUS.DONE;

	card.classList.remove("status-pending", "status-in-progress", "status-done");
	card.classList.remove("priority-low", "priority-medium", "priority-high");
	card.classList.toggle("is-overdue", isOverdue);
	card.setAttribute("data-status", state.todo.status);
	card.setAttribute("data-priority", state.todo.priority);

	card.classList.add(`status-${statusClass}`);
	card.classList.add(`priority-${priorityClass}`);
}

function updateCollapseState() {
	state.ui.canCollapse = state.todo.description.trim().length > DESCRIPTION_COLLAPSE_THRESHOLD;

	if (!state.ui.canCollapse) {
		state.ui.isExpanded = true;
		els.expandToggle.hidden = true;
		els.collapsible.classList.remove("is-collapsed");
		els.collapsible.classList.add("always-visible");
		els.expandToggle.setAttribute("aria-expanded", "true");
		els.expandToggle.classList.remove("is-expanded");
		if (els.expandToggleLabel) {
			els.expandToggleLabel.textContent = "Show less";
		}
		return;
	}

	els.expandToggle.hidden = false;
	els.collapsible.classList.remove("always-visible");
	els.collapsible.classList.toggle("is-collapsed", !state.ui.isExpanded);
	els.expandToggle.classList.toggle("is-expanded", state.ui.isExpanded);
	if (els.expandToggleLabel) {
		els.expandToggleLabel.textContent = state.ui.isExpanded ? "Show less" : "Show more";
	}
	els.expandToggle.setAttribute("aria-expanded", String(state.ui.isExpanded));
}

function renderTodoTime() {
	if (state.todo.status === STATUS.DONE) {
		els.timeRemaining.textContent = "Completed";
		els.overdueIndicator.hidden = true;
		if (els.todoLiveRegion) {
			els.todoLiveRegion.textContent = "Task completed";
		}
		return;
	}

	const now = Date.now();
	const isOverdue = now > state.todo.dueAt;
	const label = formatTimeDelta(state.todo.dueAt, now);

	els.timeRemaining.textContent = label;
	els.overdueIndicator.hidden = !isOverdue;
	els.overdueIndicator.textContent = isOverdue ? "Overdue" : "";

	if (els.todoLiveRegion) {
		els.todoLiveRegion.textContent = label;
	}
}

function syncStatusControls() {
	els.statusControl.value = state.todo.status;
	els.checkbox.checked = state.todo.status === STATUS.DONE;
}

function syncTimerLifecycle() {
	if (state.todo.status === STATUS.DONE) {
		if (todoTickId) {
			clearInterval(todoTickId);
			todoTickId = null;
		}
		return;
	}

	if (!todoTickId) {
		todoTickId = setInterval(renderTodoTime, TODO_TICK_MS);
	}
}

function renderTodo() {
	els.title.textContent = state.todo.title;
	els.description.textContent = state.todo.description;
	els.statusText.textContent = state.todo.status;
	els.priorityText.textContent = state.todo.priority;
	els.dueTime.textContent = formatReadableDue(state.todo.dueAt);

	syncStatusControls();
	updateCollapseState();
	renderTodoTime();
	applyVisualState();
	syncTimerLifecycle();
}

function setStatus(status) {
	state.todo.status = status;
	if (status === STATUS.DONE) {
		els.checkbox.checked = true;
	} else {
		els.checkbox.checked = false;
	}
	renderTodo();
	if (els.todoLiveRegion) {
		els.todoLiveRegion.textContent = `Status changed to ${status}`;
	}
}

async function openEditMode() {
	state.ui.isEditing = true;
	lastFocusedTrigger = document.activeElement;
	editSnapshot = {
		title: state.todo.title,
		description: state.todo.description,
		priority: state.todo.priority,
		dueAt: state.todo.dueAt
	};
	await switchMode("edit");
	els.editButton.setAttribute("aria-expanded", "true");

	els.editTitleInput.value = state.todo.title;
	els.editDescriptionInput.value = state.todo.description;
	els.editPrioritySelect.value = state.todo.priority;
	els.editDueDateInput.value = asLocalInputValue(state.todo.dueAt);

	els.editTitleInput.focus();
}

async function closeEditMode() {
	state.ui.isEditing = false;
	await switchMode("view");
	els.editButton.setAttribute("aria-expanded", "false");

	if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === "function") {
		lastFocusedTrigger.focus();
	} else {
		els.editButton.focus();
	}
}

async function onEditSubmit(event) {
	event.preventDefault();

	const title = els.editTitleInput.value.trim();
	const description = els.editDescriptionInput.value.trim();
	const priority = els.editPrioritySelect.value;
	const dueAt = new Date(els.editDueDateInput.value).getTime();

	if (!title || !description || Number.isNaN(dueAt)) {
		return;
	}

	state.todo.title = title;
	state.todo.description = description;
	state.todo.priority = priority;
	state.todo.dueAt = dueAt;

	await closeEditMode();
	renderTodo();
	showSaveIndicator();
	if (els.todoLiveRegion) {
		els.todoLiveRegion.textContent = "Todo updated";
	}
}

async function handleEditCancel() {
	if (editSnapshot) {
		state.todo.title = editSnapshot.title;
		state.todo.description = editSnapshot.description;
		state.todo.priority = editSnapshot.priority;
		state.todo.dueAt = editSnapshot.dueAt;
	}
	await closeEditMode();
	renderTodo();
	if (els.todoLiveRegion) {
		els.todoLiveRegion.textContent = "Edit canceled";
	}
}

function trapFormFocus(event) {
	if (event.key !== "Tab" || els.editForm.hidden) {
		return;
	}

	const focusable = els.editForm.querySelectorAll(
		'input, textarea, select, button, [href], [tabindex]:not([tabindex="-1"])'
	);

	if (!focusable.length) {
		return;
	}

	const first = focusable[0];
	const last = focusable[focusable.length - 1];

	if (event.shiftKey && document.activeElement === first) {
		event.preventDefault();
		last.focus();
	}

	if (!event.shiftKey && document.activeElement === last) {
		event.preventDefault();
		first.focus();
	}
}

function bindTodoEvents() {
	els.checkbox.addEventListener("change", () => {
		if (els.checkbox.checked) {
			setStatus(STATUS.DONE);
			return;
		}

		if (state.todo.status === STATUS.DONE) {
			setStatus(STATUS.PENDING);
		}
	});

	els.statusControl.addEventListener("change", (event) => {
		const nextStatus = event.target.value;
		setStatus(nextStatus);
	});

	els.expandToggle.addEventListener("click", () => {
		if (!state.ui.canCollapse) {
			return;
		}
		state.ui.isExpanded = !state.ui.isExpanded;
		updateCollapseState();
	});

	els.editButton.addEventListener("click", () => {
		void openEditMode();
	});

	els.cancelButton.addEventListener("click", () => {
		void handleEditCancel();
	});

	els.editForm.addEventListener("submit", onEditSubmit);
	els.editForm.addEventListener("keydown", trapFormFocus);

	els.deleteButton.addEventListener("click", openDeleteModal);

	if (els.deleteCancelButton) {
		els.deleteCancelButton.addEventListener("click", closeDeleteModal);
	}

	if (els.deleteConfirmButton) {
		els.deleteConfirmButton.addEventListener("click", () => {
			showEmptyStateMessage();
			closeDeleteModal(false);
		});
	}

	if (els.deleteModal) {
		els.deleteModal.addEventListener("click", (event) => {
			const target = event.target;
			if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
				closeDeleteModal();
			}
		});
	}

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && els.deleteModal && !els.deleteModal.hidden) {
			closeDeleteModal();
		}
	});
}

function boot() {
	setDynamicFooterYear();
	initTheme();
	renderTodo();
	bindTodoEvents();

	// Keep controls in the expected tab flow order.
	els.checkbox.tabIndex = 0;
	els.statusControl.tabIndex = 0;
	els.expandToggle.tabIndex = 0;
	els.editButton.tabIndex = 0;
	els.deleteButton.tabIndex = 0;
}

boot();
