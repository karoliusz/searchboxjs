export const SEARCH_BOX_LIST_DEFAULT_Z_INDEX = 10;

export const DEFAULT_CLASS_NAMES = {
    searchBox: {
        focusedClassName: "searchBox__focused",
        wrapperClassName: "searchBox__wrapper"
    },
    searchBoxList: {
        defaultClassName: "searchBoxList",
        itemDefaultClassName: "searchBoxList__item",
        itemButtonDefaultClassName: "searchBoxList__itemButton",
        messageClassName: "searchBoxList__message",
        loadingIndicatorClassName: "searchBoxList__loadingIndicator"
    },
    searchBoxInput: {
        defaultClassName: "searchBox__input"
    },
    searchBoxInputLoadingIndicator: {
        defaultClassName: "searchBoxInput__loadingIndicator",
        visibleClassName: "searchBoxInput__loadingIndicator--visible",
        hiddenClassName: "searchBoxInput__loadingIndicator--hidden"
    }
} as const;

export const TEXT = {
    noResultsFound: "Sorry, can't find a match for your search phrase!",
    loading: "Loading your results…"
} as const;
