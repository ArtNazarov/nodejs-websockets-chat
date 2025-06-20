# nodejs-websockets-chat
The simplest NodeJS websocket based chat

# Dependencies

```
 npm install ws
```

# Launch

Run http frontend
```
php -S localhost:8080
```
Run backend websocket nodejs server

```
node server.js
```

# Features

The data is stored in the plain text file
chat.txt, line by line, with one message per line 
in the format timestamp|user|message
