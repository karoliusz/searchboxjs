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
    private isInitializing;
    private isInitialized;
    private state;
    private stateSubscription;
    constructor(inputElement: HTMLElement, dataSource: SearchBoxDataSource<T>, itemTemplate: string, searchKeys: Array<keyof T>, options?: SearchBoxOptions<T>);
    dispose(): void;
    private initialize;
    private onStateChange;
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
