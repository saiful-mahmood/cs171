// base code adapted from https://www.d3-graph-gallery.com/parallel.html
class Parallel {

    constructor(parentElement, dataset, dimCanvas, eventHandler) {
        this.parentElement = parentElement;
        this.dataset = dataset;                              // /data/pricing.csv
        this.dimCanvas = dimCanvas;                          // {width: 540, height: 270}
        this.eventHandler = eventHandler;

        this.initVis()
    }

    initVis() {
        let vis = this;

        // set the dimensions and margins of the graph
        vis.canvas = vis.dimCanvas;
        vis.margin = {top: 40, right: 50, bottom: 80, left: 50};
        vis.width = vis.canvas.width - vis.margin.left - vis.margin.right;
        vis.height = vis.canvas.height - vis.margin.top - vis.margin.bottom;

        // append the svg object to the body of the page
        vis.fence = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // initialize arrays
        vis.plans = ["Agency", "SuperPro", "Pro", "Free"];
        vis.planLoop = {"Free": 2, "Pro": 64, "SuperPro": 122, "Agency": 213, "All": 292}
        vis.measures = ["products", "categories", "brands", "publishedPosts", "scheduledPosts"];
        vis.titles = ["Products", "Categories", "Brands", "Published Posts", "Scheduled Posts"];
        vis.decileDataset = [];

        // assign colors to plans
        vis.color = d3.scaleOrdinal()
            .domain(vis.plans)
            .range(["#2DAA5A", "#F15B2D", "#4838BF", "#FCB331"])
        // measures to the x axis
        vis.xScale = d3.scalePoint()
            .range([0, vis.width])
            .domain(vis.measures);

        // add legend
        vis.fence
            .append("rect")
            .attr("width", 16).attr("height", 16).attr("x", 124).attr("y", vis.height + 20)
            .attr("class", "Free")
        vis.fence
            .append("text")
            .attr("x", 146).attr("y", vis.height + 33)
            .attr("class", "heightLabel")
            .text("Free")
        vis.fence
            .append("rect")
            .attr("width", 16).attr("height", 16).attr("x", 290).attr("y", vis.height + 20)
            .attr("class", "Pro")
        vis.fence
            .append("text")
            .attr("x", 312).attr("y", vis.height + 33)
            .attr("class", "heightLabel")
            .text("Pro")
        vis.fence
            .append("rect")
            .attr("width", 16).attr("height", 16).attr("x", 449).attr("y", vis.height + 20)
            .attr("class", "SuperPro")
        vis.fence
            .append("text")
            .attr("x", 471).attr("y", vis.height + 33)
            .attr("class", "heightLabel")
            .text("SuperPro")
        vis.fence
            .append("rect")
            .attr("width", 16).attr("height", 16).attr("x", 640).attr("y", vis.height + 20)
            .attr("class", "Agency")
        vis.fence
            .append("text")
            .attr("x", 662).attr("y", vis.height + 33)
            .attr("class", "heightLabel")
            .text("Agency")
        vis.fence
            .append("rect")
            .attr("width", 16).attr("height", 16).attr("x", 822).attr("y", vis.height + 20)
            .attr("class", "All")
        vis.fence
            .append("text")
            .attr("x", 844).attr("y", vis.height + 33)
            .attr("class", "heightLabel")
            .text("All")

        // add title
        vis.fence
            .append("text")
            .attr("x", -22)
            .attr("y", -28)
            .attr("class", "visTitle")
            .text("Measures")

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // initialize and build arrays for each measure and plan
        vis.products = {"Free": [0], "Pro": [0], "SuperPro": [0], "Agency": [0]}
        vis.categories = {"Free": [0], "Pro": [0], "SuperPro": [0], "Agency": [0]};
        vis.brands = {"Free": [0], "Pro": [0], "SuperPro": [0], "Agency": [0]};
        vis.published = {"Free": [0], "Pro": [0], "SuperPro": [0], "Agency": [0]};
        vis.scheduled = {"Free": [0], "Pro": [0], "SuperPro": [0], "Agency": [0]};

        // build arrays for each measure-plan combination
        for (let i of vis.dataset) {
            for (let j of vis.plans) {
                if (i["plan"] === j) {
                    vis.products[j].push(+i["products"]);
                    vis.categories[j].push(+i["categories"]);
                    vis.brands[j].push(+i["brands"]);
                    vis.published[j].push(+i["publishedPosts"]);
                    vis.scheduled[j].push(+i["scheduledPosts"]);
                }
            }
        }
        // write records to decileDataset for each plan-decile combination
        // but not the 10th decile
        for (let i of vis.plans) {
            for (let j = 1; j < 10; j++) {
                vis.decileDataset.push({
                    "products": d3.quantile(vis.products[i], j / 10),
                    "categories": d3.quantile(vis.categories[i], j / 10),
                    "brands": d3.quantile(vis.brands[i], j / 10),
                    "publishedPosts": d3.quantile(vis.published[i], j / 10),
                    "scheduledPosts": d3.quantile(vis.scheduled[i], j / 10),
                    "plan": i
                })
            }
        }
        // console.log("decileDataset", vis.decileDataset)

        // build the y axes for each measure
        vis.yScale = {}
        for (let i in vis.measures) {
            name = vis.measures[i]
            vis.yScale[name] = d3.scaleLinear()
                .domain([0, d3.max(vis.decileDataset, d => +d[name])])
                .range([vis.height, 0])
        }

        // calculate coordinates for the paths
        vis.path = function (d) {
            return d3.line()(vis.measures.map(function(p) { return [vis.xScale(p), vis.yScale[p](d[p])]; }));
        }

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Highlight the plan that is hovered
        vis.highlight = function(event, d){
            vis.selected_plan = d.plan

            // first every group turns grey
            d3.selectAll(".line")
                .transition()
                .duration(200)
                .style("stroke", "lightgrey")
                .style("opacity", "0.2")
            // Second the hovered plan takes its color
            d3.selectAll("." + vis.selected_plan)
                .transition()
                .duration(200)
                .style("stroke", vis.color(vis.selected_plan))
                .style("opacity", "1")
        }

        // Unhighlight
        vis.doNotHighlight = function(event, d){
            d3.selectAll(".line")
                .transition()
                .duration(200)
                .delay(200)
                .style("stroke", function(d){ return( vis.color(d.plan))} )
                .style("opacity", "1")
        }

        // Draw the lines
        vis.fence
            .selectAll("myPath")
            .data(vis.decileDataset)
            .join("path")
            .attr("class", function (d) { return "line " + d.plan } )
            // two classes for each line: 'line' and the group name
            .attr("d", vis.path)
            .style("fill", "none")
            .style("stroke", function(d){ return( vis.color(d.plan))} )
            .style("stroke-width", 4)
            .style("opacity", 0.5)
            .on("mouseover", vis.highlight)
            .on("mouseleave", vis.doNotHighlight)
            .on("click", function(event, d){
                vis.planSelection = d.plan;
                vis.eventHandler.trigger("selectionChanged", vis.planSelection);
            });

        // Draw the axis
        vis.fence.selectAll("myAxis")
            // for each dimension of the dataset, add a 'g' element
            .data(vis.measures)
            .enter()
            .append("g")
            .attr("class", "axis")

            // translate this element to its right position on the x axis
            .attr("transform", function(d) { return "translate(" + vis.xScale(d) + ")"})

            // build the axis with the call function
            .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(vis.yScale[d])); })

            // add axis title
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text((d, i) => vis.titles[i])
            .style("fill", "black")
    }
}
