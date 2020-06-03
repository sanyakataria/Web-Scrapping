let puppeteer = require("puppeteer");
let fs = require("fs");

let url = "https://www.worldometers.info/coronavirus/#countries";
let covidtable = [];
let findc = process.argv[2];

(async function () {
    let browser = await puppeteer.launch({
        // headless: false,
        defaultViewport: null,
    });
    console.log("work started");
    let nOfP = await browser.pages();
    let page = nOfP[0];

    await page.goto(url, {
        waitUntil: "networkidle2",
    });

    await page.waitForSelector("#main_table_countries_today tbody tr");
    let everythingArr = await page.$$("#main_table_countries_today tbody tr");
    console.log(everythingArr.length);
    let countries = [];

    for (let i = 0; i < everythingArr.length; i++) {

        // this also do the same this as done below, so we have two methods.
        // 1.

        // let classname = await (everythingArr[i]).getProperty('className');
        // let c = await classname.jsonValue();
        // let nc = c.split(" ");
        // // console.log(nc[0]);
        // if(nc[0] == "total_row_world" || nc[0] == "row_continent")
        // {
        //     continue;
        // }
        // else{
        //     countries.push(everythingArr[i]);
        // }

        //2.

        let className = await page.evaluate(function (elem) {
            return elem.getAttribute("class");
        }, everythingArr[i]);
        let nc = className.split(" ");
        if (nc[0] == "total_row_world" || nc[0] == "row_continent") {
            continue;
        }
        else {
            countries.push(everythingArr[i]);
        }

    }
    console.log(countries.length)

    let cnames = [];
    let tcases = [];
    let acases = [];
    let rcases = [];
    let dcases = [];

    for (let i = 0; i < countries.length; i++) {
        // 1. 
        // evaluate returns only the names of the element so i havent returned directly at line 72.
        // taken that in ans and then picked out the text from that as ans is the array of all tds,
        // textcontent works on element by element and also it only works within evaluate function

        let data = await page.evaluate(function (elem) {
            let ans = elem.querySelectorAll("td");
            let text = []
            for (let i = 0; i < ans.length; i++) {
                let a = ans[i].textContent;
                text.push(a);
            }
            return text;
        }, countries[i]);

        cnames.push(data[1]);
        tcases.push(data[2]);
        dcases.push(data[4]);
        rcases.push(data[6]);
        acases.push(data[8]);

        createtable(cnames[i], tcases[i], dcases[i], rcases[i], acases[i]);

        //2. in this method , i have first converted all the extracted text from  the row in country array and then splitted it and used its element to create table.
        
        //  let data = await page.evaluate(function (element) {
        //     return element.textContent;
        // }, countries[0])
        //     console.log(typeof(data));
        //     data = data.split("\n");
        //     cnames.push(data[2]);
        //     tcases.push(data[3]);
        //     dcases.push(data[5]);
        //     rcases.push(data[7]);
        //     acases.push(data[9]);

        //     createtable(cnames[0], tcases[0], dcases[0], rcases[0], acases[0]);
        //     console.table(covidtable);
    }
    console.table(covidtable);

    for (let i = 0; i < countries.length; i++) {
        if (cnames[i] == findc) {
            console.table(covidtable[i]);
        }
    }

})();

async function createtable(cname, tcase, dcase, rcase, acase) {
    let pobj = {
        Country: cname,
        Total_Cases: tcase,
        Active_Cases: acase,
        Total_Recovered: rcase,
        Total_Deaths: dcase
    };
    await covidtable.push(pobj);
}