import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const margin = {top: 30, right: 195, bottom: 70, left: 60};
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
const categories = ["ViolentDemonstrations", "PeacefulProtests"];
const colors = d3.scaleOrdinal()
  .domain(categories)
  .range(["#f87060", "#69b3a2"]);

d3.csv("resources/plots/sectionone/stacked_bar_data.csv")
  .then(function(data) {
    const stack = d3.stack()
      .keys(categories);
    
    const stackedData = stack(data);
    
    //X scale
    const x = d3.scaleBand()
      .domain(data.map(d => d.Region))
      .range([0, width])
      .padding(0.3);
    
    //X axis
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
    
    //Y scale
    const maxY = d3.max(stackedData, layer => d3.max(layer, d => d[1]));
    const y = d3.scaleLinear()
      .domain([0, maxY])
      .nice()
      .range([height, 0]);
    
    // Y axis
    const yAxis = d3.axisLeft(y)
      .tickValues([0, 20, 40, 60, 80, 100]) // exclude 110
      .tickFormat(d => d + "%");

    svg.append("g")
      .call(d3.axisLeft(y))
      .call(yAxis)
      .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans");
    
    //Groups
    const layers = svg.selectAll(".layer")
      .data(stackedData)
      .enter()
      .append("g")
        .attr("class", "layer")
        .attr("fill", d => colors(d.key));
    
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
          const spaced = subgroupName.replace(/([a-z])([A-Z])/g, "$1 $2");
          const formattedValue = d3.format(",.0f")(subgroupValue).replace(/,/g, ".");
        
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.data.Region} - ${spaced}</strong><br/>Value: ${formattedValue}%`);
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
      .attr("class", "legendText")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-family", "Fira Sans")
      .text(d => {
        let spaced = d.replace(/([a-z])([A-Z])/g, '$1 $2');
        return spaced.trim();
      });
    
    const initialTheme = document.body.classList.contains("body-mode");
    window.updateStackedBarChartTheme(initialTheme);
  })
  
  .catch(function(error) {
    console.error("Error loading stacked bar chart data:", error);
  });

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/

window.updateStackedBarChartTheme = function(isDarkMode) {
  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? "#102542" : "#ebe7e6")
      .style("color", isDarkMode ? "#ebe7e6" : "#102542")
      .style("border", `1px solid ${isDarkMode ? "#ebe7e6" : "#102542"}`);
  }
  
  const legendText = d3.selectAll("#stackedbarchart .legendText");
  if (!legendText.empty())
    legendText.style("fill", isDarkMode ? "#ebe7e6" : "#102542");
};