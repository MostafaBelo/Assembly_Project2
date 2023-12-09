import { convertToBinary } from "./dataConversions.js";

// TODO:
export class CACHE {
	address_size = 24;

	S = 0;
	L = 0;
	access_time = 0; // no of cycles
	associativity = 0;

	accesses = 0;
	hits = 0;
	miss = 0;
	memory_time = 0;

	mem = {
		"index: bin": ["valid: bool", "tag: bin"],
	};

	constructor(S = 0, L = 0, access_time = 0, associativity = 0) {
		this.S = S;
		this.L = L;
		this.access_time = access_time;
		this.associativity = associativity;
	}

	setAddressSize(size = 24) {
		this.address_size = size;
	}

	read(address) {
		address = convertToBinary(address, this.address_size);
		// get tag, index, and offset by slicing the address
		address = "tag index offset";

		// check index in mem of cache, and accesses++, and memory_time += access_time

		// if found, check validity and tag
		// if correct, get by offset, and hits++
		// if not correct, write from RAM, and miss++

		// if not found, write from RAM, miss++
	}

	write(address) {
		// address given is already in binary
		// write into the cache using the associativity degree
		// randomness in case not direct mapping
		// memory_time += 120(memory access time)
	}

	getAMAT() {
		return this.memory_time / this.accesses;
	}

	init(S = 0, L = 0, access_time = 0, associativity = 0) {
		this.S = S;
		this.L = L;
		this.access_time = access_time;
		this.associativity = associativity;

		this.accesses = 0;
		this.hits = 0;
		this.miss = 0;
		this.memory_time = 0;
		this.mem = {};
	}
}

export const Cache = new CACHE();
