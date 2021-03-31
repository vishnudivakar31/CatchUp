const path = require("path")
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(express.static('../catchup-client/build'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../catchup-client/build', 'index.html'))
})

io.on('connection', (socket) => {
    console.log('user connected', socket.id)
    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id)
    })
})

http.listen(5000, () => {
    console.log('listening to *:5000')
})
