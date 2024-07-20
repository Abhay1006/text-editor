import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000', // Adjust this to your client URL
}));

// In-memory store for texts
const texts = new Map();

app.get('/texts', (req, res) => {
  res.json(Array.from(texts.values()));
});

app.post('/texts', (req, res) => {
  const id = Date.now().toString();
  const newText = { id, ...req.body };
  texts.set(id, newText);
  io.emit('new-text', newText);
  res.status(201).json(newText);
});

app.patch('/texts/:id', (req, res) => {
  const text = texts.get(req.params.id);
  if (text) {
    const updatedText = { ...text, ...req.body };
    texts.set(req.params.id, updatedText);
    io.emit('update-text', updatedText);
    res.json(updatedText);
  } else {
    res.sendStatus(404);
  }
});

app.delete('/texts/:id', (req, res) => {
  if (texts.delete(req.params.id)) {
    io.emit('delete-text', req.params.id);
    res.sendStatus(204);
  } else {
    res.sendStatus(404);
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('add-text', (text) => {
    try {
      const id = Date.now().toString();
      const newText = { id, ...text };
      texts.set(id, newText);
      io.emit('new-text', newText);
    } catch (error) {
      console.error('Error handling add-text event:', error);
    }
  });

  socket.on('update-text', (text) => {
    try {
      if (text && text.id && texts.has(text.id)) {
        const updatedText = { ...texts.get(text.id), ...text };
        texts.set(text.id, updatedText);
        io.emit('update-text', updatedText);
      }
    } catch (error) {
      console.error('Error handling update-text event:', error);
    }
  });

  socket.on('delete-text', (id) => {
    try {
      if (texts.delete(id)) {
        io.emit('delete-text', id);
      }
    } catch (error) {
      console.error('Error handling delete-text event:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

server.listen(5000, () => {
  console.log('Server is running on port 5000');
});
