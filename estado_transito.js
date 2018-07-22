
var Xray = require('x-ray');
var xray_ready = Xray();
var request = require('request');
var cheerio = require("cheerio");
var value_change = "0,13";
var date_change = 0;   //Sunday is 0, Monday is 1, and so on
var date_limit = 15;

function extract_number(text){
    return text.replace("-","").replace("%",""); 
}

function hasMinus(text){
    return (text.indexOf("-")>-1)
}

function hasChanges(data){
  var new_date = new Date();
  var actual_date = new_date.getDay();
  
  //Only let pass if Month Day is between 0 and date_limit
  if( new_date.getUTCDate() > date_limit ){
    return false;
  }
  
  
  //If exists a big difference or today is the change date
  if( (extract_number(data[0].difference)>=value_change) || (extract_number(data[1].difference)>=value_change) || actual_date==date_change ){
    return true;
  }
  
  return false;
}

function isUp(difference){
  return (extract_number(difference)>=value_change && !hasMinus(difference) )
  
}

function isDown(difference){
  return (extract_number(difference)>=value_change && hasMinus(difference) )
  
}

function make_message(data){
  if( isUp(data[0].difference) ){
    return "!! Dolar Oficial Subiendo " + data[0].difference + " esta " + data[0].buy_price
  }
  if( isDown(data[0].difference) ){
    return "!! Dolar Oficial Bajando " + data[0].difference + " esta " + data[0].buy_price
  }
  if( isUp(data[1].difference) ){
    return "!! Dolar Informal Subiendo " + data[1].difference + " esta " + data[0].buy_price
  }
  if( isDown(data[1].difference) ){
    return "!! Dolar Informal Bajando " + data[1].difference + " esta " + data[0].buy_price
  }
  
  return "Dolar Comp Informal " + data[1].buy_price
}

function sendToMaker(makerKey,eventName,data){
  var url_string = 'https://maker.ifttt.com/trigger/' + eventName + '/with/key/' + makerKey;
  console.log("URL " + url_string);
  if( hasChanges(data) ){
  //if( true ){
  var html = '<table style="width:100%; background-color:powderblue; font-size: 180%"> <tr style="width:100%; background-color:powderblue;"> <td><center><b><big>PRECIO DOLAR</big></b</center></td> </tr> </table> <table style="width:100%; background-color:powderblue; font-size: 140%"> <tr style="width:50%"> <td><center><b><big>' + data[0].title + '</big></b></center></td> <td><center><b><big>' + data[1].title + '</big></b></center></td> </tr> <tr style="width:50%"> <td><center><b><big>' + data[0].difference + '</big></b></center></td> <td><center><b><big>' + data[1].difference + '</big></b></center></td> </tr><tr style="width:50%"> <td><center><b><big>' + data[0].buy_price + '</big></b></center></td> <td><center><b><big>' + data[1].buy_price + '</big></b></center></td> </tr> </table>';
  var message = make_message(data);
  var d = new Date();
  var actual_date = d.getDate().toString() + "/" + (d.getMonth()+1).toString();
  console.log("actual date " + actual_date);
  
  request.post({
      url: url_string,
      form:    { 
    'value1' : html,
    'value2' : message,
    'value3' : actual_date}
    }, function(error, response, body) {
      console.log('Body response was ', body);
      console.log('Error was ', error);
    });
    
  console.log("Send");
  }
}

module.exports = 
  function (ctx, req, res) {
    // write the header and set the response type as a json
    console.log("Response Begin");
    res.writeHead(200, { 'Content-Type': 'application/json' });
    //writeJSON(res);
    console.log("Xray Begin");
    xray_ready('http://www.ambito.com/economia/mercados/monedas/dolar/', {data: xray_ready(
      '.container-fluid div section div div', [{
        title: 'div div h2 a b',
        difference: 'div div div .variacion big',
        buy_price: 'div div div .cierreAnterior big'
        }]
      )
    })(function(err, data) {
    console.log("Xray End")
    
    
    if(err){
      console.log("Xray Error! " + JSON.stringify(err))
      res.write( JSON.stringify(err));
    }
    else{
      console.log("Writing Response")
      var realData = [
          data.data[1],
          data.data[2]
        ];
       console.log("Real Data " + JSON.stringify( realData ))
      
      console.log("Sending event to Maker...")
      var leo_token = "BSBTCmAfGhaWR30dBE3oP";
      var event_name = "dolar_changed";
      sendToMaker(leo_token,event_name,realData);
      console.log("Event send!")
      res.write( JSON.stringify( realData ));
    }
    
    res.end();
    console.log("Response End")
    })
    
    
  }
