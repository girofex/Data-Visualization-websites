import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// colors 
const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const cssOrange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const cssGreen = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
const cssPurple = getComputedStyle(document.documentElement).getPropertyValue("--purple").trim();

// Setup Dimensions
var margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 800 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

// Color scale for top-level groups
const colorScale = d3.scaleOrdinal()
  .range([cssGreen, cssOrange, cssPurple]);

// SVG & Container Setup
const rootSvg = d3.select("#bubbleplot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("font-family", "Fira Sans"); // Enforcing font from your legend

const svg = rootSvg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip Setup
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


// TMP: DUMMY DATA, swap with csv
const dummyData = {
  name: "Global Events",
  children: [
    {
      name: "Riots",
      children: [
        { name: "Protests", value: 400 },
        { name: "Mob Violence", value: 200 },
        { name: "Civil Unrest", value: 120 },
        { name: "Demonstrations", value: 80 }
      ]
    },
    {
      name: "Remote Violence",
      children: [
        { name: "Air strikes", value: 310 },
        { name: "Shelling", value: 250 },
        { name: "IEDs", value: 150 }
      ]
    },
    {
      name: "Civilian Impact",
      children: [
        { name: "Abduction", value: 100 },
        { name: "Harassment", value: 80 },
        { name: "Displacement", value: 220 }
      ]
    }
  ]
};

// hierarchy logic
const root = d3.hierarchy(dummyData)
  .sum(d => d.value)
  .sort((a, b) => b.value - a.value);

const pack = d3.pack()
  .size([width, height])
  .padding(15); // Space between bubbles

pack(root);

// Rendering
const node = svg.selectAll("g.node")
  .data(root.descendants())
  .join("g")
  .attr("class", "node")
  .attr("transform", d => `translate(${d.x},${d.y})`);

// Draw Circles
node.append("circle")
  .attr("id", d => `circle-${d.data.name.replace(/\s+/g, '-')}`)
  .attr("r", d => d.r)
  .attr("fill", d => {
    // Coloring logic:
    // Level 0 : White
    // Level 1 : Use color scale
    // Level 2 : White (TBD: a lighter version of parent?)
    if (d.depth === 0) return cssWhite; 
    if (d.depth === 1) return colorScale(d.data.name);
    if (d.depth === 2) return cssWhite;
  })
  .attr("stroke", cssBlack)
  .attr("stroke-width", d => d.depth === 1 ? 2 : 1) // Thicker stroke for groups
  .on("mouseover", function (event, d) {
    if (d.depth === 0) return; // Ignore root
    
    tooltip
      .html(`<strong>${d.data.name}</strong><br/>Value: ${d.value || "N/A"}`)
      .style("opacity", 1);
      
    d3.select(this).attr("stroke-width", 3);
  })
  .on("mousemove", function (event) {
    tooltip
      .style("top", (event.pageY + 15) + "px")
      .style("left", (event.pageX + 15) + "px");
  })
  .on("mouseout", function (event, d) {
    tooltip.style("opacity", 0);
    d3.select(this).attr("stroke-width", d.depth === 1 ? 2 : 1);
  });

// labels
node.append("text")
  .filter(d => d.r > 20 && d.depth > 0) // Only label if bubble is big enough
  .attr("text-anchor", "middle")
  
  .attr("y", d => d.depth === 1 ? -d.r - 10 : 0) // move parent's outside
  .attr("dy", d => d.depth === 1 ? "0em" : "0.3em")

  .style("font-size", d => Math.min(d.r / 3, 14) + "px")
  .style("pointer-events", "none")
  .style("fill", cssBlack)
  .style("font-weight", d => d.depth === 1 ? "bold" : "normal")
  .text(d => d.data.name);


// Initial Theme Check
const initialTheme = document.body.classList.contains("body-mode");
window.updateBubbleTheme(initialTheme);

// DARK MODE
window.updateBubbleTheme = function(isDarkMode) {
  const rectangle = d3.selectAll("#bubbleplot .rectangle");
  if(!rectangle.empty())
    rectangle.attr("stroke", isDarkMode ? cssWhite : cssBlack);

  const circles = d3.selectAll("#bubbleplot circle");
  if(!circles.empty()) {
    circles.attr("stroke", isDarkMode ? cssWhite : cssBlack);
    // Specifically handle Leaf nodes (depth 2) which are usually white
    circles.filter(d => d.depth === 2)
           .attr("fill", isDarkMode ? "#444" : cssWhite);
  }

  const texts = d3.selectAll("#bubbleplot text");
  if(!texts.empty())
    texts.style("fill", isDarkMode ? cssWhite : cssBlack);
  
  if (!tooltip.empty()) {
    tooltip
      .style("background-color", isDarkMode ? cssBlack : cssWhite)
      .style("color", isDarkMode ? cssWhite : cssBlack)
      .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
  }
};