import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { renderBoxPlot } from "./boxplot.js";
import { renderHistogram } from "./histogram.js";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();

const dropdown = d3.select("#dropdown")
  .append("select")
  .attr("id", "plot-select");

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

  if(selected === "Box Plot"){
    box.style("display", "block");
    hist.style("display", "none");
    renderBoxPlot();
  }else{
    box.style("display", "none");
    hist.style("display", "block");
    renderHistogram();
  }
}

showChart("Box Plot");

dropdown.on("change", function(){
  showChart(this.value);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/

window.updateDropdownTheme = function(isDarkMode) {
  const menu = d3.select("#plot-select");
  if(!menu.empty()){
    menu
      .style("background-color", isDarkMode ? cssBlack : "transparent")
      .style("color", isDarkMode ? cssWhite : cssBlack)
      .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
  }
};

const initialTheme = document.body.classList.contains("body-mode");
window.updateDropdownTheme(initialTheme);