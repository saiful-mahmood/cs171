class DataPreProcessing {

    constructor(data) {
        this.data = data;
        this.wrangleData();
    }

    wrangleData() {
        this.data.forEach((k, v) => {

            // performance
            k.alexa_rank = Number(k.alexa_rank);
            k.estimated_monthly_sales_in_dollars = Number(k.estimated_monthly_sales_in_dollars);

            // usage
            k.published_posts_by_onollo = Number(k.published_posts_by_onollo);
            k.scheduled_posts_by_onollo = Number(k.scheduled_posts_by_onollo);
            
            k.joined_onollo = k.joined_onollo;
            k.last_login = k.last_login;

            // about store
            k.openned_store = new Date(k.openned_store);
            k["store_age_days"] = Math.floor((Date.now() - k.openned_store) / (1000 * 60 * 60 * 24));
            k.num_of_categories = Number(k.num_of_categories);
            k.num_of_brands = Number(k.num_of_brands);
            k.products = Number(k.products);

            k.timezone_offset = Number(k.timezone_offset);
            
        })

        return this.data
    }
}