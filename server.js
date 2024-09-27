const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const fs = require('fs');
const path = require('path');

let jsonData = null;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'play2.html'));
});

app.use(express.static(__dirname + '/public'));
const filePath = path.join(__dirname, 'public', 'data', 'data.json');
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
    console.error('Error reading JSON file:', err);
    return;
    }

    jsonData = JSON.parse(data);
});

io.on('connection', (socket) => {

    socket.emit('json-data', jsonData);

    socket.on('update-answers', (data) => {
        const { questionIndex, answers } = data;

        jsonData['questions'][questionIndex] = answers;
        io.emit('updated-answers', jsonData);
    });

    socket.on('update-groups', (data) => {
        jsonData['groups'] = data;
        io.emit('updated-groups', jsonData);
    });

    socket.on('update-question-index', (data) => {
        jsonData['active_question_index'] = data;
        io.emit('updated-question-index', data);
    });

    
    socket.on('request-updated-data', () => {
        io.emit('json-data', jsonData);
    });

    socket.on('show-found-nothing', () => {
        io.emit('display-found-nothing');
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
