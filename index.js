const express = require('express');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Serving the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Watch the file for changes
const watcher = chokidar.watch('C:\\IDZec_Weight\\Berat.txt', {
    persistent: true,
    usePolling: true,
    interval: 1,  // Check every 1 millisecond
});

watcher.on('change', (filePath) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }
        // Send updated data to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
