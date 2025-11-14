import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var margin = {top: 70, right: 30, bottom: 55, left: 110},
  width = 1000 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

const svg = d3.select("#linechart")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

d3.csv("resources/plots/sectionthree/timeline_data.csv")
  .then(function(data) {
    //X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.YEAR))
        .range([0, width]);

    const xAxis = d3.axisBottom(x)
        .ticks(7)
        .tickFormat(d3.format("d"));

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
            .style("font-size", "12px")
            .style("font-family", "Fira Sans")
            .style("text-anchor", "middle");

    //Y axis
    var y = d3.scaleLinear()
        .domain(d3.extent(data, d => d.POPULATION_EXPOSURE))
        .range([height, 0]);

    const yAxis = d3.axisLeft(y)
        .tickFormat(d => d3.format(",")(d).replace(/,/g, "."))

    svg.append("g")
        .call(yAxis)
        .selectAll("text")
            .style("font-size", "12px")
            .style("font-family", "Fira Sans");

    //Line
    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 5)
        .attr("d", d3.line()
            .x(function(d) { return x(d.YEAR) })
            .y(function(d) { return y(d.POPULATION_EXPOSURE) })
        )

    svg.append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

    //Cursor
    var bisect = d3.bisector(function(d) { return d.YEAR; }).left;

    var tooltip = svg
        .append('g')
        .append('circle')
        .style("fill", "none")
        .attr("stroke", "#ebe7e6")
        .attr('r', 8.5)
        .style("opacity", 0)

    var tooltipText = svg
        .append('g')
        .append('text')
        .style("opacity", 0)
        .attr("stroke", "#ebe7e6")
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans")

    function mouseover() {
        tooltip.style("opacity", 1)
        tooltipText.style("opacity",1)
    }

    function mousemove() {
        var x0 = x.invert(d3.pointer(event)[0]);
        var i = bisect(data, x0, 1);
        var selectedData = data[i];
        if (selectedData) {
            tooltip
                .attr("cx", x(selectedData.YEAR))
                .attr("cy", y(selectedData.POPULATION_EXPOSURE))
            tooltipText
                .html("Year: " + selectedData.YEAR + "Population exposure: " + selectedData.POPULATION_EXPOSURE)
                .attr("x", x(selectedData.YEAR) + 15)
                .attr("y", y(selectedData.POPULATION_EXPOSURE))
        }
    }

    function mouseout() {
        tooltip.style("opacity", 0)
        tooltipText.style("opacity", 0)
    }

    const initialTheme = document.body.classList.contains("body-mode");
    window.updateLineChartTheme(initialTheme);
})

.catch(function(error) {
    console.error("Error loading the data:", error);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/
window.updateLineChartTheme = function(isDarkMode) {
  const axisTitle = d3.selectAll("#barchart .yAxisTitle");
  if (!axisTitle.empty())
    axisTitle.style("fill", isDarkMode ? "#ebe7e6" : "#102542");

  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? "#102542" : "#ebe7e6")
      .style("color", isDarkMode ? "#ebe7e6" : "#102542")
      .style("border", `1px solid ${isDarkMode ? "#ebe7e6" : "#102542"}`);
  }
};