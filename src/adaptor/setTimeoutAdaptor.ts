import { TimelineItTickAdaptor } from "../adaptor";

class SetTimeoutAdaptor extends TimelineItTickAdaptor {
    private startTime = 0;
    private isPaused = true;

    startTick(): void {
        this.isPaused = false;
        this.startTime = performance.now();
        const tick = () => {
            if (this.isPaused) return;
            this.tickCallback(performance.now() - this.startTime);
            setTimeout(tick);
        };
        setTimeout(tick);
    }
    pauseTick(): void {
        this.isPaused = true;
    }

    reset(): void {
        this.startTime = 0;
    }
}

export default SetTimeoutAdaptor;
