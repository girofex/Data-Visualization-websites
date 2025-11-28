import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { annotation, annotationLabel } from "https://cdn.jsdelivr.net/npm/d3-svg-annotation@2/+esm";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const cssOrange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const cssGreen = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
const cssPurple = getComputedStyle(document.documentElement).getPropertyValue("--purple").trim();

const margin = { top: 25, right: 100, bottom: 10, left: 350 };
const width = 800;
const height = 300;

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
  { name: "Ukraine-Russia", path: "resources/plots/sectionfour/dot1.csv" },
  { name: "Mexico", path: "resources/plots/sectionfour/dot2.csv" },
  { name: "Israel-Palestine", path: "resources/plots/sectionfour/dot3.csv" }
];

const geoFiles = [
  "resources/geojson/russiaukraine.geo.json",
  "resources/geojson/mexico.geo.json",
  "resources/geojson/israelpalestine.geo.json"
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
  const geojsons = loadData.slice(0, geoFiles.length);
  const datasets = loadData.slice(geoFiles.length);
  const sizes = [
    { width: 600, height: 600 },
    { width: 300, height: 300 },
    { width: 300, height: 300 }
  ];
  const maxEvents = d3.max(datasets.flatMap(d => d.data), d => +d.EVENTS);

  const radiusScale = d3.scaleSqrt()
    .domain([1, maxEvents]) 
    .range([4, 15]); 

  const maps = svg.selectAll(".mini-map")
    .data(geojsons)
    .enter()
    .append("g")
    .attr("class", "mini-map")
    .attr("transform", (d, i) => `translate(${i * sizes[i].width}, 0)`);

  maps.each(function(geo, i) {
    const mapG = d3.select(this);
    const localData = datasets[i].data;
    const proj = d3.geoMercator();
    const path = d3.geoPath().projection(proj);
    const { width: mapW, height: mapH } = sizes[i];

    if (i === 0)
      proj.scale(120)
          .center([300, 50])
          .rotate([-10, 0]);
    else
      proj.fitSize([mapW, mapH], geo);

    mapG.append("path")
      .datum(geo)
      .attr("class", "borders")
      .attr("fill", cssWhite)
      .attr("stroke", cssBlack)
      .attr("stroke-width", 0.5)
      .attr("d", path);

    //Dots
    mapG.selectAll("circle.event-dot")
      .data(localData)
      .enter()
      .append("circle")
      .attr("class", "event-dot")
      .attr("cx", d => {
        const coords = proj([+d.CENTROID_LONGITUDE, +d.CENTROID_LATITUDE]);
        return coords[0] + (Math.random()) * 5;
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

    //Capitals
    const capitalGroup = mapG.append("g").attr("class", "capitals");
    capitalGroup.selectAll(".capital")
      .data(capitals[i])
      .enter()
      .append("circle")
      .attr("class", "capital")
      .attr("cx", d => proj(d.coords)[0])
      .attr("cy", d => proj(d.coords)[1])
      .attr("r", 5)
      .attr("fill", cssBlack)
      .attr("stroke", cssBlack)
      .attr("stroke-width", 0.8);

    //Annotations
    const capitalAnnotations = capitals[i].map(cap => {
      const [cx, cy] = proj(cap.coords);
      return {
        note: {
          label: cap.name
        },
        x: cx,
        y: cy,
        dx: cap.dx,
        dy: cap.dy,
        color: cssBlack
      };
    });

    const makeAnnotations = annotation()
      .annotations(capitalAnnotations)
      .type(annotationLabel)
      .textWrap(120);

    const annotationGroup = mapG.append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations);

    annotationGroup.selectAll(".annotation-note-label")
      .style("font-family", "Fira Sans")
      .style("font-size", "12px")
      .style("fill", cssBlack);

    //Label
    mapG.append("text")
      .attr("class", "titles")
      .attr("x", path.centroid(geo)[0])
      .attr("y", -10)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-family", "Fira Sans")
      .style("font-weight", "bold")
      .text(datasets[i].name);
  });

  //Legend
  const legend = rootSvg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(0, 150)`);

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

  const capital = d3.selectAll("#dot .capital");
  if (!capital.empty())
    capital.style("fill", isDarkMode ? cssWhite : cssBlack);

  const annotationLabels = d3.selectAll("#dot .annotation-note-label");
  if (!annotationLabels.empty())
    annotationLabels.style("fill", isDarkMode ? cssWhite : cssBlack);

  const annotationLines = d3.selectAll("#dot .annotation-group line");
  if (!annotationLines.empty())
    annotationLines.style("stroke", isDarkMode ? cssWhite : cssBlack);

  const connector = d3.selectAll("#dot .annotation-connector path");
  if (!connector.empty())
    connector.style("stroke", isDarkMode ? cssWhite : cssBlack);

  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? cssBlack : cssWhite)
      .style("color", isDarkMode ? cssWhite : cssBlack)
      .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
  }
}

window.updateDotMapTheme = updateDotMapTheme;