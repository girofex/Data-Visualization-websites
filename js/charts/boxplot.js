import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip");

const csv = [
  { name: "Mexico", path: "./resources/plots/mexico.csv" },
  { name: "Ukraine-Russia", path: "./resources/plots/ukraine_russia.csv" },
  { name: "Israel-Palestine", path: "./resources/plots/israel_palestine.csv" }
];

export function renderBoxPlot(){
  Promise.all(csv.map(file => 
  d3.csv(file.path).then(data => ({ name: file.name, data }))
))
.then(function(datasets) {
  const container = d3.select("#boxplot_container");
  container.selectAll("*").remove();
                      
  var margin = {top: 30, right: 30, bottom: 80, left: 100},
      width = 700 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;
  
  const svg = container
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
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

  const colorScale = d3.scaleOrdinal()
    .domain(datasets.map(d => d.name))
    .range(['#69b3a2','#f87060','#1f77b4']);

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
  const yMax = d3.max(allValues);
  
  //Y scale
  var y = d3.scaleLinear()
    .domain([0, yMax])
    .range([height, 0]);

  const yAxis = d3.axisLeft(y)
    .tickFormat(d => d3.format(",")(d).replace(/,/g, "."));

  //Y axis
  svg.append("g")
    .call(d3.axisLeft(y))
    .call(yAxis)
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
    .text("Population Exposure");

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
        .style("fill", function(d) { return colorScale(d.key); })
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("opacity", 0.7);

          const formatEuropean = (num) => {
            return d3.format(",.2f")(num)
              .replace(/,/g, "TEMP")
              .replace(/\./g, ",")
              .replace(/TEMP/g, ".");
          };

          const formattedNumbers = [
            formatEuropean(d.value.min),
            formatEuropean(d.value.q1),
            formatEuropean(d.value.median),
            formatEuropean(d.value.q3),
            formatEuropean(d.value.max)
          ];
          
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
}