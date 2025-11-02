import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const margin = {top: 80, right: 150, bottom: 70, left: 200};
const width = 700 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#heatmap")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

//Data
const data = [
  {day: "Protests", hour: "9am", value: 15},
  {day: "Protests", hour: "12pm", value: 45},
  {day: "Protests", hour: "3pm", value: 35},
  {day: "Protests", hour: "6pm", value: 55},
  {day: "Riots", hour: "9am", value: 20},
  {day: "Riots", hour: "12pm", value: 50},
  {day: "Riots", hour: "3pm", value: 40},
  {day: "Riots", hour: "6pm", value: 60},
  {day: "Battles", hour: "9am", value: 25},
  {day: "Battles", hour: "12pm", value: 65},
  {day: "Battles", hour: "3pm", value: 55},
  {day: "Battles", hour: "6pm", value: 70},
  {day: "Violence against civilians", hour: "9am", value: 30},
  {day: "Violence against civilians", hour: "12pm", value: 70},
  {day: "Violence against civilians", hour: "3pm", value: 60},
  {day: "Violence against civilians", hour: "6pm", value: 75},
  {day: "Explosions/Remote violence", hour: "9am", value: 35},
  {day: "Explosions/Remote violence", hour: "12pm", value: 80},
  {day: "Explosions/Remote violence", hour: "3pm", value: 70},
  {day: "Explosions/Remote violence", hour: "6pm", value: 85},
  {day: "Saturday", hour: "9am", value: 10},
  {day: "Saturday", hour: "12pm", value: 40},
  {day: "Saturday", hour: "3pm", value: 30},
  {day: "Saturday", hour: "6pm", value: 50},
  {day: "Sunday", hour: "9am", value: 5},
  {day: "Sunday", hour: "12pm", value: 30},
  {day: "Sunday", hour: "3pm", value: 25},
  {day: "Sunday", hour: "6pm", value: 45}
];

function loadData() {
  return Promise.resolve(data);
}

loadData()
.then(function(data) {
    const days = Array.from(new Set(data.map(d => d.day)));
    const hours = Array.from(new Set(data.map(d => d.hour)));
    
    //X scale
    const x = d3.scaleBand()
      .domain(hours)
      .range([0, width]);
    
    //Y scale
    const y = d3.scaleBand()
      .domain(days)
      .range([0, height]);
    
    //Color scale
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateYlOrRd)
      .domain([0, d3.max(data, d => d.value)]);
    
    //X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans");
    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 20)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text("Region");

    //Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text("Event");
    
    //Cells
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", d => x(d.hour))
        .attr("y", d => y(d.day))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => colorScale(d.value))
        .attr("stroke", "#ebe7e6")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("opacity", 0.7);
          
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.day} at ${d.hour}</strong><br/>Traffic: ${d.value}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this)
            .attr("opacity", 1);
          
          tooltip.style("opacity", 0);
        });
    
    //Legend
    const legendWidth = 20;
    const legendHeight = 200;
    
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, ${(height - legendHeight) / 2})`);
    
    const defs = svg.append("defs");
    const linearGradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");
    
    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      const offset = (i / numStops) * 100;
      const value = (i / numStops) * d3.max(data, d => d.value);
      linearGradient.append("stop")
        .attr("offset", `${offset}%`)
        .attr("stop-color", colorScale(value));
    }
    
    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .attr("stroke", "#333")
      .attr("stroke-width", 1);
    
    const legendScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([legendHeight, 0]);
    
    const legendAxis = d3.axisRight(legendScale)
      .ticks(5);
    
    legend.append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .selectAll("text")
        .style("font-size", "10px")
        .style("font-family", "Fira Sans");
    
    /*Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text("Title");
    */
  })

.catch(function(error) {
  console.error("Error loading heatmap data:", error);
});