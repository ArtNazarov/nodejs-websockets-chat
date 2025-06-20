const WebSocket = require('ws');
const fs = require('fs').promises;
const path = require('path');

const CHAT_FILE = path.join(__dirname, 'chat.txt');
const PORT = 8081;

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT });

// Load chat history on startup
let chatHistory = [];
async function loadChatHistory() {
    try {
        const data = await fs.readFile(CHAT_FILE, 'utf8');
        chatHistory = data.split('\n').filter(line => line.trim());
    } catch (err) {
        if (err.code === 'ENOENT') {
            // File doesn't exist yet, that's fine
            await fs.writeFile(CHAT_FILE, '');
        } else {
            console.error('Error loading chat history:', err);
        }
    }
}

// Save a new message to the file
async function saveMessage(timestamp, nickname, message) {
    const line = `${timestamp}|${nickname}|${message}\n`;
    try {
        await fs.appendFile(CHAT_FILE, line);
        chatHistory.push(line.trim());
    } catch (err) {
        console.error('Error saving message:', err);
    }
}

// Handle new connections
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Send chat history to new client
    ws.send(JSON.stringify({
        type: 'history',
        data: chatHistory
    }));
    
    // Handle messages from client
    ws.on('message', async (message) => {
        try {
            const { nickname, text } = JSON.parse(message);
            const timestamp = new Date().toISOString();
            
            // Save message to file
            await saveMessage(timestamp, nickname, text);
            
            // Broadcast to all clients
            const newMessage = `${timestamp}|${nickname}|${text}`;
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'message',
                        data: newMessage
                    }));
                }
            });
        } catch (err) {
            console.error('Error handling message:', err);
        }
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start the server
loadChatHistory().then(() => {
    console.log(`Chat server running on ws://localhost:${PORT}`);
});
