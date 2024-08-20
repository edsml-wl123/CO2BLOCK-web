// created by Wenxin Li, github name wl123
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Circle} from 'react-leaflet';
import Control from 'react-leaflet-custom-control';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import _ from 'lodash';
import colorBar from '../../pic/colorBar.png';
import notice from '../../pic/notice-icon.png'
import noticeDetail from '../../pic/notice-detail.png'


const Map = ({ parentState, sendDataToParent, readData })=>{
  // Custom marker icon
  const customIcon = new L.Icon({
    iconUrl: require('../../pic/marker-icon.png'),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],  // Position of the popup relative to the icon anchor
  });

  
  const [reservoirs, setReservoirs] = useState([]);
  const [heatMap, setHeatMap] = useState(false);

  // States to handle hover effects
  const [hovered1, setHovered1] = useState(false);
  const [hovered2, setHovered2] = useState(false);
  const [hovered3, setHovered3] = useState(false);
  const [hovered4, setHovered4] = useState(false);


  const fetchData = async () => {
    try {
      const response = await axios.get(`/api/reservoirs`);
      setReservoirs(response.data);
      console.log('Get reservoirs data from backend', reservoirs[0])
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

  useEffect(() => {
    fetchData();
  }, []); // Empty dependency array ensures this runs once when the component mounts


  const navigate = useNavigate();
  // Navigate to Model page when button is clicked
  const goToModel= async(site) => {
    try {
      const inputs = readData(site);
      console.log(inputs);
      const response = await axios.post(`/api/save-inputs`, inputs);
      console.log('Backend reponse:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }

    // Send parameters of selected reservoir to parent component
    const newParentState = {
      ...parentState,
      activeModule: 'model',
      selectedReservoir: site
    };
    sendDataToParent(newParentState);
    navigate(`/model/map/${site['ETI ID']}`);
  }


  const goToHeatMap = ()=>{
    setHeatMap(true);
  }
  const goBack = ()=>{
    setHeatMap(false);
  }


  // Get color and size of circle according to theoretical capacity and area size
  const getColor = (co2) => {
    return co2 > 4000 ? '#A90001' :
           co2 > 3000 ? '#A70001' :
           co2 > 2500 ? '#BD0026' :
           co2 > 2000 ? '#E31A1C' :
           co2 > 1500 ? '#F44336' :
           co2 > 1000 ? '#FF7043' : 
           co2 > 500  ? '#FFA726' : 
           co2 > 0    ? '#FFCC80' : 
                        '#FFEDA0';
  };
  const getRadius = (area) => {
    let r= Math.sqrt(area/3.14);
    if (r<10) r*=2;
    return r*1000;
  };



  return (
    <MapContainer center={[57.5, 1.16]} zoom={6} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {heatMap? 
        reservoirs.map(site => (
        <Circle
        key={site['ETI ID']}
        center={[site['lat'],site['lon']]}
        radius={getRadius(site['Area (km^2)'])}
        color={getColor(site['Theoretical capacity [Mton]'])}
        opacity={0.3}
        weight={1.5}
        fillColor={getColor(site['Theoretical capacity [Mton]'])}
        fillOpacity={0.55}
      >
        <Marker key={site['ETI ID']} position={[site['lat'], site['lon']]} icon={customIcon}>
          <Tooltip direction="top" offset={[0, -15]}>
              <span style={{fontWeight:'bold'}}>Unit name:</span> {site['Unit name']} <br/>
              <span style={{fontWeight:'bold'}}>ETI ID:</span> {site['ETI ID']} <br/>
              <span style={{fontWeight:'bold'}}>Formation name:</span> {site['formation name']} <br/>
              <span style={{fontWeight:'bold'}}>Area:</span> {site['geographic area']} <br/>
              <span style={{fontWeight:'bolder'}}>Theoretical capacity (Mton): {site['Theoretical capacity [Mton]']}</span> 
          </Tooltip>

          <Popup>
            <div style={{background:'rgb(128,128,128,0.35)', padding:'10px', borderRadius: '8px'}}>
            <span style={{fontWeight:'bold'}}>Unit name:</span> {site['Unit name']} <br/>
            <span style={{fontWeight:'bold'}}>ETI ID:</span> {site['ETI ID']} <br/>
            <span style={{fontWeight:'bold'}}>Formation name:</span> {site['formation name']} <br/>
            <span style={{fontWeight:'bold'}}>Geographic area:</span> {site['geographic area']} <br/>
            <span style={{fontWeight:'bold'}}>Domain type:</span> {site['domain type']} <br/>
            <span style={{fontWeight:'bold'}}>Depth (m):</span> {site['depth - shallowest (m)']} (shallowest), {site['depth - mean (m)']} (mean) <br/>
            <span style={{fontWeight:'bold'}}>Area (km^2):</span> {site['Area (km^2)']} <br/>
            <span style={{fontWeight:'bold'}}>Thickness (m):</span> {site['thick (m)']} <br/>
            <span style={{fontWeight:'bold'}}>Permeability (mD):</span> {site['perm (mD)']} <br/>
            <span style={{fontWeight:'bold'}}>Porosity:</span> {site['porosity']} <br/>
            <span style={{fontWeight:'bold'}}>Rock compressibility (MPa^-1):</span> {site['rock compr [MPa^-1]']} <br/>
            <span style={{fontWeight:'bold'}}>Water compressibility (MPa^-1):</span> {site['water compr [MPa^-1]']} <br/>
            <span style={{fontWeight:'bold'}}>CO2 density (ton/m3):</span> {site['CO2 density [ ton/m3]']} <br/>
            <span style={{fontWeight:'bold'}}>CO2 viscosity (cp):</span> {site[' CO2 viscosity [cp]']} <br/>
            <span style={{fontWeight:'bold'}}>Water viscosity (cp):</span> {site['water viscosity [cp]']} <br/>
            <span style={{fontWeight:'bold'}}>Mean pressure (Mpa):</span> {site['pressure_mean [Mpa]']} <br/>
            <span style={{fontWeight:'bold'}}>Mean temperature (C):</span> {site['temperature_mean [C] ']} <br/>
            <span style={{fontWeight:'bold'}}>Brine salinity (ppm):</span> {site['salinity [ppm]']} <br/>
            <span style={{fontWeight:'bold'}}>Pore pressure shallow (Mpa):</span> {site['pore pressure shallow depth [MPa]']} <br/>
            <span style={{fontWeight:'bold'}}>Lithostatic pressure (MPa):</span> {site['lithostatic pressure  [MPa]']} <br/>
            <span style={{fontWeight:'bold'}}>Stress ratio:</span> {site['stress ratio']} <br/>
            <span style={{fontWeight:'bolder'}}>Theoretical capacity (Mton): {site['Theoretical capacity [Mton]']}</span> <br/>
            
            <button onClick={() => goToModel(site)} 
              onMouseEnter={() => setHovered1(true)} onMouseLeave={() => setHovered1(false)}
              style={{marginTop:'8px', marginLeft:'30%',backgroundColor: hovered1?'#7f8183':'#9b9ea1', color: '#333', border: 'none',borderRadius:'40px',padding: '12px 10px',
                fontSize: '15px',fontWeight: 'bolder',textAlign: 'center',cursor: 'pointer',transition: 'background-color 0.3s, box-shadow 0.3s',
                outline: 'none',position: 'relative',boxShadow:hovered1?'2px 4px 8px rgba(0, 0, 0, 0.1)':'none'}}>CO2BLOCK</button>
            </div>      
          </Popup>
        </Marker>
        </Circle>))

      :

      reservoirs.map(site => (
        <Marker key={site['ETI ID']} position={[site['lat'], site['lon']]} icon={customIcon}>
          <Tooltip direction="top" offset={[0, -15]}>
              <span style={{fontWeight:'bold'}}>Unit name:</span> {site['Unit name']} <br/>
              <span style={{fontWeight:'bold'}}>ETI ID:</span> {site['ETI ID']} <br/>
              <span style={{fontWeight:'bold'}}>Formation name:</span> {site['formation name']} <br/>
              <span style={{fontWeight:'bold'}}>Area:</span> {site['geographic area']} <br/>
          </Tooltip>

          <Popup>
            <div style={{background:'rgb(128,128,128,0.35)', padding:'10px', borderRadius: '8px'}}>
            <span style={{fontWeight:'bold'}}>Unit name:</span> {site['Unit name']} <br/>
            <span style={{fontWeight:'bold'}}>ETI ID:</span> {site['ETI ID']} <br/>
            <span style={{fontWeight:'bold'}}>Formation name:</span> {site['formation name']} <br/>
            <span style={{fontWeight:'bold'}}>Geographic area:</span> {site['geographic area']} <br/>
            <span style={{fontWeight:'bold'}}>Domain type:</span> {site['domain type']} <br/>
            <span style={{fontWeight:'bold'}}>Depth (m):</span> {site['depth - shallowest (m)']} (shallowest), {site['depth - mean (m)']} (mean) <br/>
            <span style={{fontWeight:'bold'}}>Area (km^2):</span> {site['Area (km^2)']} <br/>
            <span style={{fontWeight:'bold'}}>Thickness (m):</span> {site['thick (m)']} <br/>
            <span style={{fontWeight:'bold'}}>Permeability (mD):</span> {site['perm (mD)']} <br/>
            <span style={{fontWeight:'bold'}}>Porosity:</span> {site['porosity']} <br/>
            <span style={{fontWeight:'bold'}}>Rock compressibility (MPa^-1):</span> {site['rock compr [MPa^-1]']} <br/>
            <span style={{fontWeight:'bold'}}>Water compressibility (MPa^-1):</span> {site['water compr [MPa^-1]']} <br/>
            <span style={{fontWeight:'bold'}}>CO2 density (ton/m3):</span> {site['CO2 density [ ton/m3]']} <br/>
            <span style={{fontWeight:'bold'}}>CO2 viscosity (cp):</span> {site[' CO2 viscosity [cp]']} <br/>
            <span style={{fontWeight:'bold'}}>Water viscosity (cp):</span> {site['water viscosity [cp]']} <br/>
            <span style={{fontWeight:'bold'}}>Mean pressure (Mpa):</span> {site['pressure_mean [Mpa]']} <br/>
            <span style={{fontWeight:'bold'}}>Mean temperature (C):</span> {site['temperature_mean [C] ']} <br/>
            <span style={{fontWeight:'bold'}}>Brine salinity (ppm):</span> {site['salinity [ppm]']} <br/>
            <span style={{fontWeight:'bold'}}>Pore pressure shallow (Mpa):</span> {site['pore pressure shallow depth [MPa]']} <br/>
            <span style={{fontWeight:'bold'}}>Lithostatic pressure (MPa):</span> {site['lithostatic pressure  [MPa]']} <br/>
            <span style={{fontWeight:'bold'}}>Stress ratio:</span> {site['stress ratio']} <br/>
            {/* <span style={{fontWeight:'bolder'}}>Theoretical capacity (Mton): {site['Theoretical capacity [Mton]']}</span> <br/> */}
            
            <button onClick={() => goToModel(site)} 
              onMouseEnter={() => setHovered1(true)} onMouseLeave={() => setHovered1(false)}
              style={{marginTop:'8px', marginLeft:'30%',backgroundColor: hovered1?'#7f8183':'#9b9ea1', color: '#333', border: 'none',borderRadius:'40px',padding: '12px 10px',
                fontSize: '15px',fontWeight: 'bolder',textAlign: 'center',cursor: 'pointer',transition: 'background-color 0.3s, box-shadow 0.3s',
                outline: 'none',position: 'relative',boxShadow:hovered1?'2px 4px 8px rgba(0, 0, 0, 0.1)':'none'}}>CO2BLOCK</button>
            </div>      
          </Popup>
        </Marker>))}
      
      
      <Control position="bottomright">
        <button onClick={goToHeatMap} onMouseEnter={() => setHovered2(true)} onMouseLeave={() => setHovered2(false)}
        style={{ display:!heatMap?'inline':'none', pointerEvents:!heatMap?'auto':'none',
          cursor: 'pointer', padding: '10px', color:'#3D3D3D', fontSize:'15px', fontWeight:'bold',
          backgroundColor: hovered2?'rgb(150,150,150,0.8)':'rgb(180,180,180,0.8)', border: 'none', borderRadius: '10px' }}>
          Overall CO2<br/>Storage
        </button>
      </Control>

      <Control position="bottomright">
        <button onClick={goBack} onMouseEnter={() => setHovered3(true)} onMouseLeave={() => setHovered3(false)}
        style={{ display:heatMap?'inline':'none', pointerEvents:heatMap?'auto':'none',
          cursor: 'pointer', padding: '10px', color:'#3D3D3D', fontSize:'18px', fontWeight:'bold',
          backgroundColor: hovered3?'rgb(150,150,150,0.8)':'rgb(180,180,180,0.8)', border: 'none', borderRadius: '10px' }}>
          Back
        </button>
      </Control>

      <Control position='topright'>
        <img src={colorBar} alt="Color Bar"
          style={{
            display:heatMap?'inline':'none',
            marginTop: '10px', marginRight:'5px', width: '50px', height: '365px'  
          }}
      />
      </Control>

      <Control position='topleft'>
      <div style={{
        display: heatMap ? 'inline-block' : 'none',
        position: 'relative', width: '330px',
        marginTop: '10px', marginLeft: '0px'
      }}>
      <img src={hovered4 ? noticeDetail : notice} alt="Notice"
        style={{ width: '100%', pointerEvents: 'none' }}
      />
      <div
        style={{
          position: 'absolute', top: '0%', left: '0%', width: '10%', height: '20%', 
          pointerEvents: 'auto', backgroundColor: 'rgba(255, 255, 255, 0)'
        }}
        onMouseEnter={() => setHovered4(true)} onMouseLeave={() => setHovered4(false)}
      ></div>
    </div>
        
      </Control>      
    </MapContainer>
  );
}

export default Map;