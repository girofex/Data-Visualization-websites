import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// EXAMPLE

// Dimensions and margins
const margin = {top: 30, right: 150, bottom: 70, left: 60};
const width = 700 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#stackedbarchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

// Mock data 
const mockData = [
  {quarter: "Q1", Electronics: 120, Clothing: 80, Food: 95, Furniture: 60},
  {quarter: "Q2", Electronics: 150, Clothing: 90, Food: 110, Furniture: 75},
  {quarter: "Q3", Electronics: 180, Clothing: 105, Food: 125, Furniture: 85},
  {quarter: "Q4", Electronics: 200, Clothing: 120, Food: 140, Furniture: 95}
];

// Categories and colors
const categories = ["Electronics", "Clothing", "Food", "Furniture"];
const colors = d3.scaleOrdinal()
  .domain(categories)
  .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]);

// Load mock data
function loadData() {
  return Promise.resolve(mockData);
}

loadData()
  .then(function(data) {
    // Stack the data
    const stack = d3.stack()
      .keys(categories);
    
    const stackedData = stack(data);
    
    // X scale
    const x = d3.scaleBand()
      .domain(data.map(d => d.quarter))
      .range([0, width])
      .padding(0.3);
    
    // Y scale
    const maxY = d3.max(stackedData, layer => d3.max(layer, d => d[1]));
    const y = d3.scaleLinear()
      .domain([0, maxY])
      .nice()
      .range([height, 0]);
    
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
    
    // Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Sales (in thousands)");
    
    // Create groups for each stack layer
    const layers = svg.selectAll(".layer")
      .data(stackedData)
      .enter()
      .append("g")
        .attr("class", "layer")
        .attr("fill", d => colors(d.key));
    
    // Draw rectangles
    layers.selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
        .attr("x", d => x(d.data.quarter))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {
          const category = d3.select(this.parentNode).datum().key;
          const value = d[1] - d[0];
          
          d3.select(this)
            .attr("opacity", 0.7);
          
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.data.quarter} - ${category}</strong><br/>Value: ${value}k`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("opacity", 1);
          
          tooltip.style("opacity", 0);
        });
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, 0)`);
    
    const legendItems = legend.selectAll(".legend-item")
      .data(categories)
      .enter()
      .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);
    
    legendItems.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => colors(d));
    
    legendItems.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .text(d => d);
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Quarterly Sales by Category");
  })
  .catch(function(error) {
    console.error("Error loading stacked bar chart data:", error);
  });
