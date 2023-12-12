export class Parser {
	reads = "";
	parsed = [];
	constructor(readsFile) {
		if (readsFile !== undefined) this.takeFile(readsFile);
	}
	takeFile(readsFile) {
		this.reads = readsFile;
	}

	validate_reads() {
		let reads_file = this.reads;
		if (typeof reads_file !== "string") {
			return false;
		}

		if (reads_file === "") return true;

		reads_file = reads_file.replaceAll("\n", "");
		reads_file = reads_file.replaceAll(" ", "");
		for (let i = 0; i < reads_file.length; i++) {
			if (!"0123456789,".includes(reads_file[i])) {
				return false;
			}
		}
		if (reads_file.split(",").includes("")) {
			return false;
		}
		return true;
	}

	seperate_reads() {
		this.parsed = [];

		let arr = this.reads.replaceAll("\n", "").replaceAll(" ", "").split(",");
		arr = arr.filter(function (elem) {
			return elem !== "";
		});
		for (let i = 0; i < arr.length; i++) {
			this.parsed.push(parseInt(arr[i]));
		}
	}
}
