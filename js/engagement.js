const NUMBER_OF_VALUES = 15;

class EngagementVis {

    constructor(parentElement, data, icons_data) {
        this.parentElement = parentElement;
        this.data = data;
        this.icons_data = icons_data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 50, right: 150, bottom: 50, left: 40 };

        // x ticks Labels
        vis.xLabels = {
            0:"0",
            1:"1 - 10",
            10:"11 -100",
            100:"101 - 1,000",
            1000:"1,001 - 10,000",
            10000:"10,001 - 100,000",
            100000:">100,000"
        };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.right
            - vis.margin.left;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.bottom
            - vis.margin.top;

        // vis.width = 1200;
        // vis.height = 800;

        // Main viz area
        vis.svg = d3.select("#" + vis.parentElement)
                    .append("svg")
                    .attr("width", vis.width + vis.margin.right + vis.margin.left)
                    .attr("height", vis.height + vis.margin.bottom + vis.margin.top )
                    
        // Title segments charts
        vis.titleSegmentChart = vis.svg.append("g")

        vis.products_domain = d3.extent(vis.data.map(d=>{
            return d.products;
        }));

        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(1);

        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale)
            .ticks(10)
            .tickFormat((d) => vis.xLabels[d]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.yScale)
            .ticks(10);

        vis.xLabel = "Products in store"
        vis.yLabel = "Avg published posts"

        vis.pieColorsScale = d3.scaleOrdinal(["#F15B2D", "#FCB331", "#4838BF", "#2DAA5A", "#FFF831",
            "#B2A7FF", "#CCEDAC", "#3422B8", "#FACD9E", "#F6F5FC", "#CCA84E", "#F15A2D", "#E99FA0",
            "#589885", "#6F6F6F"])

        vis.pieData = d3.pie().value(d => d.count);

        vis.pieArc = d3.arc()
            .outerRadius(d=>vis.rScale(d.data.maxPosts) - 2)
            .innerRadius(0);

        vis.chart = vis.svg.append("g")
            .attr("class", "engage-chart")
            .attr("width", vis.width - vis.margin.left - vis.margin.right)
            .attr("height", vis.height - vis.margin.top - vis.margin.bottom)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.piesContainer = vis.chart.append("g")
            .attr("class", "pies-container")

        vis.chart.append("g")
                 .attr("class", "x-axis")
                 .attr("transform", "translate(" + vis.margin.left + ", " + vis.height + " )")

        vis.chart.append("g")
                 .attr("class", "y-axis")
                 .attr("transform", "translate(" + vis.margin.left + ",  0)")

        var tableEl = d3.select("#tableContent")
                        .append("table")
                        .attr("class", "table")

        var theadTr = tableEl.append("thead")
                            .append("tr");

        let tbodyEl = tableEl.append("tbody");

        let tableColumns = ["#", "Color", "Icons", "Segements", "# of Companies"]
        
        for (let i = 0; i < tableColumns.length; i++) {
            theadTr.append("th").text(tableColumns[i]);}


        for (let i = 0; i < NUMBER_OF_VALUES; i++) {
        
            let row = tbodyEl.append("tr");

            row.append("td")
                .attr("id", "index_" + i)

            row.append("td")
                .append("svg")
                .attr("width", 10)
                .attr("height", 10)
                .append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("id", "color_" + i)


            row.append("td")
                .attr("id", "icon_" + i)

            row.append("td")
                .attr("id", "name_" + i)

            row.append("td")
                .attr("id", "value_" + i)
        }               

        this.wrangleData();
    }

    wrangleData() {

        let vis = this;

        const productsMax = 1000000;
        const productsMin = 1;
        const pies = new Map();
        const srcData = vis.data;
        
        let allCompanies = preparePieData(srcData, "1st segment", vis.icons_data);

        allCompanies = simplifyPieData(allCompanies, NUMBER_OF_VALUES);
        vis.allCompanies = {pieData: allCompanies};

        srcData.forEach(company => {
            if (isNaN(company.products)) {
                return;
            }
            
            for (let products=productsMin; products<productsMax; products*=10) {
                if (company.products > products && products < productsMax -1) {
                    continue;
                }

                if (!pies.has(products)) {
                    pies.set(products, {
                        range: products,
                        companies: [],
                        maxPosts: 0,
                        pieData: {}
                    });
                }

                const current = pies.get(products);
                current.companies.push(company);
                break;
            }
        })

        console.log("srcData", srcData);

        pies.forEach((value)=> {

            value.maxPosts = avgOut(value.companies, 
                                    "published_posts_by_onollo", 
                                    value.companies.length);

            const allPieData = preparePieData(value.companies, "1st segment", vis.icons_data);

            value.pieData = simplifyPieData(allPieData, NUMBER_OF_VALUES);
            value.pieData.forEach(d=>{d.maxPosts = value.maxPosts})
        })

        vis.pies = Array.from(pies.values()).sort((a, b)=>a.range-b.range);

        
        this.updateVis()
    }

    updateVis() {
        let vis = this;  

        vis.yScale.domain([0, d3.max(vis.pies, d=>d.maxPosts) + 1000]);

        const xRange = vis.pies.map(d=>d.range);
        xRange.unshift(0);

        vis.xScale.domain(xRange);
        
        vis.rScale = d3.scaleLinear()
                        .domain(d3.extent(vis.pies, d=>d.maxPosts))
                        .range([10, 70]);

        vis.chart.select(".x-axis")
                 .call(vis.xAxis)
                 .append("text")
                 .text(vis.xLabel)
                 .attr("transform", "translate(" + vis.width / 2 + ", 50)")
					.attr("class", "axis-label")
					.attr("fill", "black");

        vis.chart.select(".y-axis")
                .call(vis.yAxis)
                .append("text")
                .text(vis.yLabel)
                .attr("transform", "translate(-50, " + vis.height / 2.5 + "), rotate(-90)")
                .attr("class", "axis-label")
                .attr("fill", "black");

        const vLines = vis.piesContainer.selectAll('.v-pie-line')
                                        .data(vis.pies);
        
        vLines.enter()
                .append("line")
                .attr("class", "v-pie-line")
                .style("stroke", "lightgrey")
                .style("stroke-width", 1)
                .attr("x1", d=>vis.margin.left + vis.xScale(d.range))
                .attr("y1", vis.height)
                .attr("x2", d=>vis.margin.left + vis.xScale(d.range))
                .attr("y2", d=>vis.yScale(d.maxPosts));

        const hLines = vis.piesContainer.selectAll('.h-pie-line')
                                         .data(vis.pies);

        hLines.enter()
                .append("line")
                .attr("class", "h-pie-line")
                .style("stroke", "lightgrey")
                .style("stroke-width", 1)
                .attr("x1", vis.margin.left)
                .attr("y1", d=>vis.yScale(d.maxPosts))
                .attr("x2", d=>vis.margin.left + vis.xScale(d.range))
                .attr("y2", d=>vis.yScale(d.maxPosts));

        let pies = vis.piesContainer.selectAll(".pie-chart")
                                    .data(vis.pies);

        const newPies = pies.enter()
                            .append("g")
                            .attr("class", "pie-chart");

        newPies.append('circle')
                .attr('class', 'hit-ares')
                .attr('r', d=>vis.rScale(d.maxPosts))
                .on('mouseover', (e, d) => showMoreDetails(vis, d))
                .on('mouseout', () => showMoreDetails(vis, vis.allCompanies))

        pies = pies.merge(newPies);
        pies.attr("transform", d=>`translate(${vis.margin.left + vis.xScale(d.range)},${vis.yScale(d.maxPosts)})`)

        let arsc = pies.selectAll(".arc")
            .data(d=>vis.pieData(d.pieData));

        arsc.enter()
            .append("path")
            .attr("pointer-events", "none")
            .attr("class", "arc")
            .attr("d", vis.pieArc)
            .attr("fill", (d, i) => vis.pieColorsScale(d.data.name));

        showMoreDetails(vis, vis.allCompanies);
    }
}

function showMoreDetails(vis, data) {

    // Update Table
    let sortedData = data.pieData.sort((a, b) => b.count - a.count);

    console.log("sortedData :::", sortedData)

    for (let i = 0; i < NUMBER_OF_VALUES; i++) {

        if (sortedData[i] != "N/A") {
            d3.select("#index_" + i)
            .text(i + 1)

            d3.select("#color_" + i)
                .attr("fill", vis.pieColorsScale(sortedData[i].name));

            d3.select("#icon_" + i)
                .text(sortedData[i].icon)
            
            // custom icon for Other
            if (sortedData[i].name == "Other") {
                d3.select("#icon_" + i)
                    .text("🗑")
            }

            d3.select("#name_"+i) 
                .text(sortedData[i].name)

            d3.select("#value_"+i) 
                .text(sortedData[i].count.toLocaleString())
        }
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

function preparePieData(companies, key, icons_data) {

    const res = new Map();

    function selectIcon(segment, icons_data) {
        for (let i = 0; i < icons_data.length; i++) {
            if (icons_data[i].name == segment) {
                return icons_data[i].code
            }
        }
    }

    companies.forEach(function(d, i) {
        const segment = d[key];

        if (!res.has(segment)) {
            res.set(segment, {
                count: 0,
                name: segment,
                icon: selectIcon(segment, icons_data)
            })
        }
        res.get(segment).count++;
    });

    return Array.from(res.values());
}

function simplifyPieData(data, count) {

    data.sort((a, b) => b.count - a.count);

    if (data.length <= count) {
        return [...data];
    }

    const other = {
        count: 0,
        name: "Other",
    }

    for (let i = count; i < data.length; i++) {
        other.count += data[i].count;
    }

    const res = data.slice(0, count);

    res.push(other);

    return res;
}