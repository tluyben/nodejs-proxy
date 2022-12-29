# Simple NodeJS proxy 

## installation

- install node 17+, npm/yarn
- run yarn

- yarn start
  - for production 

- yarn dev 
  - for development

- yarn dev -- -f ./forwardingfile.json 
  - for passing in the forwarding file 

- yarn start -- -f ./forwardingfile.json 
  - for passing in the forwarding file 




## how to use

- curl http://localhost:3002/api/sqlite/tables
- curl "http://localhost:3002/api/sqlite/query?q=select+Title+from+albums"
- curl "http://localhost:3002/api/send?message=please+can+you+write+a+sorting+algorithm+in+c"



# License

MIT

Disclaimer: for localhost experimentation only, we accept no liability.

Support my open source work by <a href="https://twitter.com/luyben">following me on twitter <img src="https://storage.googleapis.com/saasify-assets/twitter-logo.svg" alt="twitter" height="24px" align="center"></a>
