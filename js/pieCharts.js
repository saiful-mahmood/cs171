class PieCharts {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        console.log("pie-initVis");

        vis.margin = {top: 150, right: 150, bottom: 150, left: 150 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.right - vis.margin.left;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.bottom - vis.margin.top; 

        // Main viz area
        vis.svg = d3.select("#" + vis.parentElement)
                    .append("svg")
                    .attr("width", vis.width + vis.margin.right + vis.margin.left)
                    .attr("height", vis.height + vis.margin.bottom + vis.margin.top )
                    .append("g")
                    .attr("transform", `translate(${vis.width / 2}, ${vis.height/2})`)

        vis.segments = getSegementsCount(vis.data[0]);

        console.log("vis.segments", vis.segments);

        vis.pieScale = d3.scaleOrdinal()
                            .domain(vis.segments)
                            .range(['#ffd384', '#94ebcd', '#fbaccc',
                                    '#d3e0ea', '#fa7f72']);
                            // .range(["#F15B2D", "#FCB331", "#4838BF", "#2DAA5A", "#FFF831", "#B2A7FF", "#CCEDAC",
                            //         "#3422B8", "#FACD9E", "#F6F5FC", "#CCA84E", "#F15A2D", "#E99FA0", "#589885",
                            //         "#6F6F6F"]);

        vis.pie = d3.pie().value(function(d) { return d.count; });

        vis.arc = vis.svg.selectAll("arc")
                            .data(vis.pie(vis.segments))
                            .enter();

        vis.path = d3.arc()
                     .outerRadius(200)
                     .innerRadius(0);

        vis.arc.append("path")
                    .attr("d", vis.path)
                    .attr("fill", function(d) { return vis.pieScale(d); });
        
        var label = d3.arc()
                        .outerRadius(200)
                        .innerRadius(0);
      
        vis.arc.append("text")
                .attr("transform", function(d) { 
                        return "translate(" + label.centroid(d) + ")"; 
                })
                .text(function(d) { return d.data.name; })
                .style("font-family", "arial")
                .style("font-size", 15);

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this; 
        console.log("Pie-wrangleData")
        this.updateVis()
    }

    updateVis() {
        let vis = this; 
        console.log("Pie-update")
    }
}

    function getSegementsCount(data) {
        segmentsCount = {};
        data.forEach(function(d) {
            segmentsCount[d["1st segment"]] = (segmentsCount[d["1st segment"]] || 0) + 1;
        });
    
        segments2 = []
    
        let segmentsNames = Object.keys(segmentsCount);
    
        for (let i = 0; i < segmentsNames.length; i++) {
            segment = {};
            segment["name"] = segmentsNames[i]
            segment["count"] = segmentsCount[segmentsNames[i]]
            segments2.push(segment);
        }

        return segments2;
    }