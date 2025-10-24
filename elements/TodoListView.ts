import { ItemView, WorkspaceLeaf, TFile, MarkdownView } from "obsidian";
import { TodoItem, TODO_VIEW_TYPE } from "../types";
import type TodoPlugin from "../main";

export class TodoListView extends ItemView {
	plugin: TodoPlugin;

	constructor(leaf: WorkspaceLeaf, plugin: TodoPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return TODO_VIEW_TYPE;
	}

	getDisplayText() {
		return "ToDo List";
	}

	getIcon() {
		return "checkbox-glyph";
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();

		// Header row: title and refresh button side-by-side
		const headerRow = container.createEl("div", { cls: "todo-header-row" });
		headerRow.createEl("h4", { text: "All ToDos", cls: "todo-heading" });

		// Use a compact refresh icon button next to the heading
		const refreshBtn = headerRow.createEl("button", {
			text: "↻",
			cls: "todo-refresh-btn",
			attr: { title: "Refresh", "aria-label": "Refresh ToDo list" },
		});
		refreshBtn.addEventListener("click", () => {
			this.refreshTodos();
		});
		await this.refreshTodos();
	}

	async refreshTodos() {
		const container = this.containerEl.children[1];

		// Clear existing content except the header
		const children = Array.from(container.children);
		children.slice(1).forEach((child) => child.remove());

		const todos = await this.findAllTodos();

		if (todos.length === 0) {
			container.createEl("p", {
				text: "No ToDos found in vault",
				cls: "todo-empty-state",
			});
			return;
		}

		// Group todos by file
		const todosByFile = new Map<string, TodoItem[]>();
		todos.forEach((todo) => {
			const fileName = todo.file.basename;
			if (!todosByFile.has(fileName)) {
				todosByFile.set(fileName, []);
			}
			todosByFile.get(fileName)?.push(todo);
		});

		// Create the todo list
		todosByFile.forEach((fileTodos, fileName) => {
			const fileSection = container.createEl("div", {
				cls: "todo-file-section",
			});

			const fileHeader = fileSection.createEl("h5", {
				text: `${fileName} (${fileTodos.length})`,
				cls: "todo-file-header",
			});

			fileHeader.addEventListener("click", () => {
				const file = fileTodos[0].file;
				this.app.workspace.openLinkText(file.path, "");
			});

			const todoList = fileSection.createEl("ul", { cls: "todo-list" });

			fileTodos.forEach((todo) => {
				const listItem = todoList.createEl("li", { cls: "todo-item" });

				const todoText = listItem.createEl("span", {
					text: todo.context,
					cls: "todo-context",
				});

				const lineInfo = listItem.createEl("span", {
					text: ` (line ${todo.line})`,
					cls: "todo-line-info",
				});

				listItem.addEventListener("click", () => {
					this.openFileAtLine(todo.file, todo.line);
				});
			});
		});
	}

	async findAllTodos(): Promise<TodoItem[]> {
		const todos: TodoItem[] = [];
		const files = this.app.vault.getMarkdownFiles();

		for (const file of files) {
			const content = await this.app.vault.read(file);
			const lines = content.split("\n");

			lines.forEach((line, index) => {
				const matches = line.match(/\bToDo\b/g);
				if (matches) {
					matches.forEach(() => {
						// Remove "ToDo" from the context and clean up extra spaces
						const cleanContext = line
							.trim()
							.replace(/\bToDo\b/g, "")
							.replace(/\s+/g, " ")
							.trim();

						todos.push({
							file: file,
							line: index + 1,
							text: "ToDo",
							context: cleanContext || "Empty todo item",
						});
					});
				}
			});
		}

		return todos;
	}

	async openFileAtLine(file: TFile, line: number) {
		const leaf = this.app.workspace.getLeaf(false);
		await leaf.openFile(file);

		const view = leaf.view;
		if (view instanceof MarkdownView) {
			const editor = view.editor;
			editor.setCursor(line - 1, 0);
			editor.scrollIntoView({
				from: { line: line - 1, ch: 0 },
				to: { line: line - 1, ch: 0 },
			});
		}
	}

	async onClose() {}
}
