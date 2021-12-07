// initialize global variables & switches
let countryTreemap,
    countryGlobe;

// load data using promises
let promises = [
    d3.json("data/world.geojson"),
        // "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
    d3.csv("data/countryCode.csv")
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// initMainPage
function initMainPage(dataArray) {

    // initialize objects
    geogGlobe = new Globe("#geogGlobe", dataArray[0], dataArray[1], {width: 1280, height: 600});
    geogTreemap = new GeogTM("#geogTree", dataArray[1], {width: 1560, height: 300});

}
