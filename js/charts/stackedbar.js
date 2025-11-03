import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const margin = {top: 30, right: 190, bottom: 70, left: 60};
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#stackedbarchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

//Categories
const categories = ["ViolentDemonstrations (%)", "PeacefulProtests (%)"];
const colors = d3.scaleOrdinal()
  .domain(categories)
  .range(["#f87060", "#69b3a2"]);

d3.csv("./resources/plots/stacked_bar_data.csv")
  .then(function(data) {
    const stack = d3.stack()
      .keys(categories);
    
    const stackedData = stack(data);
    
    // X scale
    const x = d3.scaleBand()
      .domain(data.map(d => d.Region))
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
        .style("font-size", "12px")
        .style("font-family", "Fira Sans")
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
      .attr("y", height + margin.bottom - 20)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text("Region");
    
    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans");
    
    // Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text("Protests");
    
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
        .attr("x", d => x(d.data.Region))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("opacity", 0.7);
        
          var subgroupName = d3.select(this.parentNode).datum().key;
          var subgroupValue = d.data[subgroupName];
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.data.Region} - ${subgroupName}</strong><br/>Value: ${subgroupValue}`);
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
      .style("font-family", "Fira Sans")
      .text(d => d);
    
    /*Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text("Title");
    */
  })
  .catch(function(error) {
    console.error("Error loading stacked bar chart data:", error);
  });
