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

io.on(Constants.CONNECTION, (socket) => {
    let userID = socket.id
    console.log('user connected', userID)
    socket.on(Constants.DISCONNECT, () => {
        console.log('user disconnected', userID)
        unregisterUser(userID)
    })
    socket.on(Constants.REGISTER, (uuid) => registerUser(uuid, userID))
})

http.listen(5000, () => {
    console.log('listening to *:5000')
})
