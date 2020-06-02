let request = require("request");
let url = "https://www.worldometers.info/coronavirus/#countries";
let cheerio = require("cheerio");
let fs = require("fs");
let covidtable = [];
let findc = process.argv[2];

console.log("sending request");

request(url, function (err, response, data) {

    console.log("data recieved");

    if (err == null && response.statusCode === 200) {
        fs.writeFileSync("data.html", data);
        parseHtml(data);
    } else if (response.statusCode === 400) {
        console.log("page not found");
    } else {
        console.log(err);
        console.log(response.statusCode);
    }
})

console.log("doing other work");

function parseHtml(data) {
    let $ = cheerio.load(data);

    let everythingArr = $("#main_table_countries_today tbody tr");
    console.log(everythingArr.length);
    let countries = [];
    let i = 0;
    while (i < everythingArr.length) {
        if (($(everythingArr[i]).hasClass("row_continent")) || ($(everythingArr[i]).hasClass("total_row_world"))) {
            i++;
        }
        else {
            countries.push($(everythingArr[i]));
            i++;
        }
    }
    console.log(countries.length);
    let cnames = [];
    let tcases = [];
    let acases = [];
    let rcases = [];
    let dcases = [];
    for (let i = 0; i < countries.length; i++) {
        cnames.push($($(countries[i]).find("td")[1]).text());
        tcases.push($($(countries[i]).find("td")[2]).text());
        dcases.push($($(countries[i]).find("td")[4]).text());
        rcases.push($($(countries[i]).find("td")[6]).text());
        acases.push($($(countries[i]).find("td")[8]).text());
        createtable(cnames[i], tcases[i], dcases[i], rcases[i], acases[i]);
    }
    // console.log(cnames.length);
    // console.log(tcases.length);
    //console.table(covidtable);

    // console.log(cnames[10])

    for (let i = 0; i < countries.length; i++) {
        if (cnames[i] == findc) {
            console.table(covidtable[i]);
        }
    }

    function createtable(cname, tcase, dcase, rcase, acase) {
        let pobj = {
            Country: cname,
            Total_Cases: tcase,
            Active_Cases: acase,
            Total_Recovered: rcase,
            Total_Deaths: dcase
        };
        covidtable.push(pobj);
    }
}