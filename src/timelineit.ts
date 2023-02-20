import EventEmitter from "eventemitter3";
import {
    MinPriorityQueue,
    PriorityQueue,
} from "@datastructures-js/priority-queue";
import { TimelineItTickAdaptor } from "./adaptor";
import SetIntervalAdaptor from "./adaptor/setIntervalAdaptor";
import AnimationFrameTickAdaptor from "./adaptor/animationFrameAdaptor";
import SetImmediateAdaptor from "./adaptor/setImmediateAdaptor";
import SetTimeoutAdaptor from "./adaptor/setTimeoutAdaptor";
import NextTickAdaptor from "./adaptor/nextTickAdaptor";

type TimeUnit = "ms" | "s" | "m" | "h" | "d";
type TaskCallback = () => unknown | Promise<unknown>;

interface TaskOptions {
    name?: string;
}

const adaptorNameMap = {
    setInterval: SetIntervalAdaptor,
    animationFrame: AnimationFrameTickAdaptor,
    setImmediate: SetImmediateAdaptor,
    setTimeout: SetTimeoutAdaptor,
    nextTick: NextTickAdaptor,
} as const;

type AdaptorName = keyof typeof adaptorNameMap;

interface TimelineItOptions {
    adaptor?: AdaptorName;
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
    private readonly taskList = new MinPriorityQueue<Task>(
        (task) => task.timeMS
    );
    private readonly adaptor: TimelineItTickAdaptor;

    constructor(options: TimelineItOptions) {
        super();
        const AdaptorConstructor =
            adaptorNameMap[options?.adaptor ?? "setTimeout"];
        this.adaptor = new AdaptorConstructor(this.onTick.bind(this));
    }

    private onTick(time: number) {
        this.emit("tick", {
            time,
            percentage: Math.min(time / this.taskList.back().timeMS, 1),
        });
        while (
            !this.taskList.isEmpty() &&
            time >= this.taskList.front().timeMS
        ) {
            this.taskList.pop().callback();
        }
        if (this.taskList.isEmpty()) {
            this.adaptor.pauseTick();
            this.emit("timelineEnd");
        }
    }

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
        this.emit("timelineStart");
        this.adaptor.reset();
        this.adaptor.startTick();
        return new Promise<void>((resolve) =>
            this.once("timelineEnd", resolve)
        );
    }
    async pause() {
        this.emit("paused", this.adaptor);
        this.adaptor.pauseTick();
    }
}
export default (options: TimelineItOptions) => new TimelineIt(options);
