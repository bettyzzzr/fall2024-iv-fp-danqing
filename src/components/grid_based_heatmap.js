import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import heatmapConfig from './grid_base_heatmap.json'; // Import JSON configuration
import data from '../../data.csv'; // Path to the CSV file

const GridBaseHeatmap = () => {
  const svgRef = useRef();
  const [valueField, setValueField] = useState(heatmapConfig.value_field); // Dropdown selection
  const [shape, setShape] = useState('square'); // Default shape is square

  useEffect(() => {
    // Load and process data, then render heatmap
    d3.csv(data).then((csvData) => {
      const filteredData = preprocessData(csvData, heatmapConfig);
      renderHeatmap(filteredData, svgRef, heatmapConfig, valueField, shape);
    });
  }, [valueField, shape]);

  const preprocessData = (csvData, config) => {
    // Filter the top 15 countries based on the latest year
    const latestYear = config.year_range[1];
    const topCountries = csvData
      .filter((d) => +d.year === latestYear)
      .sort((a, b) => b[config.size_field] - a[config.size_field])
      .slice(0, config.top_countries)
      .map((d) => d[config.y_axis]);

    return csvData.filter((d) => topCountries.includes(d[config.y_axis]));
  };

  const renderHeatmap = (data, svgRef, config, valueField, shape) => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 40, left: 100 };

    svg.selectAll('*').remove(); // Clear existing content

    const years = d3.range(config.year_range[0], config.year_range[1] + 1);
    const countries = [...new Set(data.map((d) => d[config.y_axis]))];

    // Scales
    const xScale = d3.scaleBand().domain(years).range([margin.left, width - margin.right]).padding(0.1);
    const yScale = d3.scaleBand().domain(countries).range([margin.top, height - margin.bottom]).padding(0.1);
    const colorScale = d3.scaleLinear().domain(d3.extent(data, (d) => +d[valueField])).range(['white', config.color]);
    const sizeScale = d3.scaleSqrt().domain(d3.extent(data, (d) => +d[config.size_field])).range([5, xScale.bandwidth() / 2]);

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale);

    svg.append('g').attr('transform', `translate(0, ${height - margin.bottom})`).call(xAxis);
    svg.append('g').attr('transform', `translate(${margin.left}, 0)`).call(yAxis);

    // Heatmap elements
    svg
      .selectAll(shape === 'square' ? 'rect' : 'circle')
      .data(data)
      .join(shape === 'square' ? 'rect' : 'circle')
      .attr(
        'x',
        (d) => (shape === 'square' ? xScale(+d[config.x_axis]) : xScale(+d[config.x_axis]) + xScale.bandwidth() / 2)
      )
      .attr(
        'y',
        (d) => (shape === 'square' ? yScale(d[config.y_axis]) : yScale(d[config.y_axis]) + yScale.bandwidth() / 2)
      )
      .attr('width', (d) => (shape === 'square' ? sizeScale(+d[config.size_field]) * 2 : null))
      .attr('height', (d) => (shape === 'square' ? sizeScale(+d[config.size_field]) * 2 : null))
      .attr('cx', (d) => (shape === 'circle' ? xScale(+d[config.x_axis]) + xScale.bandwidth() / 2 : null))
      .attr('cy', (d) => (shape === 'circle' ? yScale(d[config.y_axis]) + yScale.bandwidth() / 2 : null))
      .attr('r', (d) => (shape === 'circle' ? sizeScale(+d[config.size_field]) : null))
      .attr('fill', (d) => colorScale(+d[valueField]))
      .on('mouseover', (e, d) => {
        const tooltip = d3.select('#tooltip');
        tooltip
          .style('visibility', 'visible')
          .text(
            `${d[config.y_axis]} (${d[config.x_axis]}): CO2 Emissions = ${d[config.size_field]}, ${valueField} = ${d[valueField]}`
          )
          .style('top', `${e.pageY}px`)
          .style('left', `${e.pageX + 10}px`);
      })
      .on('mouseout', () => {
        d3.select('#tooltip').style('visibility', 'hidden');
      });
  };

  return (
    <div style={{ position: 'relative' }}>
      <div>
        <label htmlFor="valueField">Select Data for Color: </label>
        <select id="valueField" onChange={(e) => setValueField(e.target.value)} value={valueField}>
          <option value="population">Population</option>
          <option value="gdp">GDP</option>
        </select>
        <label htmlFor="shape">Select Shape: </label>
        <select id="shape" onChange={(e) => setShape(e.target.value)} value={shape}>
          <option value="square">Square</option>
          <option value="circle">Circle</option>
        </select>
      </div>
      <svg ref={svgRef}></svg>
      <div
        id="tooltip"
        style={{
          position: 'absolute',
          background: 'lightgray',
          padding: '5px',
          borderRadius: '3px',
          visibility: 'hidden',
          pointerEvents: 'none',
        }}
      ></div>
    </div>
  );
};

export default GridBaseHeatmap;