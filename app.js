var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(path.join(__dirname, 'catchup-client/build')))

app.get('/*', (req, res) => res.sendFile(path.join(__dirname, 'catchup-client/build', 'index.html')))

app.listen(process.env.PORT || 3000, () => console.log('server running in', process.env.PORT || 3000))
