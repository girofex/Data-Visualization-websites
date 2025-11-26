import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { hexbin as d3Hexbin } from "https://cdn.jsdelivr.net/npm/d3-hexbin@0.2/+esm";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();

const margin = { top: 25, right: 100, bottom: 10, left: 350 };
const width = 800;
const height = 300;

const rootSvg = d3.select("#hexbin")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const container = rootSvg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const svg = container.append("g");

const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("opacity", 0)
  .style("background-color", cssWhite)
  .style("border", `1px solid ${cssBlack}`)
  .style("padding", "10px")
  .style("border-radius", "5px")
  .style("z-index", "999999")
  .style("pointer-events", "none");

const csvFiles = [
  { name: "Ukraine-Russia", path: "resources/plots/sectionfour/hexbin1.csv" },
  { name: "Mexico", path: "resources/plots/sectionfour/hexbin2.csv" },
  { name: "Israel-Palestine", path: "resources/plots/sectionfour/hexbin3.csv" }
];

const geoFiles = [
  "../resources/geojson/russiaukraine.geo.json",
  "../resources/geojson/mexico.geo.json",
  "../resources/geojson/israelpalestine.geo.json"
];

const capitals = [
  [
    { name: "Kyiv", coords: [30.5234, 50.4501], dx: -40, dy: 10 },
    { name: "Moscow", coords: [37.6173, 55.7558], dx: 80, dy: 30 }
  ],
  [
    { name: "Mexico City", coords: [-99.1332, 19.4326], dx: 80, dy: -25 }
  ],
  [
    { name: "Jerusalem", coords: [35.2137, 31.7683], dx: 80, dy: -10 },
    { name: "Ramallah", coords: [35.2065, 31.8986], dx: 80, dy: -55 },
    { name: "Gaza City", coords: [34.4378, 31.5019], dx: -35, dy: -15 }
  ]
];

Promise.all([
  ...geoFiles.map(url => d3.json(url)),
  ...csvFiles.map(file => d3.csv(file.path).then(data => ({ name: file.name, data })))
]).then(loadData => {
  const geojsons = loadData.slice(0, 3);
  const datasets = loadData.slice(3);
  
  const sizes = [
    { width: 600, height: 600 },
    { width: 300, height: 300 },
    { width: 300, height: 300 }
  ];

  const maps = svg.selectAll(".mini-map")
    .data(geojsons)
    .enter()
    .append("g")
    .attr("class", "mini-map")
    .attr("transform", (d, i) => `translate(${i * sizes[i].width}, 0)`);

  maps.each(function(geo, i) {
    const mapG = d3.select(this);
    const localData = datasets[i].data;
    const { width: mapW, height: mapH } = sizes[i];

    // Setup projection
    const proj = d3.geoMercator();
    const path = d3.geoPath().projection(proj);

    if (i === 0)
      proj.scale(120).center([300, 50]).rotate([-10, 0]);
    else
      proj.fitSize([mapW, mapH], geo);

    // Draw borders
    mapG.append("path")
      .datum(geo)
      .attr("class", "borders")
      .attr("fill", "none")
      .attr("stroke", cssBlack)
      .attr("stroke-width", 1.5)
      .attr("d", path);

    const points = geo.features.flatMap(feature => {
      const adminName = feature.properties.ADMIN1; // adjust to match your geojson
      const csvRow = localData.find(d => d.ADMIN1 === adminName);
      if (!csvRow) return [];

      const centroid = path.centroid(feature); // [x, y] in pixels
      if (!centroid || centroid.some(isNaN)) return [];

      return [{
        x: centroid[0],
        y: centroid[1],
        events: +csvRow.count,
        admin: adminName,
        country: feature.properties.COUNTRY
      }];
    });


    // Create hexbin generator
    const hexRadius = i === 0 ? 25 : 15;
    const hexbinGen = d3Hexbin()
      .radius(hexRadius)
      .extent([[0, 0], [mapW, mapH]]);

    // Generate hexbins
    const hexbins = hexbinGen(points);

    // Calculate max events for color scale
    const maxEvents = d3.max(hexbins, d => d3.sum(d, p => p.events));

    // Color scale
    const colorScale = d3.scaleSequential()
      .domain([0, maxEvents])
      .interpolator(d3.interpolateYlOrRd);

    // Draw hexbins
    mapG.append("g")
      .attr("class", "hexbins")
      .selectAll("path")
      .data(hexbins)
      .enter()
      .append("path")
      .attr("d", hexbinGen.hexagon())
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .attr("fill", d => {
        const totalEvents = d3.sum(d, p => p.events);
        return totalEvents > 0 ? colorScale(totalEvents) : "none";
      })
      .attr("stroke", cssBlack)
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.8)
      .on("mouseover", function(event, d) {
        const totalEvents = d3.sum(d, p => p.events);
        if (totalEvents > 0) {
          tooltip
            .style("opacity", 1)
            .html(`
              <strong>Total Events: ${totalEvents}</strong><br/>
              Locations: ${d.length}
            `);
          d3.select(this).attr("opacity", 1);
        }
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", function() {
        tooltip.style("opacity", 0);
        d3.select(this).attr("opacity", 0.8);
      });

    // Add title
    mapG.append("text")
      .attr("class", "titles")
      .attr("x", mapW / 2)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-family", "Fira Sans")
      .style("font-weight", "bold")
      .style("fill", cssBlack)
      .text(datasets[i].name);
  });

  // Add legend
  const legend = rootSvg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(20, ${height / 2})`);

  const legendScale = d3.scaleSequential()
    .domain([0, 100])
    .interpolator(d3.interpolateYlOrRd);

  const legendHeight = 150;
  const legendWidth = 20;

  const legendData = d3.range(0, legendHeight);

  legend.selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i)
    .attr("width", legendWidth)
    .attr("height", 1)
    .attr("fill", d => legendScale((legendHeight - d) / legendHeight * 100));

  legend.append("text")
    .attr("x", legendWidth + 5)
    .attr("y", 0)
    .style("font-size", "10px")
    .style("font-family", "Arial, sans-serif")
    .style("fill", cssBlack)
    .text("High");

  legend.append("text")
    .attr("x", legendWidth + 5)
    .attr("y", legendHeight)
    .style("font-size", "10px")
    .style("font-family", "Arial, sans-serif")
    .style("fill", cssBlack)
    .text("Low");

  legend.append("text")
    .attr("x", 0)
    .attr("y", -10)
    .style("font-size", "12px")
    .style("font-family", "Arial, sans-serif")
    .style("font-weight", "bold")
    .style("fill", cssBlack)
    .text("Event Intensity");

  const initialTheme = document.body.classList.contains("body-mode");
  updateHexbinTheme(initialTheme);
});

/*///*//*/*//*/*//*/*//*/*//*/*//*/*
//DARK MODE
/*//*///*//*//*//*//*//*//*//*//*/
function updateHexbinTheme(isDarkMode) {
  const titles = d3.selectAll("#hexbin .titles");
  if (!titles.empty())
    titles.style("fill", isDarkMode ? cssWhite : cssBlack);

  const borders = d3.selectAll("#hexbin .borders");
  if (!borders.empty())
    borders.style("stroke", isDarkMode ? cssWhite : cssBlack);

  const hexbins = d3.selectAll("#hexbin .hexbins path");
  if (!hexbins.empty())
    hexbins.style("stroke", isDarkMode ? cssWhite : cssBlack);

  const legendTexts = d3.selectAll("#hexbin .legend text");
  if (!legendTexts.empty())
    legendTexts.style("fill", isDarkMode ? cssWhite : cssBlack);

  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? cssBlack : cssWhite)
      .style("color", isDarkMode ? cssWhite : cssBlack)
      .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
  }
}

window.updateHexbinTheme = updateHexbinTheme;