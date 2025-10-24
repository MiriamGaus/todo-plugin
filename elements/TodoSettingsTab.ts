import { App, PluginSettingTab, Setting, ColorComponent } from "obsidian";
import { DEFAULT_SETTINGS } from "../types";
import type TodoPlugin from "../main";

export class TodoHighlightSettingTab extends PluginSettingTab {
	plugin: TodoPlugin;

	constructor(app: App, plugin: TodoPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		let pickerFont: ColorComponent | undefined;
		let pickerBackground: ColorComponent | undefined;

		new Setting(containerEl)
			.setName("Use Color Theme")
			.setDesc("Automatically use current theme colors.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.useThemeColors)
					.onChange(async (value) => {
						this.plugin.settings.useThemeColors = value;
						await this.plugin.saveSettings();
						this.display();
					})
			);
		new Setting(containerEl)
			.setName("TODO font colour")
			.setDesc("Choose the font colour for your TODOs.")
			.addExtraButton((btn) =>
				btn
					.setIcon("rotate-ccw")
					.setTooltip("Reset to default colour")
					.onClick(async () => {
						const defaultColour = DEFAULT_SETTINGS.todoColor;
						this.plugin.settings.todoColor = defaultColour;
						pickerFont?.setValue(defaultColour);
						await this.plugin.saveSettings();
					})
					.setDisabled(this.plugin.settings.useThemeColors)
			)
			.addColorPicker((cp) => {
				pickerFont = cp;
				cp.setValue(this.plugin.settings.todoColor).onChange(
					async (value) => {
						this.plugin.settings.todoColor = value;
						await this.plugin.saveSettings();
					}
				);
				// Apply disabled styling
				if (this.plugin.settings.useThemeColors) {
					cp.setDisabled(true);
				}
			});

		// Apply CSS class for visual disabled state
		if (this.plugin.settings.useThemeColors) {
			const fontSettingEl =
				containerEl.children[containerEl.children.length - 1];
			fontSettingEl.addClass("todo-setting-disabled");
		}

		new Setting(containerEl)
			.setName("TODO background colour")
			.setDesc("Choose the background colour for your TODOs.")
			.addExtraButton((btn) =>
				btn
					.setIcon("rotate-ccw")
					.setTooltip("Reset to default colour")
					.onClick(async () => {
						const defaultBackgroundColour =
							DEFAULT_SETTINGS.todoBackgroundColor;
						this.plugin.settings.todoBackgroundColor =
							defaultBackgroundColour;
						pickerBackground?.setValue(defaultBackgroundColour);
						await this.plugin.saveSettings();
					})
					.setDisabled(this.plugin.settings.useThemeColors)
			)
			.addColorPicker((cp) => {
				pickerBackground = cp;
				cp.setValue(this.plugin.settings.todoBackgroundColor).onChange(
					async (value) => {
						this.plugin.settings.todoBackgroundColor = value;
						await this.plugin.saveSettings();
					}
				);
				// Apply disabled styling
				if (this.plugin.settings.useThemeColors) {
					cp.setDisabled(true);
				}
			});

		// Apply CSS class for visual disabled state
		if (this.plugin.settings.useThemeColors) {
			const backgroundSettingEl =
				containerEl.children[containerEl.children.length - 1];
			backgroundSettingEl.addClass("todo-setting-disabled");
		}
	}
}
