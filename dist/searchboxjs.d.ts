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
    private state;
    private stateSubscription;
    constructor(inputElement: HTMLElement, dataSource: SearchBoxDataSource<T>, itemTemplate: string, searchKeys: Array<keyof T>, options?: SearchBoxOptions<T>);
    dispose(): void;
    private initialize;
    private onStateChange;
}

export { SearchBox as default };
