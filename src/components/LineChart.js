import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ data, country }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data) return;

    // Set chart dimensions
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 60, bottom: 40, left: 60 };

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);

    svg.selectAll('*').remove(); // Clear previous chart

    // Scales
    const xScale = d3.scaleLinear().domain([2003, 2023]).range([margin.left, width - margin.right]);
    const yScaleLeft = d3.scaleLinear().domain(d3.extent(data, (d) => d.co2)).range([height - margin.bottom, margin.top]);
    const yScaleRight = d3.scaleLinear().domain(d3.extent(data, (d) => d.gdp)).range([height - margin.bottom, margin.top]);

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));
    const yAxisLeft = d3.axisLeft(yScaleLeft);
    const yAxisRight = d3.axisRight(yScaleRight);

    svg.append('g').attr('transform', `translate(0, ${height - margin.bottom})`).call(xAxis);
    svg.append('g').attr('transform', `translate(${margin.left}, 0)`).call(yAxisLeft);
    svg.append('g').attr('transform', `translate(${width - margin.right}, 0)`).call(yAxisRight);

    // Line generators
    const co2Line = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScaleLeft(d.co2));

    const gdpLine = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScaleRight(d.gdp));

    // Add lines
    svg.append('path')
      .datum(data)
      .attr('d', co2Line)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', 2);

    svg.append('path')
      .datum(data)
      .attr('d', gdpLine)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', 2);

    // Tooltip
    svg
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => xScale(d.year))
      .attr('cy', (d) => yScaleLeft(d.co2))
      .attr('r', 5)
      .attr('fill', 'blue')
      .on('mouseover', (event, d) => {
        const tooltip = d3.select('#line-tooltip');
        tooltip
          .style('visibility', 'visible')
          .text(`Year: ${d.year}, CO2: ${d.co2}, GDP: ${d.gdp}`)
          .style('top', `${event.pageY}px`)
          .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', () => {
        d3.select('#line-tooltip').style('visibility', 'hidden');
      });
  }, [data]);

  return (
    <div style={{ position: 'relative' }}>
      <h3>{country || 'Global Average'}: CO2 and GDP Trends</h3>
      <svg ref={svgRef}></svg>
      <div
        id="line-tooltip"
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

export default LineChart;