import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const margin = { top: 30, right: 20, bottom: 30, left: 40 },
      width = 300 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

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
    const allData = datasets.flatMap(d => d.data);

    //X scale
    const x = d3.scaleLinear()
      .domain(d3.extent(allData, d => +d.POPULATION_EXPOSURE))
      .range([0, width]);

    const color = d3.scaleOrdinal()
      .domain(datasets.map(d => d.name))
      .range(['#69b3a2','#f87060','#1f77b4']);
    
    const histogram = d3.histogram()
      .value(d => +d.POPULATION_EXPOSURE)
      .domain(x.domain())
      .thresholds(x.ticks(10));

    //Small multiple
    const svg = d3.select("#histogram")
      .selectAll("uniqueChart")
      .data(datasets)
      .enter()
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
     svg.append("text")
        .attr("class", "yAxisTitle")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 2)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("font-family", "Roboto Slab")
        .text("Total Occurrences");

    //Histograms
    svg.each(function(dataset) {
      const groupData = dataset.data;
      const bins = histogram(groupData);

      //Y domain
      const yLocal = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .range([height, 0]);

      const chart = d3.select(this);

      //X axis
      chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(3))
        .selectAll("text")
          .style("font-size", "12px")
          .style("font-family", "Fira Sans");

      //Y axis
      chart.append("g")
        .call(d3.axisLeft(yLocal).ticks(3))
        .selectAll("text")
          .style("font-size", "12px")
          .style("font-family", "Fira Sans");

      //Bars
      chart.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
          .attr("x", d => x(d.x0) + 1)
          .attr("y", d => yLocal(d.length))
          .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
          .attr("height", d => height - yLocal(d.length))
          .style("fill", color(dataset.name))
          .style("opacity", 0.8)
          .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("opacity", 0.7);
          
            tooltip
              .style("opacity", 1)
              .html(`<strong>Total Occurrences:</strong>`);
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

      chart.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .text(dataset.name)
        .style("font-size", "11px")
        .style("fill", color(dataset.name));
    });
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