import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import heatmapConfig from './grid_base_heatmap.json';

const dataUrl =
  'https://raw.githubusercontent.com/bettyzzzr/fall2024-iv-final-project-data/refs/heads/main/15%E5%9B%BD%E7%A2%B3%E6%8E%92%E6%94%BE.csv';

const GridBaseHeatmap = () => {
  const svgRef = useRef();
  const [valueField, setValueField] = useState(heatmapConfig.value_field); // Dropdown selection
  const [shape, setShape] = useState('square'); // Default shape is square

  useEffect(() => {
    // Load and process data from the remote URL, then render heatmap
    d3.csv(dataUrl).then((csvData) => {
      const filteredData = preprocessData(csvData, heatmapConfig);
      renderHeatmap(filteredData, svgRef, heatmapConfig, valueField, shape);
    });
  }, [valueField, shape]);

  const preprocessData = (csvData, config) => {
    // Filter the top 15 countries based on the latest year
    const latestYear = config.year_range[1];
    const topCountries = csvData
      .filter((d) => +d.year === latestYear)
      .sort((a, b) => +b[config.value_field] - +a[config.value_field])
      .slice(0, 15);

    return topCountries;
  };

  const renderHeatmap = (data, svgRef, config, valueField, shape) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous rendering

    const { width, height, margin, grid_size, colors } = config;

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.country))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.year))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    const colorScale = d3
      .scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(data, (d) => +d[valueField])]);

    svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.country))
      .attr('y', (d) => y(d.year))
      .attr('width', grid_size)
      .attr('height', grid_size)
      .attr('fill', (d) => colorScale(+d[valueField]));
  };

  return (
    <div>
      <h1>Grid-Based Heatmap</h1>
      <div>
        <label>
          Value Field:
          <select value={valueField} onChange={(e) => setValueField(e.target.value)}>
            {Object.keys(heatmapConfig.fields).map((field) => (
              <option key={field} value={field}>
                {heatmapConfig.fields[field]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div>
        <label>
          Shape:
          <select value={shape} onChange={(e) => setShape(e.target.value)}>
            <option value="square">Square</option>
            <option value="circle">Circle</option>
          </select>
        </label>
      </div>
      <svg
        ref={svgRef}
        width={heatmapConfig.width}
        height={heatmapConfig.height}
      ></svg>
    </div>
  );
};

export default GridBaseHeatmap;
