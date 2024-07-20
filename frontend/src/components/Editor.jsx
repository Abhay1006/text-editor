import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const Editor = ({ setSelectedText }) => {
  const [texts, setTexts] = useState([]);
  const [newText, setNewText] = useState({ content: '', x: 0, y: 0, font: 'Arial', size: '16px' });

  useEffect(() => {
    const fetchTexts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/texts');
        setTexts(response.data);
      } catch (error) {
        console.error('Error fetching texts:', error);
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

  const handleClick = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    setNewText({ ...newText, x, y });
    const content = prompt('Enter your text:');
    if (content) {
      const text = { ...newText, content };
      axios.post('http://localhost:5000/texts', text)
        .then(response => {
          setTexts((prevTexts) => [...prevTexts, response.data]);
        })
        .catch(error => console.error('Error adding text:', error));
    }
  };

  const handleTextDelete = (id) => {
    axios.delete(`http://localhost:5000/texts/${id}`)
      .then(() => {
        setTexts((prevTexts) => prevTexts.filter(text => text.id !== id));
      })
      .catch(error => console.error('Error deleting text:', error));
  };

  return (
    <div className="w-3/4 h-screen border relative" onClick={handleClick}>
      {texts.map((text) => (
        <div
          key={text.id} // Ensure consistency with ID field
          style={{ 
            position: 'absolute', 
            top: text.y, 
            left: text.x, 
            fontFamily: text.font, // Apply the font family
            fontSize: text.size // Apply the font size
          }}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedText(text);
          }}
        >
          {text.content}
          <button onClick={() => handleTextDelete(text.id)} className="ml-2 text-red-500">Delete</button>
        </div>
      ))}
    </div>
  );
};

export default Editor;
