import { debounceTime, distinctUntilChanged, filter, first, map, merge, Subscription, switchMap } from "rxjs";
import { DEFAULT_CLASS_NAMES } from "./constants";

import { SearchBoxDataSource } from "./dataLayer/interfaces";
import { SearchBoxOptions } from "./interfaces";
import { SearchBoxInput } from "./SearchBoxInput";
import { SearchBoxResultList } from "./SearchBoxResultList";
import { State } from "./utils";

interface SearchBoxState<T = unknown> {
    inputFocused: boolean;
    resultListFocused: boolean;
    inputValue: string;
    selectedItem: T;
}

/**
 * SearchBox component
 * 
 * @param itemTemplate Provides HTML template for found items. Parameter names enclosed with {{ and }} will be replaced with their values from the item object. Example: <span class="itemName">{{name}}</span>
 */
export class SearchBox<T> {
    private input: SearchBoxInput = null;
    private resultList: SearchBoxResultList<T> = null;
    private isInitializing = false;
    private isInitialized = false;

    private state: State<SearchBoxState<T>> = null;
    private stateSubscription: Subscription;
    private inputValueSubscription: Subscription;
    private inputItemsSubscription: Subscription;

    constructor(
        private inputElement: HTMLElement,
        private dataSource: SearchBoxDataSource<T>,
        private itemTemplate: string,
        private searchKeys: Array<keyof T>,
        private options: SearchBoxOptions<T> = {}) {
        const minSearchValueLength = 3;

        if (!(inputElement instanceof HTMLInputElement)) {
            throw new Error('Input element must be a valid HTMLInputElement!');
        }

        inputElement.classList.add(DEFAULT_CLASS_NAMES.searchBoxInput.defaultClassName);

        this.state = new State<SearchBoxState<T>>({
            inputFocused: false,
            resultListFocused: false,
            inputValue: '',
            selectedItem: null
        });

        this.input = new SearchBoxInput(inputElement, {
            onFocus: () => this.state.setState({ inputFocused: true, resultListFocused: false }),
            onBlur: () => this.state.setState({ inputFocused: false }),
            onValueChange: value => this.state.setState({ inputValue: value })
        });

        this.resultList = new SearchBoxResultList(inputElement, itemTemplate, {
            onFocus: () => this.state.setState({ resultListFocused: true }),
            onBlur: () => this.state.setState({ resultListFocused: false }),
            onItemSelect: item => this.state.setState({ selectedItem: item })
        });

        this.stateSubscription = this.state.state$.subscribe(event => this.onStateChange(event));
        
        const firstFocus$ = this.state.state$.pipe(
            first(state => state?.inputFocused),
            map(() => '')
        );

        const inputValue$ = this.state.state$.pipe(
            filter((state) => !(state?.inputValue) || state?.inputValue.length >= minSearchValueLength),
            map(state => state.inputValue || ''),
            debounceTime(500)
        );

        const inputItems$ = merge(firstFocus$, inputValue$).pipe(
            switchMap(value => this.dataSource.getItems(value, 10, this.searchKeys))
        );

        this.inputValueSubscription = merge(firstFocus$, inputValue$)
            .subscribe((inputValue) => {
                console.log('input says', inputValue);

                // TODO: Use this stream to show the loading indicator
            });
        
        this.inputItemsSubscription = inputItems$.subscribe(
            items => {
                this.resultList.setItems(items);
            }
        );
    }

    dispose() {
        this.input.dispose();
        this.resultList.dispose();
        this.inputElement = null;
        this.stateSubscription.unsubscribe();
        this.inputValueSubscription.unsubscribe();
    }

    private onStateChange(event: SearchBoxState<T>) {
        console.log('state changed', event);

        if (event.selectedItem && this.options.onItemSelect) {
            this.options.onItemSelect(event.selectedItem);
        }

        if (event.inputFocused) {
            this.resultList.show();
        } else if (!event.resultListFocused) {
            this.resultList.hide();
        }
    }
}
