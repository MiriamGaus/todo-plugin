import { TFile } from "obsidian";

export const TODO_VIEW_TYPE = "todo-list-view";

export interface TodoItem {
	file: TFile;
	line: number;
	text: string;
	context: string;
}

export interface TodoSettings {
	todoColor: string;
	todoBackgroundColor: string;
	useThemeColors: boolean;
}

export const DEFAULT_SETTINGS: TodoSettings = {
	todoColor: "#8A5CF5",
	todoBackgroundColor: "#1e1e1e",
	useThemeColors: true,
};
