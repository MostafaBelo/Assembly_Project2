import { convertToBinary } from "./dataConversions.js";

export class CACHE {
	address_size = 24;

	S = 0; //size
	L = 0; // cahe line size in block
	C = 0; // number of cache lines
	associativity = 0;

	accesses = 0;
	hits = 0;
	miss = 0;
	memory_time = 0;
	missPenalty = 120;
	hitPenalty = 1;

	mem = {};

	constructor(S = 0, L = 0, associativity = 0) {
		this.S = S;
		this.L = L;
		this.C = this.S / this.L;
		this.associativity = associativity;
	}
	setPenalty(missPenalty = 120, hitPenalty = 1) {
		this.missPenalty = missPenalty;
		this.hitPenalty = hitPenalty;
	}
	isIndexInCache(index) {
		index = parseInt(index, 2);
		return index in this.mem;
	}
	isvalid(index, tag) {
		index = parseInt(index, 2);
		for (let i = index; i < index + this.associativity; i++) {
			if (i in this.mem && this.mem[i].valid && this.mem[i].tag === tag) {
				return true;
			}
		}
		return false;
	}
	getRandomInt(min, max) {
		// max is exclusive and min is inclusive
		return Math.floor(Math.random() * (max - min) + min);
	}

	setAddressSize(size = 24) {
		this.address_size = size;
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
		let offset = address.slice(tagSize + indexSize, this.address_size);
		this.accesses++;

		// check index in mem of cache, and accesses++, and memory_time += access_time
		if (this.isIndexInCache(index) && this.isvalid(index, tag)) {
			//offset = parseInt(offset, 2);
			this.hits++;
			this.memory_time += this.hitPenalty;
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
		for (let i = index; i < index + this.associativity; i++) {
			if (!(i in this.mem)) {
				this.mem[i] = { valid: true, tag: tag };
				return;
			}
		}
		// if not found, pick random index and write
		index = this.getRandomInt(index, index + this.associativity);
		this.mem[index] = { valid: true, tag: tag };
	}

	init(S = 0, L = 0, associativity = 0) {
		this.S = S;
		this.L = L;
		this.C = this.S / this.L;
		this.associativity = associativity;

		this.accesses = 0;
		this.hits = 0;
		this.miss = 0;
		this.memory_time = 0;
		this.mem = {};
	}
}

export const Cache = new CACHE();
