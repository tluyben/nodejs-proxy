const express = require('express');
const request = require('request');
const fs = require('fs'); // add the fs module for reading the config file
const url = require('url'); // add the url module for parsing URLs
const dotenv = require('dotenv'); // add the dotenv module for reading environment variables

// load the values of the environment variables from the .env file
dotenv.config();

let config = undefined

// if there is an -f as first argument, read the config file from the path specified by the second argument
if (process.argv[2] === '-f') {
  // read the config file
  config = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
} else {
  // read the forwarding.json file
  config = JSON.parse(fs.readFileSync('forwarding.json', 'utf8'));
}


// create an express app
const app = express();

// set up a route that accepts any method and any path
app.all('*', (req, res) => {
  // get the original request method, path, and body
  const method = req.method;
  const path = req.path;
  const body = req.body;

  // get the query string parameters
  const query = req.query;

  // get the original request headers
  const headers = req.headers;

  // get the original request URL and parse it
  const urlObj = url.parse(req.protocol + '://' + req.get('host') + req.originalUrl);

  // find a matching URL mapping in the config
  const mapping = config.urls.find(m => urlObj.href.startsWith(m.if));

  if (!mapping) {
    // no matching URL mapping found
    res.status(404).send('Not Found');
    return;
  }

  // deconstruct the mapping 
  const urlMapping = url.parse(mapping.then);

  // construct the options object for the request module
  const options = {
    url: mapping ? mapping.then + (mapping.then.indexOf('/', 10) >= 0 ? '' : '/') + urlObj.path.substring(urlMapping.path.length) : urlObj.href, // the URL to forward the request to
    method, // the original request method
    headers, // the original request headers
    qs: query, // the query string parameters
    json: true, // set the content type to JSON
  };

  // add the request body if the original request had one
  if (body) {
    options.body = body;
  }


  // make the request to the other host
  request(options, (error, response, body) => {
    if (error) {
      // handle the error
      res.status(500).send({ error });
    } else {
      // send the response from the other host back to the original requester
      res.send(body);
    }
  });
});


app.listen(process.env.NODE_PROXY_PORT ?? 3002, () => {
  console.log(`Server listening on port ${process.env.NODE_PROXY_PORT ?? 3002}`);
});

