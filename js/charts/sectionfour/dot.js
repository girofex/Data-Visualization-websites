import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const cssOrange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const cssGreen = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
const cssPurple = getComputedStyle(document.documentElement).getPropertyValue("--purple").trim();

var margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 1000 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

const eventColors = {
  "Riots": cssGreen,
  "Explosions/Remote violence": cssOrange,
  "Violence against civilians": cssPurple
};

const rootSvg = d3.select("#dot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const container = rootSvg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const svg = container.append("g");

const projection = d3.geoMercator()
  .scale(130)
  .translate([width / 2, height / 1.5]);

const geoPath = d3.geoPath().projection(projection);

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

let myZoom = d3.zoom()
  .scaleExtent([1, 10])
  .on("zoom", (e) => svg.attr("transform", e.transform));

rootSvg.call(myZoom);

d3.select("#zoom-in").on("click", () =>
  rootSvg.transition().call(myZoom.scaleBy, 2)
);
d3.select("#zoom-out").on("click", () => {
  const t = d3.zoomTransform(rootSvg.node());
  if (t.k <= 1.001)
    rootSvg.transition().duration(750).call(myZoom.transform, d3.zoomIdentity);
  else
    rootSvg.transition().call(myZoom.scaleBy, 0.5);
});

Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.csv("resources/plots/sectionfour/dot.csv")
]).then(function (loadData) {
  let topo = loadData[0];
  let eventData = loadData[1];

  const countryEventMap = new Map();
  eventData.forEach(row => {
    countryEventMap.set(row.COUNTRY);
    countryEventMap.CENTROID_LATITUDE = +countryEventMap.CENTROID_LATITUDE;
    countryEventMap.CENTROID_LONGITUDE = +countryEventMap.CENTROID_LONGITUDE;
    countryEventMap.EVENTS = +countryEventMap.EVENTS;
  });

  //Countries
  svg.selectAll("path")
    .data(topo.features)
    .join("path")
    .attr("class", "borders")
    .attr("d", geoPath)
    .attr("fill", cssWhite)
    .attr("stroke", cssBlack)
    .attr("stroke-width", 0.3)
    .style("pointer-events", "all");

  //Dots
  svg.selectAll("circle")
    .data(eventData)
    .join("circle")
    .attr("cx", d => projection([d.CENTROID_LONGITUDE, d.CENTROID_LATITUDE])[0])
    .attr("cy", d => projection([d.CENTROID_LONGITUDE, d.CENTROID_LATITUDE])[1])
    .attr("r", 4)
    .attr("fill", d => eventColors[d.EVENT_TYPE])
    .attr("opacity", 0.8)
    .attr("stroke", cssBlack)
    .attr("stroke-width", 0.4)
    .on("mouseover", function (event, d) {
      tooltip
        .html(`
          <strong>${d.COUNTRY}</strong><br/>
          ${d.EVENT_TYPE}<br/>
          Events: ${d.EVENTS}<br/>
          Week: ${d.WEEK}
        `)
        .style("opacity", 1);

      d3.select(this)
        .attr("r", 6)
        .attr("opacity", 1);
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", (event.pageY + 15) + "px")
        .style("left", (event.pageX + 15) + "px");
    })
    .on("mouseout", function () {
      tooltip.style("opacity", 0);
      d3.select(this)
        .attr("r", 4)
        .attr("opacity", 0.8);
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
  window.updateDotMapTheme(initialTheme);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/
window.updateDotMapTheme = function (isDarkMode) {
  const borders = d3.selectAll("#dot .borders");
  if (!borders.empty())
    borders.attr("stroke", isDarkMode ? cssBlack : cssWhite);

  const legendText = d3.selectAll("#dot .legend text");
  if (!legendText.empty())
    legendText.style("fill", isDarkMode ? cssWhite : cssBlack);

  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? cssBlack : cssWhite)
      .style("color", isDarkMode ? cssWhite : cssBlack)
      .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
  }
};