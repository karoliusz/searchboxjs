import { SearchBoxDataSource } from "./interfaces";

export class SearchBoxJSONDataSource<T> implements SearchBoxDataSource<T> {
    private items: Promise<T[]> = null;

    constructor(private url: string) {}

    getItems(searchPhrase: string, take: number, searchKeys: Array<keyof T>) {
        if (!this.items) {
            // this.items = this.fetchJSON(this.url);

            this.items = this.waitForIt(1000).then(() => this.fetchJSON(this.url));
        }

        // this.items.then(items => this.filterItems(items, searchPhrase, searchKeys));

        return this.waitForIt(1000).then(() => {
            return this.items.then(items => this.filterItems(items, searchPhrase, searchKeys));
        });
    }

    private async fetchJSON(url: string): Promise<T[]> {
        return fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error(`Request to fetch JSON data for the SearchBox has failed with status code ${response.status}`);
                }
            });
    }

    private filterItems(items: T[], searchPhrase: string, searchKeys: Array<keyof T>) {
        if (searchPhrase.length < 2) {
            return items;
        }

        searchPhrase = searchPhrase.toLowerCase();

        return items.filter(item => searchKeys.some(key => {
            const fieldValue = item[key];

            return fieldValue && String(fieldValue).toLowerCase().includes(searchPhrase);
        }));
    }

    /** TODO: Remove later - this is only for testing purposes */
    private waitForIt(timeMs: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), timeMs);
        });
    }
}
