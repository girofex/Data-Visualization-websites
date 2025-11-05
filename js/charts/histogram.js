import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const margin = { top: 30, right: 20, bottom: 30, left: 40 },
      width = 210 - margin.left - margin.right,
      height = 210 - margin.top - margin.bottom;

d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/5_OneCatSevNumOrdered.csv")
  .then(function(data) {

    data.forEach(d => {
      d.year = +d.year;
      d.n = +d.n;
    });

    const sumstat = d3.groups(data, d => d.name)
      .map(([key, values]) => ({ key, values }));

    //X scale
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);

    //Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.n)])
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(sumstat.map(d => d.key))
      .range(['#69b3a2','#f87060','#1f77b4','#000000ff',
              '#000000ff','#000000ff','#000000ff','#000000ff','#000000ff']);

    //Small multiple
    const svg = d3.select("#histogram")
      .selectAll("uniqueChart")
      .data(sumstat)
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
        .text("Total occurrences");

    //Histograms
    svg.each(function(dGroup) {
      const groupData = dGroup.values;

      const histogram = d3.histogram()
        .value(d => d.year)
        .domain(x.domain())
        .thresholds(x.ticks(10));

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
          .style("fill", color(dGroup.key))
          .style("opacity", 0.8);

      chart.append("text")
        .attr("x", 0)
        .attr("y", -10)
        .text(dGroup.key)
        .style("font-size", "11px")
        .style("fill", color(dGroup.key));
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