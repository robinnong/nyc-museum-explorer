import filterWords from './filterWords.js';
const app = {}; //NAMESPACED OBJECT

// CACHED JQUERY SELECTORS 
app.$cities = $('.click-thru span');
app.$toggleUp = $('.button-up');
app.$toggleDown = $('.button-down');
app.$searchResults = $('ol');
app.$cityForm = $('#city-filter');
app.$typeForm = $('.filter-bar');
app.$selectType = $('input[type="radio"]');
app.$filterList = $('ul');
app.$search = $('.search-form'); 

// DO NOT DELETE!
app.SOCRATA_API_TOKEN = [REDACTED];
app.SOCRATA_API_URL = 'https://data.cityofnewyork.us/resource/fn6f-htvy.json';
app.GOOGLEMAPS_API_URL = 'https://www.google.com/maps/search/?api=1&query=';//search function 

// GLOBALLY DECLARED VARIABLES
app.citiesArray = ["Brooklyn", "New York", "Queens", "Bronx", "Staten Island"];
app.classArray = ["show-all", "art", "science", "history", "cultural", "childrens"];
app.classIcons = ["", "fa-palette", "fa-atom", "fa-landmark", "fa-globe", "fa-child"];
app.numCities = app.citiesArray.length - 1;

// VISIBILITY
$('button, label, input[type="submit"]').addClass('pointer');
$('.scroll-up, .filter-bar').hide();

//KEYWORDS TO FILTER AND ASSIGN MUSEUM TYPES  
let cityIndex = 0;
let typeFilter = filterWords[0];
let cachedResults = [];

// FUNCTIONS
// WHEN USER CLICKS UP IN CITY LIST
app.toggleCityUp = () => {
    cityIndex > 0 ? cityIndex-- : cityIndex = app.numCities;
    app.displayCity();
}

// WHEN USER CLICKS DOWN IN CITY LIST
app.toggleCityDown = () => {
    cityIndex < app.numCities ? cityIndex++ : cityIndex = 0;
    app.displayCity();
}

// AFTER USER TOGGLES THRU THE CITY LIST, DISPLAY THE NAME OF THE CITY (FROM ARRAY)
app.displayCity = () => app.$cities.text(app.citiesArray[cityIndex]);

// WHEN USER SUBMITS CHOICE OF CITY, MAKE A CALL TO THE API
async function evaluateCity() {
    const selectedCity = app.citiesArray[cityIndex];
    await app.getByCity(selectedCity);
    app.loading();
}

//API CALL
app.getByCity = (borough) => {  
    $.ajax({
        url: app.SOCRATA_API_URL, 
        method: "GET",
        dataType: 'json',
        data: {
            city: borough,
            "$limit" : 5000,
            "$$app_token" : app.SOCRATA_API_TOKEN
        }
    }).then(results => {   
        app.$searchResults.empty();
        cachedResults = results; 
        app.displayResults(results);   
        $('.loading-message').text("")
    }).catch(() => {  
        $('.loading-message').html(`<p>Failed to load data. Please wait and try again</p>`);
    })
};

//API CALL
app.getBySearch = (query) => {
    $.ajax({
        url: app.SOCRATA_API_URL,
        method: "GET",
        dataType: 'json',
        data: { 
            "$q": query,
            "$limit": 5000,
            "$$app_token": app.SOCRATA_API_TOKEN
        }
    }).then(results => {
        app.$searchResults.empty();
        $('.loading-message').empty();

        cachedResults = results; 
        if (results.length > 0) {
            app.displayResults(results);
        } else {
            $('.loading-message').html(`<p>Sorry! ☹</p><p>Your search for "${query}" didn't return any results.</p>`);
        }
    }).catch(() => { 
        $('.loading-message').html(`<p>Failed to load data. Please wait and try again</p>`);
    })
};

// DISPLAY LOADING MESSAGE 
app.loading = () => $('.loading-message').html(`<p>Loading results...</p>`);

// ASSIGNS THE COLOUR TAB FOR EACH TYPE 
app.assignType = function () { 
    filterWords.forEach((item, index) => {
        $(item).each(function(){
            $(".result-container:contains(" + this + ")").find('.icon').addClass(app.classArray[index]).find('.fas').addClass(app.classIcons[index]);
        })
    }) 
}

// GET THE USER'S FILTER SELECTION
app.getType = () => {
    const idAttribute = $('input[type="radio"]:checked').attr("id"); 
    app.classArray.forEach((item, index) => { idAttribute === item ? typeFilter = filterWords[index]: null }) 
    // Filter through the previous search results using the selected museum type and display the results again on the page
    app.$searchResults.empty();
    app.displayResults(cachedResults); 
}

// DISPLAYS RESULTS FOR THE SELECTED CITY OR FILTER OPTION
app.displayResults = (museums) => {
    museums.forEach(museum => {
        const name = museum.name;
        const address = museum.adress1;
        const tel = museum.tel;
        const url = museum.url; 
        const city = museum.city;
        // Encoding the Google Maps search query
        const encoded = encodeURI(`${museum.name}+${museum.adress1}`)
        const mapQuery = `${app.GOOGLEMAPS_API_URL}+${encoded}`
        const museumHtml = 
            `<li class="result-container">
                <div class="name">
                    <div class="icon"><i class="fas"></i></div>
                    <h3>${name}</h3>
                </div>
                <p class="address"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> <a href="${mapQuery}">${address}, ${city}, NY </a></p>
                ${tel != "" ? `<a class="tel" href="tel:${tel}"><i class="fas fa-phone" aria-hidden="true"></i> ${tel}</a>` : `<p class="tel"></p>`}
                <a class="url" href="${url}" rel="external">Visit Website</a>
            </li>`; 

        typeFilter.forEach(str => name.includes(str) ? app.$searchResults.append(museumHtml): null);
    })
    app.assignType();
    $('.scroll-up').show();
}

app.resetSearch = () => {
    app.$typeForm.show(); 
    typeFilter = filterWords[0];
    $('input[type="radio"]:checked').prop("checked", false);
}

// INITIALIZE
app.init = () => {  
    app.displayCity(0);
    // EVENTS
    $('.filter-bar').hover(function(){
        app.$filterList.toggle();
    });
    $('.filter-bar').focusin(function () {
        app.$filterList.show();
    }); 

    // On clicking the up arrow, move up the in the list of cities
    app.$toggleUp.on('click', app.toggleCityUp); 
    // On clicking the up arrow, move up the down the list of cities
    app.$toggleDown.on('click', app.toggleCityDown); 

    app.$toggleUp.on('keydown', function(e){
        (e.key === 'Enter') ? app.toggleCityUp() : null;
    }); 
    app.$toggleDown.on('keydown', function (e) {
        (e.key === 'Enter') ? app.toggleCityDown(): null;
    }); 

    // On submitting the selected borough 
    app.$cityForm.on('submit', function(e) {
        e.preventDefault(); 
        app.resetSearch();
        evaluateCity();
    })  

    // On selecting a filter type
    app.$selectType.change(app.getType);

    // On submitting a search query
    app.$search.on('submit', function(e) {
        e.preventDefault();
        app.resetSearch();
        const userQuery = $('#search').val().trim();  
        app.getBySearch(userQuery);
    })
}

// DOCUMENT READY
$(() => {   
    app.init();
})  


