import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const margin = {top: 80, right: 150, bottom: 70, left: 200};
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#heatmap")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

d3.csv("./resources/plots/heatmap_data.csv")
  .then(function(rawData) {
    const data = [];
    const regions = ["Africa", "Asia/Pacific", "Europe/CentralAsia", "LatinAmerica/Caribbean", "MiddleEast", "US/Canada"];

    rawData.forEach(row => {
      regions.forEach(region => {
        data.push({
          eventType: row.EVENT_TYPE,
          region: region,
          value: +row[region]
        });
      });
    });
    
    const eventTypes = Array.from(new Set(data.map(d => d.eventType)));
    
    //X scale
    const x = d3.scaleBand()
      .domain(regions)
      .range([0, width]);
    
    //Y scale
    const y = d3.scaleBand()
      .domain(eventTypes)
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
        .style("font-family", "Fira Sans")
        .style("text-anchor", "middle")
        .each(function(d) {
          var text = d3.select(this);
          var parts = d.split("/");
          text.text("");
          
          parts.forEach(function(part, i) {
            text.append("tspan")
              .attr("x", 0)
              .attr("dy", i === 0 ? "0.8em" : "1.1em")
              .text(i < parts.length - 1 ? part + "," : part);
          });
        });
    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 15)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab");

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
      .style("font-family", "Roboto Slab");
    
    //Cells
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", d => x(d.region))
        .attr("y", d => y(d.eventType))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => colorScale(d.value))
        .attr("stroke", "#ebe7e6")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("opacity", 0.7);
        
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.eventType}</strong><br/>${d.region}<br/>Events: ${d.value}`);
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
    
    //Legend
    const legendWidth = 20;
    const legendHeight = 200;
    
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, ${(height - legendHeight) / 2})`);
    
    legend.append("text")
      .attr("x", legendWidth / 2 + 50)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text("Population Exposure");
    
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
      .attr("stroke", "#102542")
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
    console.error("Error loading the data:", error);
});

/*Data
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
*/