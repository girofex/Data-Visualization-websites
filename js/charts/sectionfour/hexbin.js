import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { hexbin as d3Hexbin } from "https://cdn.jsdelivr.net/npm/d3-hexbin@0.2.2/+esm";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const cssGray = getComputedStyle(document.documentElement).getPropertyValue("--gray").trim();

var margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 1000 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

const rootSvg = d3.select("#hexbin")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const svg = rootSvg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const projection = d3.geoMercator()
  .rotate([-10, 0])
  .scale(130)
  .translate([width / 1.8, height / 1.8]);

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("opacity", 0)
  .style("background-color", `${cssWhite}`)
  .style("border", `1px solid ${cssWhite}`)
  .style("padding", "10px")
  .style("border-radius", "5px")
  .style("z-index", "999999")
  .style("pointer-events", "none");

//Zoom
let myZoom = d3.zoom()
  .scaleExtent([1, 10])
  .on('zoom', (e) => svg.attr('transform', `translate(${margin.left},${margin.top}) ${e.transform}`));

rootSvg.call(myZoom);

d3.select('#zoom-in').on('click', () =>
  rootSvg.transition().call(myZoom.scaleBy, 2)
);
d3.select('#zoom-out').on('click', () => {
  const t = d3.zoomTransform(rootSvg.node());
  if (t.k <= 1.001)
    rootSvg.transition().duration(750).call(myZoom.transform, d3.zoomIdentity);
  else
    rootSvg.transition().call(myZoom.scaleBy, 0.5);
});

Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.csv("resources/plots/sectionfour/hex.csv")
]).then(function (loadData) {
  let topo = loadData[0];
  let eventData = loadData[1];

  const countMap = new Map();
  eventData.forEach(d => countMap.set(d.COUNTRY, +d.count));

  const maxCount = d3.max(eventData, d => +d.count);
  const colorScale = d3.scaleSequential(d3.interpolateOrRd)
    .domain([0, maxCount]);

  //Hexbin
  const hexRadius = 4;
  const hexHeight = Math.sqrt(3) * hexRadius;
  const hexWidth = 2 * hexRadius;
  const horizSpacing = hexWidth * 0.75;
  const vertSpacing = hexHeight;
  const path = d3.geoPath().projection(projection);

  //Global grid
  const globalGrid = [];
  const pad = Math.max(hexWidth, hexHeight) * 2;
  for (let y = -pad; y < height + pad; y += vertSpacing) {
    const row = Math.round((y + pad) / vertSpacing);

    for (let x = -pad; x < width + pad; x += horizSpacing) {
      const offsetX = (row % 2) ? hexWidth / 2 : 0;
      globalGrid.push({ x: x + offsetX, y: y });
    }
  }

  const hexes = [];
  globalGrid.forEach(h => {
    const lnglat = projection.invert([h.x, h.y]);
    if(!lnglat)
      return;

    for (let f of topo.features) {
      if (d3.geoContains(f, lnglat)) {
        const country = f.properties.name;
        const count = countMap.get(country) || 0;
        hexes.push({ x: h.x, y: h.y, country: country, count: count });

        break;
      }
    }
  });

  //Hexagons
  svg.selectAll("path.hex")
    .data(hexes)
    .join("path")
    .attr("class", "hex")
    .attr("d", d => {
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const angle = 0; // 0, 60deg, 120deg, ...
        pts.push([d.x + hexRadius * Math.cos(angle), d.y + hexRadius * Math.sin(angle)]);
      }
      return d3.line()(pts) + "Z";
    })
    .attr("fill", d => d.count === 0 ? cssGray : colorScale(d.count))
    .attr("stroke", cssBlack)
    .attr("stroke-width", 0.2)
    .on("mouseover", function(event, d) {
      tooltip
        .style("opacity", 1)
        .html(`<strong>${d.country}</strong><br/>` + (d.count ? `${d.count} events` : "No data"));
      d3.select(this).attr("fill-opacity", 0.6);
    })
    .on("mousemove", function(event) {
      tooltip.style("top", (event.pageY + 15) + "px")
             .style("left", (event.pageX + 15) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);
      d3.select(this).attr("fill-opacity", 1);
    });

  //Legend
  const legend = rootSvg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(20, ${height - 650})`);

  const legendVals = [0, 500, 2000, maxCount];

  legendVals.forEach((v, i) => {
    const g = legend.append("g")
      .attr("transform", `translate(0, ${i * 25})`);

    g.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", v === 0 ? cssGray : colorScale(v));

    g.append("text")
      .attr("x", 30)
      .attr("y", 15)
      .style("font-size", "12px")
      .attr("fill", cssBlack)
      .text(v === 0 ? "No data" : `${v} events`);
  });

  const initialTheme = document.body.classList.contains("body-mode");
  window.updateHexbinTheme(initialTheme);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/
window.updateHexbinTheme = function(isDarkMode) {
  const borders = d3.selectAll("#hexbin .borders");
  if(!borders.empty())
    borders.attr("stroke", isDarkMode ? cssBlack : cssWhite);

  const legendText = d3.selectAll("#hexbin .legend text");
  if (!legendText.empty())
    legendText.style("fill", isDarkMode ? cssWhite : cssBlack);
  
  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? cssBlack : cssWhite)
      .style("color", isDarkMode ? cssWhite : cssBlack)
      .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
  }
};