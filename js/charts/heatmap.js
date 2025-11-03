import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const margin = {top: 80, right: 185, bottom: 70, left: 200};
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
    
    //X axis
    svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "Fira Sans")
      .style("text-anchor", "middle")
      .each(function(d) {
          const text = d3.select(this);
          text.text("");

          const spaced = d.replace(/([a-z])([A-Z])/g, '$1 $2');
          const parts = spaced.split("/");

          parts.forEach((part, i) => {
            text.append("tspan")
              .attr("x", 0)
              .attr("dy", i === 0 ? "0.8em" : "1.2em")
              .text(part.trim())
              .text(i < parts.length - 1 ? part + "," : part);
          });
      });
    
    //Y scale
    const y = d3.scaleBand()
      .domain(eventTypes)
      .range([0, height]);
    
    //Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans");
    
    //Color scale
    const colorScale = d3.scaleSequential()
      .interpolator(d3.interpolateYlOrRd)
      .domain([0, d3.max(data, d => d.value)]);
    
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
          
          const spaced = d.region.replace(/([a-z])([A-Z])/g, "$1 $2");
          const parts = spaced.split("/").map(part => part.trim());
          const formattedRegion = parts.join(", ");

          const formattedNumber = d3.format(",.0f")(d.value).replace(/,/g, ".");
        
          tooltip
            .style("opacity", 1)
            .html(`<strong>${d.eventType}</strong><br/>${formattedRegion}<br/>Mean: ${formattedNumber}`);
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
      .attr("class", "legend-title")
      .attr("x", legendWidth / 2 + 65)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text("Mean Population Exposure");
    
    const initialTheme = document.body.classList.contains("body-mode");
    window.updateHeatMapTheme(initialTheme);
    
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
      .ticks(5)
      .tickFormat(d => d3.format(",.0f")(d).replace(/,/g, "."));
    
    legend.append("g")
      .attr("transform", `translate(${legendWidth}, 0)`)
      .call(legendAxis)
      .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans");
  })

  .catch(function(error) {
    console.error("Error loading the data:", error);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/

window.updateHeatMapTheme = function(isDarkMode) {
  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? "#102542" : "#ebe7e6")
      .style("color", isDarkMode ? "#ebe7e6" : "#102542")
      .style("border", `1px solid ${isDarkMode ? "#ebe7e6" : "#102542"}`);
  }
  
  const legendTitle = d3.select("#heatmap .legend-title");
  if (!legendTitle.empty())
      legendTitle.style("fill", isDarkMode ? "#ebe7e6" : "#102542");
};