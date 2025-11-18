import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { annotation, annotationLabel } from "https://cdn.jsdelivr.net/npm/d3-svg-annotation@2.5.1/+esm";

var margin = {top: 70, right: 150, bottom: 55, left: 110},
  width = 1200 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

const csv = [
  { name: "Africa", path: "resources/plots/sectionthree/africa.csv" },
  { name: "Asia-Pacific", path: "resources/plots/sectionthree/asiapacific.csv" },
  { name: "Europe-Central Asia", path: "resources/plots/sectionthree/europecentralasia.csv" },
  { name: "Latin America-Caribbean", path: "resources/plots/sectionthree/latinamericacaribbean.csv" },
  { name: "Middle East", path: "resources/plots/sectionthree/middleeast.csv" },
  { name: "US-Canada", path: "resources/plots/sectionthree/uscanada.csv" }
];

const linechart1 = document.getElementById("linechart");
const linechart2 = document.getElementById("linechart2");

Promise.all(csv.map(file => 
  d3.csv(file.path).then(data => ({ name: file.name, data }))
))
.then(function (datasets) {

    datasets.forEach(d => {
        d.data.forEach(row => {
            row.YEAR = +row.YEAR;
            row.POPULATION_EXPOSURE = +row.POPULATION_EXPOSURE;
            row.EVENTS = +row.EVENTS;
        });
    });

    if (linechart1)
        createChart("#linechart", datasets, "POPULATION_EXPOSURE");
    
    if (linechart2)
        createChart("#linechart2", datasets, "EVENTS");

    const initialTheme = document.body.classList.contains("body-mode");
    window.updateLineChartTheme(initialTheme);
});

//Animation
const observerOptions = {
    root: null,
    threshold: 0.5
};

const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {

            const svg = d3.select(entry.target);

            if (svg.attr("data-animate") === "false") {
                svg.attr("data-animate", "true");

                svg.selectAll(".line").each(function () {
                    const totalLength = this.getTotalLength();

                    d3.select(this)
                        .attr("stroke-dasharray", totalLength + " " + totalLength)
                        .attr("stroke-dashoffset", totalLength)
                        .transition()
                        .duration(2500)
                        .ease(d3.easeSin)
                        .attr("stroke-dashoffset", 0);
                });
            }
        }
    });
}, observerOptions);

//Chart
function createChart(containerId, datasets, yField) {
    const svgRoot = d3.select(containerId)
        .append("svg")
        .attr("data-animate", "false")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    chartObserver.observe(svgRoot.node());

    const svg = svgRoot.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const colorScale = d3.scaleOrdinal()
        .domain(datasets.map(d => d.name))
        .range(['#1f77b4','#f87060','#69b3a2', '#d62728', '#9467bd', '#ffca4d']);

    //X axis
    const x = d3.scaleLinear()
        .domain([
            d3.min(datasets, d => d3.min(d.data, r => r.YEAR)) - (containerId=="#linechart" ? 0.9 : 0),
            d3.max(datasets, d => d3.max(d.data, r => r.YEAR))
        ])
        .range([0, width]);

    const xAxis = d3.axisBottom(x)
        .tickFormat(d3.format("d"))
        .ticks(7);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .selectAll("text")
            .style("font-size", "12px")
            .style("font-family", "Fira Sans");

    //Y axis
    const y = d3.scaleLinear()
        .domain([
            d3.min(datasets, d => d3.min(d.data, r => r[yField])),
            d3.max(datasets, d => d3.max(d.data, r => r[yField]))
        ])
        .nice()
        .range([height, 0]);

    const yAxis = d3.axisLeft(y)
        .tickFormat(d => d3.format(",")(d).replace(/,/g, "."));

    svg.append("g")
        .call(yAxis)
        .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans");
    
    svg.append("text")
      .attr("class", "yAxisTitle")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text(containerId=="#linechart" ? "Population Exposure" : "Number of Events");

    //Line
    const lineGen = d3.line()
        .x(d => x(d.YEAR))
        .y(d => y(d[yField]))
        .defined(d => !isNaN(d.YEAR) && !isNaN(d[yField]));
    
    const group = svg.selectAll(".area-line")
        .data(datasets)
        .join("g")
        .attr("class", "area-line");
    
    const path = group.append("path")
        .attr("class", "line")
        .attr("data-region", d => d.name)
        .attr("d", d => lineGen(d.data))
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d.name))
        .attr("stroke-width", 2.5)
        .style("cursor", "pointer")
        .on("click", handleToggle);

    //Labels
    let labels = datasets.map(d => {
        const lastPoint = [...d.data].reverse().find(p => lineGen.defined()(p));

        return {
            name: d.name,
            color: colorScale(d.name),
            x: x(lastPoint.YEAR),
            y: y(lastPoint[yField]),
            origY: y(lastPoint[yField])
        };
    });

    const minSpacing = 18;
    labels.sort((a,b) => a.y - b.y);

    for (let i = 1; i < labels.length; i++) {
        if ((labels[i].y - labels[i-1].y) < minSpacing)
            labels[i].y = labels[i-1].y + minSpacing;
    }
    
    for (let i = labels.length - 2; i >= 0; i--) {
        if ((labels[i+1].y - labels[i].y) < minSpacing)
            labels[i].y = labels[i+1].y - minSpacing;
    }

    labels.forEach(l => {
        l.y = Math.max(0, Math.min(height, l.y));
        l.x = width + 8;
    });

    labels.forEach(l => {
        svg.append("text")
        .attr("data-region", l.name)
        .attr("x", l.x)
        .attr("y", l.y)
        .text(l.name)
        .style("font-family", "Fira Sans")
        .style("font-size", "12px")
        .style("fill", l.color)
        .style("cursor", "pointer")
        .on("click", handleToggle);
    });

    //Annotation
    if(containerId=="#linechart"){
        const note = [{
            note: {
                label: "Min value: 138.390",
                title: "Warning: this isn't 0"
            },
            x: x(2019),
            y: y(0),
            dx: -40,
            dy: -40,
            color: "#102542"
        }];

        const makeAnnotations = annotation()
            .annotations(note)
            .type(annotationLabel)
            .textWrap(150);

        const annotationGroup = svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);

        annotationGroup.selectAll(".annotation-note-label").each(function() {
            const bbox = this.getBBox();
            const x = bbox.x;
            const y = bbox.y + bbox.height + 8;
            const underlineLength = bbox.width - 15;

            d3.select(this.parentNode)
                .append("line")
                .attr("x1", x)
                .attr("x2", x + underlineLength)
                .attr("y1", y)
                .attr("y2", y)
                .attr("stroke", "#102542")
                .attr("stroke-width", 1);
        });

        annotationGroup.selectAll(".annotation-note-title")
            .style("font-family", "Roboto Slab")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("fill", "#102542");

        annotationGroup.selectAll(".annotation-note-label")
            .style("font-family", "Fira Sans")
            .style("font-size", "12px")
            .style("fill", "#102542");
    }

    //Opacity
    let activeRegion = null;

    function handleToggle(event) {
        const clickedRegion = d3.select(this).attr("data-region");

        if (activeRegion === clickedRegion) {
            activeRegion = null;

            svg.selectAll(".line")
                .transition().duration(300)
                .style("opacity", 1);

            svg.selectAll("text[data-region]")
                .transition().duration(300)
                .style("opacity", 1);

            return;
        }

        activeRegion = clickedRegion;

        svg.selectAll(".line")
            .transition().duration(300)
            .style("opacity", function () {
                return d3.select(this).attr("data-region") === clickedRegion ? 1 : 0.2;
            });

        svg.selectAll("text[data-region]")
            .transition().duration(300)
            .style("opacity", function () {
                return d3.select(this).attr("data-region") === clickedRegion ? 1 : 0.2;
            });
    }
}

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/
window.updateLineChartTheme = function(isDarkMode) {
    const axisTitle1 = d3.selectAll("#linechart .yAxisTitle");
    if (!axisTitle1.empty())
        axisTitle1.style("fill", isDarkMode ? "#ebe7e6" : "#102542");
    
    const axisTitle2 = d3.selectAll("#linechart2 .yAxisTitle");
    if (!axisTitle2.empty())
        axisTitle2.style("fill", isDarkMode ? "#ebe7e6" : "#102542");

    const annotationTitles = d3.selectAll("#linechart .annotation-note-title");
    if (!annotationTitles.empty())
        annotationTitles.style("fill", isDarkMode ? "#ebe7e6" : "#102542");

    const annotationLabels = d3.selectAll("#linechart .annotation-note-label");
    if (!annotationLabels.empty())
        annotationLabels.style("fill", isDarkMode ? "#ebe7e6" : "#102542");

    const annotationLines = d3.selectAll("#linechart .annotation-group line");
    if (!annotationLines.empty())
        annotationLines.style("stroke", isDarkMode ? "#ebe7e6" : "#102542");

    const connector = d3.selectAll("#linechart .annotation-connector path");
    if (!connector.empty())
        connector.style("stroke", isDarkMode ? "#ebe7e6" : "#102542");
    
    const legendText = d3.selectAll("#linechart .legendText");
    if (!legendText.empty())
        legendText.style("fill", isDarkMode ? "#ebe7e6" : "#102542");
};
