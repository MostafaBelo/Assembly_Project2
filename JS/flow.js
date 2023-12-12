import { Cache } from "./data.js";

export class Flow {
	ui = undefined;
	isPlaying = false;

	parser = undefined;
	currentInstruction = 0; // the one to be executed

	constructor() {}

	setUI(ui) {
		this.ui = ui;
	}
	setParser(par) {
		this.parser = par;
	}

	setupUI(ui) {
		if (ui !== undefined) this.setUI(ui);

		this.ui.onPlay = () => {
			this.startExecution();
		};
		this.ui.onStop = () => {
			this.stopExecution();
		};
		this.ui.onNext = () => {
			this.executeNext();
		};
		this.ui.onFallThrough = () => {
			this.executeAll();
		};
	}

	getInstructions() {
		return this.parser.parsed;
	}

	startExecution() {
		if (this.isPlaying) return;

		this.isPlaying = true;

		let AccessCode = this.ui.codeContent;

		// call parser and save its outcome for later execution (maybe as it is already saved in the parser)
		this.parser.takeFile(AccessCode);
		if (!this.parser.validate_reads()) {
			alert("Failed to parse code");
			this.isPlaying = false;
			return;
		}
		this.parser.seperate_reads();

		let s = this.ui.s;
		let l = this.ui.l;
		let associativity = this.ui.associativity;
		Cache.init(s, l, associativity);
		this.currentInstruction = 0;

		this.ui.setCurrentTab("execution"); // implicitly calls update
		// this.ui.update();
	}

	executeNext() {
		if (!this.isPlaying) return;

		this.executeCommand();
		this.ui.update();
	}

	executeAll() {
		if (!this.isPlaying) return;

		// while running, keep executing commands
		while (this.isPlaying) {
			this.executeCommand();
		}

		// after execution of all commands update ui
		this.ui.update();
	}

	stopExecution() {
		if (!this.isPlaying) return;

		this.isPlaying = false;
		this.ui.setCurrentTab("code"); // implicitly calls update
	}

	executeCommand() {
		if (this.getInstructions().length === this.currentInstruction) {
			this.isPlaying = false;
			return;
		}
		const instruction = this.getInstructions()[this.currentInstruction]; // address

		Cache.read(instruction);
		this.currentInstruction++;
	}
}

export const flow = new Flow();
