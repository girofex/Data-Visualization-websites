import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// EXAMPLE

// Dimensions and margins
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 700 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#wafflechart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create tooltip
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

// Mock data
const mockData = [
  {category: "Product A", value: 35, color: "#1f77b4"},
  {category: "Product B", value: 25, color: "#ff7f0e"},
  {category: "Product C", value: 20, color: "#2ca02c"},
  {category: "Product D", value: 15, color: "#d62728"},
  {category: "Product E", value: 5, color: "#9467bd"}
];

// Load mock data
function loadData() {
  return Promise.resolve(mockData);
}

// What to do?