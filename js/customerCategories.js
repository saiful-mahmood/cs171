console.log("let's get started!")

function showImage(d) {
    // let imgPath = 'imgs/' + d.image;
    document.getElementById("imageArea").innerHTML = "<img src='imgs/" + d.image + "' class='buildingImage'/>"
    let building_title = d.Category
    let table_data = "<h4 class='building_stats'> "+building_title+"</h4>";

    table_data += "<table class=\"table table-hover\" id=\"myTable\">"

    table_data += "<tr><td>Total monthly estimated sales for current Onollo customers in the industry: "
        + d.Total_estimated_monthly_sales + " </td>"
    table_data += "<tr><td>Average monthly estimated sales for current Onollo customers in the industry: "
        + d.Avg_estimated_monthly_sales + " </td>"
    table_data += "<tr><td>Total number of Onollo customers in the industry: " + d3.format(",")(d.Number_Of_Companies)
        + " </td>"
    table_data += "</tr></table></div>"
    console.log(d)
    document.getElementById("statsArea").innerHTML = table_data
}

// let rawData = d3.csv("data/client_data JT.xlsx - buildings.csv", (row) => {
let rawData = d3.csv("data/client_data JT.xlsx - buildings.csv", (row) => {
    // convert
    row.value = +row.value
    return row
}).then( (rawData) => {
    rawData.sort((a, b) => {
        return b.height_px - a.height_px;
    })
    showImage(rawData[0]);
    console.log(rawData);

    let svg = d3.select("#left_column").append("svg")
        .attr("width", 500)
        .attr("height", 550)

    svg.selectAll("rect")
        .data(rawData)
        .enter()
        .append("rect")
        .attr('width', (d) => {return d.height_px})
        .attr('height', 40)
        .attr('class', "SuperPro")
        .attr("x", 250)
        .attr("y", (d,i) => {return i*50})
        .on('mouseover',function(e,d) {
            showImage(d)});

    svg.selectAll("#left_column.buildingLabel")
        .data(rawData)
        .enter()
        .append("text")
        .attr("class", "buildingLabel")
        .attr("x", 245)
        .attr("y", (d, i) => {return i*50+27})
        .text((d) => d["Category"])

    svg.selectAll("text.heightLabel")
        .data(rawData)
        .enter()
        .append("text")
        .attr("class", "heightLabel")
        .attr("x", (d) => (+d.height_px) + (+d.height_px < 200 ? 254 : 146))
        .attr("y", (d, i) => {return i*50+25})
        .text((d) => d3.format(",")(d.Number_Of_Companies) + " companies");
});

