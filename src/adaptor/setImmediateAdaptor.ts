import { TimelineItTickAdaptor } from "../adaptor";

class SetImmediateAdaptor extends TimelineItTickAdaptor {
    private startTime = 0;
    private isPaused = true;

    startTick(): void {
        if (typeof setImmediate === "undefined")
            throw new Error(
                "Your environment doesn't support setImmediate. Please switch to another adaptor."
            );
        this.isPaused = false;
        this.startTime = performance.now();
        const tick = () => {
            if (this.isPaused) return;
            this.tickCallback(performance.now() - this.startTime);
            setImmediate(tick);
        };
        setImmediate(tick);
    }
    pauseTick(): void {
        this.isPaused = true;
    }

    reset(): void {
        this.startTime = 0;
    }
}

export default SetImmediateAdaptor;
