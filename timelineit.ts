import EventEmitter from "eventemitter3";
import {
    MinPriorityQueue,
    PriorityQueue,
} from "@datastructures-js/priority-queue";

type TimeUnit = "ms" | "s" | "m" | "h" | "d";
type TaskCallback = () => unknown | Promise<unknown>;

interface TaskOptions {
    name?: string;
}

interface ITimelineIt {
    at: (
        callback: TaskCallback,
        time: number,
        unit: TimeUnit,
        options: TaskOptions
    ) => ITimelineIt;
    then: (
        callback: TaskCallback,
        time: number,
        unit: TimeUnit,
        options: TaskOptions
    ) => ITimelineIt;
    start: () => Promise<void>;
    pause: () => Promise<void>;
    clear: () => ITimelineIt;
}

class Task {
    readonly name?: string;
    readonly timeMS: number;
    readonly callback: TaskCallback;

    constructor(timeMS: number, callback: TaskCallback, name?: string) {
        this.callback = callback;
        this.name = name;
        this.timeMS = timeMS;
    }
}

class TimelineIt extends EventEmitter implements ITimelineIt {
    private taskList = new MinPriorityQueue<Task>((task) => task.timeMS);

    at(
        callback: TaskCallback,
        time: number,
        unit: TimeUnit,
        options: TaskOptions = {}
    ) {
        this.taskList.push(new Task(time, callback, options.name));
        return this;
    }
    then(
        callback: TaskCallback,
        time: number,
        unit: TimeUnit,
        options: TaskOptions = {}
    ) {
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
    async start() {
        const timeoutSet = new Set<number>();
        const promiseList = this.taskList.toArray().map(async (task, index) => {
            const timeout = setTimeout(async () => {
                await task.callback();
                timeoutSet.delete(timeout);
            }, task.timeMS);
            timeoutSet.add(timeout);
        });
        await Promise.all(promiseList);
    }
    async pause() {}
}
export default () => new TimelineIt();
