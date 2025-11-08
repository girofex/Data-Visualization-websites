import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var margin = {top: 70, right: 30, bottom: 55, left: 110},
  width = 1000 - margin.left - margin.right,
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

const csv = [
  { name: "Mexico", path: "../resources/plots/sectiontwo/ridgelineplot_mexico.csv" },
  { name: "Ukraine-Russia", path: "../resources/plots/sectiontwo/ridgelineplot_ukraine_russia.csv" },
  { name: "Israel-Palestine", path: "../resources/plots/sectiontwo/ridgelineplot_israel_palestine.csv" }
];

Promise.all(csv.map(file => 
  d3.csv(file.path).then(data => ({ name: file.name, data }))
))
.then(function(datasets) {
  const colorScale = d3.scaleOrdinal()
    .domain(datasets.map(d => d.name))
    .range(['#69b3a2','#f87060','#9467bd']);

  const allExposures = datasets.flatMap(d => 
    d.data.map(row => +row.POPULATION_EXPOSURE)
  );
  
  //X scale for population exposure
  const x = d3.scaleLinear()
    .domain([0, d3.max(allExposures)])
    .range([0, width]);

  const xAxis = d3.axisBottom(x)
    .tickFormat(d => d3.format(",")(d).replace(/,/g, "."));
  
  //X axis
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis.ticks(8))
    .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "Fira Sans");
  
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("font-family", "Roboto Slab")
    .text("Population Exposure");

  //Y scale for ridgeline
  const y = d3.scaleBand()
    .domain(datasets.map(d => d.name))
    .range([0, height])
    .paddingInner(0.5);
  
  datasets.forEach(dataset => {
    svg.append("text")
      .attr("x", -10)
      .attr("y", y(dataset.name))
      .attr("text-anchor", "end")
      .attr("alignment-baseline", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text(dataset.name);
  });

  const maxFatalities = d3.max(datasets, dataset => 
    d3.max(dataset.data, d => +d.FATALITIES)
  );
  
  //Y scale for fatalities
  const yFatalities = d3.scaleLinear()
    .domain([0, maxFatalities])
    .range([0, y.step()*0.9]);

  //Ridgeline
  datasets.forEach(dataset => {
    const dataPoints = dataset.data.map(d => ({
      exposure: +d.POPULATION_EXPOSURE,
      fatalities: +d.FATALITIES
    }));

    const bandwidth = (d3.max(allExposures) - d3.min(allExposures)) / 20;
    const xTicks = x.ticks(100);

    const densityData = xTicks.map(xVal => {
      let weightedSum = 0;
      let totalWeight = 0;
      
      dataPoints.forEach(point => {
        const distance = Math.abs(point.exposure - xVal);
        if (distance < bandwidth * 3) {
          const u = distance / bandwidth;
          const kernel = u <= 1 ? 0.75 * (1 - u * u) : 0;
          weightedSum += kernel * point.fatalities;
          totalWeight += kernel;
        }
      });
      
      const density = totalWeight > 0 ? weightedSum / totalWeight : 0;
      return { x: xVal, y: density };
    });

    //Area
    svg.append("path")
      .datum(densityData)
      .attr("transform", `translate(0,${y(dataset.name)})`)
      .attr("fill", colorScale(dataset.name))
      .attr("fill-opacity", 0.7)
      .attr("stroke-width", 1.5)
      .attr("d", d3.area()
        .curve(d3.curveBasis)
        .x(d => x(d.x))
        .y0(0)
        .y1(d => -yFatalities(d.y))
      )
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("fill-opacity", 0.9);
      
        tooltip
          .style("opacity", 1)
          .html(`<strong>${dataset.name}</strong>`);
      })
    
      .on("mousemove", function(event, d) {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      
      .on("mouseout", function() {
        d3.select(this)
          .attr("fill-opacity", 0.7);
        
        tooltip.style("opacity", 0);
      });
    
    //Baseline
    svg.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y(dataset.name))
      .attr("y2", y(dataset.name))
      .attr("stroke", "#102542")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.3);
  });
})
.catch(function(error) {
  console.error("Error loading the data:", error);
});