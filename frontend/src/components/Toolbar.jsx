import React from 'react';

const Toolbar = ({ selectedText, setSelectedText, socket }) => {
  const handleFontChange = (e) => {
    if (selectedText) {
      const updatedText = { ...selectedText, font: e.target.value };
      setSelectedText(updatedText);
      socket.emit('update-text', updatedText);
    }
  };

  const handleSizeChange = (e) => {
    if (selectedText) {
      const updatedText = { ...selectedText, size: e.target.value };
      setSelectedText(updatedText);
      socket.emit('update-text', updatedText);
    }
  };

  return (
    <div className="w-1/4 bg-gray-200 p-4">
      <div className="mb-4">
        <label htmlFor="font-select" className="block mb-2 text-sm font-medium text-gray-700">Font:</label>
        <select id="font-select" onChange={handleFontChange} value={selectedText?.font || 'Arial'}>
          <option value="Arial">Arial</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>
      <div>
        <label htmlFor="size-select" className="block mb-2 text-sm font-medium text-gray-700">Size:</label>
        <select id="size-select" onChange={handleSizeChange} value={selectedText?.size || '16px'}>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
        </select>
      </div>
    </div>
  );
};

export default Toolbar;
