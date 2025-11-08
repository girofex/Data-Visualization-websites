import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var margin = {top: 70, right: 30, bottom: 40, left: 110},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

const svg = d3.select("#ridgeline")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

d3.csv("https://raw.githubusercontent.com/zonination/perceptions/master/probly.csv")
  .then(function(data) {
    const categories = data.columns;
    const n = categories.length;

    //X scale
    const x = d3.scaleLinear()
      .domain([-10, 140])
      .range([0, width]);
    
    //X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans");

    //Y scale
    const y = d3.scaleLinear()
      .domain([0, 0.4])
      .range([height, 0]);

    //Y axis
    const y0 = d3.scaleBand()
      .domain(categories)
      .range([0, height])
      .paddingInner(1);
    
    svg.append("g")
      .call(d3.axisLeft(y0))  
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

    //Kernel density estimation
    const kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40));
    const allDensity = [];
    
    for (let i = 0; i < n; i++) {
      const key = categories[i];
      const density = kde(data.map(d => +d[key]));
      allDensity.push({key: key, density: density});
    }

    //Areas
    svg.selectAll("areas")
      .data(allDensity)
      .enter()
      .append("path")
        .attr("transform", d => `translate(0,${y0(d.key) - height})`)
        .datum(d => d.density)
        .attr("fill", "#69b3a2")
        .attr("stroke", "#102542")
        .attr("stroke-width", 1)
        .attr("d", d3.line()
          .curve(d3.curveBasis)
          .x(d => x(d[0]))
          .y(d => y(d[1]))
        )
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
  })
  .catch(function(error) {
    console.error("Error loading the data:", error);
  });

//Kernel density estimation functions
function kernelDensityEstimator(kernel, X) {
  return function(V) {
    return X.map(x => [x, d3.mean(V, v => kernel(x - v))]);
  };
}

function kernelEpanechnikov(k) {
  return function(v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}

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