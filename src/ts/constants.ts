export const SEARCH_BOX_LIST_DEFAULT_Z_INDEX = 10;

export const DEFAULT_CLASS_NAMES = {
    searchBoxList: {
        defaultClassName: "searchBoxList",
        itemDefaultClassName: "searchBoxList__item",
        itemButtonDefaultClassName: "searchBoxList__itemButton",
        messageClassName: "searchBoxList__message",
        loadingIndicatorClassName: "searchBoxList__loadingIndicator"
    }
} as const;

export const TEXT = {
    noResultsFound: "Sorry, can't find a match for your search phrase!",
    loading: "Loading your results…"
} as const;