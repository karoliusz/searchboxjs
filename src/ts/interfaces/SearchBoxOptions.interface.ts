import { SearchItemField } from './SearchItemField.interface';

export interface SearchBoxOptions<T> {
    propertiesToDisplay?: SearchItemField[];
    onItemSelect?: (selectedItem: T) => void
}
