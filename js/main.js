/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let myEngagementVis,
    myMapVis,
    myOverviewVis,
    cleanData;


let selectedCategory = '';
let selectedTimeRange = [];
let selectedState = '';


// load data using promises
var promises = [
    d3.csv("data/all_data_6.csv"),
    d3.csv("data/segments_icons.csv"),
];

Promise.all(promises)
    .then(data => {
        initMainPage(data);
    })
    .catch(function (err) {
        console.log(err);
    });

// initMainPage
function initMainPage(dataArray) {

    console.log("dataArray", dataArray);

    // clean data
    cleanData = new DataPreProcessing(dataArray[0]);

    // init Overview
    myOverviewVis = new OverviewVis('myOverviewData', cleanData.data);

    // init Engagement
    myEngagementVis = new EngagementVis('myEngagementViz', cleanData.data, dataArray[1]);

    // Logs
    console.log("cleanData: ", cleanData.data);
}