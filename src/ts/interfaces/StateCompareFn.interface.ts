export interface StateCompareFn<T> {
    (a: T, b: T): boolean;
}
