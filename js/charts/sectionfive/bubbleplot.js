import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const cssOrange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const cssGreen = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
const cssPurple = getComputedStyle(document.documentElement).getPropertyValue("--purple").trim();

const margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 1500 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom;

const colorScale = d3.scaleOrdinal().range([cssOrange, cssGreen, cssPurple]);

const rootSvg = d3.select("#bubbleplot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("font-family", "Fira Sans");

const svg = rootSvg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

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

function buildHierarchy(data) {
  const root = { name: "root", children: [] };
  const eventMap = new Map();

  data.forEach(d => {
    const eventType = d.EVENT_TYPE;
    const subEventType = d.SUB_EVENT_TYPE;
    const value = +d.EVENTS;

    if (!eventMap.has(eventType)) {
      const eventNode = { name: eventType, children: [] };
      eventMap.set(eventType, eventNode);
      root.children.push(eventNode);
    }

    eventMap.get(eventType).children.push({
      name: subEventType,
      value: value,
      EVENT_TYPE: subEventType
    });
  });

  return root;
}

d3.csv("resources/plots/sectionfive/bubble.csv").then(function (data) {
  const hierarchyData = buildHierarchy(data);

  const root = d3.hierarchy(hierarchyData)
    .sum(d => d.value || 0)
    .sort((a, b) => b.value - a.value);

  const pack = d3.pack()
    .size([width, height])
    .padding(d => d.depth === 0 ? 80 : 30);

  pack(root);

  const nodes = root.children.flatMap(d => d.descendants());
  const node = svg.selectAll("g.node")
    .data(nodes)
    .join("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("circle")
    .attr("id", d => `circle-${d.data.name.replace(/\s+/g, '-')}`)
    .attr("r", d => d.r)
    .attr("fill", d => d.depth === 2 ? cssGreen : "transparent")
    .attr("stroke", d => d.depth === 1 ? cssOrange : "transparent")
    .attr("stroke-width", d => d.depth === 1 ? 2 : 1)
    .style("opacity", 0.9)
    .on("mouseover", function (event, d) {
      if (d.depth === 0) return;

      const formatNumber = d3.format(",");
      const formatted = formatNumber(d.value).replace(/,/g, ".");

      tooltip.html(`<strong>${d.data.name}</strong><br/>Value: ${formatted || "N/A"}`)
        .style("opacity", 1);
      d3.select(this).attr("stroke-width", 3);
    })
    .on("mousemove", function (event) {
      tooltip.style("top", (event.pageY + 15) + "px")
        .style("left", (event.pageX + 15) + "px");

      d3.select(this).style("opacity", 0.4);
    })
    .on("mouseout", function (event, d) {
      d3.select(this).style("opacity", 0.9);
      d3.select(this).attr("stroke-width", d.depth === 1 ? 2 : 1);
      tooltip.style("opacity", 0);
    });

  //Labels
  node.append("text")
    .filter(d => d.r > 20 && d.depth === 1)
    .attr("text-anchor", "middle")
    .attr("y", d => -d.r - 10)
    .style("font-size", "14px")
    .style("font-family", "Roboto Slab")
    .style("font-weight", "bold")
    .style("pointer-events", "none")
    .style("fill", cssBlack)
    .text(d => d.data.name);

  const initialTheme = document.body.classList.contains("body-mode");
  window.updateBubbleTheme(initialTheme);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/
window.updateBubbleTheme = function (isDarkMode) {
  const texts = d3.selectAll("#bubbleplot text");
  if (!texts.empty())
    texts.style("fill", isDarkMode ? cssWhite : cssBlack);

  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? cssBlack : cssWhite)
      .style("color", isDarkMode ? cssWhite : cssBlack)
      .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
  }
};