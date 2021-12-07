// countryTreemap = new TreemapCountry("#ctrTree", dataArray[1], {width: 1280, height: 300});

// set the dimensions and margins of the graph
const canvas = {width: 1240, height: 600},
    margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = canvas.width - margin.left - margin.right,
    height = canvas.height - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#geogGlobe")
    .append("svg")
    .attr("width", canvas.width)
    .attr("height", canvas.height)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Map, projection, and data (web or local)
// const path = d3.geoPath();
const projection = d3.geoNaturalEarth1()
    .scale(200)
    .center([0,0])                         // drop map to make room for title
    .translate([width / 2, height / 2]);
const gJson = "/data/world.geojson";
         // = "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson";
const companies = "/data/countryCode.csv";

// append tooltip
// vis.tooltip = d3.select(vis.parentElement).append('div')
//     .attr('class', "tooltip")

// Data and color scale
const data = new Map();
const opacityScale = d3.scaleThreshold()
    .domain([1, 10, 20, 50, 100, 1000])         // 7 population buckets; first is < 100K
    .range(.14, .28, .43, .57, .71, .86, 1);    // continuous, single hue color scheme made into 7 discrete values

// Load external data and boot
Promise.all(
    [d3.json(gJson),
        d3.csv(companies, function(d) {
            data.set(d.code, [d.parent, +d.value])
        }),
        d3.csv(companies
            //     console.log("companies", d)
            //     data.set(d.code, +d.value)
        )
    ])
    .then(function(loadData){
        updateVis(loadData)
})

    function updateVis(loadData) {
        let topo = loadData[0]
        let companyData = loadData[1];
        let companies = loadData[2]
        console.log("topo", topo, "companies", companies);

        let geoMap = {}
        topo.features.forEach(function (d) {geoMap[d["id"]] = d;});
        console.log("geoMap", geoMap)
        let compMap = {}
        companies.forEach(function (d) {compMap[d["code"]] = d;})
        console.log("compMap", compMap)

        console.log(topo.features[9].id, companies[6].code);
        console.log("geoMap[AUT]", geoMap["AUT"])
        console.log("compMap[AUT]", compMap["AUT"], compMap["AUT"]["parent"], compMap["AUT"]["value"])
        console.log("AUT", compMap[topo.features[9].id]["parent"], compMap[topo.features[9].id]["value"])


        // let mouseOver = function() {
        //     d3.selectAll(".Country")
        //         .transition()
        //         .duration(200)
        //         .style("opacity", .5)
        //     d3.select(this)
        //         .transition()
        //         .duration(200)
        //         .style("opacity", 1)
        //         // .style("stroke", "black")
        // }
        //
        // let mouseLeave = function() {
        //     d3.selectAll(".Country")
        //         .transition()
        //         .duration(200)
        //         .style("opacity", .8)
        //     d3.select(this)
        //         .transition()
        //         .duration(200)
        //         .style("stroke", "transparent")
        // }

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("class", function(d){
                if (compMap[d.id])
                    return compMap[d.id]["parent"]
                else
                    return "empty"
            })
            .attr("opacity", d => opacityScale(d.total[1]))
        // .on("mousemove", function (event, d) {
        //     d3.select(this)
        //     vis.tooltip
        //         .style("opacity", 1)
        //         .style("left", event.pageX + "px")
        //         .style("top", event.pageY + "px")
        //         .html(`<div style="border: thin solid grey; border-radius: 5px; background: lightgrey;
        //                 padding: 10px">
        //                 ` + d.data.name + `<br>` +
        //             d3.format(",")(d.data.value) + (d.data.value < 2 ? ` company` :` companies`))
        // })
        // .on("mouseover", mouseOver )
        // .on("mouseleave", mouseLeave )
}