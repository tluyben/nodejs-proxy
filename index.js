import express from 'express';
import fs from 'fs'; // add the fs module for reading the config file
import url from 'url'; // add the url module for parsing URLs
import dotenv from 'dotenv'; // add the dotenv module for reading environment variables

import got from 'got'

// load the values of the environment variables from the .env file
dotenv.config();

let config = undefined

// if there is an -f as first argument, read the config file from the path specified by the second argument
if (process.argv[2] === '-f') {
  // read the config file
  config = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  console.log(`Reading configuration forwarding file ${process.argv[3]}`);
} else {
  // read the forwarding.json file
  config = JSON.parse(fs.readFileSync('forwarding.json', 'utf8'));
  console.log(`Reading configuration forwarding file ./forwarding.json`);
}

// create an express app
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// set up a route that accepts any method and any path
app.all('*', async (req, res) => {
  // get the original request method, path, and body
  const method = req.method;
  const path = req.path;
  const body = req.body;

  //console.log(req)

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

  //console.log(config.urls, 'urlObj', urlObj, 'mapping', mapping, 'urlMapping', urlMapping)

  // here we cut out the path if the 'if' path is longer than then 'then' path 
  let endPath = mapping ? mapping.then + (mapping.then.indexOf('/', 10) >= 0 ? '' : '/') + urlObj.path.substring(urlMapping.path.length) : urlMapping.path

  const splitPath = urlObj.path.substring(1).split('/')

  for (let i = 0; i < urlMapping.path.substring(1).split('/').length; i++) {
    endPath = endPath.replace(`/${splitPath[i]}`, '')
  }

  // construct the options object for the request module
  const options = {
    url: endPath, // the URL to forward the request to
    method, // the original request method
    headers, // the original request headers
    searchParams: query
  };

  // add the request body if the original request had one
  // fix for non-json bodies
  if (body) {
    options.json = body;
  }

  options.headers.host = urlMapping.host

  delete options['url']
  delete options['headers']['content-length']

  const data = await got(endPath, options).json();

  res.send(data)
  //console.log(data)
});


app.listen(process.env.NODE_PROXY_PORT ?? 3002, () => {
  console.log(`Server listening on port ${process.env.NODE_PROXY_PORT ?? 3002}`);
});

