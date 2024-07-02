const express = require('express');
const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 8443;  // Port default untuk HTTPS

// Baca sertifikat SSL/TLS
const privateKey = fs.readFileSync('/etc/letsencrypt/live/con-weight.dhk.co.id/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/con-weight.dhk.co.id/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/con-weight.dhk.co.id/chain.pem', 'utf8');

const credentials = { key: privateKey, cert: certificate, ca: ca };

// Buat server HTTPS
const server = https.createServer(credentials, app);
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

server.listen(port, '0.0.0.0', () => {
    console.log(`Server running at https://0.0.0.0:${port}`);
});
