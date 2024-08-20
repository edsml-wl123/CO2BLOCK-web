// created by Wenxin Li, github name wl123

import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import axios from 'axios';
import './index.css';
import LimitForm from './LimitForm';
import Result from './Result';

const Model = ({inputsRoute, enteredInputs, selectedReservoir}) => {
    const [receivedInputs, setReceivedInputs] = useState(null);
    const [submitted, setSubmitted] = useState(false); 
    const [limits, setLimits] = useState(null);
    const [resultsGenerated, setResultsGenerated] = useState(null);
    const [maxScenario, setMaxScenario] = useState(null);
    const [error, setError] = useState(null);

    // Set received inputs to state
    useEffect(() => {
        if(inputsRoute==='enter-inputs' && enteredInputs!==null) setReceivedInputs(enteredInputs);
        if(inputsRoute==='map' && selectedReservoir!==null) setReceivedInputs(selectedReservoir);
    }, [inputsRoute]);


    const getDataFromForm = (limits) => {
        setSubmitted(true);
        setLimits(limits);
        runCO2BLOCK(limits);
    };


    const runCO2BLOCK = async(limits) => {
        try {
            const response = await axios.post(`/api/model/${inputsRoute}/run`, limits);
            console.log('Backend reponse:', response.data);
            if (response.data.startsWith('returncode')){
              throw new Error("Error while running CO2BLOCK\n\n"+response.data);
            }

            // Set outputs and Maximum storage scenario to states when backend model finishes running
            setResultsGenerated(response.data); 
            getMaxScenario();
        } catch (error) {
            setError(error);
            alert(error);
        }
    }

    // Get the maximum storage scenario from backend
    const getMaxScenario = async()=>{
      try {
        const response = await axios.get(`/api/model/maxScenario`);
        console.log('Get max scenario from backend', response.data);
        setMaxScenario(response.data);
      } catch (error) {
        if (error.response) {
          alert(`Error: ${error.response.data.message}`);
        } else if (error.request) {
          alert('Error: No response received from the server'); // If the request was made but no response was received
        } else {
          alert(`Error: ${error.message}`); // Other errors (network issues, etc.)
        }
      } 
    }

      
    return(
        <div className={submitted?'tight-container':'container'}>
          <div className='caption'>
            {receivedInputs ? 
            <h2>Received Inputs</h2> : 
            <h2 className='message'>To run the CO2BLOCK model, select a reservoir on the map page or enter inputs manually on the enter-inputs page.</h2>}
          </div>

          <div className={submitted?'tight-body':'body'}>
          {inputsRoute==='enter-inputs' ? (
            receivedInputs ? (
              <>
              <b>Unit name: </b> {receivedInputs.name!=='' && receivedInputs.name!==null ? receivedInputs.name:'unknown'}<br /><br />
              {Object.entries(receivedInputs).map(([key, value]) => (
              key !== 'name' ? (
                <React.Fragment key={key}>
                  <b>{capitalize(key)}: </b> {value !== null && value !== ''? value.toString() + '; ' : 'default; '}
                </React.Fragment>
              ) : null
              ))}
            </>
            ) : '') : (
            receivedInputs ? (
              <>
              <b>Unit name: </b> {receivedInputs['Unit name']+'; '}
              <b>ETI ID: </b> {receivedInputs['ETI ID']+'; '}
              <b>Formation: </b> {receivedInputs['formation name']+'; '}
              <b>Geographic area: </b> {receivedInputs['geographic area']+'; '}
              <br /><br />
              {Object.entries(receivedInputs).map(([key, value]) => (
                key !== 'Unit name' && key!== 'lat' && key!=='lon' && key!=='ETI ID' && key!=='formation name' && key!=='geographic area'? (
                  <React.Fragment key={key}>
                    <b>{capitalize(key)}: </b> {value !== null && value !== '' ? value.toString() + '; ' : 'default; '}
                  </React.Fragment>
                ) : null
                ))}
              </>
              ): '')} <br />
            {receivedInputs ? 
              submitted ? <Result resultsGenerated={error ? null:resultsGenerated} limits={limits} maxScenario={maxScenario}/> : <LimitForm sendDataToParent={getDataFromForm}/>
            :''}
          </div>


        </div>
        
    );
}

// Captitalize a string
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export default Model;