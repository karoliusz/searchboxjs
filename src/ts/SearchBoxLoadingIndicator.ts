import { DEFAULT_CLASS_NAMES } from "./constants";

export class SearchBoxLoadingIndicator {
    private spinnerElement: HTMLDivElement = null;

    constructor(private wrapperElement: HTMLDivElement) {
        this.spinnerElement = document.createElement('div');
        this.spinnerElement.className = DEFAULT_CLASS_NAMES.searchBoxInputLoadingIndicator.defaultClassName;
        this.wrapperElement.append(this.spinnerElement);
        this.hide();
    }

    public show() {
        const { hiddenClassName, visibleClassName } = DEFAULT_CLASS_NAMES.searchBoxInputLoadingIndicator;

        this.spinnerElement.classList.remove(hiddenClassName);
        this.spinnerElement.classList.add(visibleClassName);
    }

    public hide() {
        const { hiddenClassName, visibleClassName } = DEFAULT_CLASS_NAMES.searchBoxInputLoadingIndicator;
        
        this.spinnerElement.classList.remove(visibleClassName);
        this.spinnerElement.classList.add(hiddenClassName);
    }

    public dispose() {
        this.spinnerElement.remove();
        this.spinnerElement = null;
    }
}
