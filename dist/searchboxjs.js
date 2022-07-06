import { BehaviorSubject, distinctUntilChanged, first, map, filter, debounceTime, merge, skipUntil, switchMap } from 'rxjs';

const SEARCH_BOX_LIST_DEFAULT_Z_INDEX = 10;
const DEFAULT_CLASS_NAMES = {
  searchBox: {
    focusedClassName: "searchBox--focused",
    wrapperClassName: "searchBox__wrapper",
    loadingClassName: "searchBox--loading"
  },
  searchBoxList: {
    defaultClassName: "searchBoxList",
    itemDefaultClassName: "searchBoxList__item",
    itemButtonDefaultClassName: "searchBoxList__itemButton",
    messageClassName: "searchBoxList__message",
    loadingIndicatorClassName: "searchBoxList__loadingIndicator"
  },
  searchBoxInput: {
    defaultClassName: "searchBox__input"
  },
  searchBoxInputLoadingIndicator: {
    defaultClassName: "searchBoxInput__loadingIndicator",
    visibleClassName: "searchBoxInput__loadingIndicator--visible",
    hiddenClassName: "searchBoxInput__loadingIndicator--hidden"
  }
};
const TEXT = {
  noResultsFound: "Sorry, can't find a match for your search phrase!",
  loading: "Loading your results\u2026"
};

class BrowserEventManager {
  constructor(element) {
    this.element = element;
  }
  eventListeners = [];
  addListener(type, fn) {
    this.element.addEventListener(type, fn);
    this.eventListeners.push({ type, fn });
  }
  dispose() {
    this.eventListeners.forEach(({ type, fn }) => {
      this.element.removeEventListener(type, fn);
    });
    this.eventListeners.length = 0;
    this.element = null;
  }
}

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

function getPathBetweenElements(ancestor, descendant) {
  if (!ancestor || !descendant || !ancestor.contains(descendant)) {
    return null;
  }
  if (ancestor === descendant) {
    return [ancestor];
  }
  const path = [descendant];
  let currentNode = descendant;
  while (currentNode.parentNode && currentNode.parentNode !== ancestor) {
    currentNode = currentNode.parentNode;
    path.unshift(currentNode);
  }
  path.unshift(ancestor);
  return path;
}

class SearchBoxInput {
  constructor(inputElement, options = {}) {
    this.inputElement = inputElement;
    this.options = options;
    this.browserEventManager = new BrowserEventManager(this.inputElement);
    this.browserEventManager.addListener("focus", () => {
      this.options.onFocus && this.options.onFocus();
    });
    this.browserEventManager.addListener("blur", () => {
      this.options.onBlur && this.options.onBlur();
    });
    this.browserEventManager.addListener("input", (event) => {
      const target = event.target;
      this.options.onValueChange && this.options.onValueChange(target.value);
    });
  }
  browserEventManager = null;
  setFocus() {
    this.inputElement.focus();
  }
  dispose() {
    this.inputElement = null;
    this.browserEventManager.dispose();
  }
}

class SearchBoxLoadingIndicator {
  constructor(wrapperElement) {
    this.wrapperElement = wrapperElement;
    this.spinnerElement = document.createElement("div");
    this.spinnerElement.className = DEFAULT_CLASS_NAMES.searchBoxInputLoadingIndicator.defaultClassName;
    this.wrapperElement.append(this.spinnerElement);
    this.hide();
  }
  spinnerElement = null;
  show() {
    const { hiddenClassName, visibleClassName } = DEFAULT_CLASS_NAMES.searchBoxInputLoadingIndicator;
    this.spinnerElement.classList.remove(hiddenClassName);
    this.spinnerElement.classList.add(visibleClassName);
  }
  hide() {
    const { hiddenClassName, visibleClassName } = DEFAULT_CLASS_NAMES.searchBoxInputLoadingIndicator;
    this.spinnerElement.classList.remove(visibleClassName);
    this.spinnerElement.classList.add(hiddenClassName);
  }
  dispose() {
    this.spinnerElement.remove();
    this.spinnerElement = null;
  }
}

class SearchBoxResultList {
  constructor(inputElement, itemTemplate, options = {}) {
    this.inputElement = inputElement;
    this.itemTemplate = itemTemplate;
    this.options = options;
    this.initializeListElement();
    this.listElementEvents = new BrowserEventManager(this.listElement);
    this.documentEvents = new BrowserEventManager(window.document.documentElement);
    this.listElement.style.position = "fixed";
    this.listElement.style.zIndex = String(SEARCH_BOX_LIST_DEFAULT_Z_INDEX);
    this.listElementEvents.addListener("mousedown", (event) => {
      this.setFocus();
    });
    this.listElementEvents.addListener("click", (event) => {
      const target = event.target;
      if (target instanceof HTMLElement) {
        const selectedItem = this.getSelectedItem(target);
        this.options.onItemSelect(selectedItem);
      }
    });
    this.documentEvents.addListener("mousedown", (event) => {
      const clickedElement = event.target;
      if (this.isFocused && !this.listElement.contains(clickedElement)) {
        this.blur();
      }
    });
  }
  static escapeHTML(unescaped) {
    return unescaped.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  listElementEvents = null;
  documentEvents = null;
  listElement = null;
  items = [];
  visible = false;
  isFocused = false;
  setItems(items) {
    const { searchBoxList: { messageClassName } } = DEFAULT_CLASS_NAMES;
    this.clearList();
    if (items.length) {
      this.items = items;
      this.items.forEach((item, index) => {
        this.listElement.appendChild(this.createListItem(item, index));
      });
    } else {
      this.listElement.innerHTML = `<div class="${messageClassName}">${TEXT.noResultsFound}</div>`;
    }
  }
  beginLoading() {
    const { searchBoxList: { messageClassName, loadingIndicatorClassName } } = DEFAULT_CLASS_NAMES;
    this.clearList();
    this.listElement.innerHTML = `
            <div class="${messageClassName}">
                <div class="${loadingIndicatorClassName}"></div>
                ${TEXT.loading}
            </div>
        `;
  }
  show() {
    const { bottom, right } = this.inputElement.getBoundingClientRect();
    const viewportWidth = document.documentElement.clientWidth;
    this.listElement.style.display = "block";
    this.listElement.style.top = `${bottom}px`;
    this.listElement.style.right = `${viewportWidth - right}px`;
    this.visible = true;
  }
  hide() {
    if (this.visible) {
      this.visible = false;
      this.listElement.style.display = "none";
      this.blur();
    }
  }
  setFocus() {
    if (!this.isFocused) {
      this.isFocused = true;
      this.options.onFocus && this.options.onFocus();
    }
  }
  blur() {
    if (this.isFocused) {
      this.isFocused = false;
      this.options.onBlur && this.options.onBlur();
    }
  }
  dispose() {
    this.inputElement = null;
    this.listElementEvents.dispose();
    this.documentEvents.dispose();
  }
  getSelectedItem(clickedElement) {
    const { searchBoxList: { itemButtonDefaultClassName } } = DEFAULT_CLASS_NAMES;
    const path = getPathBetweenElements(this.listElement, clickedElement);
    const button = path?.find((element) => element.tagName === "BUTTON" && element.classList.contains(itemButtonDefaultClassName));
    if (button?.tagName === "BUTTON" && button.classList.contains(itemButtonDefaultClassName)) {
      const itemIndex = typeof button?.dataset.index === "string" ? Number(button.dataset.index) : null;
      const selectedItem = this.items[itemIndex] || null;
      return selectedItem;
    } else {
      return null;
    }
  }
  clearList() {
    this.items = [];
    this.listElement.innerHTML = "";
  }
  initializeListElement() {
    const { searchBoxList: { defaultClassName } } = DEFAULT_CLASS_NAMES;
    this.listElement = document.createElement("ul");
    this.listElement.classList.add(defaultClassName);
    this.listElement.style.display = "none";
    document.body.append(this.listElement);
    this.beginLoading();
  }
  createListItem(item, index) {
    const listItemElement = document.createElement("li");
    const buttonElement = document.createElement("button");
    const htmlContent = this.getItemHTML(item, this.itemTemplate);
    const { searchBoxList: { itemButtonDefaultClassName, itemDefaultClassName } } = DEFAULT_CLASS_NAMES;
    buttonElement.setAttribute("data-index", String(index));
    buttonElement.setAttribute("type", "button");
    buttonElement.innerHTML = htmlContent;
    buttonElement.classList.add(itemButtonDefaultClassName);
    listItemElement.appendChild(buttonElement);
    listItemElement.classList.add(itemDefaultClassName);
    return listItemElement;
  }
  getItemHTML(item, itemTemplate) {
    return itemTemplate.replace(/{{(.+)}}/g, (stringToReplace, enclosedParameterName) => {
      const parameterName = enclosedParameterName.trim();
      const value = item[parameterName] ?? null;
      const valueToRender = value === null ? "" : String(value);
      return SearchBoxResultList.escapeHTML(valueToRender);
    });
  }
}

class SearchBox {
  constructor(inputElement, dataSource, itemTemplate, searchKeys, options = {}) {
    this.inputElement = inputElement;
    this.dataSource = dataSource;
    this.itemTemplate = itemTemplate;
    this.searchKeys = searchKeys;
    this.options = options;
    const minSearchValueLength = 3;
    if (!(inputElement instanceof HTMLInputElement)) {
      throw new Error("Input element must be a valid HTMLInputElement!");
    }
    inputElement.classList.add(DEFAULT_CLASS_NAMES.searchBoxInput.defaultClassName);
    this.state = new State({
      inputFocused: false,
      resultListFocused: false,
      inputValue: "",
      selectedItem: null
    });
    this.input = new SearchBoxInput(inputElement, {
      onFocus: () => this.state.setState({ inputFocused: true, resultListFocused: false }),
      onBlur: () => this.state.setState({ inputFocused: false }),
      onValueChange: (value) => this.state.setState({ inputValue: value })
    });
    this.resultList = new SearchBoxResultList(inputElement, itemTemplate, {
      onFocus: () => this.state.setState({ resultListFocused: true }),
      onBlur: () => this.state.setState({ resultListFocused: false }),
      onItemSelect: (item) => this.state.setState({ selectedItem: item })
    });
    this.addWrapperElement();
    this.loadingIndicator = new SearchBoxLoadingIndicator(this.wrapperElement);
    this.stateSubscription = this.state.state$.subscribe((event) => this.onStateChange(event));
    const firstFocus$ = this.state.state$.pipe(first((state) => state?.inputFocused), map(() => ""));
    const inputValue$ = this.state.state$.pipe(distinctUntilChanged((a, b) => a?.inputValue === b?.inputValue), filter((state) => !state?.inputValue || state?.inputValue.length >= minSearchValueLength), map((state) => state.inputValue || ""), debounceTime(500));
    const inputItems$ = merge(firstFocus$, inputValue$).pipe(skipUntil(firstFocus$), switchMap((value) => this.dataSource.getItems(value, 10, this.searchKeys)));
    this.inputValueSubscription = merge(firstFocus$, inputValue$).pipe(skipUntil(firstFocus$)).subscribe(() => this.showLoadingIndicator());
    this.inputItemsSubscription = inputItems$.subscribe((items) => {
      this.resultList.setItems(items);
      this.hideLoadingIndicator();
    });
  }
  input = null;
  resultList = null;
  loadingIndicator = null;
  wrapperElement = null;
  state = null;
  stateSubscription;
  inputValueSubscription;
  inputItemsSubscription;
  showLoadingIndicator() {
    this.loadingIndicator.show();
    this.wrapperElement.classList.add(DEFAULT_CLASS_NAMES.searchBox.loadingClassName);
  }
  hideLoadingIndicator() {
    this.loadingIndicator.hide();
    this.wrapperElement.classList.remove(DEFAULT_CLASS_NAMES.searchBox.loadingClassName);
  }
  dispose() {
    this.loadingIndicator.dispose();
    this.removeWrapperElement();
    this.input.dispose();
    this.resultList.dispose();
    this.inputElement = null;
    this.stateSubscription.unsubscribe();
    this.inputValueSubscription.unsubscribe();
    this.inputItemsSubscription.unsubscribe();
  }
  onStateChange(event) {
    const { searchBox: { focusedClassName } } = DEFAULT_CLASS_NAMES;
    const hasFocusedClass = this.wrapperElement?.classList.contains(focusedClassName);
    if (event.selectedItem && this.options.onItemSelect) {
      this.options.onItemSelect(event.selectedItem);
    }
    if (event.inputFocused) {
      this.resultList.show();
    } else if (!event.resultListFocused) {
      this.resultList.hide();
    }
    if (event.inputFocused || event.resultListFocused) {
      !hasFocusedClass && this.wrapperElement.classList.add(focusedClassName);
    } else {
      hasFocusedClass && this.wrapperElement.classList.remove(focusedClassName);
    }
  }
  addWrapperElement() {
    const inputElement = this.inputElement;
    this.wrapperElement = document.createElement("div");
    this.wrapperElement.className = DEFAULT_CLASS_NAMES.searchBox.wrapperClassName;
    inputElement.insertAdjacentElement("beforebegin", this.wrapperElement);
    this.wrapperElement.appendChild(inputElement);
  }
  removeWrapperElement() {
    this.wrapperElement.insertAdjacentElement("beforebegin", this.inputElement);
    this.wrapperElement.remove();
    this.wrapperElement = null;
  }
}

class SearchBoxJSONDataSource {
  constructor(url) {
    this.url = url;
  }
  items = null;
  getItems(searchPhrase, take, searchKeys) {
    if (!this.items) {
      this.items = this.waitForIt(1e3).then(() => this.fetchJSON(this.url));
    }
    return this.waitForIt(1e3).then(() => {
      return this.items.then((items) => this.filterItems(items, searchPhrase, searchKeys));
    });
  }
  async fetchJSON(url) {
    return fetch(url).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Request to fetch JSON data for the SearchBox has failed with status code ${response.status}`);
      }
    });
  }
  filterItems(items, searchPhrase, searchKeys) {
    if (searchPhrase.length < 2) {
      return items;
    }
    searchPhrase = searchPhrase.toLowerCase();
    return items.filter((item) => searchKeys.some((key) => {
      const fieldValue = item[key];
      return fieldValue && String(fieldValue).toLowerCase().includes(searchPhrase);
    }));
  }
  waitForIt(timeMs) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), timeMs);
    });
  }
}

export { SearchBox, SearchBoxJSONDataSource };
//# sourceMappingURL=searchboxjs.js.map
