// created by Wenxin Li, github name wl123
import React, { useState, useEffect} from 'react';
import axios from 'axios';
import _ from 'lodash';
import {handleDownload} from '../../utils/downloadFile.js'
import './index.css';
import downloadIcon from '../../pic/downloadIcon.png';
import './index.css';

const Help=()=>{
    const [example, setExample] = useState(null);

    const getExample = async() =>{
        try {
            const response = await axios.get(`/api/help`);
            setExample(response.data);
            console.log('Get example from backend', response.data);
        } catch (error) {
            if (error.response) {
              alert(`Error: ${error.response.data.message}`);
            } else if (error.request) {
              alert('Error: No response received from the server'); // If the request was made but no response was received
            } else {
              alert(`Error: ${error.message}`); // Other errors (network issues, etc.)
          }
        }
    };


    useEffect(()=>{
      getExample();
    }, [])



    return (
        <div id='help-container'>
          <h2 id='help-info'>CO2BLOCK Web Interface</h2>
          <p className='intro'>This project provides a web interface for the CO2BLOCK tool, which estimates CO₂ 
            storage capacity in saline aquifers. The interface allows users to input geological data, 
            run the model online, and analyze different storage scenarios. The project is built using a 
            Python Flask backend and a React frontend. Matlab Runtime Compiler needs to be installed and 
            set up for running the model.
          </p>

          <h3 id='installation'>Installation Guide</h3>
          <p className='user-guide'>For step-by-step guide to install the prerequisites for this interface, click&nbsp;
          <a href="https://github.com/ese-msc-2023/irp-wl123/tree/main/deliverables" target="_blank" rel="noopener noreferrer">here</a>
          &nbsp;to see the readme.md file. 
          </p>

          <h3 id='upload'>File Upload</h3>
          <p className='upload-guide'>To upload a file for as CO2BLOCK inputs or for revenue optimization, ensure it is 
             an Excel file and follows certain naming formats so that the system can recognize the parameters. 
             Here provides example file for CO2BLOCK parameters and revenue calculation that you can download. If you want to upload 
             your own file, it's recommended to match the column names with those in the example files.
          </p>
          <button id='egDownload1' onClick={event=>handleDownload(event,example[0])}>
                <img src={downloadIcon} className='downloadIcon' onClick={event=>handleDownload(event,example[0])}/>
          </button>
          
          <p className='download1'>Download an example file as CO2BLOCK inputs.</p>
          <br/>

          <button id='egDownload2' onClick={event=>handleDownload(event,example[1])}>
                <img src={downloadIcon} className='downloadIcon2' onClick={event=>handleDownload(event,example[1])}/>
          </button>
          <p className='download2'>Download an example file for revenue optimization.</p>
        </div>
      );
}

export default Help;