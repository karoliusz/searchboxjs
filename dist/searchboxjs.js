import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

class State {
  static areEqualShallow(a, b) {
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
  lastBroadcastedState = null;
  compareState;
  stateSource;
  _state$;
  get state$() {
    return this._state$;
  }
  constructor(initialState) {
    this.lastBroadcastedState = { ...initialState };
    this.compareState = this.defaultCompareState;
    this.stateSource = new BehaviorSubject(this.lastBroadcastedState);
    this._state$ = this.stateSource.pipe(distinctUntilChanged(this.compareState));
  }
  setState(state) {
    this.lastBroadcastedState = { ...this.lastBroadcastedState, ...state };
    this.stateSource.next(this.lastBroadcastedState);
  }
  defaultCompareState(a, b) {
    return State.areEqualShallow(a, b);
  }
}

class SearchBox {
  constructor(inputElement, dataSource, itemTemplate, searchKeys, options = {}) {
    this.inputElement = inputElement;
    this.dataSource = dataSource;
    this.itemTemplate = itemTemplate;
    this.searchKeys = searchKeys;
    this.options = options;
    if (!(inputElement instanceof HTMLInputElement)) {
      throw new Error("Input element must be a valid HTMLInputElement!");
    }
    this.state = new State({
      inputFocused: false,
      resultListFocused: false,
      inputValue: "",
      selectedItem: null
    });
    this.stateSubscription = this.state.state$.subscribe((event) => this.onStateChange(event));
  }
  state = null;
  stateSubscription;
  dispose() {
    this.inputElement = null;
    this.stateSubscription.unsubscribe();
  }
  initialize() {
    this.dataSource.getItems("", 10, this.searchKeys).then((data) => {
    });
  }
  onStateChange(event) {
    console.log("state changed", event);
    if (event.selectedItem && this.options.onItemSelect) {
      this.options.onItemSelect(event.selectedItem);
    }
  }
}

export { SearchBox as default };
//# sourceMappingURL=searchboxjs.js.map
