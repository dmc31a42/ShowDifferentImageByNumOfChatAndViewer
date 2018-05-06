var tmi = require('tmi.js')
var oauth = require('./oauth.js')
var app = require('express')();
var express = require('express');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var AppOptions = require('./AppOptions.js');
app.use(express.static('public'));
var ChatOptions = AppOptions.ChatOptions;

var options = {
    options: {
        debug: true
    },
    connection: {
        reconnect: true
    },
    identity: {
        username: oauth.username,
        password: oauth.password
    },
    channels: [ChatOptions.channelName]
}

//- setting
var State = {};
//- state

var client = new tmi.client(options);

client.connect();

var chatArray = [];
setInterval(function() {
    var DateNow = Date.now();
    var DatePoint = DateNow - ChatOptions.LogDeleteIntervalSec;
    var indexOfPrevious = chatArray.findIndex((value, index, obj) =>
        value.date>=DatePoint);
    
    if(indexOfPrevious>0){
        chatArray.splice(0, indexOfPrevious);
    }
},ChatOptions.LogDeleteIntervalSec);

// test code
/*setInterval(function() {
    client.say(ChatOptions.channelName, new Date().toLocaleString() + " test")
}, 1000)*/
// -test code



client.on("chat", (channel, user, message, self) => {
    if(self) return

    chatArray.push({
        "channel": channel,
        "user": user,
        "message": message,
        "date": Date.now()
    });
    CheckNumberOfChat();
    
})

function CheckNumberOfChat(){
    var indexOfChatAfterCheckSec = chatArray.findIndex(value=>value.date>Date.now()-ChatOptions.checkSec*1000);
    var NumberOfChatAfterCheckSec = chatArray.length-indexOfChatAfterCheckSec;
    /*ChatOptions.case.sort(function(a,b) {
        return b.cut-a.cut;
    });*/
    if(ChatOptions.case[0].cut ==0){
        for(var i=0; i<ChatOptions.case.length-1; i++){
            if(NumberOfChatAfterCheckSec>= ChatOptions.case[i].cut &&
            NumberOfChatAfterCheckSec < ChatOptions.case[i+1].cut)
            {
                if (!State.currentCut || State.currentCut.cut != ChatOptions.case[i].cut){
                    State.currentCut = ChatOptions.case[i];
                    broadCastAll();
                }
            }
        }
        if(NumberOfChatAfterCheckSec>ChatOptions.case[ChatOptions.case.length-1].cut) {
            if (!State.currentCut || State.currentCut.cut != ChatOptions.case[i].cut){
                State.currentCut = ChatOptions.case[i];
                broadCastAll();
            }
        }
    }
    /*ChatOptions.case.forEach(element => {
        if (NumberOfChatAfterCheckSec >= element.cut){
            if (!State.currentCut || State.currentCut.cut != element.cut){
                State.currentCut = element;
                //notice
            }
        }
    });*/
}

function broadCastAll(){
    io.emit('common',
        State
    );
}

io.on('connection', function(socket){
    socket.on('common', function(data){
       socket.emit('common', State); 
    })
});

server.listen(3000, function() {
    console.log('Socket IO server listening on port ' + 3000);
  });