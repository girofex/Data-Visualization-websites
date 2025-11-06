import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var margin = {top: 30, right: 30, bottom: 80, left: 100},
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("#boxplot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

const csv = [
  { name: "Mexico", path: "./resources/plots/mexico.csv" },
  { name: "Ukraine-Russia", path: "./resources/plots/ukraine_russia.csv" },
  { name: "Israel-Palestine", path: "./resources/plots/israel_palestine.csv" }
];

Promise.all(csv.map(file => 
  d3.csv(file.path).then(data => ({ name: file.name, data }))
))
.then(function(datasets) {
  var sumstat = datasets.map(dataset => {
    const values = dataset.data.map(d => +d.POPULATION_EXPOSURE).sort(d3.ascending);
    
    //25th percentile
    const q1 = d3.quantile(values, 0.25);
    //75th percentile
    const q3 = d3.quantile(values, 0.75);
    const interQuantileRange = q3 - q1;

    const median = d3.quantile(values, 0.5);
    const min = d3.min(values);
    const max = d3.max(values);
    
    return {
      key: dataset.name,
      value: { q1, median, q3, interQuantileRange, min, max }
    };
  });

  //X scale
  var x = d3.scaleBand()
    .range([ 0, width ])
    .domain(datasets.map(d => d.name))
    .paddingInner(1)
    .paddingOuter(.5)

  //X axis
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "Fira Sans");

  const allValues = datasets.flatMap(d => d.data.map(row => +row.POPULATION_EXPOSURE));
  const yMin = d3.min(allValues);
  const yMax = d3.max(allValues);
  
  //Y scale
  var y = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);

  //Y axis
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

  //Vertical line
  svg
    .selectAll("vertLines")
    .data(sumstat)
    .enter()
    .append("line")
      .attr("x1", function(d){return(x(d.key))})
      .attr("x2", function(d){return(x(d.key))})
      .attr("y1", function(d){return(y(d.value.min))})
      .attr("y2", function(d){return(y(d.value.max))})
      .attr("stroke", "#102542")
      .style("width", 40)

  //Main box
  var boxWidth = 100

  svg
    .selectAll("boxes")
    .data(sumstat)
    .enter()
    .append("rect")
        .attr("x", function(d){return(x(d.key)-boxWidth/2)})
        .attr("y", function(d){return(y(d.value.q3))})
        .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))})
        .attr("width", boxWidth )
        .attr("stroke", "#102542")
        .style("fill", "#69b3a2")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("opacity", 0.7);

          const formattedNumbers = [d3.format(",")(d.value.min).replace(/,/g, "."),
            d3.format(",")(d.value.q1).replace(/,/g, "."),
            d3.format(",")(d.value.median).replace(/,/g, "."),
            d3.format(",")(d.value.q3).replace(/,/g, "."),
            d3.format(",")(d.value.max).replace(/,/g, ".")];
            
            tooltip
              .style("opacity", 1)
              .html(`<strong>${d.key}</strong><br/>
                Min: ${formattedNumbers[0]}<br/>
                25th percentile: ${formattedNumbers[1]}<br/>
                Median: ${formattedNumbers[2]}<br/>
                75th percentile: ${formattedNumbers[3]}<br/>
                Max: ${formattedNumbers[4]}`);
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

  //Median
  svg
    .selectAll("medianLines")
    .data(sumstat)
    .enter()
    .append("line")
      .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
      .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
      .attr("y1", function(d){return(y(d.value.median))})
      .attr("y2", function(d){return(y(d.value.median))})
      .attr("stroke", "#102542")
      .style("width", 80)
  });

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