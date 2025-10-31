import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// EXAMPLE

// Dimensions and margins
const margin = {top: 80, right: 150, bottom: 70, left: 100};
const width = 700 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#heatmap")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

// Mock data - correlation matrix or time series
const mockData = [
  {day: "Monday", hour: "9am", value: 15},
  {day: "Monday", hour: "12pm", value: 45},
  {day: "Monday", hour: "3pm", value: 35},
  {day: "Monday", hour: "6pm", value: 55},
  {day: "Tuesday", hour: "9am", value: 20},
  {day: "Tuesday", hour: "12pm", value: 50},
  {day: "Tuesday", hour: "3pm", value: 40},
  {day: "Tuesday", hour: "6pm", value: 60},
  {day: "Wednesday", hour: "9am", value: 25},
  {day: "Wednesday", hour: "12pm", value: 65},
  {day: "Wednesday", hour: "3pm", value: 55},
  {day: "Wednesday", hour: "6pm", value: 70},
  {day: "Thursday", hour: "9am", value: 30},
  {day: "Thursday", hour: "12pm", value: 70},
  {day: "Thursday", hour: "3pm", value: 60},
  {day: "Thursday", hour: "6pm", value: 75},
  {day: "Friday", hour: "9am", value: 35},
  {day: "Friday", hour: "12pm", value: 80},
  {day: "Friday", hour: "3pm", value: 70},
  {day: "Friday", hour: "6pm", value: 85},
  {day: "Saturday", hour: "9am", value: 10},
  {day: "Saturday", hour: "12pm", value: 40},
  {day: "Saturday", hour: "3pm", value: 30},
  {day: "Saturday", hour: "6pm", value: 50},
  {day: "Sunday", hour: "9am", value: 5},
  {day: "Sunday", hour: "12pm", value: 30},
  {day: "Sunday", hour: "3pm", value: 25},
  {day: "Sunday", hour: "6pm", value: 45}
];

// // Load mock data
function loadData() {
  return Promise.resolve(mockData);
}

loadData()
  .then(function(data) {
    // Get unique days and hours
    const days = Array.from(new Set(data.map(d => d.day)));
    const hours = Array.from(new Set(data.map(d => d.hour)));
    
    // X scale
    const x = d3.scaleBand()
      .domain(hours)
      .range([0, width])
      .padding(0.05);
    
    // Y scale
    const y = d3.scaleBand()
      .domain(days)
      .range([0, height])
      .padding(0.05);
    
    // Color scale
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateYlOrRd)
      .domain([0, d3.max(data, d => d.value)]);
    
    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("font-size", "12px");
    
    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style("font-size", "12px");
    
    // X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 20)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Time of Day");
    
    // Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Day of Week");
    
    // Draw heatmap cells
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", d => x(d.hour))
        .attr("y", d => y(d.day))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => colorScale(d.value))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("stroke", "#000")
            .attr("stroke-width", 2);
          
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.day} at ${d.hour}</strong><br/>Traffic: ${d.value}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1);
          
          tooltip.style("opacity", 0);
        });
    
    // Add color legend
    const legendWidth = 20;
    const legendHeight = 200;
    
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, ${(height - legendHeight) / 2})`);
    
    // Create gradient for legend
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
    
    // Create gradient stops
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const offset = (i / numStops) * 100;
      const value = (i / numStops) * d3.max(data, d => d.value);
      linearGradient.append("stop")
        .attr("offset", `${offset}%`)
        .attr("stop-color", colorScale(value));
    }
    
    // Draw legend rectangle
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .attr("stroke", "#333")
      .attr("stroke-width", 1);
    
    // Add legend scale
    const legendScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([legendHeight, 0]);
    
    const legendAxis = d3.axisRight(legendScale)
      .ticks(5);
    
    legend.append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .selectAll("text")
        .style("font-size", "10px");
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Website Traffic Heatmap by Day and Time");
  })
  .catch(function(error) {
    console.error("Error loading heatmap data:", error);
  });
