
const apiai = require("apiai");
const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const axios = require('axios');
var app = express();
app.set("port", process.env.PORT || 5000);

//serve static files in the public directory
app.use(express.static("public"));

// Process application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.listen(app.get("port"), function () {
  console.log("Magic Started on port", app.get("port"));
});
// Pro
/*var nombre;
var csvDat=[];
var rutt="0";

function leerrut(string){   
var rut = string;
var rut2="hola";
var c=0;
var csvData=[];
var fs = require('fs'); 
var parse = require('csv-parse');
var nombre;
var apellido;

fs.createReadStream('texto.csv')
    .pipe(parse({delimiter: ','}))
    .on('data', function(csvrow) {
        //console.log(csvrow);
        //do something with csvrow
        csvData.push(csvrow);  

    })



    .on('end',function() {
      //do something wiht csvData
    

      
      //console.log(csvData[1][1]);
      
    });

return Seconds
10var a= leerrut("17859655-1");

console.log(a)
*/

function randomIntInc(low, high) {
  return Math.floor(Math.random() * (high - low + 1) + low)
}

function hora()
{

var horaactual= new Date();
var horaprogramada = new Date();
horaprogramada.setHours(11);
horaprogramada.setMinutes(04);
horaprogramada.setSeconds(50);
var a =horaprogramada.getTime()-horaactual.getTime();
return a;
}
function hola()
{

console.log("HOOOOOOOOOOOOOOLAAAAAAAAAAA")

return "hola"

}




setTimeout(function(){
    hola("asd");
}, hora());


var url = "http://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha=02022014&ticket=23FB31DD-9988-406C-AB70-4E24D490131D"
//var url = "http://appswlsdesa.entel.cl/Ordering/OrderingCli/T/consultarEstadoDeliveryService/consultarEstadoDeliveryWS?WSDL"
var http= require('http');
/*function recorrejson (json)
{

var a = Object.keys(json.Listado).length
var b=json;
console.log(b.Listado[1])
var c,d,e,f;
for(var i =0; i<a;i++){

c=b.Listado[i].CodigoEstado;



console.log(c)
}*/




//}

http.get(url,            
     (res) => {

        var body = '';
        res.on('data', (d) => {
            body+=d;
        });
        res.on('end', () => {
            var result = JSON.parse(body);
            console.log(result)
            
           
            //recorrejson(result);
        });
    }).on('error', (e) => {
        console.log("Error: "+ e.message);
    })

    


