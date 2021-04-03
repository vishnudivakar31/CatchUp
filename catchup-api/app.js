const Constants = require('./constants')
const path = require("path")
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http, { 
    cors: { 
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    } 
})

var users_uuid = {}

app.use(express.static('../catchup-client/build'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../catchup-client/build', 'index.html'))
})

function registerUser(uuid, userID) {
    users_uuid[uuid] = userID
    console.log(users_uuid)
}

function unregisterUser(userID) {
    users_uuid = Object.keys(users_uuid).reduce((accumulator, key) => {
        if (users_uuid[key] != userID) {
            accumulator[key] = users_uuid[key]
        }
        return accumulator
    }, {})
    console.log(users_uuid)
}

function sendOffer(payload, socket) {
    let targetUUID = payload.targetUUID
    let targetID = users_uuid[targetUUID]
    if (targetID) {
        io.emit(Constants.OFFER_RECV, JSON.stringify(payload))
    } else {
        socket.emit(Constants.INVALID_UUID, {...payload, message: 'invalid user ID'})
    }
}

function sendAnswer(payload, socket) {
    let targetUUID = payload.targetUUID
    let targetID = users_uuid[targetUUID]
    if (targetID) {
        io.emit(Constants.ANSWER_RECV, JSON.stringify(payload))
    } else {
        socket.emit(Constants.INVALID_UUID, {...payload, message: 'invalid user ID'})
    }
}

io.on(Constants.CONNECTION, (socket) => {
    let userID = socket.id
    socket.on(Constants.DISCONNECT, () => {
        console.log('user disconnected', userID)
        unregisterUser(userID)
    })
    socket.on(Constants.REGISTER, (uuid) => registerUser(uuid, userID))
    socket.on(Constants.OFFER_SEND, (payload) => sendOffer(payload, socket))
    socket.on(Constants.ANSWER_SEND, payload => sendAnswer(payload, socket))
})

http.listen(5000, () => {
    console.log('listening to *:5000')
})
