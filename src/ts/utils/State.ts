import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

import { StateCompareFn } from '../interfaces';

export class State<T extends object> {
    static areEqualShallow(a: object, b: object): boolean {
        for (let key in a) {
            if (!(key in b) || a[key] !== b[key]) {
                return false;
            }
        }

        for (let key in b) {
            if (!(key in a)) {
                return false;
            }
        }

        return true;
    }

    private lastBroadcastedState: T = null;
    private compareState: StateCompareFn<T>;

    private stateSource: BehaviorSubject<T>;
    private _state$: Observable<T>;

    public get state$(): Observable<T> {
        return this._state$;
    }

    constructor(initialState: T) {
        this.lastBroadcastedState = { ...initialState };
        this.compareState = this.defaultCompareState;
        this.stateSource = new BehaviorSubject(this.lastBroadcastedState);
        this._state$ = this.stateSource.pipe(
            distinctUntilChanged(this.compareState)
        );
    }

    public setState(state: Partial<T>): void {
        this.lastBroadcastedState = { ...this.lastBroadcastedState, ...state };
        this.stateSource.next(this.lastBroadcastedState);
    }

    private defaultCompareState(a: T, b: T): boolean {
        return State.areEqualShallow(a, b);
    }
}
