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
    channels: ChatOptions.channelName
}

//- setting
var State = {};
//- state

var client = new tmi.client(options);

client.connect();

var chatArray = [];
/*setInterval(function() {
    var DateNow = Date.now();
    var DatePoint = DateNow - ChatOptions.LogDeleteIntervalSec*1000;
    var indexOfPrevious = chatArray.findIndex((value, index, obj) =>
        value.date>=DatePoint);
    
    if(indexOfPrevious>0){
        chatArray.splice(0, indexOfPrevious);
    }
},ChatOptions.LogDeleteIntervalSec*1000);
*/
client.on("chat", (channel, user, message, self) => {
    if(self) return

    chatArray.push({
        "channel": channel,
        "user": user,
        "message": message,
        "date": Date.now()
    });
})


indexOfChatAfterCheckSec = 0
ChatOptions.case.sort(function(a,b) {
    return a.cut-b.cut;
});
setInterval(function() {
	CheckNumberOfChat();	
},ChatOptions.LogicCheckIntervalSec*1000);
function CheckNumberOfChat(){
    if(chatArray.length > 0) {
        indexOfChatAfterCheckSec = chatArray.slice(indexOfChatAfterCheckSec).findIndex(value=>value.date>Date.now()-ChatOptions.ChatRateCheckIntervalSec*1000)+indexOfChatAfterCheckSec;
        State.NumberOfChatAfterCheckSec = chatArray.length-indexOfChatAfterCheckSec;
        if(ChatOptions.case[0].cut ==0){
            for(var i=0; i<ChatOptions.case.length-1; i++){
                if(State.NumberOfChatAfterCheckSec>= ChatOptions.case[i].cut &&
                    State.NumberOfChatAfterCheckSec < ChatOptions.case[i+1].cut)
                {
                    if (!State.currentCut || State.currentCut.cut != ChatOptions.case[i].cut){
                        State.currentCut = ChatOptions.case[i];
                        //broadCastAll();
                    }
                }
            }
            if(State.NumberOfChatAfterCheckSec>ChatOptions.case[ChatOptions.case.length-1].cut) {
                if (!State.currentCut || State.currentCut.cut != ChatOptions.case[i].cut){
                    State.currentCut = ChatOptions.case[i];
                    //broadCastAll();
                }
            }
        }
    }
    broadCastAll();
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

// test code
/*setInterval(function() {
    client.say(ChatOptions.channelName, new Date().toLocaleString() + " test")
}, 1000)*/
function makeTestChat() {
    var chatItem = {
        "channel": ChatOptions.channelName[getRandomInt(0,ChatOptions.channelName.length)],
        "user": getRandomArbitrary(0,10).toString(),
        "message": getRandomArbitrary(0,50).toString(),
        "date": Date.now()
    }
    chatArray.push(chatItem);
    var localDate = new Date(chatItem.date);
    console.log("DEBUG["
        + localDate.getHours().toString().padStart(2,"0")
        + ":" + localDate.getMinutes().toString().padStart(2,"0")
        + "] info: [" + chatItem.channel
    + "] <" + chatItem.user
    + "> : " + chatItem.message)
    //[20:59] info: [#bbira] <rrangyang>: 헐 오늘 안 늦으셨넹
    setTimeout(makeTestChat, getRandomInt(0,ChatOptions.ChatRateCheckIntervalSec*1000)/getRandomInt(10,20));
}
//makeTestChat();
// -test code

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}