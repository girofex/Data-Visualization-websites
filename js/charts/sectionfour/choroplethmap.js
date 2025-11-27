import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const cssOrange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const cssGreen = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
const cssPurple = getComputedStyle(document.documentElement).getPropertyValue("--purple").trim();
const cssGray = getComputedStyle(document.documentElement).getPropertyValue("--gray").trim();

var margin = { top: 10, right: 10, bottom: 10, left: 10 },
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

rootSvg.insert("rect")
  .attr("class", "rectangle")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .attr("fill", "none")
  .attr("stroke", cssBlack)
  .attr("stroke-width", 1)
  .attr("rx", 10)
  .attr("ry", 10);

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

d3.select('#choropleth-zoom-in').on('click', () =>
  rootSvg.transition().call(myZoom.scaleBy, 2)
);

d3.select('#choropleth-zoom-out').on('click', () => {
  const t = d3.zoomTransform(rootSvg.node());
  if (t.k <= 1.001)
    rootSvg.transition().duration(750).call(myZoom.transform, d3.zoomIdentity);
  else
    rootSvg.transition().call(myZoom.scaleBy, 0.5);
});

d3.select('#choropleth-zoom-restore').on('click', () => {
  rootSvg.transition()
    .duration(750)
    .call(myZoom.transform, d3.zoomIdentity);
});

Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.csv("resources/plots/sectionfour/choropleth.csv")
]).then(function (loadData) {
  let topo = loadData[0];
  let eventData = loadData[1];

  const countryEventMap = new Map();
  eventData.forEach(row => {
    countryEventMap.set(row.COUNTRY, row.EVENT_TYPE);
  });

  svg.selectAll("path")
    .attr("class", "borders")
    .data(topo.features)
    .join("path")
    .attr("d", d3.geoPath().projection(projection))
    .attr("fill", d => {
      const countryName = d.properties.name;
      const eventType = countryEventMap.get(countryName);
      return eventType ? eventColors[eventType] : cssGray;
    })
    .attr("stroke", cssBlack)
    .attr("stroke-width", 0.3)
    .attr("pointer-events", "all")
    .style("pointer-events", "all")
    .on("mouseover", function (event, d) {
      const countryName = d.properties.name;
      const eventType = countryEventMap.get(countryName);

      tooltip
        .html(`<strong>${countryName}</strong><br/>${eventType || "No data"}`)
        .style("opacity", 1);

      d3.select(this).attr("fill-opacity", 0.6);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", (event.pageY + 15) + "px")
        .style("left", (event.pageX + 15) + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
      d3.select(this).attr("fill-opacity", 1);
    });

  //Legend
  const legend = rootSvg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(20, ${height - 650})`);

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

  const initialTheme = document.body.classList.contains("body-mode");
  window.updateChoroplethTheme(initialTheme);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/
window.updateChoroplethTheme = function(isDarkMode) {
  const rectangle = d3.selectAll("#choropleth .rectangle");
  if(!rectangle.empty())
    rectangle.attr("stroke", isDarkMode ? cssWhite : cssBlack);

  const borders = d3.selectAll("#choropleth .borders");
  if(!borders.empty())
    borders.attr("stroke", isDarkMode ? cssBlack : cssWhite);

  const legendText = d3.selectAll("#choropleth .legend text");
  if (!legendText.empty())
    legendText.style("fill", isDarkMode ? cssWhite : cssBlack);
  
  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? cssBlack : cssWhite)
      .style("color", isDarkMode ? cssWhite : cssBlack)
      .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
  }
};