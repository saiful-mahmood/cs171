// Bar chart configurations: data keys and chart titles
let configs = [
    { key: "Products_bins", title: "Number of Products"},
    { key: "Plan Level", title: "Plan Level"},
    { key: "num_posts", title: "Number of Posts"},
    { key: "platforms", title: "Platforms"}
];


// Initialize variables to save the charts later
let barcharts = [];
let areachart;



// Date parser to convert strings to date objects
var parseDate = d3.timeParse("%Y-%m-%d");

d3.csv("data/onollo_customers.csv"). then(csv=>{

    csv.forEach(function(d){
        d.survey = parseDate(d.survey);
    });

    // Store csv data in global variable
    let data = csv;

    // create the bar chart objects
    configs.forEach(function(d,i){
        barname = "bar_"+configs[i].key;
        label = "bar"+i;
        barcharts[i]=new BarChart(label, data, configs[i].key, configs[i].title);
    });

    areachart = new AreaChart("histogram-chart", data);
});



// React to 'brushed' event and update all bar charts
function brushed() {

    // Get the extent of the current brush
    let selectionRange = d3.brushSelection(d3.select(".brush").node());


    // Convert the extent into the corresponding domain values
    let selectionDomain = selectionRange.map(areachart.xScale.invert);

    // redraw barcharts
    barcharts.forEach(d=>d.selectionChanged(selectionDomain));
}
