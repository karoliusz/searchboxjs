import { BrowserEventManager } from "./utils";

interface SearchBoxInputOptions {
    onFocus?: () => void;
    onBlur?: () => void;
    onValueChange?: (value: string) => void;
}

export class SearchBoxInput {
    private browserEventManager: BrowserEventManager = null;

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
    }

    public setFocus() {
        this.inputElement.focus();
    }

    public dispose() {
        this.inputElement = null;
        this.browserEventManager.dispose();
    }
}
