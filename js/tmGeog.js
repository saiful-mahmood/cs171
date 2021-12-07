// base code adapted from https://www.d3-graph-gallery.com/treemap.html
class GeogTM {

    constructor(parentElement, dataset, dimCanvas) {
        this.parentElement = parentElement;                 // "#csvTree"
        this.dataset = dataset;                             // "/data/countryCode.csv"
        this.dimCanvas = dimCanvas                          // {width: 1280, height: 300}

        this.initVis()
    }

    initVis() {
        let vis = this;

        // set the dimensions and margins of the graph
        vis.canvas = vis.dimCanvas;
        vis.margin = {top: 10, right: 10, bottom: 0, left: 30};
        vis.width = vis.canvas.width - vis.margin.left - vis.margin.right;
        vis.height = vis.canvas.height - vis.margin.top - vis.margin.bottom;

        // append the svg object in the body of the page
        vis.boxes = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", vis.canvas.width)
            .attr("height", vis.canvas.height)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // append tooltip
        vis.tooltip = d3.select(vis.parentElement).append("div")
            .attr("class", "tooltip")

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // sort
        vis.sortedData = vis.dataset.sort((a,b)=> b.value - a.value);
        // console.log("sortedData", vis.sortedData);

        // stratify the data: reformatting for d3.js
        vis.root = d3.stratify()
            .id(d => d.name)           // Name of the entity (column name is name in csv)
            .parentId(d => d.parent)   // Name of the parent (column name is parent in csv)
            (vis.sortedData);
        vis.root.sum(d => +d.value)    // Compute the numeric value for each entity

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // d3.treemap computes the position of each element of the hierarchy
        // The coordinates are added to the root object above
        d3.treemap()
            .size([vis.width, vis.height])
            .padding(3)
            (vis.root)

        // draw rectangles
        vis.boxes
            .selectAll("rect")
            .data(vis.root.leaves())
            .join("rect")
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr("class", "tmBox")
            .attr("class", d => d.data.parent)

            // add tooltip
            .on("mouseover", function (event, d) {
                console.log("x", d.x0, "y", d.y0)
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", 2)
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", d.x0 + 20 + "px")
                    .style("top", d.y0 + 1005 + "px")
                    .html(`<div style="border: thin solid grey; border-radius: 5px; background: white;
                        opacity: .85; padding: 10px">` + d.data.name  + ` has ` +
                        d3.format(",")(d.data.value) + (d.data.value < 2 ? ` company` :` companies`))
            })
            .on("mouseout", function (event, d) {
                d3.select(this)
                    .style("stroke-width", 0)
                vis.tooltip
                    .style("opacity", 0)
                    .html(``)
            })

        // add text labels
        vis.boxes
            .selectAll("text")
            .data(vis.root.leaves())
            .join("text")
            .attr("x", d => d.x0 + 9)                   // to adjust position more right
            .attr("y", d => d.y0 + 17)                  // to adjust position lower
            .text(function(d){
                if (d.data.name.length * 8 < d.x1 - d.x0)  // don't display text if rect is too small
                    return d.data.name
            })
            .attr("class", "label")
    }
}
