// initialize global variables & switches
let pricingParallel,
    categoriesHist,
    brandsHist,
    productsHist,
    publishedPostsHist,
    scheduledPostsHist;

// load data using promises
let promises = [
    d3.csv("data/pricing.csv")
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// initMainPage
function initMainPage(dataArray) {
    // console.log("dataArray", dataArray);

    // create event handler
    let eventHandler = {
        bind: (eventName, handler) => {
            document.body.addEventListener(eventName, handler);
        },
        trigger: (eventName, extraParameters) => {
            document.body.dispatchEvent(new CustomEvent(eventName, {
                detail: extraParameters
            }));
        }
    }

    // initialize objects
    pricingParallel = new Parallel ("#parallel", dataArray[0], {width: 1080, height: 540}, eventHandler);

    productsHist = new Histogram("#products", "Products", dataArray[0], {width: 540, height: 270},
        "", "products");
    categoriesHist = new Histogram("#categories", "Categories", dataArray[0], {width: 540, height: 270},
        "", "categories");
    brandsHist = new Histogram("#brands", "Brands", dataArray[0], {width: 540, height: 270},
        "", "brands");
    publishedPostsHist = new Histogram("#publishedPosts", "Published Posts", dataArray[0], {width: 540, height: 270},
        "", "publishedPosts");
    scheduledPostsHist = new Histogram("#scheduledPosts", "Scheduled Posts", dataArray[0], {width: 540, height: 270},
        "", "scheduledPosts");

    // bind event handler
    eventHandler.bind("selectionChanged", function(event){
        productsHist.onSelectionChange(event.detail);
        categoriesHist.onSelectionChange(event.detail);
        brandsHist.onSelectionChange(event.detail);
        publishedPostsHist.onSelectionChange(event.detail);
        scheduledPostsHist.onSelectionChange(event.detail);
    });

}
