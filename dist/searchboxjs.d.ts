interface SearchBoxDataSource<T> {
    getItems: (searchPhrase: string, take: number, searchKeys: Array<keyof T>) => Promise<T[]>;
}

interface SearchItemField {
    fieldName: string;
    className: string;
    fieldLabel?: string;
}

interface SearchBoxOptions<T> {
    propertiesToDisplay?: SearchItemField[];
    onItemSelect?: (selectedItem: T) => void;
}

/**
 * SearchBox component
 *
 * @param itemTemplate Provides HTML template for found items. Parameter names enclosed with {{ and }} will be replaced with their values from the item object. Example: <span class="itemName">{{name}}</span>
 */
declare class SearchBox<T> {
    private inputElement;
    private dataSource;
    private itemTemplate;
    private searchKeys;
    private options;
    private input;
    private resultList;
    private loadingIndicator;
    private wrapperElement;
    private state;
    private stateSubscription;
    private inputValueSubscription;
    private inputItemsSubscription;
    constructor(inputElement: HTMLElement, dataSource: SearchBoxDataSource<T>, itemTemplate: string, searchKeys: Array<keyof T>, options?: SearchBoxOptions<T>);
    showLoadingIndicator(): void;
    hideLoadingIndicator(): void;
    dispose(): void;
    private onStateChange;
    private addWrapperElement;
    private removeWrapperElement;
}

declare class SearchBoxJSONDataSource<T> implements SearchBoxDataSource<T> {
    private url;
    private items;
    constructor(url: string);
    getItems(searchPhrase: string, take: number, searchKeys: Array<keyof T>): Promise<T[]>;
    private fetchJSON;
    private filterItems;
    /** TODO: Remove later - this is only for testing purposes */
    private waitForIt;
}

export { SearchBox, SearchBoxJSONDataSource };
