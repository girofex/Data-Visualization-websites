import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// EXAMPLE

// Dimensions and margins
const margin = {top: 30, right: 150, bottom: 70, left: 60};
const width = 700 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#groupedbarchart")
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
  {region: "North", Product_A: 85, Product_B: 92, Product_C: 78},
  {region: "South", Product_A: 95, Product_B: 88, Product_C: 85},
  {region: "East", Product_A: 78, Product_B: 95, Product_C: 90},
  {region: "West", Product_A: 90, Product_B: 82, Product_C: 88},
  {region: "Central", Product_A: 82, Product_B: 90, Product_C: 92}
];

// Products and colors
const products = ["Product_A", "Product_B", "Product_C"];
const colors = d3.scaleOrdinal()
  .domain(products)
  .range(["#3498db", "#e74c3c", "#2ecc71"]);

// // Load mock data
function loadData() {
  return Promise.resolve(mockData);
}

loadData()
  .then(function(data) {
    // X0 scale (for groups)
    const x0 = d3.scaleBand()
      .domain(data.map(d => d.region))
      .range([0, width])
      .padding(0.2);
    
    // X1 scale (for bars within groups)
    const x1 = d3.scaleBand()
      .domain(products)
      .range([0, x0.bandwidth()])
      .padding(0.05);
    
    // Y scale
    const maxY = d3.max(data, d => d3.max(products, key => d[key]));
    const y = d3.scaleLinear()
      .domain([0, maxY])
      .nice()
      .range([height, 0]);
    
    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
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
      .text("Sales Performance");
    
    // Create groups for each region
    const regionGroups = svg.selectAll(".region-group")
      .data(data)
      .enter()
      .append("g")
        .attr("class", "region-group")
        .attr("transform", d => `translate(${x0(d.region)},0)`);
    
    // Draw bars for each product within each region
    regionGroups.selectAll("rect")
      .data(d => products.map(key => ({key: key, value: d[key], region: d.region})))
      .enter()
      .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => colors(d.key))
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("opacity", 0.7);
          
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.region} - ${d.key.replace('_', ' ')}</strong><br/>Value: ${d.value}`)
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
      .data(products)
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
      .text(d => d.replace('_', ' '));
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .text("Regional Product Performance Comparison");
  })
  .catch(function(error) {
    console.error("Error loading grouped bar chart data:", error);
  });
