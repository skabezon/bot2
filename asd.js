
//app.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
var holaa;
let port = 1234;
contador_oc=0;

// Set up mongoose connection
const mongoose = require('mongoose');
let dev_db_url = 'mongodb://someuser:abcd1234@ds233212.mlab.com:33212/productstutorial';

let mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const Schema = mongoose.Schema;

var ProductSchema = new Schema({
    name: {type: String, required: true, max: 100},
    price: {type: Number, required: true},
});

var ClienteSchema = new Schema({
    name: {type: String, required: true, max: 100},
    rut: {type: String, required: true},
    producto: {type: String, required: true},
});

var OcSchema = new Schema({
    ocompra: {type: String, required: true},
    name: {type: String, required: true, max: 100},
    rut: {type: String, required: true},
    estado: {type: String, required: true},
    fecha: {type: String, required: true, max: 100},
});


// Export the model
var Cliente = mongoose.model('Cliente', ClienteSchema);

var Oc=mongoose.model('Oc',OcSchema);


app.listen(port, () => {
    console.log('Server is up and running on port numner ' + port);




});

function Cliente_create (string,int,ca) {
    var a = string;
    var b = int;
    var c = ca
    
    let cliente = new Cliente(
        {
            name: a,
            rut: b,
            producto:c
        }
    );

    cliente.save(function (err) {
        if (err) {
            console.log(err)
        }
        console.log('Product Created successfully')
    })
};



function buscar (id) {
   
   Cliente.findOne(id, function (err, product) {
        if (err) console.log(err);
        console.log(product)
        
      
        
        
    })

        
      
    
   
};


 function buscar2 (rutt) {
  		console.log("hola")

        Cliente.find({rut: rutt},function(err,obj){
            var a = obj[0].rut;
            
            if(a==undefined){
                console.log("hola")
            console.log(obj.rut)
            }
			
        	
        })
}


//Cliente_create("Anibal","17938201-6","note gamer")


function Oc_create (oc,name,rut,estado,fecha) {
    var a = oc;
    var b = name;
    var c = rut;
    var d = estado;
    var e = fecha;
    
    let ocom = new Oc(
        {   
            ocompra:a,
            name: b,
            rut: c,
            estado: d,
            fecha: e
        }
    );

    ocom.save(function (err) {
        if (err) {
            console.log(err)

        }
        console.log('OC CREADA')
    })
};

Oc_create("200001010","Anibal Marquez","17938201-6","En ruta","3/09/2018")
/*Oc_create("2000033926","jean paul indey","15468404-2","Ingresado","3/09/2018")
Oc_create("2000033925","yalaska farias","14497899-4","Ingresado","3/09/2018")
Oc_create("2000033920","Alejandro Mujica","10259234-4","En proceso","3/09/2018")
Oc_create("2000033919","Daniela Leiva","15321907-9","Retenido","4/09/18",)
Oc_create("2000033906","Francisca Pacheco","19063644-5","En proceso","4/09/2018")
Oc_create("2000033865","mauricio figueroa","9007421-0","Para rutear","4/09/2018")
Oc_create("2000033840","Francisco Tapia","17313426-6","Para rutear","3/09/2018")
Oc_create("2000033839","Aldo Reyes","5679884-6","Para rutear","3/09/2018")
Oc_create("2000033828","María Teresa Zúñiga","17659410-1","Para rutear","4/09/2018")
Oc_create("2000033827","Karem Ovalle","17102613-K","Para rutear","4/09/2018")*/

 function buscar_OC (OrdenCompra) {
      
        

        Oc.find({ocompra: OrdenCompra},function(err,obj){
        var l=obj.length;
       if(err){

        console.log("error del servidor: "+err)
       }
       else if(l==0){
        console.log("No hay OC")
        var responseText=("Mmm 🤔 No tengo registro de despachos pendientes asociados a la orden. Verifica que sea el mismo número que te llegó en el correo de confirmación y vuelve a ingresarlo")
        //sendTextMessage(sender, responseText);
       }       
  
       else{
        var oc2=obj[0].ocompra;
        var nombre=obj[0].name;
        var estado=obj[0].estado;
        var rut=obj[0].rut;
        var fecha=obj[0].fecha;
        console.log(oc2)
        if  (oc2==OrdenCompra)
        {console.log("OC SI EXISTE")
          var responseText="Ya recibimos la solicitud y estamos preparando tu pedido 😉 \n Te confirmo algunos datos asociados: \n Nro orden de compra"+oc2+" \n Fecha de entrega: "+fecha+" \n  "
          //sendTextMessage(sender, responseText);
          console.log(responseText)
        }}
          
        })
        }



var UsuarioSchema = new Schema({
    sender: {type: String, required: true, max: 100},
    sus: {type: Number, required: true, max: 100},
    rut: {type: String, required: true},
    oc: {type: String, required: true, max: 100},
});
var Usuario=mongoose.model('Usuario',UsuarioSchema);

function user_create (sender,sus,rut,oc) {
    var a = sender;
    var b = sus;
    var c = rut;
    var d = oc;

    let user = new Usuario(
        {   
            sender:a,
            sus: b,
            rut: c,
            oc:d
                    }
    );

    user.save(function (err) {
        if (err) {
            console.log(err)

        }
        console.log('Usuario suscrito')
    })
};
function buscarsender () {
      

        Usuario.find({},function(err,obj){
            var a = obj;
            
            if(err){
              console.log(err)
            }
            else{
            buscaroc2(obj)
            
            }
          
        })
}

function imprime (OC){


    console.log(OC)
}


function buscaroc2 (senders)
{

  var s = senders;
for(var i=0; i<s.length;i++){
var OC = s[i].oc;
console.log(s[i].oc)
  Oc.find({ ocompra: OC},function(err,obj){
            var a = obj;
            
            if(err){
              console.log(err)
            }
            else{
            imprime(obj)
           
            }
          
        })


} 



}

//buscarsender()