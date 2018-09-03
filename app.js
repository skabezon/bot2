
//app.js
const express = require('express');
const bodyParser = require('body-parser');
const Product = require('./models/product.model');
const Clientes =require('./models/product.model');
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
var holaa;
let port = 1234;


// Set up mongoose connection
const mongoose = require('mongoose');
let dev_db_url = 'mongodb://someuser:abcd1234@ds233212.mlab.com:33212/productstutorial';

let mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));



function Cliente_create (string,int) {
    var a = string;
    var b = int;
    
    let Cliente = new Cliente(
        {
            name: a,
            rut: b
        }
    );

    Cliente.save(function (err) {
        if (err) {
            console.log('error')
        }
        console.log('Product Created successfully')
    })
};





function buscar (id) {
   
   Product.findById(id, function (err, product) {
        if (err) console.log(err);
        console.log(product)
        
      
        
        
    })
   
};


function buscar2 (id){

Product.findById(id).exec((err, productInfo) =>{
    if(err) {
    console.log("Error de servidor", err);
 } else {
    if(!productInfo){
    console.log("No existe el producto")
    }else {
        console.log("entra en la funcion ql")
      hola(productInfo);
    return;


}
 }
})



}

function hola(product)
{
holaa= product.name;
console.log(holaa);
aaa(holaa)
return product;
}
function aaa(asd)
{

console.log(holaa)

}


buscar2("5b86e419726baf0e0007d0d8");



app.listen(port, () => {
    console.log('Server is up and running on port numner ' + port);




});

/*
var Schema = mongoose.Schema;

var ClientesSchema = new Schema({
    a_string: String,
    a_rut: Number,
    a_nombre: String,
    a_apellido: String
});

const Clientes = mongoose.model('Clientes',ClientesSchema)

console.log(Clientes.findById('5b86d391ffaf512704f0e8af'))



product_details = function (product) {
    
    

        console.log(product.Find);
   
};

function Cliente_create (string,int,next) {
    var a = string;
    var b = int;
    var next =this._next;
    let Cliente = new Product(
        {
            name: a,
            rut: b
        }
    );

    Cliente.save(function (err) {
        if (err) {
            console.log('error')
        }
        console.log('Product Created successfully')
    })
};*/