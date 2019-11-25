// import request from 'request'
// import Xray from 'x-ray'
// import cheerio from "cheerio"
// var xray_ready = Xray();
import hubInitializer from './hubs'
import prepareFakeWindow from './workerFakeDOM'
import prepareJQuery from './jquery-3.3.1'
// import signalR from './jquery.signalR-2.4.0'
// importScripts("workerFakeDOM.js");
// importScripts('jquery-3.3.1');
const htmlparser2 = require("htmlparser2");



function extract_status(original_string){
    console.log("Extracting Status from " + original_string + "..");
    var new_string = "";
    var regular_expresion = /Retiro(\w)*Jos/i;      //Obtain status for José León Suárez-Retiro. It does repeats endlesly "José León Suárez-Retiro<status>José León Suárez-Retiro"
    var first_word = "Retiro";
    var second_word = "Jos";
    new_string = original_string.match(regular_expresion)[0];   //Obtain first ocurrence
    new_string = new_string.slice(first_word.length  , new_string.search(second_word) );    //Slicing innecesary text
    console.log("Status: " + JSON.stringify(new_string));

    return new_string;
}

function is_normal(an_status){
    if( an_status=='Normal' ){
        return true;
    }
    return false;
}

//Highlights Lines with unexpected status
function status_message(an_status){
    if( is_normal(an_status) ){
        return an_status;
    }

    return '<big style="background-color:#ff5e5e;">&nbsp;&nbsp;' + an_status + '&nbsp;&nbsp;</big>';
}

function hasChanges(data){
    //False ONLY if all lines are normal
    if( is_normal(data.status_line_a) &&
        is_normal(data.status_line_b) && 
        is_normal(data.status_line_c) && 
        is_normal(data.status_line_d) && 
        is_normal(data.status_line_e) && 
        is_normal(data.status_line_h) && 
        is_normal(data.status_urquiza) &&
        is_normal(data.status_mitre) ){
        return false;
    }

    //ONLY True if some lines is not normal
    return true;
}

function sendToMaker(makerKey,eventName,data){
    var url_string = 'https://maker.ifttt.com/trigger/' + eventName + '/with/key/' + makerKey;
    console.log("URL " + url_string);
    if( hasChanges(data) ){
    //if( true ){
    var html = '<table style="width:100%; background-color:#b2b2b2; font-size: 180%"> <tr style="width:100%; background-color:#b2b2b2;"><td><center><b><big>ESTADO TRANSPORTE</big></b</center></td> </tr> </table> <table style="width:100%; background-color:#b2b2b2; font-size: 140%"> <tr style="width:50%"> <td><center><b><big>Linea</big></b></center></td> <td><center><b><big>Estado</big></b></center></td> </tr> <tr style="width:50%"><td><center><b><big style="background-color:#ff6b6b;">&nbsp;&nbsp;Linea B&nbsp;&nbsp;</big></b></center></td><td><center><b><big>' + status_message(data.status_line_b) + '</big></b></center></td> </tr><tr style="width:50%"><td><center><b><big style="background-color:#4a82f9;">&nbsp;&nbsp;Linea C&nbsp;&nbsp;</big></b></center></td><td><center><b><big>' + status_message(data.status_line_c) + '</big></b></center></td> </tr><tr style="width:50%"><td><center><b><big style="background-color:#13ad53;">&nbsp;&nbsp;Linea D&nbsp;&nbsp;</big></b></center></td><td><center><b><big>' + status_message(data.status_line_d) + '</big></b></center></td> </tr><tr style="width:50%"><td><center><b><big style="background-color:#6acbff;">&nbsp;&nbsp;Linea A&nbsp;&nbsp;</big></b></center></td><td><center><b><big>' + status_message(data.status_line_a) + '</big></b></center></td> </tr><tr style="width:50%"><td><center><b><big style="background-color:#ab5eff;">&nbsp;&nbsp;Linea E&nbsp;&nbsp;</big></b></center></td><td><center><b><big>' + status_message(data.status_line_e) + '</big></b></center></td> </tr><tr style="width:50%"><td><center><b><big style="background-color:#ffee5e;">&nbsp;&nbsp;Linea H&nbsp;&nbsp;</big></b></center></td><td><center><b><big>' + status_message(data.status_line_h) + '</big></b></center></td> </tr><tr style="width:50%"><td><center><b><big style="background-color:#ff993a;">&nbsp;Tren Urq&nbsp;</big></b></center></td><td><center><b><big>' + status_message(data.status_urquiza) + '</big></b></center></td> </tr><tr style="width:50%"><td><center><b><big style="background-color:#eff5ff;">&nbsp;Tren Mitre&nbsp;</big></b></center></td><td><center><b><big>' + status_message(data.status_mitre) + '</big></b></center></td> </tr></table>';
    var d = new Date();
    var actual_date = d.getDate().toString() + "/" + (d.getMonth()+1).toString();
    console.log("actual date " + actual_date);

    // request.post({
    //     url: url_string,
    //     form:    { 
    //     'value1' : html,
    //     'value2' : actual_date,
    //     'value3' : ""}
    //     }, function(error, response, body) {
    //     console.log('Body response was ', body);
    //     console.log('Error was ', error);
    //     });
        
    console.log("Send");
    }
}


function myParser(res) {
    // write the header and set the response type as a json
    console.log("Response Begin");
    res.writeHead(200, { 'Content-Type': 'application/json' });
    //writeJSON(res);

    /*
    console.log("Xray Begin");
    xray_ready('http://www.metrovias.com.ar/', {data: xray_ready(
        '#linesStateSection', [{
            status_line_a: '#status-line-A',
            status_line_b: '#status-line-B',
            status_line_c: '#status-line-C',
            status_line_d: '#status-line-D',
            status_line_e: '#status-line-E',
            status_line_h: '#status-line-H',
            status_urquiza: '#status-line-U'
            }]
        )
    })(function(err, data) {
    console.log("Xray End")


    if(err){
        console.log("Xray Error! " + JSON.stringify(err))
        res.write( JSON.stringify(err));
    }
    else{
        console.log("Inner Xray Begin");
        xray_ready('http://servicios.lanacion.com.ar/transito', {extra_data: xray_ready(
        '.trenes #ramales', [{
            raw_line: ' .linea3'
            }]
        )
        })(function(err, extra_data) {
        console.log("Inner Xray End")
        
        // if(err){
        // console.log("Inner Xray Error! " + JSON.stringify(err))
        // res.write( JSON.stringify(err));
        // }
        // else{
            console.log("Data " + JSON.stringify( data ))
            //console.log("Extra Data " + JSON.stringify( extra_data ))
        
        console.log("Writing Response")
        var realData = data.data[0];
        //realData.status_mitre = extract_status(extra_data.extra_data[0].raw_line);
        console.log("Real Data " + JSON.stringify( realData ))
        
        console.log("Sending event to Maker...")
        var leo_token = "bEJDjvRQ04PPYZVlKAP2E8";
        var event_name = "estado_transito";
        sendToMaker(leo_token,event_name, realData);
        console.log("Event send!")
        res.write( JSON.stringify( realData ));
        console.log("Response Writed");
        //}
        res.end();
        console.log("Response End")
        });
    }});
    */
}

//Handle Main Request
export default async function handleRequest(mainRequest) {
    prepareFakeWindow(self);
    prepareJQuery();
    // console.log("**** window document:", window.document);
    // console.log("**** JQuery version:", $.fn.jquery);
    // console.log("htmlparser2: ", htmlparser2);
    // const parser = new htmlparser2.Parser(
    //     {
    //         onopentag(name, attribs) {
    //             if (name === "script" && attribs.type === "text/javascript") {
    //                 console.log("JS! Hooray!");
    //             }
    //         },
    //         ontext(text) {
    //             console.log("-->", text);
    //         },
    //         onclosetag(tagname) {
    //             if (tagname === "script") {
    //                 console.log("That's it?!");
    //             }
    //         }
    //     },
    //     { decodeEntities: true }
    // );
    // parser.write(
    //     "Xyz <script type='text/javascript'>var foo = '<<bar>>';</ script>"
    // );
    // parser.end();

    //! TODO el problema es que se llena desde el Javascript con una libreria de jqueri SignalR o algo asi, habria que entender como funciona que hace una coneccion a singalR de metrovias y usar los datos que devuelvan directamente 
    /*
        Hay que incluir jquery, signalR y las librerias asociadas, tengo descargadas una copia pero no se si podemos usarlas asi nomas. 
        Porque necesitamos que se pongan en nombre jQuery, no se si $ va a permitirme el cloudflare worker
        Hay que probar incluir asi nomas las libreiras con import o require a ver que pasa
        Al finalizar hay que parsear el html para obtener lo que quiero para llenarlo en un array o simil para poder procesarlo con las otras funciones
    */
   hubInitializer(jQuery);
   var hub = jQuery.connection.moveShape;
   hub.client.estadoLineas = function (html) {
       console.log("HTML: ", html);

   };
   jQuery.connection.hub.start().done(function () {

   });
   jQuery.connection.hub.disconnected(function () {
       setTimeout(function () {
           jQuery.connection.hub.start();
       }, 5000);
   });      

    // await fetch('https://www.metrovias.com.ar/estadolineas/desktop.html')
    // .then((res) => {
    //     console.log("There is response!");
    //     return res.text();
    // })
    // .then((data) => {
    //     console.log("Data: ", data);
    //     // $('#container').html(data);
    // });

    return new Response('Hello worker!', {
        headers: { 'content-type': 'text/plain' },
    });
}