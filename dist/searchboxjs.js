import './scss/main.scss';
import { BehaviorSubject, distinctUntilChanged } from 'rxjs';

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

const SEARCH_BOX_LIST_DEFAULT_Z_INDEX = 10;
const DEFAULT_CLASS_NAMES = {
  searchBoxList: {
    defaultClassName: "searchBoxList",
    itemDefaultClassName: "searchBoxList__item",
    itemButtonDefaultClassName: "searchBoxList__itemButton",
    messageClassName: "searchBoxList__message",
    loadingIndicatorClassName: "searchBoxList__loadingIndicator"
  }
};
const TEXT = {
  noResultsFound: "Sorry, can't find a match for your search phrase!",
  loading: "Loading your results\u2026"
};

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
    const { searchBoxList: { itemButtonDefaultClassName, defaultClassName } } = DEFAULT_CLASS_NAMES;
    buttonElement.setAttribute("data-index", String(index));
    buttonElement.setAttribute("type", "button");
    buttonElement.innerHTML = htmlContent;
    buttonElement.classList.add(itemButtonDefaultClassName);
    listItemElement.appendChild(buttonElement);
    listItemElement.classList.add(defaultClassName);
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
    if (!(inputElement instanceof HTMLInputElement)) {
      throw new Error("Input element must be a valid HTMLInputElement!");
    }
    this.state = new State({
      inputFocused: false,
      resultListFocused: false,
      inputValue: "",
      selectedItem: null
    });
    this.resultList = new SearchBoxResultList(inputElement, itemTemplate, {
      onFocus: () => this.state.setState({ resultListFocused: true }),
      onBlur: () => this.state.setState({ resultListFocused: false }),
      onItemSelect: (item) => this.state.setState({ selectedItem: item })
    });
    this.stateSubscription = this.state.state$.subscribe((event) => this.onStateChange(event));
  }
  resultList = null;
  isInitializing = false;
  isInitialized = false;
  state = null;
  stateSubscription;
  dispose() {
    this.resultList.dispose();
    this.inputElement = null;
    this.stateSubscription.unsubscribe();
  }
  initialize() {
    this.isInitializing = true;
    this.dataSource.getItems("", 10, this.searchKeys).then((data) => {
      this.resultList.setItems(data);
      this.isInitialized = true;
      this.isInitializing = false;
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
