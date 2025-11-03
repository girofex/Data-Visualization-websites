import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var margin = {top: 30, right: 30, bottom: 80, left: 100},
    width = 700 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var svg = d3.select("#barchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

d3.csv("./resources/plots/bar_data.csv")
  .then(function(data) {
    //X axis
    var x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(function(d) { return d.Region; }))
      .padding(0.2);
      
    svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
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

    //Y axis
    var y = d3.scaleLinear()
      .domain([0, 500000])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style("font-family", "Fira Sans");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text("Total occurrences");

    //Bars
    svg.selectAll("mybar")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.Region); })
        .attr("y", function(d) { return y(d.TotalEvents); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.TotalEvents); })
        .attr("fill", "#69b3a2")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("opacity", 0.7);
        
          tooltip
            .style("opacity", 1)
            .html(`<strong>Total Events</strong>: ${d.TotalEvents}`);
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
  })

  .catch(function(error) {
    console.error("Error loading the data:", error);
});