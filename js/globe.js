class Globe {

    constructor(parentElement, worldData, countryCodes, dimCanvas) {
        this.parentElement = parentElement;
        this.worldData = worldData;                             // /data/world.geojson
        this.countryCodes = countryCodes;                       // /data/countryCode.csv
        this.canvas = dimCanvas;                                // {width: 1280, height: 800}

        this.initVis()
    }

    initVis() {
        let vis = this;

        // set the dimensions and margins of the graph
        // vis.canvas = vis.dimCanvas;
        vis.margin = {top: 40, right: 40, bottom: 40, left: 25};
        vis.width = vis.canvas.width - vis.margin.left - vis.margin.right;
        vis.height = vis.canvas.height - vis.margin.top - vis.margin.bottom;

        // append the svg object to the body of the page
        vis.earth = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", vis.canvas.width)
            .attr("height", vis.canvas.height)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // projection
        vis.projection = d3.geoNaturalEarth1()
            .scale(200)
            .center([0,0])
            .translate([vis.width / 2, vis.height / 2]);

        vis.data = new Map();
        vis.opacityScale = d3.scaleThreshold()
            .domain([1, 10, 20, 50, 100, 1000])          // 7 population buckets; first is < 100K
            .range([.25, .375, .5, .625, .75, .875, 1])  // continuous, single color scheme made into 7 discrete values

        // append tooltip
        vis.tooltip = d3.select(vis.parentElement).append("div")
            .attr("class", "tooltip")

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.topo = vis.worldData;
        vis.companies = vis.countryCodes;
        // console.log("topo", vis.topo, "companies", vis.companies);

        vis.geoMap = {}
        vis.topo.features.forEach(function (d) {vis.geoMap[d["id"]] = d;});
        // console.log("geoMap", vis.geoMap)
        vis.compMap = {}
        vis.companies.forEach(function (d) {vis.compMap[d["code"]] = d;})
        // console.log("compMap", vis.compMap)

        // Draw the map
        vis.earth.append("g")
            .selectAll("path")
            .data(vis.topo.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(vis.projection)
            )
            .attr("class", function(d){
                if (vis.compMap[d.id])
                    return vis.compMap[d.id]["parent"]
                else
                    return "empty"
            })
            .attr("opacity", function(d){
                if (vis.compMap[d.id]) {
                    return vis.opacityScale(Number(vis.compMap[d.id]["value"])); }
                else
                    return 1
            })
            // add tooltip
            .on("mouseover", function (event, d) {
                if (vis.compMap[d.id]["value"] > 0) {
                    d3.select(this)
                        .style("stroke", "black")
                        .style("stroke-width", 2)
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + "px")
                        .style("top", event.pageY + "px")
                        .html(`<div style="border: thin solid grey; border-radius: 5px; background: white;
                            opacity: .85; padding: 10px">` +
                            vis.compMap[d.id]["name"] + ` has ` + d3.format(",")(vis.compMap[d.id]["value"])
                            + (vis.compMap[d.id]["value"] < 2 ? ` company` : ` companies`)
                        )
                }
            })
            .on("mouseout", function (event, d) {
                if (vis.compMap[d.id]["value"] > 0) {
                    d3.select(this)
                        .style("stroke-width", 0)
                    vis.tooltip
                        .style("opacity", 0)
                        .html(``)
                }
            })
    }
}

