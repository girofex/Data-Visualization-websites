import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const cssOrange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const cssGreen = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
const cssPurple = getComputedStyle(document.documentElement).getPropertyValue("--purple").trim();

var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 1000 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

const eventColors = {
  "Riots": cssGreen,
  "Explosions/Remote violence": cssOrange,
  "Violence against civilians": cssPurple
};

const rootSvg = d3.select("#choropleth")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const svg = rootSvg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const projection = d3.geoMercator()
  .scale(130)
  .translate([width / 2, height / 1.5]);

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background-color", "white")
  .style("border", "1px solid #ddd")
  .style("padding", "10px")
  .style("border-radius", "5px");

//Zoom
let myZoom = d3.zoom()
  .scaleExtent([1, 10])
  .on('zoom', handleZoom);

function handleZoom(e) {
  svg.attr('transform', e.transform);
}

function initEvents() {
  d3.select('#zoom-in').on('click', zoomIn);
  d3.select('#zoom-out').on('click', zoomOut);
}

function initZoom() {
  rootSvg.call(myZoom);
}

function zoomIn() {
  rootSvg.transition().call(myZoom.scaleBy, 2);
}

function zoomOut() {
  rootSvg.transition().call(myZoom.scaleBy, 0.5);
}

initEvents();
initZoom();

Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.csv("resources/plots/sectionfour/choropleth.csv")
]).then(function(loadData){
  let topo = loadData[0];
  let eventData = loadData[1];
  
  const countryEventMap = new Map();
  eventData.forEach(row => {
    countryEventMap.set(row.COUNTRY, row.EVENT_TYPE);
  });
  
  svg.selectAll("path")
      .data(topo.features)
      .join("path")
      .attr("d", d3.geoPath().projection(projection))
      .attr("fill", d => {
        const countryName = d.properties.name;
        const eventType = countryEventMap.get(countryName);
        return eventType ? eventColors[eventType] : "#cccccc";
      })
      .attr("stroke", cssBlack)
      .attr("stroke-width", 0.3)
      .on("mouseover", function(event, d) {
        const countryName = d.properties.name;
        const eventType = countryEventMap.get(countryName);
        
        tooltip
          .style("visibility", "visible")
          .html(`<strong>${countryName}</strong><br/>${eventType || "No data"}`);
        
        d3.select(this)
          .attr("fill-opacity", 0.6)
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        tooltip.style("visibility", "hidden");
        
        d3.select(this)
          .attr("fill-opacity", 1)
      });
  
  //Legend
  const legend = rootSvg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(20, ${height - 100})`);
  
  Object.entries(eventColors).forEach(([eventType, color], i) => {
    const legendRow = legend.append("g")
      .attr("transform", `translate(0, ${i * 25})`);
    
    legendRow.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", color);
    
    legendRow.append("text")
      .attr("x", 30)
      .attr("y", 15)
      .style("font-size", "12px")
      .style("font-family", "Fira Sans")
      .attr("fill", cssBlack)
      .text(eventType);
  });
});