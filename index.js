const apiai = require("apiai");
const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const axios = require('axios');
var app = express();
var mensaje;
var Botkit = require('botkit');
const config = require("./config");
const cli = require('./config/cli').console
var fs = require('fs'); 
var parse = require('csv-parse');
var contexto="";
const greetUserText = async (userId) => {
  //first read user firstname
  console.log("AAAAAAAAAAAAAAAAA")
  await request(
    {
      uri: "https://graph.facebook.com/v3.0/" + userId,
      qs: {
        access_token: config.FB_PAGE_TOKEN
      }
    },
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        var user = JSON.parse(body);

        if (user.first_name) {
          console.log(
            "FB user: %s %s, %s",
            user.first_name,
            user.last_name,
            user.gender
          );

          sendTextMessage(userId, "Welcome " + user.first_name + " " + user.last_name + " 😀 " + "! " + "I am Y-Assistant 🤖 Here to Help You.");
        } else {
          console.log("Cannot get data for fb user with id", userId);
        }
      } else {
        console.error(response.error);
      } 
    }
  );
}
var contador_oc=0;
//fs.readFile('nombres')
var controller = Botkit.facebookbot({
    debug: true,
    log: true,
    access_token: config.FB_PAGE_TOKEN,
    verify_token: config.FB_VERIFY_TOKEN,
    app_secret: config.FB_APP_SECRET,
    validate_requests: true
});
//controller.api.messenger_profile.greeting("hola como estas ! soy bla bla bla bla");
controller.api.messenger_profile.get_started('Hello');  


//Import Config file


//setting Port
app.set("port", process.env.PORT || 5000);

//serve static files in the public directory
app.use(express.static("public"));

// Process application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

// Process application/json
app.use(bodyParser.json());
const mongoose = require('mongoose');
let dev_db_url = 'mongodb://someuser:abcd1234@ds233212.mlab.com:33212/productstutorial';

let mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

////////////////////// SCHEMAS //////////////////////////////
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
    ocompra: {type: String, required: true, max: 100},
    name: {type: String, required: true, max: 100},
    rut: {type: String, required: true},
    estado: {type: String, required: true},
    fecha: {type: String, required: true, max: 100},
});

var UsuarioSchema = new Schema({
    sender: {type: String, required: true},
    sus: {type: Number, required: true},
    rut: {type: String, required: true},
    oc: {type: String, required: true},
});


// Export the model
var Cliente = mongoose.model('Cliente', ClienteSchema);

var Oc=mongoose.model('Oc',OcSchema);

var Usuario=mongoose.model('Usuario',UsuarioSchema);

// Index route
app.get("/", function (req, res) {
  res.send("Hello world, I am a chat bot");
});

// for Facebook verification
app.get("/webhook/", function (req, res) {
  console.log("request");
  if (
    req.query["hub.mode"] === "subscribe" &&
    req.query["hub.verify_token"] === config.FB_VERIFY_TOKEN
  ) {
    res.status(200).send(req.query["hub.challenge"]);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

// Spin up the server
app.listen(app.get("port"), function () {
  console.log("Magic Started on port", app.get("port"));
});

const apiAiService = apiai(config.API_AI_CLIENT_ACCESS_TOKEN, {
  language: "es",
  requestSource: "fb"
});
const sessionIds = new Map();

/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post("/webhook/", function (req, res) {
  var data = req.body;
  // Make sure this is a page subscription
  if (data.object == "page") {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function (pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function (messagingEvent) {
        if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        }
        else if (messagingEvent.referral) {

            receivedReferral(messagingEvent);
        } 
        else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        }
        else {
          console.log("Webhook received unknown messagingEvent: ",messagingEvent);
        }
      });
    });
    // Assume all went well.
    // You must send back a 200, within 20 seconds
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;
  mensaje=message.text;

  if (!sessionIds.has(senderID)) {
    sessionIds.set(senderID, uuid.v1());
  }

  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;

  if (messageText) {
    //send message to api.ai
    sendToApiAi(senderID, messageText);
  } else if (messageAttachments) {
    handleMessageAttachments(messageAttachments, senderID);
  }

}
function receivedReferral(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.referral;
  console.log(message.source)
  mensaje=message.ref;
  console.log(mensaje)
  if (!sessionIds.has(senderID)) {
    sessionIds.set(senderID, uuid.v1());
  }

  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.ref;
  var messageAttachments = message.attachments;

  if (messageText) {
    //send message to api.ai
    sendToApiAi(senderID, messageText);
  } else if (messageAttachments) {
    handleMessageAttachments(messageAttachments, senderID);
  }
}

function sendToApiAi(sender, text) {
  sendTypingOn(sender);
  let apiaiRequest = apiAiService.textRequest(text, {
    sessionId: sessionIds.get(sender)
  });

  apiaiRequest.on("response", response => {
    if (isDefined(response.result)) {
      handleApiAiResponse(sender, response);
    }
  });

  apiaiRequest.on("error", error => console.error(error));
  apiaiRequest.end();
}

/*
 * Turn typing indicator on
 *
 */
const sendTypingOn = (recipientId) => {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_on"
  };
  callSendAPI(messageData);
}

/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
const callSendAPI = async (messageData) => {

const url = "https://graph.facebook.com/v3.0/me/messages?access_token=" + config.FB_PAGE_TOKEN;
  await axios.post(url, messageData)
    .then(function (response) {
      if (response.status == 200) {
        var recipientId = response.data.recipient_id;
        var messageId = response.data.message_id;
        if (messageId) {
          console.log(
            "Successfully sent message with id %s to recipient %s",
            messageId,
            recipientId
          );
        } else {
          console.log(
            "Successfully called Send API for recipient %s",
            recipientId
          );
        }
      }
    })
    .catch(function (error) {
      console.log(error.response.headers);
    });
}


const isDefined = (obj) => {
  if (typeof obj == "undefined") {
    return false;
  }
  if (!obj) {
    return false;
  }
  return obj != null;
}

function handleApiAiResponse(sender, response) {
  let responseText = response.result.fulfillment.speech;
  let responseData = response.result.fulfillment.data;
  let messages = response.result.fulfillment.messages;
  let action = response.result.action;
  let contexts = response.result.contexts;
  let parameters = response.result.parameters;

  sendTypingOff(sender);

 if (responseText == "" && !isDefined(action)) {
    //api ai could not evaluate input.
    console.log("Unknown query" + response.result.resolvedQuery);
    sendTextMessage(
      sender,
      "I'm not sure what you want. Can you be more specific?"
    );
  } else if (isDefined(action)) {
    handleApiAiAction(sender, action, responseText, contexts, parameters);
  } else if (isDefined(responseData) && isDefined(responseData.facebook)) {
    try {
      console.log("Response as formatted message" + responseData.facebook);
      sendTextMessage(sender, responseData.facebook);
    } catch (err) {
      sendTextMessage(sender, err.message);
    }
  } else if (isDefined(responseText)) {
    sendTextMessage(sender, responseText);
  }
}

/*
 * Turn typing indicator off
 *
 */
const sendTypingOff = (recipientId) => {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender_action: "typing_off"
  };

  callSendAPI(messageData);
}

const sendTextMessage = async (recipientId, text) => {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text
    }
  };
  await callSendAPI(messageData);
}
var contador=0;


function handleApiAiAction(sender, action, responseText, contexts, parameters) {
   switch (action) {
    case "send-text":
     // var responseText = "This is example of Text message."+mensaje
     var responseText;
     if (mensaje=="17859655-1"){

        var responseText = "Rut: "+mensaje+" Nombre: Alejandro Jochava OC:1235766 "
     }

     else if (mensaje=="11643181-5"){

        var responseText = "Rut:"+mensaje+" Nombre: Viviana Gomez OC:12125411235766 "
     } 
     else
     {

      var responseText = "Rut:"+mensaje+" No registrado"
      contador=contador+1;
      console.log(contador)
     }
      sendTextMessage(sender, responseText);
      break;
    
    case "Hello":
      
       
    var responseText = "Para ayudarte a hacer seguimiento del despacho de tu compra, selecciona una de las siguientes opciones: ";
    const elements = [{
    "type": "postback",
    "title": "Buscar por rut",
    "payload": "buscar_rut",
  }, {
    "type": "postback",
    "title": "Orden de compra",
    "payload": "buscar_oc"
  }]
  sendButtonMessage(sender, responseText, elements)


      
     

      break;
case "buscar_rut":
contexto="rut"

  var responseText = "Muy bien ingresa tu rut"
  sendTextMessage(sender, responseText);

break;

case "buscar_oc":

contexto="OC"
  var responseText = "Muy bien ingresa tu orden de compra"
  sendTextMessage(sender, responseText);
break;

case "ingresa_oc":
  /*if(mensaje=="123123123")
  {
      var responseText = "Tu orden de compra es: "+mensaje;
      sendTextMessage(sender, responseText);

  }
  else
  {
  var responseText = "no hay nada asociado a esa orden pero puedes buscar por rut o intentar nuevamente con tu orden de compra"
    const elements = [{
    "type": "postback",
    "title": "Buscar por rut",
    "payload": "buscar_rut",
  }, ]
    sendButtonMessage(sender, responseText, elements)

  }*/

  if(contexto=="rut"){
    var responseText="El rut no está asociado a ninguna orden de compra"
    sendTextMessage(sender, responseText);

  }
  else if(contexto=="OC"){

    buscar_OC(mensaje,sender,responseText)  
  }
  
break;

case "ingresa_rut":
if(contexto=="OC"){
  var responseText="Mmm 🤔 No tengo registro de despachos pendientes asociados a la orden. Verifica que sea el mismo número que te llegó en el correo de confirmación y vuelve a ingresarlo"
    sendTextMessage(sender, responseText);

}

else if(contexto=="rut"){
 buscar_rut(mensaje,sender,responseText)
}
  
  
break;

case "agradecimiento":


break;



    default:
      //unhandled action, just send back the text
         

    sendTextMessage(sender, responseText);
  }

    
  }


function receivedPostback(event) {
  console.log(event);

  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;
  if(event.postback.referral){
    mensaje=event.postback.referral.ref;
  }
  

  // The 'payload' param is a developer-defined field which is set in a postback
  // button for Structured Messages.
  var payload = event.postback.payload;
  cli.blue(payload);
  handleApiAiAction(senderID, payload, "", "", "")
  
  console.log(
    "Received postback for user %d and page %d with payload '%s' " + "at %d",
    senderID,
    recipientID,
    payload,
    timeOfPostback
  );

}

/*function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.postback;
  mensaje=message.ref;
  var payload=event.payload;

  console.log(mensaje)
  if (!sessionIds.has(senderID)) {
    sessionIds.set(senderID, uuid.v1());
  }

  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;

  // You may get a text or attachment but not both
  var messageText = message.ref;
  var messageAttachments = message.attachments;

  if (messageText) {
    //send message to api.ai
    sendToApiAi(senderID, messageText);
  } else if (messageAttachments) {
    handleMessageAttachments(messageAttachments, senderID);
  }
}*/





const sendButtonMessage = async (recipientId, text, buttons) => {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: text,
          buttons: buttons
        }
      }
    }
  };

  await callSendAPI(messageData);
}
//////////////// BUSCAR EN LA BD RUT  OC ///////////////////////////////////////
 /*function buscar_rut (rutt,sender,responseText) {
      
        

        Cliente.find({rut: rutt},function(err,obj){
        var l=obj.length;
       if(err){

        console.log("error del servidor: "+err)
       }
       else if(l==0){
        console.log("EL RUT NO EXISTE")
        var responseText=("El rut no está asociado a ninguna orden de compra")
        sendTextMessage(sender, responseText);
       }       
  
       else{
        var rut2=obj[0].rut;
        var nombre=obj[0].name;
        var producto=obj[0].producto;
        console.log(rut2)
        if  (rut2==rutt)
        {console.log("EL RUT SI EXISTE")
          var responseText="el rut; "+rutt+" corresponde a la persona de nombre:"+nombre+"y su producto es: "+producto;
          sendTextMessage(sender, responseText);
        }}
          
        })
        }
*/
function buscar_rut (rutt,sender,responseText) {
      
        

        Oc.find({rut: rutt},function(err,obj){
        var l=obj.length;
       if(err){

        console.log("error del servidor: "+err)
       }
       else if(l==0){
        console.log("EL RUT NO EXISTE")
        var responseText=("El rut no está asociado a ninguna orden de compra")
        sendTextMessage(sender, responseText);
       }       
  
       else{
        var oc2=obj[0].ocompra;
        var nombre=obj[0].name;
        var estado=obj[0].estado;
        var rut2=obj[0].rut;
        var fecha=obj[0].fecha;
        console.log(rut2)
        if  (rut2==rutt)
        {console.log("EL RUT SI EXISTE")
          var responseText="Ya recibimos la solicitud y estamos preparando tu pedido 😉 \nTe confirmo algunos datos asociados: \nNro orden de compra: "+oc2+" \nFecha de entrega: "+fecha+" \n  "
          sendTextMessage(sender, responseText);
        }}
          
        })
        }


function buscar_OC (OrdenCompra,sender,responseText) {
      
        

        Oc.find({ocompra: OrdenCompra},function(err,obj){
        var l=obj.length;
       if(err){

        console.log("error del servidor: "+err)
       }
       else if(l==0){
        contador_oc=contador_oc+1;
        console.log("No hay OC")

        if(contador_oc==1){
          var responseText=("Mmm 🤔 No tengo registro de despachos pendientes asociados a la orden. Verifica que sea el mismo número que te llegó en el correo de confirmación y vuelve a ingresarlo")
          sendTextMessage(sender, responseText);
        }

        if(contador_oc==2){
         var responseText=("Mmm 🤔 No tengo registro de despachos pendientes asociados a la orden. Verifica que sea el mismo número que te llegó en el correo de confirmación y vuelve a ingresarlo o puedes probar con tu rut")
        //sendTextMessage(sender, responseText);
        contador_oc=0;

        const elements = [{
        "type": "postback",
        "title": "Buscar por rut",
        "payload": "buscar_rut",
      }, ]
    sendButtonMessage(sender, responseText, elements)
        }
       
       }       
  
       else{
        contador_oc=0;
        var oc2=obj[0].ocompra;
        var nombre=obj[0].name;
        var estado=obj[0].estado;
        var rut=obj[0].rut;
        var fecha=obj[0].fecha;
        console.log(oc2)
        if  (oc2==OrdenCompra)
        {console.log("OC SI EXISTE")

        user_create(sender,"1",rut,oc2,fecha)
         //var responseText="Ya recibimos la solicitud y estamos preparando tu pedido 😉 \nTe confirmo algunos datos asociados: \nNro orden de compra: "+oc2+" \nFecha de entrega: "+fecha+" \n  "
          //sendTextMessage(sender, responseText);
          //console.log(responseText)
         // sendTextMessage(sender, responseText);
        }}
          
        })
        }


        function randomIntInc(low, high) {
         return Math.floor(Math.random() * (high - low + 1) + low)
        }

        function hora(h,m,s)
        {
        var h =h;
        var m =m;
        var s =s;
        
        var horaactual= new Date();
        var horaprogramada = new Date();
        horaprogramada.setHours(h);
        horaprogramada.setMinutes(m);
        horaprogramada.setSeconds(s);
        var a =horaprogramada.getTime()-horaactual.getTime();
        return a;
        }


      

        


function user_create (sender,sus,rut,oc,fecha) {
    var a = sender;
    var b = sus;
    var c = rut;
    var d = oc;
    var f = fecha;
    let usuario = new Usuario(
        {   
            sender:a,
            sus: b,
            rut: c,
            oc:d
                    }
    );

    usuario.save(function (err) {
        if (err) {
            console.log(err)

        }
        console.log('Usuario suscrito')

        var responseText="Ya recibimos la solicitud y estamos preparando tu pedido 😉 \nTe confirmo algunos datos asociados: \nNro orden de compra: "+d+" \nFecha de entrega: "+f+" \n  "
          //sendTextMessage(sender, responseText);
          console.log(responseText)
          sendTextMessage(sender, responseText);
    })
};

function buscarsender () {
      

        Usuario.find({},function(err,obj){
            var a = obj;
            
            if(err){
              console.log(err)
            }
            else{

            for(var i=0; i<a.length;i++){
            var s = a[i].sender;
            var o = a[i].oc;
            buscaroc2(s,o)
            
            }}
          
        })
}




function buscaroc2 (sender, oc)
{

  var s = sender;
  var o = oc;
//for(var i=0; i<s.length;i++){
//var OC = s[i].oc;
//var sender=s[i].sender;

  Oc.find({ ocompra: o},function(err,obj){
            var a = obj;
            
            if(err){
              console.log(err)
            }
            else{
              
            sendTextMessage(sender,"El estado de tu producto es: "+a[0].estado);
           
            }
          
        })


//} 



}

setTimeout(function(){
        buscarsender();;
        }, hora());

/*setTimeout(function(){
        sendTextMessage("2204677629573507", "hola como estas alejandro");;
        }, hora());*/