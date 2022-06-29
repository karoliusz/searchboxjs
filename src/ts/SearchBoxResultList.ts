import { getPathBetweenElements, BrowserEventManager } from "./utils";
import { DEFAULT_CLASS_NAMES, SEARCH_BOX_LIST_DEFAULT_Z_INDEX, TEXT } from "./constants";

interface SearchBoxResultListOptions<T> {
    onFocus?: () => void;
    onBlur?: () => void;
    onItemSelect?: (value: T) => void;
}

export class SearchBoxResultList<T> {
    static escapeHTML(unescaped: string): string {
        return unescaped
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    private listElementEvents: BrowserEventManager = null;
    private documentEvents: BrowserEventManager = null;
    private listElement: HTMLUListElement = null;
    private items: T[] = [];
    private visible = false;

    private isFocused = false;

    constructor(
        private inputElement: Element,
        private itemTemplate: string,
        private options: SearchBoxResultListOptions<T> = {}
    ) {
        this.initializeListElement();
        this.listElementEvents = new BrowserEventManager(this.listElement);
        this.documentEvents = new BrowserEventManager(window.document.documentElement);
        this.listElement.style.position = 'fixed';
        this.listElement.style.zIndex = String(SEARCH_BOX_LIST_DEFAULT_Z_INDEX);

        this.listElementEvents.addListener('mousedown', event => {
            this.setFocus();
        });

        this.listElementEvents.addListener('click', event => {
            const target = event.target;

            if (target instanceof HTMLElement) {
                const selectedItem = this.getSelectedItem(target);
            
                this.options.onItemSelect(selectedItem);
            }
        });

        this.documentEvents.addListener('mousedown', event => {
            const clickedElement = event.target as HTMLElement;

            if (this.isFocused && !this.listElement.contains(clickedElement)) {
                this.blur();
            }
        });
    }

    public setItems(items: T[]) {
        const { searchBoxList: { messageClassName } } = DEFAULT_CLASS_NAMES;

        this.clearList();

        if (items.length) {
            this.items = items;
            this.items.forEach((item, index) => {
                this.listElement.appendChild(this.createListItem(item, index));
            });
        } else {
            this.listElement.innerHTML = `<div class="${messageClassName}">${TEXT.noResultsFound}</div>`
        }
    }

    public beginLoading() {
        const { searchBoxList: { messageClassName, loadingIndicatorClassName } } = DEFAULT_CLASS_NAMES;

        this.clearList();

        this.listElement.innerHTML = `
            <div class="${messageClassName}">
                <div class="${loadingIndicatorClassName}"></div>
                ${TEXT.loading}
            </div>
        `
    }

    public show() {
        const { bottom, right } = this.inputElement.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth;

        this.listElement.style.display = 'block';
        this.listElement.style.top = `${bottom}px`;
        this.listElement.style.right = `${viewportWidth - right}px`;
        this.visible = true;
    }

    public hide() {
        if (this.visible) {
            this.visible = false;
            this.listElement.style.display = 'none';
            this.blur();
        }
    }

    public setFocus() {
        if (!this.isFocused) {
            this.isFocused = true;
            this.options.onFocus && this.options.onFocus();
        }
    }

    public blur() {
        if (this.isFocused) {
            this.isFocused = false;
            this.options.onBlur && this.options.onBlur();
        }
    }

    public dispose() {
        this.inputElement = null;
        this.listElementEvents.dispose();
        this.documentEvents.dispose();
    }

    private getSelectedItem(clickedElement: HTMLElement): T {
        const { searchBoxList: { itemButtonDefaultClassName } } = DEFAULT_CLASS_NAMES;
        const path = getPathBetweenElements(this.listElement, clickedElement);
        const button = path?.find(element => element.tagName === 'BUTTON' && element.classList.contains(itemButtonDefaultClassName));

        if (button?.tagName === 'BUTTON' && button.classList.contains(itemButtonDefaultClassName)) {
            const itemIndex = typeof button?.dataset.index === 'string' ? Number(button.dataset.index) : null;
            const selectedItem = this.items[itemIndex] || null;
        
            return selectedItem;
        } else {
            return null;
        }
    }

    private clearList() {
        this.items = [];
        this.listElement.innerHTML = '';
    }

    private initializeListElement() {
        const { searchBoxList: { defaultClassName } } = DEFAULT_CLASS_NAMES;

        this.listElement = document.createElement('ul');
        this.listElement.classList.add(defaultClassName);
        this.listElement.style.display = 'none';
        document.body.append(this.listElement);
        this.beginLoading();
    }

    private createListItem(item: T, index: number) {
        const listItemElement = document.createElement('li');
        const buttonElement = document.createElement('button');
        const htmlContent = this.getItemHTML(item, this.itemTemplate);
        const { searchBoxList: { itemButtonDefaultClassName, itemDefaultClassName } } = DEFAULT_CLASS_NAMES;

        buttonElement.setAttribute('data-index', String(index));
        buttonElement.setAttribute('type', 'button');
        buttonElement.innerHTML = htmlContent;
        buttonElement.classList.add(itemButtonDefaultClassName);
        listItemElement.appendChild(buttonElement);
        listItemElement.classList.add(itemDefaultClassName);

        return listItemElement;
    }

    private getItemHTML(item: T, itemTemplate: string) {
        return itemTemplate.replace(/{{(.+)}}/g, (stringToReplace, enclosedParameterName) => {
            const parameterName = enclosedParameterName.trim();
            const value = item[parameterName] ?? null;
            const valueToRender = value === null ? '' : String(value);

            return SearchBoxResultList.escapeHTML(valueToRender);
        });
    }
}
