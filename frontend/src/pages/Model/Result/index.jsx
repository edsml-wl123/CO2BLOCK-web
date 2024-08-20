// created by Wenxin Li, github name wl123
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';
import {getCacheBustedUrl, handleDownload} from '../../../utils/downloadFile.js'
import './index.css';
import ScenarioWindow from './ScenarioWindow';
import Loading from '../../../pic/loading.gif'
import downloadIcon from '../../../pic/downloadIcon.png'

const Result= ({resultsGenerated, limits, maxScenario}) => {
    const [results, setResults] = useState(null);
    const [viewScenario, setViewScenario] = useState(false);
    
  
    const get_results = async()=>{
        try {
            const response = await axios.get(`/api/model/results`);
            setResults(response.data);
            console.log('Get CO2BLOCK outputs from backend', response.data);
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

    // Get results when model finishes execution
    useEffect(()=>{
        if(resultsGenerated && results===null)
            get_results();
    }, [resultsGenerated])


    const viewMaxScenario=()=>{
        setViewScenario(true);
    }

    const onCloseScenario=()=>{
      setViewScenario(false);
    }


    // Navigate to optimization page when button clicked
    const navigate = useNavigate();
    const goRevenueOptimize = ()=>{
      navigate('/optimize/outputs');
    }    

    return(
        <div>
            <h2 id='results-label'>Results</h2>
            <div className='results'>
            {resultsGenerated && results?
                <>
                  {results.slice(0,2).map((url, index) => (
                    <img id={`pic${index+1}`} className='displayPic' key={index} src={getCacheBustedUrl(url)} alt={`Outputs ${index}`} />
                  ))}
                  
                  <button id='button1' className='custom-button' onClick={viewMaxScenario}>
                    Max Storage<br/>Scenario</button>
                  <button id='button2' className='custom-button' onClick={goRevenueOptimize}>
                    Revenue<br/>Optimization</button>
                  <button id='download' onClick={(event)=>{handleDownload(event,results[0]);
                    handleDownload(event,results[1]);handleDownload(event,results[2]);
                    handleDownload(event, results[3]);}}>
                    <img src={downloadIcon} className='downloadIcon' 
                    onClick={(event)=>{handleDownload(event,results[0]);
                      handleDownload(event,results[1]);handleDownload(event,results[2]);
                      handleDownload(event,results[3]);}}/>
                  </button>
                </> 
                :(
                <>
                  <img id='pic1' className='displayPic' src={Loading} alt="loadingGif" />
                  <img id='pic2' className='displayPic' src={Loading} alt="loadingGif" />
                </>  
                )
            }
            </div>

            {resultsGenerated && results && viewScenario ? (
                  <ScenarioWindow totalCO2Storage={maxScenario.maxStorage} 
                  wellNum={maxScenario.wellNum} wellRadius={limits.wellRadius} 
                  distance={maxScenario.wellDistance} injectionRate={parseFloat(maxScenario.flowRate)} 
                  timeDuration={parseFloat(limits.injectionTime)} correction={limits.correction}
                  onClose={onCloseScenario}/>
                ):''}
        </div>
    );

};


export default Result;