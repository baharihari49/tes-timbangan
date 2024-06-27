const express = require('express');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware untuk mengurai body dari request POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serving the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Nama file timbangan
const fileName = 'timbangan.txt';

// Route POST untuk menerima data dan menulis ke file timbangan.txt
app.post('/data', (req, res) => {
    const data = req.body.data;

    if (!data) {
        return res.status(400).send('Data is required');
    }

    fs.writeFile(fileName, data, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).send('Error writing file');
        }

        console.log('File berhasil dibuat atau diupdate!');

        // Kirim data ke semua klien yang terhubung
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });

        res.send('Data received and written to file');
    });
});

// Watch the file for changes
// const watcher = chokidar.watch('C:\\IDZec_Weight\\Berat.txt', {
//     persistent: true,
//     usePolling: true,
//     interval: 1,  // Check every 1 millisecond
// });

// watcher.on('change', (filePath) => {
//     fs.readFile(filePath, 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error reading file:', err);
//             return;
//         }

//         fs.writeFile(fileName, data, (err) => {
//             if (err) {
//                 console.error('Error writing file:', err);
//             } else {
//                 console.log('File berhasil dibuat atau diupdate!');
//             }

//             // Kirim data ke semua klien yang terhubung
//             wss.clients.forEach(client => {
//                 if (client.readyState === WebSocket.OPEN) {
//                     client.send(data);
//                 }
//             });
//         });
//     });
// });

server.listen(port, '0.0.0.0',() => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
