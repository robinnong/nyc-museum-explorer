//PESUDOCODE  
// Allow the user to toggle between the 5 boroughs of New York City 
// Create event listnerers for the toggle arrows 
// When user clicks submit, check which borough the user chose and store user input in a variable
// Send the user's selection (variable) as a query to New York City Museum API 
// Get all museum listings for that borough and display as a list 
// Display the name, contact, address and website for each museum 
// Make the museum name a link to the website  
// Add a link to query Google Maps for the location using the museum name or address 
// Bonus: Allow user to filter the results by type (Art Gallery, Science, History, etc.)
// Bonus: Make all links open in a new tab
// Bonus: Add some animated/transitional effects
 
const app = {}; //NAMESPACED OBJECT

// CSS STUFF
$('label, i, input[type="submit"]').addClass('pointer')

// CACHED JQUERY SELECTORS 
app.$cities = $('.click-thru span') 
app.$toggleUp = $('.arrows .fa-angle-up') 
app.$toggleDown = $('.arrows .fa-angle-down') 
app.$searchResults = $('section') 
app.$cityForm = $('#city-filter')  
app.$typeForm = $('.filter-bar')
app.$selectType = $('input[type="radio"]')  

// DO NOT DELETE!
app.SOCRATA_API_TOKEN = '1eOVPNZ5mpDC6mAyfKeXXR49h'  
app.SOCRATA_API_URL =  'https://data.cityofnewyork.us/resource/fn6f-htvy.json' 
app.GOOGLEMAPS_API_URL = 'https://www.google.com/maps/search/?api=1&query='//search function 

// GLOBALLY DECLARED VARIABLES
app.citiesArray = ["Brooklyn", 
                     "New York",
                     "Queens",
                     "Bronx",
                     "Staten Island"
                    ]           

app.numCities = app.citiesArray.length - 1

//KEYWORDS TO FILTER AND ASSIGN MUSEUM TYPES
app.strArray = [ 
                ["Art", "Galerie", "FIT", "Design", "Studio", "Guggenheim", "Illustration", "Collection", "Drawing", "Brooklyn Museum", "Media", "Moving Image", "Photography", "National Academy", "Nicholas Roerich", "Goethe-Institut", "Dahesh"],
                ["Science", "Technology", "Transit", "Space", "Skyscraper", "Seaport"], 
                ["History", "Heritage", "Memorial", "Historic", "Archival", "Archive", "Hall Of Fame", "Police", "Library", "Finance", "Alice Austen", "Defense", "Homestead", "Waterfront", "Museum of the City", "Holocaust", "Wyckoff", "Fire", "Island", "Theodore Roosevelt", "Lighthouse", "Farm", "Mansion", "Manor", "Audubon", "Rose Museum", "Vernon Hotel", "Fraunces", "House", "Jackie Robinson", "Audubon "],
                ["Culture", "Cultural", "Leo Baeck", "Yeshiva", "Americas", "Numismatic", "Hispanic", "Tenement", "Madame Tussauds", "Tolerance", "Anne Frank","Garibaldi-Meucci", "Jewish", "Asia", "Chinese", "Nordic", "Museo", "Ukrainian", "Italian", "Jazz", "Indian", "Wave Hill"],
                ["Children's", "Discovery Times"],
                [" "]
                ]

app.classArray = ["art", "science", "history", "cultural", "childrens"]

let cityIndex = 0; 

// FUNCTIONS
app.displayCity = () => {   
    app.$cities.text(app.citiesArray[cityIndex])
}

app.toggleCityUp = () => {   
    if (cityIndex > 0) {
        cityIndex = cityIndex - 1;
    } else {
        cityIndex = app.numCities;
    }
    app.displayCity() 
}

app.toggleCityDown = () => {  
    if (cityIndex < app.numCities) {
    cityIndex = cityIndex + 1;
    } else {
        cityIndex = 0;
    }
    app.displayCity() 
} 

// ASSIGNS THE COLOUR TAB FOR EACH TYPE 
app.assignType = function () { 
    for (let n = 0; n<5; n++) {
        $(app.strArray[n]).each(function(){
            $(".result-container:contains(" + this + ")").addClass(app.classArray[n])
        })
    }
}

// USER INPUT FROM FILTER DROP DOWN MENU
app.getUserFilter = () => { 
    let str = ""
    $('input[type="radio"]:checked').each(function() {
        str = $(this).val()
    });
    return str
}

app.displayResults = (museums) => {
    const str = app.getUserFilter()
    let typeFilter;
    if (str === "Art"){
        typeFilter = app.strArray[0]
    } else if (str === "Science") {
        typeFilter = app.strArray[1]
    } else if (str === "History")  {
        typeFilter = app.strArray[2]
    } else if (str === "Cultural") {
        typeFilter = app.strArray[3]
    } else if (str === "Children's") {
        typeFilter = app.strArray[4]
    } else {
        typeFilter = app.strArray[5]
    }
    museums.forEach((museum) => {
        const name = museum.name
        const address = museum.adress1
        const tel = museum.tel
        const url = museum.url 
        const city = museum.city
        const encoded = encodeURI(`${museum.name}+${museum.adress1}`)
        const mapQuery = `${app.GOOGLEMAPS_API_URL}+${encoded}`
        const museumHtml = 
            `<div class="result-container">
                <h3>${name}</h3>
                <p class="address"><i class="fas fa-map-marker-alt"></i> <a href="${mapQuery}" target="_blank">${address}, ${city}, NY </a></p>
                <a class="url" href="${url}" target="_blank">Visit Website </a>
                <p class="tel">${tel}</p> 
            </div>`; 
        for (let n = 0; n<typeFilter.length; n++) {  
            if (name.includes(typeFilter[n])) { 
                app.$searchResults.append(museumHtml) 
            }
        }
    })
    app.assignType()
    $('.scroll-up').show()
}

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
        app.$searchResults.empty() 
        app.displayResults(results)   
    }).catch((error)=> { 
        console.log(error)
    })
};

app.toggleArrow = () => {
    $('.filter-bar i').toggleClass('fa-angle-up animated fadeIn faster')  
}
 
// INITIALIZE
app.init = () => { 
    app.displayCity()   
    $('li').addClass('pointer')
    $('.scroll-up, .filter-bar').hide() 
    // EVENTS
    app.$toggleUp.on('click', app.toggleCityUp) 
    app.$toggleDown.on('click', app.toggleCityDown) 
    app.$cityForm.on('submit', function (e) {
        e.preventDefault() 
        $('input[type="radio"]:checked').prop( "checked", false); //default user selection to Show All
        const selectedCity = app.citiesArray[cityIndex] 
        app.getByCity(selectedCity) 
        app.$typeForm.show()
    })  
    app.$selectType.change(function () {  
        app.getUserFilter() 
        const selectedCity = app.citiesArray[cityIndex] 
        app.getByCity(selectedCity) //sometimes if there is not result returned, the drop down menu stops working and I don't know how to fix it  
    })
    $('input[type="checkbox"]').on('click', app.toggleArrow)
}

// DOCUMENT READY
$(() => {  
    app.init();
})  


