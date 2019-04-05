const http = require('http');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const appID='';
const password='';
const tenant = '';
const subscriptionID = '';
const resourceGroup = '';

const app = express();


var manageVm = function(action, vmName, callback) {

  var request = require('request');

  request({
    url: `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    method: 'POST',
    form: {

      'client_id' : appID,
      'scope' : 'https://graph.microsoft.com/.default',
      'client_secret' : password,
      'grant_type': 'client_credentials'

    }
  }, function(err, res) {
    var json = JSON.parse(res.body);
    console.log("Access Token:", json.access_token);
    var token = json.access_token;
    var token_type = json.token_type; //always be bearer
    const httpTransport = require('https');
  const responseEncoding = 'utf8';
  const httpOptions = {
      hostname: 'management.azure.com',
      path: `/subscriptions/${subscriptionID}/${resourceGroup}/free/providers/Microsoft.Compute/virtualMachines/${vmName}/${action}?api-version=2018-06-01`,
      method: 'POST',
      headers: {"Authorization":`${token_type} ${token}`}
  };

  const request = httpTransport.request(httpOptions, (res) => {
      let responseBufs = [];
      let responseStr = '';
      
      res.on('data', (chunk) => {
          if (Buffer.isBuffer(chunk)) {
              responseBufs.push(chunk);
          }
          else {
              responseStr = responseStr + chunk;            
          }
      }).on('end', () => {
          responseStr = responseBufs.length > 0 ? 
              Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
          
          callback(null, res.statusCode, res.headers, responseStr);
      });
      
  })
  .setTimeout(10000)
  .on('error', (error) => {
      callback(error);
  });
  request.end();
  });
}


app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
  const twiml = new MessagingResponse();
  var message = req.body.Body.toString().split(" ");;
  var command = message[0].toUpperCase();
  var server = message[1];
  
  switch(command) {
    case 'HELPME':{
      twiml.message(`available commands: start/restart/stop/reimage/deallocate [server name]`); 
      break;
  }
    case 'START':{
      twiml.message(`Starting ${server}`);
      manageVm("start", server, (error, statusCode, headers, response) => {
        switch (statusCode){
          case 404:{
            twiml.message(`Error: ${server} does not exist!`);
            break;
          }
          case 202:{
            twiml.message(`${server} started. Text ip ${server} to see ip address.`);
            break;
          }
          case 401:{
            twiml.message('Authorization failure.');
            break;
          }
          default:{
            console.log(`Error: code ${statusCode}: ${error}`);
            twiml.message('Something Happened');
            break;
          } 
        }
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());    
      });
      break;
    }
    case 'RESTART':{
      twiml.message(`Restarting ${server}...`);
      manageVm("restart", server, (error, statusCode, headers, response) => {
        switch (statusCode){
          case 404:{
            twiml.message(`Error: ${server} does not exist!`);
            break;
          }
          case 202:{
            twiml.message(`${server} has been restarted.`);
            break;
          }
          case 401:{
            twiml.message('Authorization failure.');
            break;
          }
          default:{
            console.log(`Error: code ${statusCode}: ${error}`);
            twiml.message('Something Happened');
            break;
          } 
        }
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
      });
        break;
    }
    case 'STOP':{
      twiml.message(`Stopping ${server}...`);
      manageVm("powerOff", server, (error, statusCode, headers, response) => {
        switch (statusCode){
          case 404:{
            twiml.message(`Error: ${server} does not exist!`);
            break;
          }
          case 202:{
            twiml.message(`${server} has been shut down. But you're still being billed for resources not released. Text deallocate [vmname] to release the resources.`);
            break;
          }
          case 401:{
            twiml.message('Authorization failure.');
            break;
          }
          default:{
            console.log(`Error: code ${statusCode}: ${error}`);
            twiml.message('Something Happened');
            break;
          } 
        }
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
      });
        break;
    }
    case 'REIMAGE':{
    twiml.message(`Reimaging ${server}...`);
    manageVm("reimage", server, (error, statusCode, headers, response) => {
      switch (statusCode){
        case 404:{
          twiml.message(`Error: ${server} does not exist!`);
          break;
        }
        case 202:{
          twiml.message(`${server} has been reimaged back to its initial state.`);
          break;
        }
        case 401:{
          twiml.message('Authorization failure.');
          break;
        }
        default:{
          console.log(`Error: code ${statusCode}: ${error}`);
          twiml.message('Something Happened');
          break;
        } 
      }
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    });
      break;
  }
    case 'DEALLOCATE':{
      twiml.message(`Deallocating ${server}...`);
      manageVm("deallocate", server, (error, statusCode, headers, response) => {
        switch (statusCode){
          case 404:{
            twiml.message(`Error: ${server} does not exist!`);
            break;
          }
          case 202:{
            twiml.message(`${server} has been deallocated. You are not billed for the compute resources that has been released.`);
            break;
          }
          case 401:{
            twiml.message('Authorization failure.');
            break;
          }
          default:{
            console.log(`Error: code ${statusCode}: ${error}`);
            twiml.message('Something Happened');
            break;
          } 
        }
        res.writeHead(200, { 'Content-Type': 'text/xml' });
        res.end(twiml.toString());
      });
        break;
    }
    case 'DELETE':
      twiml.message('I cannot do this for you because it is too dangerous.');
      break;
    default:
      twiml.message(`Invalid command`);
  }

});

http.createServer(app).listen(1337, () => {
  console.log('Express server listening on port 1337');
});
