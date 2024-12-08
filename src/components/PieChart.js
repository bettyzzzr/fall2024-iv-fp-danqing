import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const PieChart = ({ data, year }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;

    // Process data
    const pieData = Object.keys(data).map((key) => ({
      label: key,
      value: data[key],
    }));

    // Set up chart dimensions
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    svg.selectAll('*').remove(); // Clear previous chart

    const g = svg.append('g').attr('transform', `translate(${width / 2}, ${height / 2})`);

    // Create pie generator
    const pie = d3.pie().value((d) => d.value);
    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    // Define color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create pie slices
    g.selectAll('path')
      .data(pie(pieData))
      .join('path')
      .attr('d', arc)
      .attr('fill', (d) => color(d.data.label))
      .on('mouseover', (event, d) => {
        const tooltip = d3.select('#pie-tooltip');
        tooltip
          .style('visibility', 'visible')
          .text(`${d.data.label}: ${d.data.value} (${((d.data.value / d3.sum(pieData.map((d) => d.value))) * 100).toFixed(2)}%)`)
          .style('top', `${event.pageY}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', () => {
        d3.select('#pie-tooltip').style('visibility', 'hidden');
      });
  }, [data]);

  return (
    <div style={{ position: 'relative' }}>
      <h3>CO2 Emission Breakdown ({year || 'Global Average'})</h3>
      <svg ref={svgRef}></svg>
      <div
        id="pie-tooltip"
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

export default PieChart;