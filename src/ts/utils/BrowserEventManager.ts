type ListenerFn<T> = (event: T) => void;

interface RegisteredListener {
    type: keyof HTMLElementEventMap;
    fn: ListenerFn<unknown>;
}

export class BrowserEventManager {
    private eventListeners: Array<RegisteredListener> = [];

    constructor(private element: Element) {}

    public addListener<T extends keyof HTMLElementEventMap>(type: T, fn: ListenerFn<HTMLElementEventMap[T]>) {
        this.element.addEventListener(type, fn);
        this.eventListeners.push({ type, fn });
    }

    public dispose() {
        this.eventListeners.forEach(({ type, fn }) => {
            this.element.removeEventListener(type, fn);
        });

        this.eventListeners.length = 0;
        this.element = null;
    }
}
