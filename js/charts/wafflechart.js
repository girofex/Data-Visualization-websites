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

//Data
const data = [
  {category: "Protests", value: 35, color: "#1f77b4"},
  {category: "Riots", value: 25, color: "#f87060"},
  {category: "Battles", value: 20, color: "#69b3a2"},
  {category: "Violence against civilians", value: 15, color: "#d62728"},
  {category: "Explosions/Remote violence", value: 5, color: "#9467bd"}
];

function loadData() {
  return Promise.resolve(data);
}

loadData()
  .then(function(data) {
    //Cells
    let cells = [];
    let cellIndex = 0;
    data.forEach(d => {
      for (let i = 0; i < d.value; i++) {
        cells.push({
          category: d.category,
          color: d.color,
          value: d.value,
          index: cellIndex++
        });
      }
    });
    
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
            .html(`<strong>${d.category}</strong><br/>Value: ${d.value}%`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("opacity", 1);
          
          tooltip.style("opacity", 0);
        });
    
    //Legend
    const legendHeight = 200;
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, ${(height - legendHeight) / 2})`);
    
    data.forEach((d, i) => {
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
    
    /*Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top + 20)
      .attr("text-anchor", "start")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text("Title");
    */
  })
  .catch(function(error) {
    console.error("Error loading waffle chart data:", error);
  });