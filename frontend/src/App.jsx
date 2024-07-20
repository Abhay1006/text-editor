import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Toolbar from './components/Toolbar';

const socket = io('http://localhost:5000', {
  withCredentials: true,
  transports: ['websocket', 'polling'],
});

const App = () => {
  const [texts, setTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);

  useEffect(() => {
    const fetchTexts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/texts');
        setTexts(response.data);
      } catch (error) {
        console.error('There was an error fetching the texts!', error);
      }
    };

    fetchTexts();

    socket.on('new-text', (newText) => {
      setTexts((prevTexts) => [...prevTexts, newText]);
    });

    socket.on('update-text', (updatedText) => {
      setTexts((prevTexts) => prevTexts.map(text => text.id === updatedText.id ? updatedText : text));
    });

    socket.on('delete-text', (id) => {
      setTexts((prevTexts) => prevTexts.filter(text => text.id !== id));
    });

    return () => {
      socket.off('new-text');
      socket.off('update-text');
      socket.off('delete-text');
    };
  }, []);

  const handleCanvasClick = (e) => {
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;
    const newText = { content: '', x, y, font: 'Arial', size: '16px' };

    socket.emit('add-text', newText);
  };

  const handleTextClick = (text, e) => {
    e.stopPropagation();
    setSelectedText(prevText => prevText?.id === text.id ? null : text);
  };

  const handleInputChange = (e) => {
    if (selectedText) {
      const updatedText = { ...selectedText, content: e.target.value };
      setSelectedText(updatedText);
      socket.emit('update-text', updatedText);
    }
  };

  return (
    <div className="flex">
      <div
        className="w-3/4 h-screen bg-white relative overflow-hidden"
        onClick={handleCanvasClick}
      >
        {texts.map(text => (
          <input
            key={text.id}
            style={{
              position: 'absolute',
              left: Math.max(0, Math.min(text.x, window.innerWidth * 0.75 - 200)), // Ensure text is within canvas width
              top: Math.max(0, Math.min(text.y, window.innerHeight - 50)), // Ensure text is within canvas height
              fontFamily: text.font,
              fontSize: text.size,
              maxWidth: '100%', // Prevent text from extending outside canvas
              boxSizing: 'border-box',
            }}
            value={text.id === selectedText?.id ? selectedText.content : text.content}
            onClick={(e) => handleTextClick(text, e)}
            onChange={handleInputChange}
            className="border-none outline-none resize-none"
          />
        ))}
      </div>
      <Toolbar selectedText={selectedText} setSelectedText={setSelectedText} socket={socket} />
    </div>
  );
};

export default App;
