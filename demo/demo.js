const searchInput = document.getElementById('searchInput');
const { SearchBox, SearchBoxJSONDataSource } = SearchBoxJS;

if (searchInput) {
    const searchInputDataSource = new SearchBoxJSONDataSource('./index.json');
    const searchInputComponent = new SearchBox(
        searchInput,
        searchInputDataSource,
        '<span>{{title}}</span>',
        ['title']
    );

    console.log(searchInputComponent);
}