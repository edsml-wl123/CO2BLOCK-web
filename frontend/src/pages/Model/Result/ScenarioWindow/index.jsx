// created by Wenxin Li, github name wl123
import React, { useEffect,useState } from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';


const ScenarioWindow = ({ wellNum, wellRadius, distance, injectionRate, timeDuration, correction, totalCO2Storage, onClose }) => {
    useEffect(() => {
      // Open a new window to display maximum storage scenario
      const newWindow = window.open('', 'MaxStorageScenario', 'width=700,height=450');
      const newDocument = newWindow.document;
  
      // Create a root element for React to render the component into
      const rootElement = newDocument.createElement('div');
      rootElement.id = 'scenario-root';
      newDocument.body.appendChild(rootElement);
  
      // Apply some basic styles to the new document
      const styleElement = newDocument.createElement('style');
      styleElement.innerHTML = `
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          overflow: hidden;
        }

        .circle-grid {
          position: relative;
          width: 700px;
          height: 450px;
          background-color: #87CEEB; 
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        .circle {
          position: absolute;
          background-color: red;
          border-radius: 50%;
          transform: translate(-50%, -50%);
        }
        .line {
          position: absolute;
          background-color: black;
        }
        .distance{
          position:absolute;
          transform: translate(-50%, -100%);
          font-weight: 600;
        }
        .info-box {
          position: absolute;
          top: 18%;
          right: 3%;
          background-color: #87CEEB;
          padding: 10px;
          border-radius: 5px;
          border: 1px solid black;
          font-size: 15px;
        }`;
      newDocument.head.appendChild(styleElement);
  
      ReactDOM.render(
        <Scenario
          wellNum={wellNum}
          wellRadius={wellRadius}
          distance={distance}
          injectionRate={injectionRate}
          timeDuration={timeDuration}
          correction={correction}
          totalCO2Storage={totalCO2Storage}
        />,
        rootElement
      );
      newWindow.addEventListener('beforeunload', onClose);
  
      // Cleanup when component unmounts or window is closed
      return () => {
        newWindow.removeEventListener('beforeunload', onClose);
        //newWindow.close();
      };
    }, [wellNum, wellRadius, distance, injectionRate, timeDuration, correction, totalCO2Storage, onClose]);
    return null;
  };

  
  
const Scenario = ({ wellNum, wellRadius, distance, injectionRate, timeDuration, correction, totalCO2Storage }) => {
    // Set the state maximum storage scenario
    const [scenario, setScenario] = useState({
        wellNum:wellNum,
        wellRadius:wellRadius,
        wellDistance:distance,
        injRate:injectionRate,
        injTime:timeDuration,
        correction: correction,
        maxStorage:totalCO2Storage
    })
    // Set layout of wells
    const [grid, setGrid] = useState({
        rowGrid:Math.floor(Math.sqrt(wellNum)), 
        colGrid: Math.ceil(Math.sqrt(wellNum))});

    let wellPositions=[];
    for (let row = 0; row < grid.rowGrid; row++) {
      for (let col = 0; col < grid.colGrid; col++) {
        wellPositions.push({ 
            top: grid.rowGrid===1?`50%`:`${(row / (grid.rowGrid - 1)) * 75 * grid.rowGrid/grid.colGrid+15}%`, 
            left: grid.colGrid===1?`30%`:`${(col / (grid.colGrid - 1)) * 50+6}%` });
      }
    }
    console.log(grid, wellPositions);


    // Adjust of line weights and size of circles according to nuumber of wells
    const getLineWidth = (rowGrid) => {
      if (rowGrid > 40) return '0.5px';
      if (rowGrid > 15) return '1px';
      if (rowGrid > 10) return '1.5px';
      if (rowGrid > 5) return '2px';
      if (rowGrid > 3) return '3.5px';
      return '4px';
    };
    const lineWidth=getLineWidth(grid.rowGrid);

    const getCircleDiameter = (rowGrid) =>{
      if (rowGrid>30) return '2px';
      if (rowGrid>17) return '3px';
      return `${50/rowGrid}px`
    }
    const circleDiameter = getCircleDiameter(grid.rowGrid);

    
    const range = (start, end) => {
        const array = [];
        for (let i = start; i < end; i++) {
            array.push(i);
        }
        return array;
    };


  return (
    <div className="circle-grid">
      {grid.colGrid>1 ? 
        range(0, grid.rowGrid).map((_, index) =>(
          <div
            className="line"
            style={{ top: wellPositions[index*grid.colGrid].top, 
            left: wellPositions[0].left, width:'50%', 
            height: lineWidth }}
          ></div>
      )) : ''}
      {grid.rowGrid>1 ? 
        range(0, grid.colGrid).map((_, index) =>(
          <div
            className="line"
            style={{ top:wellPositions[0].top, 
            left: wellPositions[index].left, 
            width: lineWidth, 
            height:`${75*grid.rowGrid/grid.colGrid}%` }}
          ></div>
      )):''}
      {grid.colGrid>1 ? 
          <div
            className="distance"
            style={{ top:`${wellPositions[0].top}`, 
            left: `${parseFloat(wellPositions[0].left.slice(0,-1))/2+parseFloat(wellPositions[1].left.slice(0,-1))/2}%`,
            fontSize: grid.rowGrid>4?grid.rowGrid>10?'6px':'13px':'18px'
            }}
          >{scenario.wellDistance}m</div>
       : ''}

      {wellPositions.map((pos, index) => (
        <div
          key={index}
          className="circle"
          style={{ top: pos.top, left: pos.left, 
            width: circleDiameter, 
            height: circleDiameter }}
        ></div>
      ))}       

      <div className="info-box">
        <p><strong>Well number:</strong> {scenario.wellNum}</p>
        <p><strong>Interwell distance:</strong> {scenario.wellDistance}m</p>
        <p><strong>Correction:</strong> {scenario.correction}</p>
        <p><strong>Well radius:</strong> {scenario.wellRadius}m</p>
        <p><strong>Time duration:</strong> {scenario.injTime} yr</p>
        <p><strong>Max flow rate:</strong> {scenario.injRate.toFixed(7)} Mt/yr</p>
        <p><strong>Total storage:</strong> {scenario.maxStorage.toFixed(7)} Gton</p>
      </div>
    </div>
  );
};


export default ScenarioWindow;
