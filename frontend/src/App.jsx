// created by Wenxin Li, github name wl123

import React, { Component }from 'react'
import { Route, Routes, NavLink, Navigate} from 'react-router-dom';
import InputForm from './pages/EnterInputs/InputForm';
import FileUploader from './pages/EnterInputs/FileUploader';
import {readExcelFile, readReservoirData} from './utils/readData.js';
import Map from './pages/Map';
import Model from './pages/Model';
import Optimize from './pages/Optimize'
import Help from './pages/Help';
import './App.css'


class App extends Component{
    // State of model inputs
    state = { 
      activeModule: 'Map',
      inputs: {
        name: '',
        domainType: 'open',
        minDepth: '',
        meanDepth: '', 
        thickness: '',
        area:'',  
        meanPermeability: '',
        meanPorosity: '',  
        // Optional Inputs
        rockCompressibility: '',
        waterCompressibility: '',
        co2Density: '',
        co2Viscosity: '',
        waterViscosity: '',
        porePressure: '',
        meanPressure: '',
        meanTemperature: '',
        brineSalinity: '',
        principalStress: '',
        stressRatio: '',
        frictionCoefficient: '',
        cohesion: '',       
        tensileStrength: ''
      },
      selectedReservoir:null,
    };

    // Receive data from children components
    handleDataFromChild = (data) => {
        this.setState(data);
    };


    // Set state when the active module is changed
    handleModuleChange = (module) => {
      if (module !== this.state.activeModule) {
        if (module==='enter-inputs'){
          this.setState({ 
            activeModule: module,
            inputs: {  // clear previous inputs 
              name: '', domainType: 'open', minDepth: '', meanDepth: '', thickness: '', area:'',  
              meanPermeability: '', meanPorosity: '', rockCompressibility: '', waterCompressibility: '',
              co2Density: '', co2Viscosity: '', waterViscosity: '', porePressure: '', meanPressure: '',
              meanTemperature: '', brineSalinity: '', principalStress: '', stressRatio: '',  
              frictionCoefficient: '', cohesion: '', tensileStrength: '' 
            }
          });
        }
        else{
          this.setState({ activeModule: module });
        }
      }
    };


    render() {
        return (
          <div className="menu">
            <aside>
              {/* Navigator bar */}
              <nav className='nav'>
                <NavLink className={({ isActive }) => {
                  if (isActive) {
                    this.handleModuleChange('map');
                  }
                  return isActive ? 'nav-link-active' : 'nav-link';
                  }} to="/map">Map</NavLink> <br/><br/><br/>
                 
                <NavLink className={({ isActive }) => {
                  if (isActive) {
                    this.handleModuleChange('enter-inputs');
                  }
                  return isActive ? 'nav-link-active' : 'nav-link';
                }} to="/enter-inputs">Enter Inputs</NavLink> <br/><br/><br/>

                <NavLink className={({ isActive }) => {
                  if (isActive) {
                    this.handleModuleChange('model');
                  }
                  return isActive ? 'nav-link-active' : 'nav-link';
                }} to="/model">Model</NavLink> <br/><br/><br/>
                 
                <NavLink className={({ isActive }) => {
                  if (isActive) {
                    this.handleModuleChange('optimize');
                  }
                  return isActive ? 'nav-link-active' : 'nav-link';
                  }} to="/optimize">Optimize</NavLink> <br/><br/><br/>
                 
                <NavLink className={({ isActive }) => {
                  if (isActive) {
                   this.handleModuleChange('help');
                  }
                  return isActive ? 'nav-link-active' : 'nav-link';
                  }} to="/help">Help</NavLink> <br/><br/><br/>
              </nav>
            </aside>
            {/* Main area rendered by different components according to routes */}
            <main className={this.state.activeModule==='model'||this.state.activeModule==='optimize' ? 'gray-main':'blue-main'}>
              <Routes>
                <Route path="/" element={<Navigate to="/map" />} />
                <Route path="/map" element={<Map parentState={this.state} sendDataToParent={this.handleDataFromChild}
                 readData={readReservoirData}/>}/>
                <Route path='/enter-inputs' element={
                  <>
                  <FileUploader accept=".xlsx,.xls" readFile={readExcelFile} 
                   parentState={this.state} sendDataToParent={this.handleDataFromChild}/>
                  <InputForm parentState={this.state} sendDataToParent={this.handleDataFromChild}/>
                  </>
                }/>
                <Route path="/model" element={<Model inputsRoute={null} enteredInputs={null} selectedReservoir={null}/>}/>
                <Route path="/model/enter-inputs" element={<Model inputsRoute='enter-inputs' 
                 enteredInputs={this.state.inputs} selectedReservoir={null}/>}/>
                <Route path="/model/map/:reservoirID" element={<Model inputsRoute='map'
                 enteredInputs={null} selectedReservoir={this.state.selectedReservoir}/>}/>
                <Route path="/optimize/outputs" element={<Optimize readOutputs={true} accept=".xlsx,.xls" />}/>
                <Route path="/optimize" element={<Optimize readOutputs={false} accept=".xlsx,.xls" />}/>
                <Route path="/help" element={<Help/>}/>
                <Route path="/*" element={<Map parentState={this.state} sendDataToParent={this.handleDataFromChild}/>} />
              </Routes>
            </main>
          </div>
        );
      }
    }
    

export default App;
