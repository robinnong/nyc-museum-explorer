const app = {}; //NAMESPACED OBJECT

// CACHED JQUERY SELECTORS 
app.$cities = $('.click-thru span');
app.$toggleUp = $('.arrows .fa-angle-up');
app.$toggleDown = $('.arrows .fa-angle-down');
app.$searchResults = $('ol');
app.$cityForm = $('#city-filter');  
app.$typeForm = $('.filter-bar');
app.$selectType = $('input[type="radio"]');   
app.$filterList = $('ul');

// DO NOT DELETE!
app.SOCRATA_API_TOKEN = [REDACTED];
app.SOCRATA_API_URL =  'https://data.cityofnewyork.us/resource/fn6f-htvy.json'; 
app.GOOGLEMAPS_API_URL = 'https://www.google.com/maps/search/?api=1&query=';//search function 

// GLOBALLY DECLARED VARIABLES
app.citiesArray = ["Brooklyn", "New York", "Queens", "Bronx", "Staten Island"];           
app.classArray = ["show-all", "art", "science", "history", "cultural", "childrens"];
app.classIcons = ["", "fa-palette", "fa-atom", "fa-landmark", "fa-globe", "fa-child"];
app.numCities = app.citiesArray.length - 1;

// VISIBILITY
$('button, label, i, input[type="submit"]').addClass('pointer');
$('.scroll-up, .filter-bar').hide();

//KEYWORDS TO FILTER AND ASSIGN MUSEUM TYPES
app.strArray = [ 
                [" "],
                ["Art", "Galerie", "FIT", "Design", "Studio", "Guggenheim", "Illustration", "Collection", "Drawing", "Brooklyn Museum", "Media", "Moving Image", "Photography", "National Academy", "Nicholas Roerich", "Goethe-Institut", "Dahesh"],
                ["Science", "Technology", "Transit", "Space", "Skyscraper", "Seaport"], 
                ["History", "Heritage", "Memorial", "Historic", "Archival", "Archive", "Hall Of Fame", "Police", "Bowne", "Library", "Finance", "Alice Austen", "Defense", "Homestead", "Waterfront", "Alexander Hamilton", "Museum of the City", "Holocaust", "Fire", "Island", "Valentine-Varian", "Cortlandt", "Theodore Roosevelt", "Lighthouse", "Farm", "Old Stone", "Mansion", "Manor", "Rose Museum", "Vernon Hotel", "Fraunces", "Jackie Robinson", "Audubon "],
                ["Culture", "Cultural", "Leo Baeck", "Yeshiva", "Americas", "Numismatic", "Hispanic", "Tenement", "Madame Tussauds", "Tolerance", "Anne Frank","Garibaldi-Meucci", "Jewish", "Asia", "Chinese", "Nordic", "Museo", "Ukrainian", "Italian", "Jazz", "Indian", "Wave Hill"],
                ["Children's", "Discovery Times"]
                ];

let cityIndex = 0;  
let typeFilter = app.strArray[0];

// FUNCTIONS
// WHEN USER CLICKS UP IN CITY LIST
app.toggleCityUp = () => {   
    if (cityIndex > 0) {
        cityIndex--;
    } else {
        cityIndex = app.numCities;
    }
    app.displayCity();
}

// WHEN USER CLICKS DOWN IN CITY LIST
app.toggleCityDown = () => {  
    if (cityIndex < app.numCities) {
        cityIndex++;
    } else {
        cityIndex = 0;
    }
    app.displayCity();
} 

// AFTER USER TOGGLES THRU THE CITY LIST, DISPLAY THE NAME OF THE CITY (FROM ARRAY)
app.displayCity = () => {   
    app.$cities.text(app.citiesArray[cityIndex]);
}

// WHEN USER SUBMITS CHOICE OF CITY, MAKE A CALL TO THE API
app.evaluateCity = () => {
    const selectedCity = app.citiesArray[cityIndex];
    app.getByCity(selectedCity);
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
    }).then((results) => {   
        app.$searchResults.empty();
        app.displayResults(results);   
    }).catch((error)=> { 
        console.log(error);
    })
};

// ASSIGNS THE COLOUR TAB FOR EACH TYPE 
app.assignType = function () { 
    for (let n = 1; n<6; n++) {
        $(app.strArray[n]).each(function(){
            $(".result-container:contains(" + this + ")").find('.icon').addClass(app.classArray[n]).find('.fas').addClass(app.classIcons[n]);
        })
    }
}

app.getType = () => {
    const idAttribute = $('input[type="radio"]:checked').attr("id"); 
    for (let i = 0 ; i < app.classArray.length; i++) {
        if (idAttribute === app.classArray[i]) {
            typeFilter = app.strArray[i];
        } 
    }
    app.evaluateCity();
}

// DISPLAYS RESULTS FOR THE SELECTED CITY OR FILTER OPTION
app.displayResults = (museums) => {
    museums.forEach((museum) => {
        const name = museum.name;
        const address = museum.adress1;
        const tel = museum.tel;
        const url = museum.url; 
        const city = museum.city;
        const encoded = encodeURI(`${museum.name}+${museum.adress1}`)
        const mapQuery = `${app.GOOGLEMAPS_API_URL}+${encoded}`
        const museumHtml = 
            `<li class="result-container">
                <div class="name">
                    <div class="icon"><i class="fas"></i></div>
                    <h3>${name}</h3>
                </div>
                <p class="address"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> <a href="${mapQuery}" target="_blank">${address}, ${city}, NY </a></p>
                <a class="tel" href="tel:${tel}"><i class="fas fa-phone" aria-hidden="true"></i> ${tel}</a> 
                <a class="url" href="${url}" rel="external" target="_blank">Visit Website</a>
            </li>`; 
        for (let str = 0; str < typeFilter.length; str++) {  
            if (name.includes(typeFilter[str])) { 
                app.$searchResults.append(museumHtml);
            }
        }
    })
    app.assignType();
    $('.scroll-up').show();
}

// INITIALIZE
app.init = () => { 
    app.$filterList.hide();
    app.displayCity();
    // EVENTS
    $('.filter-bar').hover(function(){
        app.$filterList.toggle();
    });
    $('.filter-bar').focusin(function () {
        app.$filterList.show();
    }); 
    app.$toggleUp.on('click', app.toggleCityUp); 
    app.$toggleDown.on('click', app.toggleCityDown); 
    app.$cityForm.on('submit', function(e) {
        e.preventDefault(); 
        typeFilter = app.strArray[0];
        $('input[type="radio"]:checked').prop("checked", false); //default user selection to Show All
        app.evaluateCity();
        app.$typeForm.show();
    })  
    app.$selectType.change(function() {   
        app.getType();
    })
}

// DOCUMENT READY
$(() => {  
    app.init();
})  


