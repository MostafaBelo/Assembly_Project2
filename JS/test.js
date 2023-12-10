import { CACHE } from "./data.js";

let mem = new CACHE();

mem.init(16*1024, 16, 1);

mem.setAddressSize(32);
mem.read(0);
mem.read(0);
mem.read(100);
mem.read(0);
mem.read(16*1024);
mem.read(16*1024+100);
mem.read(0);
