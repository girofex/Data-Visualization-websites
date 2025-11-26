import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const cssOrange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const cssGreen = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
const cssPurple = getComputedStyle(document.documentElement).getPropertyValue("--purple").trim();

const margin = { top: 20, right: 10, bottom: 10, left: 450 };
const width = 1200;
const height = 600;

const rootSvg = d3.select("#dot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const container = rootSvg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const svg = container.append("g");

const eventColors = {
  "Riots": cssGreen,
  "Explosions/Remote violence": cssOrange,
  "Violence against civilians": cssPurple
};

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

const csvFiles = [
  { name: "Ukraine-Russia", path: "resources/plots/sectionfour/dot1_alt.csv" },
  { name: "Mexico", path: "resources/plots/sectionfour/dot2_alt.csv" },
  { name: "Israel-Palestine", path: "resources/plots/sectionfour/dot3_alt.csv" }
];

const geoFiles = [
  "../resources/geojson/russiaukraine.geo.json",
  "../resources/geojson/mexico.geo.json",
  "../resources/geojson/israelpalestine.geo.json"
];

Promise.all([
  ...geoFiles.map(url => d3.json(url)),
  ...csvFiles.map(file => d3.csv(file.path).then(data => ({ name: file.name, data })))
]).then(loadData => {
  const geojsons = loadData.slice(0, geoFiles.length);
  const datasets = loadData.slice(geoFiles.length);
  const miniMapWidth = 400;
  const miniMapHeight = 500;
  const miniMapSpacing = 0;
  
  const maxEvents = d3.max(datasets.flatMap(d => d.data), d => +d.EVENTS);
  const radiusScale = d3.scaleSqrt()
  .domain([1, maxEvents]) 
  .range([4, 15]); 

  const maps = svg.selectAll(".mini-map")
    .data(geojsons)
    .enter()
    .append("g")
    .attr("class", "mini-map")
    .attr("transform", (d, i) => `translate(${i * (miniMapWidth + miniMapSpacing)}, 0)`);

  maps.each(function(geo, i) {
    const mapG = d3.select(this);
    const localData = datasets[i].data;
    const proj = d3.geoMercator();

    const path = d3.geoPath().projection(proj);

    if (i === 0){
      const customScale = 120;
      const centralLongiitude = 300;
      const centralLatitude = 50;
      proj.rotate([-10, 0]);
      proj.scale(customScale)
      .center([centralLongiitude, centralLatitude]);
    } else
      proj.fitSize([miniMapWidth, miniMapHeight], geo);

    mapG.append("path")
      .datum(geo)
      .attr("class", "borders")
      .attr("fill", cssWhite)
      .attr("stroke", cssBlack)
      .attr("stroke-width", 0.5)
      .attr("d", path);

    //Dots
    mapG.selectAll("circle")
      .data(localData)
      .enter()
      .append("circle")
      .attr("cx", d => {
        const coords = proj([+d.CENTROID_LONGITUDE, +d.CENTROID_LATITUDE]);
        return coords[0] + (Math.random()) * 5; // Add small random offset
      })
      .attr("cy", d => {
        const coords = proj([+d.CENTROID_LONGITUDE, +d.CENTROID_LATITUDE]);
        return coords[1] + (Math.random()) * 5;
      })
      .attr("r", d => radiusScale(+d.EVENTS))
      .attr("fill", d => eventColors[d.EVENT_TYPE])
      .attr("opacity", 1)
      .attr("stroke", cssBlack)
      .attr("stroke-width", 0.4)
      .on("mouseover", function(event, d) {
        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.COUNTRY}</strong><br/>
            ${d.EVENT_TYPE}<br/>
            Number of events: ${d.EVENTS}
          `);
        d3.select(this)
          .attr("r", d => radiusScale(+d.EVENTS)*1.2)
          .attr("opacity", 1);
      })
      .on("mousemove", event => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", function() {
        tooltip.style("opacity", 0);
        d3.select(this)
          .attr("r", d => radiusScale(+d.EVENTS))
          .attr("opacity", 0.8);
      });

    //Label
    mapG.append("text")
      .attr("class", "titles")
      .attr("x", 0)
      .attr("y", -5)
      .style("text-anchor", "middle")
      .attr("x", miniMapWidth / 4)
      .style("font-size", "14px")
      .style("font-family", "Fira Sans")
      .style("font-weight", "bold")
      .text(datasets[i].name);
  });

  //Legend
  const legend = rootSvg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(0, 30)`);

  Object.entries(eventColors).forEach(([eventType, color], i) => {
    const row = legend.append("g")
      .attr("transform", `translate(0, ${i * 25})`);

    row.append("rect")
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", color);

    row.append("text")
      .attr("x", 30)
      .attr("y", 15)
      .text(eventType)
      .style("font-size", "12px")
      .style("font-family", "Fira Sans")
      .attr("fill", cssBlack);
  });

  const initialTheme = document.body.classList.contains("body-mode");
  updateDotMapTheme(initialTheme);
});

/*///*//*/*//*/*//*/*//*/*//*/*//*/*
//DARK MODE
/*//*///*//*//*//*//*//*//*//*//*/
function updateDotMapTheme(isDarkMode) {
  const titles = d3.selectAll("#dot .titles")
  if(!titles.empty())
    titles.style("fill", isDarkMode ? cssWhite : cssBlack);

  d3.selectAll("#dot .legend text")
    .style("fill", isDarkMode ? cssWhite : cssBlack);

  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? cssBlack : cssWhite)
      .style("color", isDarkMode ? cssWhite : cssBlack)
      .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
  }
}

window.updateDotMapTheme = updateDotMapTheme;