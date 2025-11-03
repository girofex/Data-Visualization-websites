import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const margin = {top: 80, right: 250, bottom: 70, left: 100};
const width = 700 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;
const cellSize = 30;
const cellPadding = 3;
const cols = 10;

const svg = d3.select("#wafflechart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

// Create dropdown menu container
const menuContainer = d3.select("#wafflechart")
  .insert("div", "svg")
  .style("margin-bottom", "20px");

menuContainer.append("label")
  .text("Select Region: ")
  .style("font-family", "Roboto Slab")
  .style("font-weight", "bold")
  .style("margin-right", "10px");

const dropdown = menuContainer.append("select")
  .attr("id", "region-select")
  .style("padding", "5px")
  .style("font-family", "Fira Sans")
  .style("font-size", "14px");

// Define colors for each category
const categoryColors = {
  "Battles (%)": "#1f77b4",
  "Explosions/Remote violence (%)": "#f87060",
  "Violence against civilians (%)": "#69b3a2",
  "Protests (%)": "#d62728",
  "Riots (%)": "#9467bd"
};

d3.csv("./resources/plots/waffle_data.csv")
  .then(function(rawData) {
    // Get unique regions
    const regions = rawData.map(d => d.Region);
    
    // Populate dropdown
    dropdown.selectAll("option")
      .data(regions)
      .enter()
      .append("option")
      .text(d => d)
      .attr("value", d => d);
    
    // Function to update waffle chart
    function updateWaffle(selectedRegion) {
      // Find the row for selected region
      const regionRow = rawData.find(d => d.Region === selectedRegion);
      
      if (!regionRow) return;
      
      // Transform row data into array format
      const categories = Object.keys(categoryColors);
      const regionData = categories.map(category => ({
        category: category,
        value: +regionRow[category] || 0,
        color: categoryColors[category]
      }));
      
      // Create cells array
      let cells = [];
      let cellIndex = 0;
      regionData.forEach(d => {
        for (let i = 0; i < d.value; i++) {
          cells.push({
            category: d.category,
            color: d.color,
            value: d.value,
            index: cellIndex++
          });
        }
      });
      
      // Clear existing rectangles and legend
      svg.selectAll("rect").remove();
      svg.selectAll(".legend").remove();
      
      // Draw waffle cells
      svg.selectAll("rect")
        .data(cells)
        .enter()
        .append("rect")
          .attr("width", cellSize - cellPadding)
          .attr("height", cellSize - cellPadding)
          .attr("x", d => (d.index % cols) * cellSize)
          .attr("y", d => Math.floor(d.index / cols) * cellSize)
          .attr("fill", d => d.color)
          .attr("stroke", "#ebe7e6")
          .attr("stroke-width", 1)
          .attr("rx", 2)
          .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("opacity", 0.7);
            
            tooltip
              .style("opacity", 1)
              .html(`<strong>${d.category}</strong><br/>Value: ${d.value}%`);
          })
          .on("mousemove", function(event, d) {
            tooltip
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 10) + "px");
          })
          .on("mouseout", function() {
            d3.select(this)
              .attr("opacity", 1);
            
            tooltip.style("opacity", 0);
          });
      
      // Draw legend
      const legendHeight = regionData.length * 25;
      const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 20}, ${(height - legendHeight) / 2})`);
      
      regionData.forEach((d, i) => {
        const legendRow = legend.append("g")
          .attr("transform", `translate(0, ${i * 25})`);
        
        legendRow.append("rect")
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", d.color)
          .attr("stroke-width", 1)
          .attr("rx", 2);
        
        legendRow.append("text")
          .attr("x", 20)
          .attr("y", 12)
          .style("font-size", "14px")
          .style("font-family", "Fira Sans")
          .text(`${d.category} (${d.value}%)`);
      });
    }
    
    // Initial render with first region
    updateWaffle(regions[0]);
    
    // Update on dropdown change
    dropdown.on("change", function() {
      updateWaffle(this.value);
    });
  })
  .catch(function(error) {
    console.error("Error loading waffle chart data:", error);
  });