import { TimelineItTickAdaptor } from "../adaptor";

class NextTickAdaptor extends TimelineItTickAdaptor {
    private startTime = 0;
    private isPaused = true;

    startTick(): void {
        if (typeof process === "undefined")
            throw new Error(
                "Your environment doesn't support setImmediate. Please switch to another adaptor."
            );
        this.isPaused = false;
        this.startTime = performance.now();
        const tick = () => {
            if (this.isPaused) return;
            this.tickCallback(performance.now() - this.startTime);
            process.nextTick(tick);
        };
        process.nextTick(tick);
    }
    pauseTick(): void {
        this.isPaused = true;
    }

    reset(): void {
        this.startTime = 0;
    }
}

export default NextTickAdaptor;
