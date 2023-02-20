export abstract class TimelineItTickAdaptor {
    protected readonly tickCallback;
    protected currentTime = 0;
    constructor(tickCallback: (time: number) => void | Promise<void>) {
        this.tickCallback = tickCallback;
    }
    abstract startTick(): void;
    abstract pauseTick(): void;

    abstract reset(): void;
}
