import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var svg = d3.select("#barchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("./resources/africa_cleaned.csv")
  .then(function(data) {
    // X axis
    var x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(function(d) { return d.REGION; }))
      .padding(0.2);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    var y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);
    svg.append("g")
      .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.REGION); })
        .attr("y", function(d) { return y(d.EVENTS); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.EVENTS); })
        .attr("fill", "#69b3a2");
  })

  .catch(function(error) {
    console.error("Error loading the data:", error);
});