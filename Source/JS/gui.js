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
		highlight_cache_address: document.getElementById(
			"highlight-cache-address-input"
		),
		cache_access_time: document.getElementById("cache-access-time-input"),
		memory_access_time: document.getElementById("memory-access-time-input"),
		memory_address_size: document.getElementById("memory-address-size-input"),
	};

	cache = undefined;
	flow = undefined;

	onPlay = () => {};
	onStop = () => {};
	onNext = () => {};
	onFallThrough = () => {};

	// isPlaying = false;

	highlightAddress = -1;
	cache_access_time = 1;
	memory_access_time = 120;

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
		this.details_inputs.highlight_cache_address.value = -1;
		this.details_inputs.cache_access_time.value = 1;
		this.details_inputs.memory_access_time.value = 120;
		this.details_inputs.memory_address_size.value = 24;

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

		this.details_inputs.highlight_cache_address.oninput = (e) => {
			let address = this.details_inputs.highlight_cache_address.value;
			this.highlightAddress = parseInt(address);
			this.update();
		};

		this.details_inputs.cache_access_time.oninput = (e) => {
			let time = this.details_inputs.cache_access_time.value;
			this.cache_access_time = parseInt(time);
			this.update();
		};

		this.details_inputs.memory_access_time.oninput = (e) => {
			let time = this.details_inputs.memory_access_time.value;
			this.memory_access_time = parseInt(time);
			this.update();
		};

		this.details_inputs.memory_address_size.oninput = (e) => {
			let memorySize = this.details_inputs.memory_address_size.value;
			this.memorySize = parseInt(memorySize);
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
		let cache = this.cache;
		let lastAccess = cache.lastAccess;
		// generate memory ui
		let memText = `<tr>
        <td class="memoryAddress">Block Address</td>`;
		for (let i = 0; i < cache.associativity; i++) {
			memText += `
            <td class="memoryValue">Valid</td>
            <td class="memoryValue">Tag</td>
            `;
		}
		memText += `</tr>`;

		if (
			cache.S != 0 &&
			cache.L != 0 &&
			cache.C != 0 &&
			cache.associativity != 0
		) {
			let height = cache.C / cache.associativity;
			for (let i = 0; i < height; i++) {
				memText += `<tr>
                <td class="memoryAddress ${
									i === this.highlightAddress && "address-highlight"
								}">${i}</td>`;
				let val = cache.get(i);
				for (let j = 0; j < cache.associativity; j++) {
					if (lastAccess[0] === i && lastAccess[1] === j) {
						memText += `<td class="memoryValue ${
							lastAccess[2] ? "hit-highlight" : "miss-highlight"
						}">${val[j].valid}</td>`;
						memText += `<td class="memoryValue ${
							lastAccess[2] ? "hit-highlight" : "miss-highlight"
						}">${val[j].tag}</td>`;
					} else {
						memText += `<td class="memoryValue">${val[j].valid}</td>`;
						memText += `<td class="memoryValue">${val[j].tag}</td>`;
					}
				}
				memText += `</tr>`;
			}
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
