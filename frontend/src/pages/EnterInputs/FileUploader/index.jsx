// created by Wenxin Li, github name wl123
import React, { useState } from 'react';
import uploadIcon from '../../../pic/upload-icon.png'
import './index.css';

// FileUploader Component
const FileUploader = ({ parentState, sendDataToParent, readFile, accept }) => {
  const [clicked, setClicked] = useState(false); // State for label click
  const [uploaded, setUploaded] = useState(false); // State for file upload

  // Handle label click event
  const handleClick = () => {
      setClicked(true); // Update clicked state
      console.log('clicked'); // Log click event
  };

  // Handle file change event
  const handleFileChange = (event) => {
      console.log('file uploaded'); // Log file upload event
      const file = event.target.files[0]; // Get the selected file
      if (file) {
          setUploaded(true); // Update uploaded state
          readFile(file, (inputs_data) => {
              // Update parent state with new inputs
              const newParentState = {
                  ...parentState,
                  inputs: inputs_data
              };
              sendDataToParent(newParentState); // Send updated state to parent
          });
      }
  };

  return (
      <div className="file-upload-wrapper"> {/* Wrapper div */}
          <input 
              type="file" 
              accept={accept} 
              id="file-upload" 
              className="file-upload-input" 
              onChange={handleFileChange} 
          /> {/* File input */}
          <label 
              htmlFor="file-upload" 
              className="file-upload-label" 
              onClick={handleClick} 
              style={{color: clicked ? 'purple' : 'black', borderBottom: clicked ? '2px solid purple' : '2px solid black' }}
          >
              Upload File 
              <img 
                  src={uploadIcon} 
                  alt="Upload Icon" 
                  className="upload-icon" 
              /> {/* Upload icon */}
          </label>
      </div>
  );
};

export default FileUploader; // Export component