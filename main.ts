import { Plugin, Notice, MarkdownView, WorkspaceLeaf } from "obsidian";

// Local imports
import { TodoSettings, DEFAULT_SETTINGS, TODO_VIEW_TYPE } from "./types";
import { TodoListView } from "./elements/TodoListView";
import { TodoHighlightSettingTab } from "./elements/TodoSettingsTab";
import { createTodoEditorDecorator } from "./elements/TodoEditorDecorator";

export default class TodoPlugin extends Plugin {
	settings: TodoSettings;

	// Get computed theme colors
	getThemeColors() {
		const style = getComputedStyle(document.body);

		// Get the raw values
		let textAccent = style.getPropertyValue("--text-accent").trim();
		let backgroundPrimary = style
			.getPropertyValue("--background-primary")
			.trim();

		return {
			textAccent,
			backgroundPrimary,
		};
	}

	async onload() {
		await this.loadSettings();

		// Register the todo list view
		this.registerView(
			TODO_VIEW_TYPE,
			(leaf) => new TodoListView(leaf, this)
		);

		// Inject CSS based on current setting
		this.injectTodoStyle();

		// Add our settings tab
		this.addSettingTab(new TodoHighlightSettingTab(this.app, this));

		// Add command to open todo list
		this.addCommand({
			id: "open-todo-list",
			name: "Open ToDo List",
			callback: () => {
				this.activateView();
			},
		});

		const ribbonIconEl = this.addRibbonIcon(
			"checkbox-glyph",
			"Open ToDo List",
			(_evt: MouseEvent) => {
				this.activateView();
			}
		);

		// Preview/highlight in read mode
		this.registerMarkdownPostProcessor((el) => {
			const todoRx = /\bToDo\b/g;
			el.querySelectorAll("p, li").forEach((node: HTMLElement) => {
				const textContent = node.textContent || ""; // Get the text content
				let match;
				let lastIndex = 0;
				const fragments: (string | HTMLElement)[] = [];

				// Find all matches of the regex
				while ((match = todoRx.exec(textContent)) !== null) {
					// Push the text before the match
					if (match.index > lastIndex) {
						fragments.push(
							textContent.slice(lastIndex, match.index)
						);
					}
					// Create a span element for the match and push it
					const span = node.createEl("span", {
						cls: "cm-todo",
						text: match[0],
					});
					fragments.push(span);
					lastIndex = match.index + match[0].length;
				}

				// Push the remaining text after the last match
				if (lastIndex < textContent.length) {
					fragments.push(textContent.slice(lastIndex));
				}

				// Clear the node's content and append the fragments
				node.empty();
				fragments.forEach((fragment) => {
					if (typeof fragment === "string") {
						node.createEl("span", { text: fragment });
					} else {
						node.appendChild(fragment);
					}
				});
			});
		});

		// Highlight in edit mode
		const todoEditorDecorator = createTodoEditorDecorator();
		this.registerEditorExtension([todoEditorDecorator]);
	}

	onunload() {
		this.removeTodoStyle();
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(TODO_VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getLeftLeaf(false);
			await leaf?.setViewState({ type: TODO_VIEW_TYPE, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	// Load + save
	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}
	async saveSettings() {
		await this.saveData(this.settings);
		this.injectTodoStyle();
	}

	// Inject <style id="todo-highlight-style"> into document head
	injectTodoStyle() {
		const styleId = "todo-highlight-style";
		let styleTag = document.getElementById(styleId) as HTMLStyleElement;
		if (!styleTag) {
			styleTag = document.createElement("style");
			styleTag.id = styleId;
			document.head.appendChild(styleTag);
		}

		// Always use the current settings (which might contain theme colors)
		let textColor;
		let bgColor;
		if (this.settings.useThemeColors) {
			textColor = this.getThemeColors().textAccent;
			bgColor = this.getThemeColors().backgroundPrimary;
		} else {
			textColor = this.settings.todoColor;
			bgColor = this.settings.todoBackgroundColor;
		}

		styleTag.textContent = `
      .cm-todo {
        color: ${textColor} !important;
        background-color: ${bgColor} !important;
        border: 1px solid ${textColor} !important;
        border-radius: 3px !important;
        padding: 2px 6px !important;
        margin: 0 2px !important;
        display: inline-block !important;
        font-weight: 500 !important;
        text-shadow: none !important;
      }
      /* also apply to preview spans just in case */
      span.cm-todo {
        color: ${textColor};
        background-color: ${bgColor};
        border: 1px solid ${textColor};
        border-radius: 3px;
        padding: 2px 6px;
        margin: 0 2px;
        display: inline-block;
        font-weight: 500;
        text-shadow: none;
      }
      
      /* Dark theme adjustments */
      .theme-dark .cm-todo,
      .theme-dark span.cm-todo {
        border-color: ${textColor};
        background-color: ${
			bgColor.includes("rgba") ? bgColor : `${bgColor}22`
		};
      }
    `;
	}

	removeTodoStyle() {
		document.getElementById("todo-highlight-style")?.remove();
	}
}
