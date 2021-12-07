// base code adapted from https://www.d3-graph-gallery.com/histogram.html
class Histogram {

    constructor(parentElement, title, dataset, dimCanvas, plan, measure) {
        this.parentElement = parentElement;
        this.title = title
        this.dataset = dataset;
        this.dimCanvas = dimCanvas;
        this.plan = plan;
        this.measure = measure;

        this.initVis()
    }

    initVis() {
        let vis = this;

        // dimensions and margins
        vis.canvas = vis.dimCanvas;
        vis.margin = {top: 40, right: 40, bottom: 40, left: 50};
        vis.width = vis.canvas.width - vis.margin.left - vis.margin.right;
        vis.height = vis.canvas.height - vis.margin.top - vis.margin.bottom;

        // append the svg object to the parent element
        vis.hist = d3.select(vis.parentElement)
            .append("svg")
            .attr("width", vis.canvas.width)
            .attr("height", vis.canvas.height)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
            .attr("class", "initSvg");

        // init scales
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width]);
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0])

        // init axes
        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale);
        vis.hist
            .append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0, " + vis.height + ")")
        vis.yAxis = d3.axisLeft()
            .scale(vis.yScale);
        vis.hist
            .append("g")
            .attr("class", "y-axis")
        vis.hist
            .append("text")
            .attr("x", -154)
            .attr("y", -38)
            .attr("class", "y-axis")
            .text("Number of Companies")
            .attr("transform", "rotate(-90)");

        // add title
        vis.hist
            .append("text")
            .attr("x", 10)
            .attr("y", -12)
            .attr("class", "visTitle")
            .text(vis.title)

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // filter dataset by selection
        if (vis.plan !== "") {
            vis.selected = vis.dataset.filter(function (d) {
                return d["plan"] === vis.plan;
            })} else {
            vis.selected = vis.dataset;
        }
        // console.log("dataset", vis.dataset);
        // console.log("selected", vis.selected);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        function fillColor(plan) {
            switch (plan) {
                case "" :         return "#6F6F6F";
                case "Free" :     return "#FCB331";
                case "Pro" :      return "#4838BF";
                case "SuperPro" : return "#F15B2D";
                case "Agency" :   return "#2DAA5A";
            }
        }

        // x scale and axis
        vis.xScale
            .domain([0, d3.max(vis.selected, d => +d[vis.measure]) / 50])            // variable
            // .domain([0, d3.quantile(vis.selected, d => +d[vis.measure], .99)])            // variable
            // dividing by 50 trims off outliers at the top

        vis.hist.select(".x-axis")
            .transition()
            .duration(200)
            .ease(d3.easeCubicInOut)
            .call(vis.xAxis);

        // histogram parameters
        vis.histogram = d3.histogram()
            .value(d => +d[vis.measure])
            .domain(vis.xScale.domain())
            .thresholds(vis.xScale.ticks(40));                                  // suggested numbers of bins
        vis.bins = vis.histogram(vis.selected);

        // y scale and axis
        vis.yScale
            .domain([0, d3.max(vis.bins, d => d.length)]);
        vis.hist.select(".y-axis")
            .transition()
            .duration(200)
            .ease(d3.easeCubicInOut)
            .call(vis.yAxis);

        // append the hist to the svg
        vis.bars = vis.hist.selectAll("rect.hist")
            .data(vis.bins)
        vis.bars
            .enter()
            .append("rect")
            .attr("class", "hist")
            // update
            .merge(vis.bars)
            .attr("x", 1)
            .attr("transform", function(d) {return "translate(" + vis.xScale(d.x0) + ", "
                + vis.yScale(d.length) + ")"})
            // subtract 1px for padding, but not if the width is 0
            .attr("width", function(d) {return vis.xScale(d.x1) - vis.xScale(d.x0) - (d.x1 === d.x0 ? 0 : 1)})
            .attr("height", function(d) {return vis.height - vis.yScale(d.length); })
            .attr("fill", fillColor(vis.plan))
        vis.bars.exit().remove();
    }

    onSelectionChange(plan) {
        let vis = this;

        vis.plan = plan;
        vis.wrangleData();
    }

    onReset(){
        let vis = this;

        vis.plan = "";
        vis.wrangleData();
    }
}
