// created by Wenxin Li, github name wl123
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';
import axios from 'axios';
import './index.css';


const InputForm = ({ parentState, sendDataToParent }) => {
  const [inputs, setInputs] = useState(parentState.inputs); // State to manage form inputs
  const [errors, setErrors] = useState(''); // State to manage validation errors


  // Handle input change events
  const handleChange = (event) => {
      const { name, value } = event.target;

      if(name === 'domainType') {
          if(event.target.checked) {
              setInputs((prevInputs) => ({
                  ...prevInputs,
                  domainType: value,
              }));
          }
      } else {
          setInputs((prevInputs) => ({
              ...prevInputs,
              [name]: value,
          }));
      }
  };

  // Update inputs when parentState changes
  useEffect(() => {
      setInputs(parentState.inputs);
  }, [parentState]);

  const navigate = useNavigate(); // Initialize navigation hook

  // Handle form submission
  const handleSubmit = async (event) => {
      event.preventDefault(); // Prevent default form submission behavior
      if (validateInputs()) { // Validate inputs before submitting
          console.log('Form Submitted');
          try {
              // POST request to save inputs
              const response = await axios.post(`/api/save-inputs`, inputs);
              console.log('Backend response:', response.data);
          } catch (error) {
              console.error('Error:', error);
          }

          // Update parent state with current inputs
          const newParentState = {
              ...parentState,
              inputs: inputs
          };
          sendDataToParent(newParentState); // Send updated state to parent
          navigate('/model/enter-inputs'); // Navigate to another route
      }
  };

  // Validate form inputs
  const validateInputs = () => {
      let isValid = true;
      let newErrors = '';
      for(const field in inputs) {
          if (field === 'name' || field === 'domainType') continue;

          if (inputs[field] != null && inputs[field] !== '') {
              const value = parseFloat(inputs[field]);
              if (isNaN(value) || value < 0) {
                  newErrors += `The field ${field} must be a non-negative number;\n`;
                  isValid = false;
              }
          }
      }
      if (newErrors !== errors) {
          setErrors(newErrors);
      } else {
          if (errors !== '') alert(errors);
      }
      return isValid;
  };

  // Alert errors if they change
  useEffect(() => {
      if (errors !== '') alert(errors);
  }, [errors]);


  return (
      <form onSubmit={handleSubmit} className='enterInputs'>
        <h2>Required Inputs</h2>
        
        <div className="form-group">
          <label>Minimum depth (m):</label>
          <input type="text" className='inputs' name="minDepth" required={true} value={inputs.minDepth} onChange={handleChange}/>
          <label>Mean depth (m):</label>
          <input type="text" className='inputs' name="meanDepth" required={true} value={inputs.meanDepth} onChange={handleChange}/>
          <label>Thickness (m):</label>
          <input type="text" className='inputs' name="thickness" required={true} value={inputs.thickness} onChange={handleChange}/>
        </div>

        <div className="form-group">
          <label>Mean porosity:</label>
          <input type="text" className='inputs' name="meanPorosity" required={true} value={inputs.meanPorosity} onChange={handleChange}/>
          <label>Mean permeability (mD):</label>
          <input type="text" className='inputs' name="meanPermeability" required={true} value={inputs.meanPermeability} onChange={handleChange}/>
          <label>Area (km2):</label>
          <input type="text" className='inputs' name="area" required={true} value={inputs.area} onChange={handleChange}/>
          <label>Domain type:</label>
          <div className='radio-group'>
            <input id='open' type='radio' name='domainType' value='open' 
            checked={inputs.domainType.toLowerCase() === 'open'} onChange={handleChange} /> Open
            <input id='closed' type='radio' name='domainType' value='closed'
            checked={inputs.domainType.toLowerCase() === 'closed'} onChange={handleChange} /> Closed
          </div>
        </div>

        <h2 id='optionalInputs'>Optional Inputs</h2>
        <div className="form-group">
          <label>Rock compressibility (/MPa):</label>
          <input type="text" className='inputs' name="rockCompressibility" value={inputs.rockCompressibility} onChange={handleChange}/>
          <label style={{fontSize:'14px'}}>Water compressibility (/MPa):</label>
          <input type="text" className='inputs' name="waterCompressibility" value={inputs.waterCompressibility} onChange={handleChange}/>
          <label>CO2 density (ton/m3):</label>
          <input type="text" className='inputs' name="co2Density" value={inputs.co2Density} onChange={handleChange}/>
        </div>
        <div className="form-group">
          <label>Mean pressure (MPa):</label>
          <input type="text" className='inputs' name="meanPressure" value={inputs.meanPressure} onChange={handleChange}/>
          <label>Brine salinity (ppm):</label>
          <input type="text" className='inputs' name="brineSalinity" value={inputs.brineSalinity} onChange={handleChange}/>
          <label>Pore pressure (MPa):</label>
          <input type="text" className='inputs' name="porePressure" value={inputs.porePressure} onChange={handleChange}/>
        </div>
        <div className="form-group">
          <label>Principal stress:</label>
          <input type="text" className='inputs' name="principalStress" value={inputs.principalStress} onChange={handleChange}/>
          <label>Water viscosity (cp):</label>
          <input type="text" className='inputs' name="waterViscosity" value={inputs.waterViscosity} onChange={handleChange}/>
          <label>CO2 viscosity (cp):</label>
          <input type="text" className='inputs' name="co2Viscosity" value={inputs.co2Viscosity} onChange={handleChange}/>
        </div>
        <div className="form-group">    
          <label>Temperature (C):</label>
          <input type="text" className='inputs' name="meanTemperature" value={inputs.meanTemperature} onChange={handleChange}/>
          <label>Stress ratio:</label>
          <input type="text" className='inputs' name="stressRatio" value={inputs.stressRatio} onChange={handleChange}/>
          <label>Cohesion:</label>
          <input type="text" className='inputs' name="cohesion" value={inputs.cohesion} onChange={handleChange}/>
        </div>
        <div className="form-group">
          <label>Friction coefficient:</label>
          <input type="text" className='inputs' name="frictionCoefficient" value={inputs.frictionCoefficient} onChange={handleChange}/>
          <label>Tensile strength:</label>
          <input type="text" className='inputs' name="tensileStrength" value={inputs.tensileStrength} onChange={handleChange}/>
          <label></label>
          <button className="inputsSubmit" type="submit">CO2BLOCK</button>
        </div>
     
      </form>
  );
};

export default InputForm;
  