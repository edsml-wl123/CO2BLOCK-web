// created by Wenxin Li, github name wl123
import React, { useState, useEffect } from 'react';
import _ from 'lodash';
import './index.css';

const LimitForm = ({ sendDataToParent }) => {
  // Initialize state with default limits and errors
  const [limits, setLimits] = useState({
      injectionTime: '30', 
      minDistance: '2', 
      maxDistance: 'auto', 
      numDistance: '30', 
      maxWellNum: 'auto', 
      wellRadius: '0.2', 
      maxQ: '5', 
      correction: 'off'
  });
  const [errors, setErrors] = useState('');

  // Handle input changes
  const handleChange = (event) => {
      const { name, value } = event.target;
    
      if (name === 'correction') {
          if (event.target.checked) {
              setLimits((prevLimits) => ({
                  ...prevLimits,
                  correction: value,
              }));
          }
      } else {
          setLimits((prevLimits) => ({
              ...prevLimits,
              [name]: value,
          }));
      }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
      event.preventDefault(); // Prevent default form submission
      if (validateInputs()) { // Validate inputs before sending
          console.log('Limits validated');
          sendDataToParent(limits); // Send limits data to parent component
      }
  };

  // Validate form inputs
  const validateInputs = () => {
      let isValid = true;
      let newErrors = '';
      for (const field in limits) {
          if (field === 'correction') continue;

          // The limits can be 'auto'
          if ((field === 'maxWellNum' || field === 'maxDistance') && limits[field] === 'auto') continue;

          if (field === 'numDistance') {  
              const value = parseInt(limits[field], 10);  // check if the limit is an integer
              if (isNaN(value) || value <= 0 || value !== parseFloat(limits[field])) {
                  newErrors += `The parameter ${field} must be a positive integer number;\n`;
                  isValid = false;
                  continue;
              }
          }
          const value = parseFloat(limits[field]);  // check if the limit is a number
          if (isNaN(value) || value <= 0) {
              newErrors += `The parameter ${field} must be a positive number;\n`;
              isValid = false;
          }
      }
      if (newErrors !== errors) {
          setErrors(newErrors);
      } else {
          if (errors !== '') alert(errors); // Alert errors if any
      }
      return isValid; 
  };

  // Alert errors if they change
  useEffect(() => {
      if (errors !== '') alert(errors);
  }, [errors]);


    return(
        <div>
            <br /><br /><br />
            <form onSubmit={handleSubmit} className='enterLimits'>
            
              <div className="form-group">
                <label>Injection time (year):</label>
                <input type="text" className='limits' name="injectionTime" required={true} value={limits.injectionTime} onChange={handleChange}/>
                <label>Minmum interwell distance (km):</label>
                <input type="text" className='limits' name="minDistance" required={true} value={limits.minDistance} onChange={handleChange}/>
                <label>Maximum interwell distance (km):</label>
                <input type="text" className='limits' name="maxDistance" required={true} value={limits.maxDistance} onChange={handleChange}/>
              </div>

              <div className="form-group">
                <label>Number of distances to explore:</label>
                <input type="text" className='limits' name="numDistance" required={true} value={limits.numDistance} onChange={handleChange}/>
                <label>Maximum well number:</label>
                <input type="text" className='limits' name="maxWellNum" required={true} value={limits.maxWellNum} onChange={handleChange}/>
                <label>Well radius (m):</label>
                <input type="text" className='limits' name="wellRadius" required={true} value={limits.wellRadius} onChange={handleChange}/>
              </div>

              <div className="form-group">
                <label>Maximum injection rate per well (Mton/y):</label>
                <input type="text" className='limits' name="maxQ" required={true} value={limits.maxQ} onChange={handleChange}/>
                <div className='radio-group'>
                  <label>Correction: </label>
                  <input id='on' type='radio' name='correction' value='on' 
                  checked={limits.correction==='on'} onChange={handleChange} /> On
                  <input id='off' type='radio' name='correction' value='off'
                  checked={limits.correction==='off'} onChange={handleChange} /> Off
              </div>
              </div>
              <button className="limitsSubmit" type="submit">RUN</button>
            </form>
        </div>
    );
}

export default LimitForm;

