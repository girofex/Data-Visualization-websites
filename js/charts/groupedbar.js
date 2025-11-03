import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { annotation, annotationLabel } from "https://cdn.jsdelivr.net/npm/d3-svg-annotation@2.5.1/+esm";

const margin = {top: 50, right: 190, bottom: 70, left: 100};
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#groupedbarchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip");

const category = ["Battles", "ViolenceAgainstCivilians"];
const colors = d3.scaleOrdinal()
  .domain(category)
  .range(["#f87060", "#69b3a2"]);

d3.csv("./resources/plots/grouped_bar_data.csv")
  .then(function(data) {
    //X0 scale
    const x0 = d3.scaleBand()
      .domain(data.map(d => d.Region))
      .range([0, width])
      .padding(0.2);
    
    //X1 scale
    const x1 = d3.scaleBand()
      .domain(category)
      .range([0, x0.bandwidth()])
      .padding(0.05);
    
    //X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
        .style("font-size", "12px")
        .style("font-family", "Fira Sans")
        .each(function(d) {
          var text = d3.select(this);
          var parts = d.split("/");
          text.text("");
          
          parts.forEach(function(part, i) {
            text.append("tspan")
              .attr("x", 0)
              .attr("dy", i === 0 ? "0.8em" : "1.1em")
              .text(i < parts.length - 1 ? part + "," : part);
          });
        });

    //Y scale
    const maxY = d3.max(data, d => d3.max(category, key => d[key]));
    const y = d3.scaleLinear()
      .domain([0, maxY])
      .nice(5000)
      .range([height, 0]);
    
    const yAxis = d3.axisLeft(y).tickFormat(d3.format(","));
    
    //Y axis
    svg.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style("font-size", "12px");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left - 2)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .style("font-family", "Roboto Slab")
      .text("Total occurrences");
    
    //Groups
    const regionGroups = svg.selectAll(".region-group")
      .data(data)
      .enter()
      .append("g")
        .attr("class", "region-group")
        .attr("transform", d => `translate(${x0(d.Region)},0)`);
    
    //Bars
    regionGroups.selectAll("rect")
      .data(d => category.map(key => ({key: key, value: d[key], region: d.Region})))
      .enter()
      .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => colors(d.key))
        .on("mouseover", function(event, d) {
          d3.select(this)
            .attr("opacity", 0.7);
          
          const spaced = d.key.replace(/([a-z])([A-Z])/g, "$1 $2");
        
          tooltip
            .style("opacity", 1)
            .html(`<strong>${spaced}</strong><br/>Mean: ${d.value}`);
        })

        .on("mousemove", function(event, d) {
          tooltip
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
        })
        
        .on("mouseout", function() {
          d3.select(this)
            .attr("opacity", 1);
          
          tooltip.style("opacity", 0);
        });
    
    //Annotation
    const usCanadaData = data.find(d => d.Region === "US/Canada");
    const categoryToAnnotate = "Battles";

    const barX = x0("US/Canada") + x1(categoryToAnnotate) + x1.bandwidth() / 2;
    const barY = y(usCanadaData[categoryToAnnotate]);

    const note = [
      {
        note: {
          label: "Mean: 32",
          title: "US/Canada Battles"
        },
        x: barX,
        y: barY,
        dx: 50,
        dy: -50,
        color: "#102542"
      }
    ];

    const makeAnnotations = annotation()
      .annotations(note)
      .type(annotationLabel);

    const annotationGroup = svg.append("g")
      .attr("class", "annotation-group")
      .call(makeAnnotations);

    annotationGroup.selectAll(".annotation-note-label").each(function() {
      const title = d3.select(this);
      const bbox = this.getBBox();

      // Add line just below the text
      d3.select(this.parentNode)
        .append("line")
        .attr("x1", bbox.x)
        .attr("x2", bbox.x + bbox.width)
        .attr("y1", bbox.y + bbox.height + 2) // 2px below text
        .attr("y2", bbox.y + bbox.height + 2)
        .attr("stroke", "#102542")
        .attr("stroke-width", 1.5);
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

    //Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + 20}, 0)`);
    
    const legendItems = legend.selectAll(".legend-item")
      .data(category)
      .enter()
      .append("g")
        .attr("class", "legend-item")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);
    
    legendItems.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", d => colors(d));
    
    legendItems.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("font-family", "Fira Sans")
      .text(d => {
        let spaced = d.replace(/([a-z])([A-Z])/g, '$1 $2');
        return spaced.trim();
      });
  })

  .catch(function(error) {
    console.error("Error loading grouped bar chart data:", error);
  });