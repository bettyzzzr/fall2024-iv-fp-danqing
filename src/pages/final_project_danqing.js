import React, { useState } from 'react';
import GridBaseHeatmap from '../components/GridBaseHeatmap';
import PieChart from '../components/PieChart';
import LineChart from '../components/LineChart';
import finalProjectConfig from './final_project_danqing';

const FinalProject = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const handleGridClick = (country, year) => {
    setSelectedCountry(country);
    setSelectedYear(year);
  };

  const getPieData = (country, year) => {
    // Replace with logic to fetch pie chart data for a specific country and year
    return {};
  };

  const getLineData = (country) => {
    // Replace with logic to fetch line chart data for a specific country
    return [];
  };

  const getAveragePieData = () => {
    // Replace with logic to fetch global average pie data
    return {};
  };

  const getGlobalLineData = () => {
    // Replace with logic to fetch global line chart data
    return [];
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%' }}>
      {/* Heatmap Section */}
      <div
        style={{
          width: finalProjectConfig.layout.gridBaseHeatmap.width,
          height: finalProjectConfig.layout.gridBaseHeatmap.height,
        }}
      >
        <GridBaseHeatmap onGridClick={handleGridClick} />
      </div>

      {/* Right-Side Charts Section */}
      <div
        style={{
          width: finalProjectConfig.layout.pieChart.width,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Pie Chart (Top Half) */}
        <div
          style={{
            height: finalProjectConfig.layout.pieChart.height,
          }}
        >
          <PieChart
            data={selectedCountry && selectedYear ? getPieData(selectedCountry, selectedYear) : getAveragePieData()}
            year={selectedYear}
          />
        </div>

        {/* Line Chart (Bottom Half) */}
        <div
          style={{
            height: finalProjectConfig.layout.lineChart.height,
          }}
        >
          <LineChart
            data={selectedCountry ? getLineData(selectedCountry) : getGlobalLineData()}
            country={selectedCountry}
          />
        </div>
      </div>
    </div>
  );
};

export default FinalProject;