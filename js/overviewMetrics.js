var CARDSIZE_SIZE = [200, 150];
var CARDS_MARGIN_H = 120;
var CARDS_MARGIN_V = 80;


class OverviewVis {
    
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis()
    }
    
    initVis() {
        let vis = this;

        vis.ecomValues = countAndPrepareValues(vis.data, "platform", "platform");
        vis.segmentsValues = countAndPrepareValues(vis.data, "1st segment", "segment");
        vis.totalValues = []
        vis.maxValues = []
        vis.avgValues = []
        
        // Total
        vis.totalValues.push(["totalCompanies", vis.data.length, "Total Users"]);

        vis.totalValues.push(["totalPosts", sumUp(vis.data, "published_posts_by_onollo"), "Total Posts"]);
        vis.totalValues.push(["totalBrands", sumUp(vis.data, "num_of_brands"), "Total Brands"]);
        vis.totalValues.push(["totalProducts", sumUp(vis.data, "products"), "Total Products"]);
        
        // Averages
        vis.avgValues.push(["avgStoreAge", avgOut(vis.data, "store_age_days", vis.totalValues[0][1]), "Store Age"]);
        vis.avgValues.push(["avgMonSales", avgOut(vis.data, "estimated_monthly_sales_in_dollars", vis.totalValues[0][1]), "Monthly Sales"]);
        vis.avgValues.push(["avgProducts", avgOut(vis.data, "products", vis.totalValues[0][1]), "Products"]);
        vis.avgValues.push(["avgCategories", avgOut(vis.data, "num_of_categories", vis.totalValues[0][1]), "Categories"]);
        vis.avgValues.push(["avgBrands", avgOut(vis.data, "num_of_brands", vis.totalValues[0][1]), "Brands"]);
        vis.avgValues.push(["avgPublished", avgOut(vis.data, "published_posts_by_onollo", vis.totalValues[0][1]), "Published Posts"]);
        vis.avgValues.push(["avgScheduled", avgOut(vis.data, "scheduled_posts_by_onollo", vis.totalValues[0][1]), "Scheduled Posts"]);

        console.log("avgValues", vis.avgValues);

        // Max & min  
        vis.maxValues.push(["maxStoreAge", getMaxValue(vis.data, "store_age_days", vis.totalValues[0][1]), "Store Age"]);
        vis.maxValues.push(["maxMonSales", getMaxValue(vis.data, "estimated_monthly_sales_in_dollars", vis.totalValues[0][1]), "Monthly Sales"]);
        vis.maxValues.push(["maxProducts", getMaxValue(vis.data, "products", vis.totalValues[0][1]), "Products"]);
        vis.maxValues.push(["maxCategories", getMaxValue(vis.data, "num_of_categories", vis.totalValues[0][1]), "Categories"]);
        vis.maxValues.push(["maxBrands", getMaxValue(vis.data, "num_of_brands", vis.totalValues[0][1]), "Brands"]);
        vis.maxValues.push(["maxPublishings", getMaxValue(vis.data, "published_posts_by_onollo", vis.totalValues[0][1]), "Published Posts"]);
        vis.maxValues.push(["maxBrands", getMaxValue(vis.data, "scheduled_posts_by_onollo", vis.totalValues[0][1]), "Scheduled posts"]);


        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};

        // vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        vis.width = 1900;
        vis.height = 1200;

        vis.segmentsValues.sort(function(a, b) {
            return b[1] - a[1];
        });

        createCards(vis.data, "total_metrics", vis.totalValues, "#F15B2D");
        createCards(vis.data, "eCom_metrics", vis.ecomValues, "#4838BF");
        createCards(vis.data, "max_metrics", vis.maxValues, "#FCB331");
        createCards(vis.data, "avg_metrics", vis.avgValues, "#2DAA5A");
        // createCards("segments", vis.segmentsValues, "orange");
        
        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
    }
}

function sumUp(data, key) {

    let sum = data.reduce((k0, k) => k0 + k[key], 0);
    return sum
}

function avgOut(data, key, total) {

    let sum = sumUp(data, key);
    return Math.floor(sum / total)
}

function getMaxValue(data, key) {
    let max_value = 0
    for (let i = 0; i < data.length; i++) {
        if (data[i][key] > max_value) {
            max_value = data[i][key]
        } 
    }
    return max_value;
}

// count platforms entries 
function countPlatforms(data, key) {

    var platforms = {
        "shopify": 0,
        "bigcommerce": 0,
        "woocommerce": 0,
        "magento": 0,
    }

    for (let r in data) {
        if (data[r][key] == "Shopify") {
            platforms["shopify"]++;
        } else if (data[r][key] == "BigCommerce") {
            platforms["bigcommerce"]++;
        } else if (data[r][key] == "WooCommerce") {
            platforms["woocommerce"]++;
        } else if (data[r][key] == "Magento") {
            platforms["magento"]++;
        }
    }

    return platforms;
}

function countUnique(data, key) {
    
    let result = []

    const arrayUniqueByKey = [...new Map(data.map(item =>
        [item[key], item])).values()]; 

    arrayUniqueByKey.forEach(d=>{
        result.push(d[key]);
    });

    return result;
}

  
function countAndPrepareValues(data, key, id_name) {
    
    let res = []

    let uniques = countUnique(data, key);

    var items = {}

    for (let u = 0; u < uniques.length; u++) {
        items[uniques[u]] = 0;
    }

    for (let i in uniques) {

        for (let j in data) {
            if (data[j][key] == uniques[i]) {   
                items[uniques[i]] += 1;
            }
        }
        res.push([id_name+"_"+i, items[uniques[i]], uniques[i]]);
    }
    return res;
}

function createCards(data, parentElId, valuesArr, color) {

    let vis = this;
    // vis.width = document.getElementById(parentElId).getBoundingClientRect().width;

    vis.width = 660;

    if (parentElId == "segments") {
        vis.width = 1290;
    }
    
    var parent = d3.select("#"+parentElId);

    var cardDeck = parent.append("div")
                            .attr("class", "card-columns m-5");

    let numOfCards = vis.width / (CARDSIZE_SIZE[0] + CARDS_MARGIN_H);
    
    for (let i = 0; i < valuesArr.length; i++) {

        if (i % numOfCards == 0) {
            var row = cardDeck.append("div").attr("class", "row");
        } 

        var cardDiv = row.append("div")
                            .attr("class", "card col-" + Math.floor(12 / numOfCards) + " border m-3 p-0 justify-center")
                            .attr("style", "justify-content: center;")

        var headerDiv = cardDiv.append("div")
                                .attr("class", "card-header")
                                .attr("style", "background-color: " + color + ";"
                                               + "color: white;");

        headerDiv.append("i")
                    .attr("class", "fab fa-shopify")

        headerDiv.text(valuesArr[i][2])
        
        let cardBody = cardDiv.append("div")
                                .attr("class", "card-body text-dark")

        var numValue = cardBody.append("h3")
                                .attr("class", "card-title numValue")

        if (valuesArr[i][0] == "avgMonSales" || valuesArr[i][0] == "maxMonSales" ) {

            numValue.text("$" + Math.floor(valuesArr[i][1]).toLocaleString());

        } else if (valuesArr[i][0] == "avgStoreAge" || valuesArr[i][0] == "maxStoreAge") {
            let years = Math.floor(valuesArr[i][1] / 365 )
            let month = Math.floor(valuesArr[i][1] % 365 / 30)

            function year_years(years) {
                if (years > 1) {return " years, "} 
                    else {return " year, "}}

            // function year_years() 
            numValue.text(years)
                    .append("span")
                    .attr("class", "y_m")
                    .text(year_years(years))
                    
            numValue.append("text")
                    .text(month)
                    .append("span")
                    .attr("class", "y_m")
                    .text(" months")

        } else {
            numValue.text(Math.floor(valuesArr[i][1]).toLocaleString())
        }
    }
}