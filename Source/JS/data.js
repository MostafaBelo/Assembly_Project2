import { convertToBinary } from "./dataConversions.js";

export class CACHE {
	address_size = 24;

	S = 0; //size
	L = 0; // cahe line size in block
	C = 0; // number of cache lines
	associativity = 1;

	accesses = 0;
	hits = 0;
	miss = 0;
	memory_time = 0;
	missPenalty = 120;
	hitPenalty = 1;

	lastAccess = [-1, -1, false];

	mem = {};

	constructor(S = 0, L = 0, associativity = 1) {
		this.S = S;
		this.L = L;
		this.C = this.S / this.L;
		this.associativity = associativity;
	}
	setPenalty(missPenalty = 120, hitPenalty = 1) {
		this.missPenalty = missPenalty;
		this.hitPenalty = hitPenalty;
	}
	isIndexInCache(index, isBin = true) {
		if (isBin) index = parseInt(index, 2);
		return index in this.mem;
	}
	isvalid(index, tag) {
		index = parseInt(index, 2);
		for (let i = 0; i < this.associativity; i++) {
			if (this.mem[index][i].valid && this.mem[index][i].tag === tag) {
				return true;
			}
		}
		return false;
	}
	getJ(index, tag, isBin = true) {
		if (isBin) index = parseInt(index, 2);
		for (let i = 0; i < this.associativity; i++) {
			if (this.mem[index][i].valid && this.mem[index][i].tag === tag) {
				return i;
			}
		}
		return -1;
	}
	getRandomInt(min, max) {
		// max is exclusive and min is inclusive
		return Math.floor(Math.random() * (max - min) + min);
	}

	setAddressSize(size = 24) {
		this.address_size = size;
	}

	get(index) {
		if (index < 0 || index >= this.C / this.associativity) return undefined;
		// if (entryAddress < 0 || entryAddress >= this.S) return undefined;

		// let offset = entryAddress % this.L;
		// let index = Math.floor(entryAddress / this.L);

		if (this.isIndexInCache(index, false)) {
			return this.mem[index];
		} else {
			let tmp = [];
			for (let i = 0; i < this.associativity; i++) {
				tmp.push({ valid: false, tag: 0 });
			}
			return tmp;
		}
	}
	read(address) {
		address = convertToBinary(address, this.address_size);
		let offsetSize = Math.log2(this.L); // review this line
		let indexSize = Math.log2(this.C / this.associativity);
		let tagSize = this.address_size - offsetSize - indexSize;
		// get tag, index, and offset by slicing the address
		//address = "tag index offset";
		let tag = address.slice(0, tagSize);
		let index = address.slice(tagSize, tagSize + indexSize);
		if (indexSize === 0) index = "0";
		let offset = address.slice(tagSize + indexSize, this.address_size);
		this.accesses++;
		this.memory_time += this.hitPenalty;

		// check index in mem of cache, and accesses++, and memory_time += access_time
		if (this.isIndexInCache(index) && this.isvalid(index, tag)) {
			//offset = parseInt(offset, 2);
			this.hits++;
			index = parseInt(index, 2);
			this.lastAccess = [index, this.getJ(index, tag, false), true];
		}
		// if not found, write from RAM, and miss++
		else {
			this.write(tag, index, offset);
		}

		// if found, check validity and tag
		// if correct, get by offset, and hits++
		// if not correct, write from RAM, and miss++
		// if not found, write from RAM, miss++
	}

	getHitsRatio() {
		if (this.accesses === 0) return 0;
		return this.hits / this.accesses;
	}
	getMissessRatio() {
		if (this.accesses === 0) return 0;
		return this.miss / this.accesses;
	}
	getAMAT() {
		if (this.accesses === 0) return 0;
		return this.memory_time / this.accesses;
	}

	write(tag, index, offset) {
		this.miss++;
		this.memory_time += this.missPenalty;
		index = parseInt(index, 2);
		if (this.isIndexInCache(index, false)) {
			for (let i = 0; i < this.mem[index].length; i++) {
				if (!this.mem[index][i].valid) {
					this.mem[index][i] = { valid: true, tag: tag };
					this.lastAccess = [index, i, false];
					return;
				}
			}
			// all filled, pick random index and write
			let i = this.getRandomInt(0, this.associativity);
			this.mem[index][i] = { valid: true, tag, tag };
			this.lastAccess = [index, i, false];
		} else {
			// all empty, pick random index and write
			this.mem[index] = [];
			for (let i = 0; i < this.associativity; i++) {
				this.mem[index].push({ valid: false, tag: 0 });
			}
			let i = this.getRandomInt(0, this.associativity);
			this.mem[index][i] = { valid: true, tag, tag };
			this.lastAccess = [index, i, false];
		}
	}

	init(S = 0, L = 0, associativity = 1) {
		this.S = S;
		this.L = L;
		this.C = this.S / this.L;
		this.associativity = associativity;

		this.accesses = 0;
		this.hits = 0;
		this.miss = 0;
		this.memory_time = 0;
		this.mem = {};

		this.lastAccess = [-1, -1, false];
	}
}

export const Cache = new CACHE();
