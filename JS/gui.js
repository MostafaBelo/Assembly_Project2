class UI {
	codeAreaWrapper = document.getElementById("codeArea");
	codeLineHighlight = document.getElementById("highlight-line");
	codeLineNumbersArea = document.getElementById("codeLineNumbers");
	codeArea = document.getElementById("code");
	memArea = document.getElementById("mem");

	code_actions_btns = {
		open_file_input: document.getElementById("open-file-choose-input"),
		play_btn: document.getElementById("play-btn"),
		stop_btn: document.getElementById("stop-btn"),

		next_btn: document.getElementById("next-btn"),
		fall_through_btn: document.getElementById("fall-through-btn"),
	};

	code_tabs = {
		code_tab: document.getElementById("code-tab"),
		execution_tab: document.getElementById("execution-tab"),
	};

	details_inputs = {
		s: document.getElementById("S-input"),
		l: document.getElementById("L-input"),
		associativity: document.getElementById("associativity-input"),
		accesses: document.getElementById("accesses-input"),
		hits: document.getElementById("hits-input"),
		misses: document.getElementById("misses-input"),
		amat: document.getElementById("amat-input"),
		first_cache_address: document.getElementById("first-cache-address-input"),
	};

	cache = undefined;
	flow = undefined;

	onPlay = () => {};
	onStop = () => {};
	onNext = () => {};
	onFallThrough = () => {};

	// isPlaying = false;

	firstAddress = 8000;

	currentTab = "code";

	codeContent = "";

	s = 0;
	l = 0;
	associativity = 1;

	constructor() {
		// this.setup();
	}

	setCache(cache) {
		this.cache = cache;
	}
	setFlow(flow) {
		this.flow = flow;
	}

	setupCode() {
		// auto focus
		this.codeAreaWrapper.onclick = (e) => {
			this.codeArea.focus();
		};
		// line numbering
		this.codeArea.addEventListener(
			"input",
			(e) => {
				let content = e.target.value;
				const numberOfLines = content.split("\n").length;

				this.codeLineNumbersArea.innerHTML = Array(numberOfLines)
					.fill("<span></span>")
					.join("");

				if (this.currentTab === "code") this.codeContent = content;
			},
			false
		);

		this.code_actions_btns.open_file_input.onchange = (e) => {
			let file = this.code_actions_btns.open_file_input.files[0];

			let reader = new FileReader();
			reader.readAsText(file, "UTF-8");

			this.code_actions_btns.open_file_input.value = "";
			reader.onload = (readerEvent) => {
				let content = readerEvent.target.result;

				// check if running?
				this.codeArea.value = content;
				this.update();
			};
		};

		// setting playing mode with button click
		this.code_actions_btns.play_btn.onclick = (e) => {
			this.onPlay();
		};
		this.code_actions_btns.stop_btn.onclick = (e) => {
			this.onStop();
		};

		// setting execution actions with button click
		this.code_actions_btns.next_btn.onclick = (e) => {
			this.onNext();
		};
		this.code_actions_btns.fall_through_btn.onclick = (e) => {
			this.onFallThrough();
		};

		// tab buttons
		this.code_tabs.code_tab.onclick = (e) => {
			if (this.flow.isPlaying) return;
			this.setCurrentTab("code");
		};
		this.code_tabs.execution_tab.onclick = (e) => {
			if (!this.flow.isPlaying) return;
			this.setCurrentTab("execution");
		};

		this.updateCode();
	}
	setupCache() {
		this.updateCache();
	}
	setupDetails() {
		this.details_inputs.s.value = 0;
		this.details_inputs.l.value = 0;
		this.details_inputs.associativity.value = 1;

		this.details_inputs.accesses.value = "0";
		this.details_inputs.hits.value = "0 (0%)";
		this.details_inputs.misses.value = "0 (0%)";
		this.details_inputs.amat.value = "0";
		this.details_inputs.first_cache_address.value = 0;

		this.details_inputs.s.oninput = (e) => {
			let s = this.details_inputs.s.value;
			this.s = parseInt(s);
			this.update();
		};
		this.details_inputs.l.oninput = (e) => {
			let l = this.details_inputs.l.value;
			this.l = parseInt(l);
			this.update();
		};
		this.details_inputs.associativity.oninput = (e) => {
			let associativity = this.details_inputs.associativity.value;
			this.associativity = parseInt(associativity);
			this.update();
		};

		this.details_inputs.first_cache_address.oninput = (e) => {
			let address = this.details_inputs.first_cache_address.value;
			this.firstAddress = parseInt(address);
			this.update();
		};

		this.updateDetails();
	}
	setup(cache, flow) {
		if (cache !== undefined) this.setCache(cache);
		if (flow !== undefined) this.setFlow(flow);
		this.setupCode();
		this.setupCache();
		this.setupDetails();
	}

	updateCode() {
		if (this.flow.isPlaying) {
			this.code_actions_btns.play_btn.style.display = "none";
			this.code_actions_btns.stop_btn.style.display = "flex";

			if (this.currentTab !== "execution") {
				this.setCurrentTab("execution");
			}

			this.codeLineHighlight.style.top = `${
				1.2 * this.flow.currentInstruction
			}rem`;
		} else {
			this.code_actions_btns.play_btn.style.display = "flex";
			this.code_actions_btns.stop_btn.style.display = "none";

			if (this.currentTab === "execution") {
				this.setCurrentTab("code");
			}
		}
		this.codeArea.dispatchEvent(new Event("input"));
	}
	updateCodeTab() {
		this.removeAllTabButtonSelections();
		if (this.currentTab === "code") {
			this.code_tabs.code_tab.classList.add("selected");

			this.codeArea.disabled = false;
			this.codeLineHighlight.style.display = "none";
			this.codeArea.value = this.codeContent;
			this.codeArea.placeholder = "0, 1024, 100, 0";
		} else if (this.currentTab === "execution") {
			this.code_tabs.execution_tab.classList.add("selected");

			this.codeArea.disabled = true;
			this.codeLineHighlight.style.display = "block";
			this.codeArea.value = this.computeExecutionContent();
			this.codeArea.placeholder = "";
		}

		this.update();
	}
	updateCache() {
		// TODO:
		let cache = this.cache;
		let address = this.firstAddress;
		// generate memory ui
		let memText = `<tr>
							<td class="memoryAddress">Address</td>
							<td class="memoryValue">+3</td>
							<td class="memoryValue">+2</td>
							<td class="memoryValue">+1</td>
							<td class="memoryValue">+0</td>
						</tr>`;
		for (let i = 0; i < 6; i++) {
			// let vals = [
			// 	mem.read1(address),
			// 	mem.read1(address + 1),
			// 	mem.read1(address + 2),
			// 	mem.read1(address + 3),
			// ];
			// vals = [
			// 	convertToHexAndBinary(vals[0], 8),
			// 	convertToHexAndBinary(vals[1], 8),
			// 	convertToHexAndBinary(vals[2], 8),
			// 	convertToHexAndBinary(vals[3], 8),
			// ];
			// memText += `<tr>
			// 				<td class="memoryAddress">${address}</td>
			// 				<td class="memoryValue">${vals[3][format]}</td>
			// 				<td class="memoryValue">${vals[2][format]}</td>
			// 				<td class="memoryValue">${vals[1][format]}</td>
			// 				<td class="memoryValue">${vals[0][format]}</td>
			// 			</tr>`;
			// address += 4;
		}
		this.memArea.innerHTML = `<tbody>${memText}</tbody>`;
	}
	updateDetails() {
		this.details_inputs.accesses.value = `${this.cache.accesses}`;
		this.details_inputs.hits.value = `${this.cache.hits} (${
			this.cache.getHitsRatio() * 100
		}%)`;
		this.details_inputs.misses.value = `${this.cache.miss} (${
			this.cache.getMissessRatio() * 100
		}%)`;
		this.details_inputs.amat.value = `${this.cache.getAMAT()}`;
	}
	update() {
		this.updateCode();
		this.updateCache();
		this.updateDetails();
	}

	removeAllTabButtonSelections() {
		this.code_tabs.code_tab.classList.remove("selected");
		this.code_tabs.execution_tab.classList.remove("selected");
	}

	setCurrentTab(newTab) {
		if (this.currentTab === newTab) return;
		if (["code", "execution"].includes(newTab)) {
			this.currentTab = newTab;
		} else {
			this.currentTab = "code";
		}

		this.updateCodeTab();
	}

	computeExecutionContent() {
		let ins = this.flow.parser.parsed;
		let res = ins.join("\n");
		return res;
	}
}

export default new UI();
