type StateSubscriber<StateType> = (state: StateType) => void;

export class State<T> {
    private state: T = null;
    private lastBroadcastedState: T = null;
    private subscribers = new Set<StateSubscriber<T>>();

    constructor(initialState: T) {
        this.state = { ...initialState };
    }

    public setState(state: Partial<T>) {
        this.state = { ...this.state, ...state };
        this.broadcast();

        return this.getState();
    }

    public getState(): T {
        return { ...this.state };
    }

    public subscribe(subscriberFn: StateSubscriber<T>) {
        this.subscribers.add(subscriberFn);

        return () => {
            this.subscribers.delete(subscriberFn);
        };
    }

    private broadcast() {
        const state = this.getState();

        // TODO: Compare states, allow to pass custom compare function
        // if (this.lastBroadcastedState !== state) {};

        this.lastBroadcastedState = { ...state };
        this.subscribers.forEach(subscriber => subscriber(state));
    }
}
