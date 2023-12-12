import "./test.js";
import { Cache } from "./data.js";
import { flow } from "./flow.js";
import ui from "./gui.js";
import { Parser } from "./parser.js";

flow.setupUI(ui);
flow.setParser(new Parser());
ui.setup(Cache, flow);
