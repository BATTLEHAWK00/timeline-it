"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter3_1 = __importDefault(require("eventemitter3"));
const priority_queue_1 = require("@datastructures-js/priority-queue");
class Task {
    constructor(timeMS, callback, name) {
        this.callback = callback;
        this.name = name;
        this.timeMS = timeMS;
    }
}
class TimelineIt extends eventemitter3_1.default {
    constructor() {
        super(...arguments);
        this.taskList = new priority_queue_1.MinPriorityQueue((task) => task.timeMS);
    }
    at(callback, time, unit, options = {}) {
        this.taskList.push(new Task(time, callback, options.name));
        return this;
    }
    then(callback, time, unit, options = {}) {
        const lastTime = this.taskList.isEmpty()
            ? 0
            : this.taskList.back().timeMS;
        this.taskList.push(new Task(lastTime + time, callback, options.name));
        return this;
    }
    clear() {
        this.taskList.clear();
        return this;
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const timeoutSet = new Set();
            const promiseList = this.taskList.toArray().map((task, index) => __awaiter(this, void 0, void 0, function* () {
                const timeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                    yield task.callback();
                    timeoutSet.delete(timeout);
                }), task.timeMS);
                timeoutSet.add(timeout);
            }));
            yield Promise.all(promiseList);
        });
    }
    pause() {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.default = () => new TimelineIt();
