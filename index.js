const { response } = require("express");
const express = require("express");
const cli = require("nodemon/lib/cli");
const app = express();
const port = 3000;
const axios = require("axios").default;
const { Client } = require("pg");
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "covid-db",
  password: "ZA!nab20",
  port: 5432,
});

client.connect();

app.get("/refresh_data", async (req, res) => {
  axios
    .get("https://api.covid19api.com/summary")
    .then(async (response) => {
      if (response.data) {
        const countries = response.data.Countries;
        const truncateQuery = `truncate table public.countries`;

        const truncateResponse = await client.query(
          truncateQuery,
          async (err, truncateRes) => {
            if (err) {
              console.log(error);
              return;
            }
            let countries = [];
            const insertResponse = Promise.all(
              countries.map(async (country) => {
                const insertQuery = `
              INSERT INTO public.countries(country_id,name,code,total_cases,total_deaths,total_recovered,date)
              VALUES ('${country.ID}','${country.Country.replace(/'/g, "")}','${
                  country.CountryCode
                }',${country.TotalConfirmed},${country.TotalDeaths},${
                  country.TotalRecovered
                },'${country.Date}')`;
                client.query(insertQuery, (insertErr, insertRes) => {
                  if (insertErr) {
                    console.log(error);
                  }
                  console.log(insertRes);
                  countries.push(country);
                });
              })
            );
          }
        );
        res.send(countries);
      }
    })
    .catch((error) => {
      console.log("Endpoint not found!");
    });
});
/*
Get the top 10 countries with any of the following type of cases
1. Total
2. Recovered
3. Deaths

 */
app.get("/top10", async (req, res) => {
  let field;

  const type = req.query.type;

  if (type === "Total") {
    field = "total_cases";
  } else if (type === "Recovered") {
    field = "total_recovered";
  } else if (type === "Deaths") {
    field = "total_deaths";
  }
  const query = `select name from countries
  order by ${field} desc
  limit 10`;

  client.query(query, async (err, response) => {
    console.log(
      `******************** Top 10 countries by ${type} Cases ********************`
    );
    let countries = [];
    if (err) {
      console.log(err);
      return;
    }
    if (response.rows[0]) {
      response.rows.forEach((row) => {
        console.log(row.name);
        countries.push(row.name);
      });
      res.send(countries);
    } else {
      res.send("No country found for the type");
    }
  });
});

app.get("/percentagesByCountry", async (req, res) => {
  const countryName = req.query.country;

  const query = `SELECT (total_deaths/total_cases*100) as death_percentage,(total_recovered/total_cases*100) as recovered_percentage
  FROM public.countries
  WHERE name='${countryName.replace(/'/g, "")}'`;

  client.query(query, (err, response) => {
    let recovered_percentage, death_percentage;
    if (err) {
      console.log(err);
    }
    if (response.rows[0]) {
      response.rows.forEach((row) => {
        console.log("Recovered Percentage: ", row.recovered_percentage);
        console.log("Death Percentage: ", row.death_percentage);
        recovered_percentage = row.recovered_percentage;
        death_percentage = row.death_percentage;
      });
      res.send(`
      ***************** Stats for ${countryName} *****************
      Recovered Percentage: ${recovered_percentage}
      Death Percentage: ${death_percentage}`);
    } else {
      res.send("Data for the given country does not exist.");
    }
  });
});
app.listen(port, () => {
  console.log("App is listening at port ", port);
});
