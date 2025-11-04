import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var margin = {top: 30, right: 30, bottom: 80, left: 100},
    width = 800 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var svg = d3.select("#boxplot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

//DATA
var data = [12,19,11,13,12,22,13,4,15,16,18,19,20,12,11,9]
var data_sorted = data.sort(d3.ascending)
var q1 = d3.quantile(data_sorted, .25)
var median = d3.quantile(data_sorted, .5)
var q3 = d3.quantile(data_sorted, .75)
var interQuantileRange = q3 - q1
var min = q1 - 1.5 * interQuantileRange
var max = q1 + 1.5 * interQuantileRange

//Y axis
var y = d3.scaleLinear()
.domain([0, 24])
.range([height, 0]);

svg.append("g")
  .call(d3.axisLeft(y))
  .selectAll("text")
    .style("font-size", "12px")
    .style("font-family", "Fira Sans");

svg.append("text")
  .attr("class", "yAxisTitle")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - height / 2)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("font-size", "12px")
  .style("font-weight", "bold")
  .style("font-family", "Roboto Slab")
  .text("Total occurrences");

var center = 200
var width = 100

//Vertical line
svg.append("line")
  .attr("x1", center)
  .attr("x2", center)
  .attr("y1", y(min) )
  .attr("y2", y(max) )
  .attr("stroke", "black")

//Box
svg
.append("rect")
  .attr("x", center - width/2)
  .attr("y", y(q3) )
  .attr("height", (y(q1)-y(q3)) )
  .attr("width", width )
  .attr("stroke", "black")
  .style("fill", "#69b3a2")
  .on("mouseover", function(event, d) {
    d3.select(this)
      .attr("opacity", 0.7);
  
    tooltip
      .style("opacity", 1)
      .html(`<strong>Total Occurrences</strong>`);
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

//Min, median, max
svg
.selectAll("toto")
.data([min, median, max])
.enter()
.append("line")
  .attr("x1", center-width/2)
  .attr("x2", center+width/2)
  .attr("y1", function(d){ return(y(d))} )
  .attr("y2", function(d){ return(y(d))} )
  .attr("stroke", "black")

//const initialTheme = document.body.classList.contains("body-mode");
//window.updateBoxPlotTheme(initialTheme);

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/

/*
window.updateBoxPlotTheme = function(isDarkMode) {
  const axisTitle = d3.selectAll("#boxplot .yAxisTitle");
  if (!axisTitle.empty())
    axisTitle.style("fill", isDarkMode ? "#ebe7e6" : "#102542");

  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? "#102542" : "#ebe7e6")
      .style("color", isDarkMode ? "#ebe7e6" : "#102542")
      .style("border", `1px solid ${isDarkMode ? "#ebe7e6" : "#102542"}`);
  }
};
*/