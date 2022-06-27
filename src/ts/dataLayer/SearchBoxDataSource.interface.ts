export interface SearchBoxDataSource<T> {
    getItems: (
        searchPhrase: string, 
        take: number, 
        searchKeys: Array<keyof T>
    ) => Promise<T[]>;
}
