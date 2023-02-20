import { TimelineItTickAdaptor } from "../adaptor";

class AnimationFrameTickAdaptor extends TimelineItTickAdaptor {
    private startTime = 0;
    private isPaused = true;

    startTick(): void {
        if (typeof window === "undefined" || !window?.requestAnimationFrame)
            throw new Error(
                "Your environment doesn't support window.requestAnimationFrame. Please switch to another adaptor."
            );
        this.isPaused = false;
        this.startTime = performance.now();
        const tick = (time: number) => {
            if (this.isPaused) return;
            this.tickCallback(time - this.startTime);
            window.requestAnimationFrame(tick);
        };
        window.requestAnimationFrame(tick);
    }
    pauseTick(): void {
        this.isPaused = true;
    }

    reset(): void {
        this.startTime = 0;
    }
}

export default AnimationFrameTickAdaptor;
