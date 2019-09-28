const functions = require('firebase-functions');
const request = require('request');
const region = 'asia-east2';
const spec = {
  memory: "1GB"
  };

const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase)
const db = admin.firestore();

exports.LineMessAPI = functions.region(region).runWith(spec).https.onRequest((request, respond) => {
    var event = request.body.events[0]
    var userId = event.source.userId;
    var timestamp = event.timestamp;
    var replyToken = event.replyToken;
    var userText = ""
    if (event.type === "message" && event.message.type === "text"){
        userText = event.message.text
    } else {
        userText = "(Message type is not text)";
    }
    const addChatHistory = db.collection("chat-history").doc(timestamp.toString()).set({
        "userId": userId,
        "Message": userText,
        "timestamp": timestamp
    })

    const getUserData = db.collection("Customer").doc(userId).get().then( returnData =>{
        if (returnData.exists){
          var name = returnData.data().name
          var surname = returnData.data().surname
          var nickname = returnData.data().nickname
          reply_message(replyToken, `Hello ${nickname}(${name} ${surname})`)
        } else {
          reply_message(replyToken, "You are not the customer, Register?")
        }
        return null
    }).catch(err => {
        console.log(err)
    })

    return respond.status(200).send(request.method);
});

const LINE_HEADER = {
    "Content-Type": "application/json",
    "Authorization": "Bearer {hHP4XSADzTbtcGybvA4C4y/s62Ti5cQIR1DEcVw1MSsuKeJUcnfyBF6lkBjphWtV5u2df/z7t+B7XLUm5zUM3TdT3vAymGOeYHqWuIHiDjQ5ngasmbM7DAHz5KcK4H8/z2QU71y9mkGhtxPL6ZxX/QdB04t89/1O/w1cDnyilFU=}"
  }

function reply_message(replytoken,textfrom){
    return request.post({
        uri: `https://api.line.me/v2/bot/message/reply`,
        headers: LINE_HEADER,
        body: JSON.stringify({
          replyToken: replytoken,
          messages: [
            {
              type: "text",
              text: textfrom
            }
          ]
        })
      });
}