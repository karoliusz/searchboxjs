import { DEFAULT_CLASS_NAMES } from "./constants";
import { BrowserEventManager } from "./utils";

interface SearchBoxInputOptions {
    onFocus?: () => void;
    onBlur?: () => void;
    onValueChange?: (value: string) => void;
}

export class SearchBoxInput {
    private browserEventManager: BrowserEventManager = null;
    private wrapperElement: HTMLDivElement = null;

    constructor(
        private inputElement: HTMLInputElement,
        private options: SearchBoxInputOptions = {}
    ) {
        this.browserEventManager = new BrowserEventManager(this.inputElement);

        this.browserEventManager.addListener('focus', () => {
            this.options.onFocus && this.options.onFocus();
        });

        this.browserEventManager.addListener('blur', () => {
            this.options.onBlur && this.options.onBlur();
        });

        this.browserEventManager.addListener('input', (event: Event) => {
            const target = event.target as HTMLInputElement;

            this.options.onValueChange && this.options.onValueChange(target.value);
        });

        this.wrapperElement = document.createElement('div');
        this.wrapperElement.className = DEFAULT_CLASS_NAMES.searchBoxInput.wrapperClassName;

        inputElement.insertAdjacentElement('beforebegin', this.wrapperElement);
        this.wrapperElement.appendChild(inputElement);
    }

    public setFocus() {
        this.inputElement.focus();
    }

    public dispose() {
        // TODO: Place the input node before the wrapper element, and then remove the wrapper element
        this.inputElement = null;
        this.browserEventManager.dispose();
    }
}
