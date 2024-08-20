// created by Wenxin Li, github name wl123
import * as XLSX from 'xlsx';
import _ from 'lodash';


// Read model parameters from uploaded file according to column names
function readExcelFile(file, callback){
    const reader = new FileReader();

    reader.onload = (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet)[0];
        
    const inputs_data = {
      name: searchKeyInJSON(jsonData, 'name').value,
      area: searchKeyInJSON(jsonData, 'area (km^2)').value,
      domainType: searchKeyInJSON(jsonData, 'domain').value,
      minDepth: searchKeyInJSON(jsonData, 'depth').value,
      meanDepth: searchKeyInJSON(jsonData, 'depth - mean').value,
      thickness: searchKeyInJSON(jsonData, 'thick').value,
      meanPorosity: searchKeyInJSON(jsonData, 'porosity').value,
      meanPermeability: searchKeyInJSON(jsonData, 'perm').value,
      rockCompressibility: searchKeyInJSON(jsonData, 'rock').value,
      waterCompressibility: searchKeyInJSON(jsonData, 'water comp').value,
      meanTemperature: searchKeyInJSON(jsonData, 'temperature').value,
      co2Density: searchKeyInJSON(jsonData, 'co2 density').value,
      waterViscosity: searchKeyInJSON(jsonData, 'water visco').value,
      co2Viscosity: searchKeyInJSON(jsonData, 'co2 visco').value,
      meanPressure: searchKeyInJSON(jsonData, 'pressure_mean').value,
      brineSalinity: searchKeyInJSON(jsonData, 'salinity').value,
      stressRatio: searchKeyInJSON(jsonData, 'stress ratio').value,
      cohesion: searchKeyInJSON(jsonData, 'cohesion').value,
      porePressure: searchKeyInJSON(jsonData, 'pore pressure').value,
      tensileStrength: searchKeyInJSON(jsonData, 'tensile').value,
      principalStress: searchKeyInJSON(jsonData, 'principal stress').value,
      frictionCoefficient: searchKeyInJSON(jsonData, 'friction').value,
    };

    for (let key in inputs_data) {
      if (inputs_data[key] === 'assumed' || inputs_data[key] === 'estimated') {
          inputs_data[key] = null;
      }
    }
    callback(inputs_data);
  };
  reader.readAsArrayBuffer(file);
};
  

// Read model parameters of the selected reservoir unit
function readReservoirData(selectedReservoir){
  const jsonData = _.cloneDeep(selectedReservoir);
  let inputs_data = {
    name: searchKeyInJSON(jsonData, 'unit name').value,
    area: searchKeyInJSON(jsonData, 'area (km^2)').value,
    domainType: searchKeyInJSON(jsonData, 'domain').value,
    minDepth: searchKeyInJSON(jsonData, 'depth - shallowest').value,
    meanDepth: searchKeyInJSON(jsonData, 'depth - mean').value,
    thickness: searchKeyInJSON(jsonData, 'thick').value,
    meanPorosity: searchKeyInJSON(jsonData, 'porosity').value,
    meanPermeability: searchKeyInJSON(jsonData, 'perm').value,
    rockCompressibility: searchKeyInJSON(jsonData, 'rock').value,
    waterCompressibility: searchKeyInJSON(jsonData, 'water comp').value,
    meanTemperature: searchKeyInJSON(jsonData, 'temperature').value,
    co2Density: searchKeyInJSON(jsonData, 'co2 density').value,
    waterViscosity: searchKeyInJSON(jsonData, 'water visco').value,
    co2Viscosity: searchKeyInJSON(jsonData, 'co2 visco').value,
    meanPressure: searchKeyInJSON(jsonData, 'pressure_mean').value,
    brineSalinity: searchKeyInJSON(jsonData, 'salinity').value,
    stressRatio: searchKeyInJSON(jsonData, 'stress ratio').value,
    porePressure: searchKeyInJSON(jsonData, 'pore pressure').value,
    principalStress: searchKeyInJSON(jsonData, 'lithostatic pressure').value,
    frictionCoefficient: searchKeyInJSON(jsonData, 'friction').value,
    cohesion: 0.0,
    tensileStrength: 0.0,
  };

  for (let key in inputs_data) {
    if (key==='domainType'){
      if (inputs_data[key].toLowerCase().includes('open'))
        inputs_data[key]='open'
      else
        inputs_data[key]='closed'
    }
    if (inputs_data[key] === 'assumed' || inputs_data[key] === 'estimated') {
        inputs_data[key] = null;
    }
  }
  return inputs_data;

}

// Check whether a substring is included in a string
function searchKeyInJSON(data, searchString){
  for (const key in data) {
    if (key.toLowerCase().includes(searchString)) {
      return { key, value: data[key] };
    }
  }
  return {searchString, value:null};
};


export {readExcelFile, readReservoirData};