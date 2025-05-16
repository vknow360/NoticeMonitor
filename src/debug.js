fetch("https://exp.sunnythedeveloper.in/scrapper.php")
    .then((response) => response.json())
    .then((json) => {
        console.log("Full HTML:", json.data);
        // Also log the specific section we're trying to scrape
        const cheerio = require("cheerio");
        const $ = cheerio.load(json.data);
        console.log("\nTable rows found:", $(".w_content table tr").length);
    })
    .catch((error) => console.error("Error:", error));
