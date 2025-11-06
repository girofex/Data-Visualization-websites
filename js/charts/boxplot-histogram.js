import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { renderBoxPlot } from "./boxplot.js";
import { renderHistogram } from "./histogram.js";

const menuContainer = d3.select("#chart-container")
  .insert("div", ":first-child")
  .style("margin-top", "1rem")
  .style("margin-left", "6rem");

const dropdown = menuContainer.append("select")
  .attr("id", "plot-select")
  .style("padding", "0.5rem")
  .style("font-family", "Fira Sans")
  .style("font-size", "14px");

dropdown.selectAll("option")
  .data(["Box Plot", "Histogram"])
  .enter()
  .append("option")
  .text(d => d)
  .attr("value", d => d);

//Render
function showChart(selected) {
  const box = d3.select("#boxplot_container");
  const hist = d3.select("#histogram_container");

  if (selected === "Box Plot") {
    box.style("display", "block");
    hist.style("display", "none");
    renderBoxPlot();
  } else {
    box.style("display", "none");
    hist.style("display", "block");
    renderHistogram();
  }
}

showChart("Box Plot");

dropdown.on("change", function() {
  showChart(this.value);
});
