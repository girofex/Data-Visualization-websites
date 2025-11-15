import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var margin = {top: 70, right: 150, bottom: 55, left: 110},
  width = 1200 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

const svg = d3.select("#linechart")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const csv = [
  { name: "Africa", path: "resources/plots/sectionthree/africa.csv" },
  { name: "Asia-Pacific", path: "resources/plots/sectionthree/asiapacific.csv" },
  { name: "Europe-Central Asia", path: "resources/plots/sectionthree/europecentralasia.csv" },
  { name: "Latin America-Caribbean", path: "resources/plots/sectionthree/latinamericacaribbean.csv" },
  { name: "Middle East", path: "resources/plots/sectionthree/middleeast.csv" },
  { name: "US-Canada", path: "resources/plots/sectionthree/uscanada.csv" }
];

Promise.all(csv.map(file => 
  d3.csv(file.path).then(data => ({ name: file.name, data }))
))
.then(function (datasets) {
    datasets.forEach(d => {
        d.data.forEach(row => {
            row.YEAR = +row.YEAR;
            row.POPULATION_EXPOSURE = +row.POPULATION_EXPOSURE;
        });
    });

    const colorScale = d3.scaleOrdinal()
        .domain(datasets.map(d => d.name))
        .range(['#1f77b4','#f87060','#69b3a2', '#d62728', '#9467bd', '#ffca4d']);

    const x = d3.scaleLinear()
        .domain([
            d3.min(datasets, d => d3.min(d.data, r => r.YEAR)),
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

    const y = d3.scaleLinear()
        .domain([
            d3.min(datasets, d => d3.min(d.data, r => r.POPULATION_EXPOSURE)),
            d3.max(datasets, d => d3.max(d.data, r => r.POPULATION_EXPOSURE))
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

    const lineGen = d3.line()
    .x(d => x(d.YEAR))
    .y(d => y(d.POPULATION_EXPOSURE))
    .defined(d => !isNaN(d.YEAR) && !isNaN(d.POPULATION_EXPOSURE));

    const group = svg.selectAll(".area-line")
        .data(datasets)
        .join("g")
        .attr("class", "area-line");

    group.append("path")
        .attr("class", "line")
        .attr("d", d => lineGen(d.data))
        .attr("fill", "none")
        .attr("stroke", d => colorScale(d.name))
        .attr("stroke-width", 2.5)
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .style("opacity", 0.95)
        .each(function() {
            const totalLength = this.getTotalLength();

            d3.select(this)
                .attr("stroke-dasharray", totalLength + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                    .duration(2000)
                    .ease(d3.easeLinear)
                    .attr("stroke-dashoffset", 0);
        });

    let labels = datasets.map(d => {
        const lastPoint = [...d.data].reverse().find(p => lineGen.defined()(p));

        return {
            name: d.name,
            color: colorScale(d.name),
            x: lastPoint ? x(lastPoint.YEAR) : x(d.data[d.data.length-1].YEAR),
            y: lastPoint ? y(lastPoint.POPULATION_EXPOSURE) : y(d.data[d.data.length-1].POPULATION_EXPOSURE),
            origY: lastPoint ? y(lastPoint.POPULATION_EXPOSURE) : y(d.data[d.data.length-1].POPULATION_EXPOSURE)
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
        .attr("x", l.x)
        .attr("y", l.y)
        .text(l.name)
        .attr("text-anchor", "start")
        .style("font-family", "Fira Sans")
        .style("font-size", "12px")
        .style("fill", l.color)
        .style("font-weight", 600)
        .style("pointer-events", "none");
    });

    const initialTheme = document.body.classList.contains("body-mode");
    window.updateLineChartTheme(initialTheme);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/
window.updateLineChartTheme = function(isDarkMode) {
  const axisTitle = d3.selectAll("#barchart .yAxisTitle");
  if (!axisTitle.empty())
    axisTitle.style("fill", isDarkMode ? "#ebe7e6" : "#102542");
};