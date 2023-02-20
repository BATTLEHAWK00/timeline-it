import { TimelineItTickAdaptor } from "../adaptor";

class CommonTickAdaptor extends TimelineItTickAdaptor {
    private interval?: number;
    private startTime: number = 0;
    startTick() {
        this.startTime = performance.now();
        this.interval = setInterval(() => {
            this.tickCallback(performance.now() - this.startTime);
        }, 1);
    }
    pauseTick() {
        clearInterval(this.interval);
    }

    reset(): void {
        this.startTime = 0;
    }
}
export default CommonTickAdaptor;
