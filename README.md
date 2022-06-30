# covid-app
RESTful API to fetch COVID stats and filter the countries on the basis of record type

Entry point of service -> index.js

Script to run the service-> npm run start

DB -> The service uses a local postgres database connection to store countries data accordingly

The service offers three type of endpoints

NOTE: The /all API of COVID open API is not working. So, using the stats API I added a basic functionality



1. GET /refresh_data
  
  Description:
  This endpoint updates the table records everytime it is hit.
  
  Query Parameters:
  None
  
2. GET /percentagesByCountry
  
  Description:
  This endpoint gets the death and recovered percentage out of total cases reported for a country
  
  Query Parameters:
  country(country name)
  
  
3. GET /top10

Description:
It gets the top 10 countries depending upon the number of cases of a specific type

Query Parameters:
type -> Total,Recovered and Deaths
