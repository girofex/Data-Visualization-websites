import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { sankey, sankeyLinkHorizontal } from "https://cdn.jsdelivr.net/npm/d3-sankey@0.12/+esm";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const cssOrange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const cssGreen = getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
const cssPurple = getComputedStyle(document.documentElement).getPropertyValue("--purple").trim();

var margin = { top: 10, right: 0, bottom: 0, left: 0 },
    width = 1200 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;

const svg = d3.select("#sankey")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

Promise.all([
    d3.json("resources/plots/sectionfive/sankey_nodes.json"),
    d3.json("resources/plots/sectionfive/sankey_links.json")
]).then(([nodes, links]) => {
    const graph = { nodes, links };
    const sankeyGen = sankey()
        .nodeWidth(20)
        .nodePadding(25)
        .extent([[20, 20], [width - 20, height - 20]]);

    sankeyGen(graph);

    const color = {
        "Event": cssOrange,
        "Sub Event": cssGreen,
        "Disorder": cssPurple
    };

    //Links
    svg.append("g")
        .selectAll("path")
        .data(graph.links)
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", sankeyLinkHorizontal())
        .attr("stroke", d => {
            if (d.source.name.startsWith("E:")) return color["Event"];
            if (d.source.name.startsWith("S:")) return color["Sub Event"];
            if (d.source.name.startsWith("D:")) return color["Disorder"];
        })
        .attr("stroke-width", d => Math.max(1, d.width))
        .attr("fill", "none")
        .style("stroke-opacity", 0.4)
        .on("mousemove", function (event, d) {
            d3.select(this).style("stroke-opacity", 0.9);

            const formatNumber = d3.format(",");
            const formatted = formatNumber(d.value).replace(/,/g, ".");

            tooltip.style("opacity", 1)
                .html(`<span>Value: ${formatted}</span>`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseleave", function (event, d) {
            d3.select(this).style("stroke-opacity", 0.4);
            tooltip.style("opacity", 0);
        });

    //Nodes
    const node = svg.append("g")
        .selectAll("g")
        .data(graph.nodes)
        .enter()
        .append("g")
        .attr("class", "node");

    node.append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => {
            if (d.name.startsWith("E:"))
                return color["Event"];
            if (d.name.startsWith("S:"))
                return color["Sub Event"];
            if (d.name.startsWith("D:"))
                return color["Disorder"];
        })
        .attr("stroke", cssBlack)
        .on("mousemove", (event, d) => {
            const label = d.name.startsWith("E:") ? "Event" :
                d.name.startsWith("S:") ? "Sub Event" :
                    d.name.startsWith("D:") ? "Disorder" : "Node";

            const formatNumber = d3.format(",");
            const formatted = formatNumber(d.value).replace(/,/g, ".");

            const formatWord = d.name.slice(2);

            tooltip.style("opacity", 1)
                .html(`<strong>${label}</strong><br>
                    ${formatWord}<br>
                    <span>Count: ${formatted}</span>`
                )
                .style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseleave", () => tooltip.style("opacity", 0));

    // Node labels
    node.append("text")
        .attr("class", "nodeLabels")
        .attr("x", d => d.x0 - 6)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(d => d.name.replace(/^.\:/, ""))
        .filter(d => d.x0 < width / 2)
        .attr("x", d => d.x1 + 6)
        .attr("text-anchor", "start")
        .attr("pointer-events", "none")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans");

    const initialTheme = document.body.classList.contains("body-mode");
    window.updateSankeyDiagramTheme(initialTheme);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/
window.updateSankeyDiagramTheme = function (isDarkMode) {
    const labels = d3.selectAll("#sankey .nodeLabels");
    if (!labels.empty())
        labels.style("fill", isDarkMode ? cssWhite : cssBlack);

    if (!tooltip.empty()) {
        tooltip
            .style("background-color", isDarkMode ? cssBlack : cssWhite)
            .style("color", isDarkMode ? cssWhite : cssBlack)
            .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
    }
};