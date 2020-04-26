
const express = require("express");
const app = express();
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require('cors')

app.use(cors());
app.get('/countries', async (req,res) => 
{
  let response;
  try {
    response = await axios.get("https://www.worldometers.info/coronavirus/");
    if (response.status !== 200) {
      console.log("Error", response.status);
    }
  } catch (err) {
    return null;
  }

  // to store parsed data
  const result = [];

  // get HTML and parse death rates
  const html = cheerio.load(response.data);
  const countriesTable = html("table#main_table_countries_today");
  const countriesTableCells = countriesTable
    .children("tbody")
    .children("tr")
    .children("td");

  // count worldometers table columns
  const colCount = html('table#main_table_countries_today th').length;
  
  const totalColumns = colCount;
  const countryColIndex = 0;
  const casesColIndex = 1;
  const todayCasesColIndex = 2;
  const deathsColIndex = 3;
  const todayDeathsColIndex = 4;
  const curedColIndex = 5;
  const activeColIndex = 6;
  const criticalColIndex = 7;
  const casesPerOneMillionColIndex = 8;
  const deathsPerOneMillionColIndex = 9;
  const totalTestsColIndex = 10;
  const testsPerOneMillionColIndex = 11;

  // minus totalColumns to skip last row, which is total
  for (let i = 0; i < countriesTableCells.length - totalColumns; i += 1) {
    const cell = countriesTableCells[i];
    
    // get country
    if (i % totalColumns === countryColIndex) {
      let country =
        cell.children[0].data ||
        cell.children[0].children[0].data ||
        // country name with link has another level
        cell.children[0].children[0].children[0].data ||
        cell.children[0].children[0].children[0].children[0].data ||
        "";
      country = country.trim();
      if (country.length === 0) {
        // parse with hyperlink
        country = cell.children[0].next.children[0] && cell.children[0].next.children[0].data || "";
      }
      result.push({ country: country.trim() || "" });
    }
    // get cases
    if (i % totalColumns === casesColIndex) {
      let cases = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].cases = parseInt(
        cases.trim().replace(/,/g, "") || "0",
        10
      );
    }
    // get today cases
    if (i % totalColumns === todayCasesColIndex) {
      let cases = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].todayCases = parseInt(
        cases.trim().replace(/,/g, "") || "0",
        10
      );
    }
    // get deaths
    if (i % totalColumns === deathsColIndex) {
      let deaths = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].deaths = parseInt(
        deaths.trim().replace(/,/g, "") || "0",
        10
      );
    }
    // get today deaths
    if (i % totalColumns === todayDeathsColIndex) {
      let deaths = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].todayDeaths = parseInt(
        deaths.trim().replace(/,/g, "") || "0",
        10
      );
    }
    // get cured
    if (i % totalColumns === curedColIndex) {
      let cured = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].recovered = parseInt(
        cured.trim().replace(/,/g, "") || 0,
        10
      );
    }
    // get active
    if (i % totalColumns === activeColIndex) {
      let cured =cell.children.length != 0? cell.children[0].data : "";
      result[result.length - 1].active = parseInt(
        cured.trim().replace(/,/g, "") || 0,
        10
      );
    }
    // get critical
    if (i % totalColumns === criticalColIndex) {
      let critical = cell.children.length != 0 ? cell.children[0].data : "";
      result[result.length - 1].critical = parseInt(
        critical.trim().replace(/,/g, "") || "0",
        10
      );
    }
    // get total cases per one million population
    if (i % totalColumns === casesPerOneMillionColIndex) {
      let casesPerOneMillion = cell.children.length != 0? cell.children[0].data : "";
      result[result.length - 1].casesPerOneMillion = parseInt(
        casesPerOneMillion.trim().replace(/,/g, "") || "0",
        10
      );
    }
    // get total deaths per one million population
    if (i % totalColumns === deathsPerOneMillionColIndex) {
      let deathsPerOneMillion = cell.children.length != 0? cell.children[0].data : "";
      result[result.length - 1].deathsPerOneMillion = parseInt(
        deathsPerOneMillion.trim().replace(/,/g, "") || "0",
        10
      );
    }
    // get total tests
    if (i % totalColumns === totalTestsColIndex) {
      let totalTests = cell.children.length != 0? cell.children[0].data : "";
      result[result.length - 1].totalTests = parseInt(
        totalTests.trim().replace(/,/g, "") || "0",
        10
      );
    }
    // get tests per one million population
    if (i % totalColumns === testsPerOneMillionColIndex) {
      let testsPerOneMillion = cell.children.length != 0? cell.children[0].data : "";
      result[result.length - 1].testsPerOneMillion = parseInt(
        testsPerOneMillion.trim().replace(/,/g, "") || "0",
        10
      );
    }
  }

  return res.json(result)
})

app.listen(process.env.PORT || 3333)
