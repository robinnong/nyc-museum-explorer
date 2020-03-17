const app = {}; //NAMESPACED OBJECT

// CACHED JQUERY SELECTORS 
app.$cities = $('.click-thru span');
app.$toggleUp = $('.arrows .fa-angle-up');
app.$toggleDown = $('.arrows .fa-angle-down');
app.$searchResults = $('section');
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
app.numCities = app.citiesArray.length - 1;
app.classArray = ["art", "science", "history", "cultural", "childrens"];
app.classIcons = ["fa-palette", "fa-atom", "fa-landmark", "fa-globe", "fa-child"];

// VISIBILITY
$('button, li, i, input[type="submit"]').addClass('pointer');
$('.scroll-up, .filter-bar').hide();

//KEYWORDS TO FILTER AND ASSIGN MUSEUM TYPES
app.strArray = [ 
                ["Art", "Galerie", "FIT", "Design", "Studio", "Guggenheim", "Illustration", "Collection", "Drawing", "Brooklyn Museum", "Media", "Moving Image", "Photography", "National Academy", "Nicholas Roerich", "Goethe-Institut", "Dahesh"],
                ["Science", "Technology", "Transit", "Space", "Skyscraper", "Seaport"], 
                ["History", "Heritage", "Memorial", "Historic", "Archival", "Archive", "Hall Of Fame", "Police", "Library", "Finance", "Alice Austen", "Defense", "Homestead", "Waterfront", "Museum of the City", "Holocaust", "Wyckoff", "Fire", "Island", "Theodore Roosevelt", "Lighthouse", "Farm", "Mansion", "Manor", "Audubon", "Rose Museum", "Vernon Hotel", "Fraunces", "House", "Jackie Robinson", "Audubon "],
                ["Culture", "Cultural", "Leo Baeck", "Yeshiva", "Americas", "Numismatic", "Hispanic", "Tenement", "Madame Tussauds", "Tolerance", "Anne Frank","Garibaldi-Meucci", "Jewish", "Asia", "Chinese", "Nordic", "Museo", "Ukrainian", "Italian", "Jazz", "Indian", "Wave Hill"],
                ["Children's", "Discovery Times"],
                [" "]
                ];

let cityIndex = 0; 

// FUNCTIONS
app.displayCity = () => {   
    app.$cities.text(app.citiesArray[cityIndex]);
}

app.toggleCityUp = () => {   
    if (cityIndex > 0) {
        cityIndex--;
    } else {
        cityIndex = app.numCities;
    }
    app.displayCity();
}

app.toggleCityDown = () => {  
    if (cityIndex < app.numCities) {
    cityIndex++;
    } else {
        cityIndex = 0;
    }
    app.displayCity();
} 

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
    for (let n = 0; n<5; n++) {
        $(app.strArray[n]).each(function(){
            $(".result-container:contains(" + this + ")").find('.icon').addClass(app.classArray[n]).find('.fas').addClass(app.classIcons[n]);
        })
    }
}

// USER INPUT FROM FILTER DROP DOWN MENU
app.getUserFilter = () => { 
    let str = "";
    $('input[type="radio"]:checked').each(function() {
        str = $(this).val();
    });
    return str
}

app.displayResults = (museums) => {
    const str = app.getUserFilter();
    let typeFilter;
    if (str === "Art"){
        typeFilter = app.strArray[0];
    } else if (str === "Science") {
        typeFilter = app.strArray[1];
    } else if (str === "History")  {
        typeFilter = app.strArray[2];
    } else if (str === "Cultural") {
        typeFilter = app.strArray[3];
    } else if (str === "Children's") {
        typeFilter = app.strArray[4];
    } else {
        typeFilter = app.strArray[5];
    }
    museums.forEach((museum) => {
        const name = museum.name;
        const address = museum.adress1;
        const tel = museum.tel;
        const url = museum.url; 
        const city = museum.city;
        const encoded = encodeURI(`${museum.name}+${museum.adress1}`)
        const mapQuery = `${app.GOOGLEMAPS_API_URL}+${encoded}`
        const museumHtml = 
            `<div class="result-container">
                <div class="name">
                    <div class="icon"><i class="fas"></i></div>
                    <h3>${name}</h3>
                </div>
                <p class="address"><i class="fas fa-map-marker-alt" aria-hidden="true"></i> <a href="${mapQuery}" target="_blank">${address}, ${city}, NY </a></p>
                <a class="tel" href="tel:${tel}"><i class="fas fa-phone" aria-hidden="true"></i> ${tel}</a> 
                <a class="url" href="${url}" rel="external" target="_blank">Visit Website</a>
            </div>`; 
        for (let n = 0; n<typeFilter.length; n++) {  
            if (name.includes(typeFilter[n])) { 
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
    $('.filter-bar').focusout(function () {
        app.$filterList.hide();
    });
    app.$toggleUp.on('click', app.toggleCityUp); 
    app.$toggleDown.on('click', app.toggleCityDown); 
    app.$cityForm.on('submit', function(e) {
        e.preventDefault();
        $('input[type="radio"]:checked').prop( "checked", false); //default user selection to Show All
        app.evaluateCity();
        app.$typeForm.show();
    })  
    app.$selectType.change(function() {  
        app.getUserFilter(); 
        app.evaluateCity();
    })
}

// DOCUMENT READY
$(() => {  
    app.init();
})  


