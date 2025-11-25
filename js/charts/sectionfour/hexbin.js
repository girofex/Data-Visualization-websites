import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { hexbin as d3Hexbin } from "https://cdn.jsdelivr.net/npm/d3-hexbin@0.2.2/+esm";
import * as d3Geo from "https://d3js.org/d3-geo-projection.v2.min.js";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const cssGray = getComputedStyle(document.documentElement).getPropertyValue("--gray").trim();

const margin = { top: 10, right: 10, bottom: 10, left: 10 },
      width = 1000 - margin.left - margin.right,
      height = 700 - margin.top - margin.bottom;

const rootSvg = d3.select("#hex")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const svg = rootSvg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const projection = d3.geoMercator()
  .scale(350)
  .translate([width / 1.8, height / 1.8]);

//Tooltip
const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("opacity", 0)
  .style("background-color", cssWhite)
  .style("border", `1px solid ${cssWhite}`)
  .style("padding", "10px")
  .style("border-radius", "5px")
  .style("z-index", "999999")
  .style("pointer-events", "none");

//Zoom
const zoom = d3.zoom()
  .scaleExtent([1, 10])
  .on("zoom", (event) => svg.attr("transform", `translate(${margin.left},${margin.top}) ${event.transform}`));

rootSvg.call(zoom);

d3.select("#zoom-in").on("click", () => rootSvg.transition().call(zoom.scaleBy, 2));
d3.select("#zoom-out").on("click", () => {
  const t = d3.zoomTransform(rootSvg.node());
  if(t.k <= 1.001)
    rootSvg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
  else
    rootSvg.transition().call(zoom.scaleBy, 0.5);
});

Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.csv("resources/plots/sectionfour/hex.csv")
]).then(([topo, eventData]) => {
  const countryCountMap = new Map();
  eventData.forEach(d => {
    const country = (d.COUNTRY || "").trim();
    const count = +d.count || 0;
    countryCountMap.set(country, count);
  });

  const maxCount = d3.max(eventData, d => +d.count);
  const colorScale = d3.scaleSequential()
    .domain([0, maxCount])
    .interpolator(d3.interpolateOrRd);

  // Disegna i paesi (base mappa)
  svg.selectAll("path.country")
    .data(topo.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", d => {
      const countryName = d.properties.name;
      const count = countryCountMap.get(countryName);
      return count ? colorScale(count) : cssGray;
    })
    .attr("stroke", cssBlack)
    .attr("stroke-width", 0.3)
    .on("mouseover", function(event, d) {
      const countryName = d.properties.name;
      const count = countryCountMap.get(countryName) || 0;
      tooltip
        .style("opacity", 1)
        .html(`<strong>${countryName}</strong><br/>Events: ${count}`);
      d3.select(this).attr("opacity", 0.7);
    })
    .on("mousemove", event => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);
      d3.select(this).attr("opacity", 1);
    });

  //Legend
  const legendWidth = 300;
  const legendHeight = 20;
  const legend = rootSvg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - legendWidth - 20}, ${height - 40})`);

  const defs = rootSvg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "legend-gradient")
    .attr("x1", "0%")
    .attr("x2", "100%");

  linearGradient.append("stop").attr("offset", "0%").attr("stop-color", colorScale(0));
  linearGradient.append("stop").attr("offset", "100%").attr("stop-color", colorScale(maxCount));

  legend.append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("fill", "url(#legend-gradient)");

  legend.append("text")
    .attr("y", legendHeight + 15)
    .attr("x", 0)
    .style("font-size", "12px")
    .text("0");

  legend.append("text")
    .attr("y", legendHeight + 15)
    .attr("x", legendWidth)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .text(maxCount);

  const initialTheme = document.body.classList.contains("body-mode");
  window.updateHexTheme(initialTheme);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/
window.updateHexTheme = function(isDarkMode) {
  const borders = d3.selectAll("#hex path");
  if(!borders.empty()) borders.attr("stroke", isDarkMode ? cssWhite : cssBlack);

  if(!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? cssBlack : cssWhite)
      .style("color", isDarkMode ? cssWhite : cssBlack)
      .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
  }
};