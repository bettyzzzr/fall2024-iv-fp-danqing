import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const dataUrl =
  'https://raw.githubusercontent.com/bettyzzzr/fall2024-iv-final-project-data/refs/heads/main/15%E5%9B%BD%E7%A2%B3%E6%8E%92%E6%94%BE.csv';

const GridBaseHeatmap = ({ onGridClick }) => {
  const svgRef = useRef();
  const [valueField, setValueField] = useState('population'); // Default field for color encoding

  useEffect(() => {
    // Load and process data from the provided URL, then render the heatmap
    d3.csv(dataUrl).then((csvData) => {
      const processedData = preprocessData(csvData);
      renderHeatmap(processedData, svgRef, valueField, onGridClick);
    });
  }, [valueField]);

  const preprocessData = (data) => {
    // Ensure the data is parsed and filtered correctly
    const latestYear = d3.max(data, (d) => +d.year);
    const topCountries = data
      .filter((d) => +d.year === latestYear)
      .sort((a, b) => b.co2_emissions - a.co2_emissions)
      .slice(0, 15)
      .map((d) => d.country);

    return data.filter((d) => topCountries.includes(d.country));
  };

  const renderHeatmap = (data, svgRef, valueField, onGridClick) => {
    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 40, left: 100 };

    svg.selectAll('*').remove(); // Clear previous content

    const years = [...new Set(data.map((d) => +d.year))];
    const countries = [...new Set(data.map((d) => d.country))];

    // Scales
    const xScale = d3.scaleBand().domain(years).range([margin.left, width - margin.right]).padding(0.1);
    const yScale = d3.scaleBand().domain(countries).range([margin.top, height - margin.bottom]).padding(0.1);
    const colorScale = d3
      .scaleLinear()
      .domain(d3.extent(data, (d) => +d[valueField]))
      .range(['white', 'green']);
    const sizeScale = d3.scaleSqrt().domain(d3.extent(data, (d) => +d.co2_emissions)).range([5, xScale.bandwidth() / 2]);

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale);

    svg.append('g').attr('transform', `translate(0, ${height - margin.bottom})`).call(xAxis);
    svg.append('g').attr('transform', `translate(${margin.left}, 0)`).call(yAxis);

    // Heatmap elements
    svg
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => xScale(+d.year) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yScale(d.country) + yScale.bandwidth() / 2)
      .attr('r', (d) => sizeScale(+d.co2_emissions))
      .attr('fill', (d) => colorScale(+d[valueField]))
      .on('mouseover', (event, d) => {
        const tooltip = d3.select('#tooltip');
        tooltip
          .style('visibility', 'visible')
          .text(`${d.country} (${d.year}): CO2 = ${d.co2_emissions}, ${valueField} = ${d[valueField]}`)
          .style('top', `${event.pageY}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', () => {
        d3.select('#tooltip').style('visibility', 'hidden');
      })
      .on('click', (event, d) => {
        // Trigger parent callback with country and year
        onGridClick(d.country, +d.year);
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
      </div>
      <svg ref={svgRef} width={800} height={600}></svg>
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