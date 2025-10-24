import {
	EditorView,
	ViewPlugin,
	ViewUpdate,
	Decoration,
	DecorationSet,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";

export const createTodoEditorDecorator = () => {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;
			constructor(view: EditorView) {
				this.decorations = this.buildDeco(view);
			}
			update(update: ViewUpdate) {
				if (update.docChanged || update.viewportChanged) {
					this.decorations = this.buildDeco(update.view);
				}
			}
			buildDeco(view: EditorView) {
				const builder = new RangeSetBuilder<Decoration>();
				const regex = /\bToDo\b/g;
				for (const { from, to } of view.visibleRanges) {
					const text = view.state.doc.sliceString(from, to);
					let m;
					while ((m = regex.exec(text)) !== null) {
						const start = from + m.index;
						const end = start + m[0].length;
						builder.add(
							start,
							end,
							Decoration.mark({ class: "cm-todo" })
						);
					}
				}
				return builder.finish();
			}
		},
		{ decorations: (v) => v.decorations }
	);
};
