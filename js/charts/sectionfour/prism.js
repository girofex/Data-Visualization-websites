import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();

var water_color = cssBlack;
var countries_color = cssBlack;
var borders_color = cssWhite;

var margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 1000 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

const canvas = d3.select("#prism")
    .append("canvas")
    .attr("width", width)
    .attr("height", height);

const context = canvas.node().getContext("2d");

const devicePixelRatio = window.devicePixelRatio || 1;
canvas.attr("width", width * devicePixelRatio)
      .attr("height", height * devicePixelRatio)
      .style("width", `${width}px`)
      .style("height", `${height}px`);
context.scale(devicePixelRatio, devicePixelRatio);

const projection = d3.geoOrthographic()
    .scale(250)
    .translate([width / 2, height / 2])
    .clipAngle(90);

const path = d3.geoPath()
    .projection(projection)
    .context(context);

//Zoom
const zoom = d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", (event) => {
        const t = event.transform;
        projection.scale(250 * t.k);
        
        if(event.sourceEvent && event.sourceEvent.type === "mousemove") {
            const rotate = projection.rotate();
            const k = 75 / projection.scale();
            projection.rotate([
                rotate[0] + event.sourceEvent.movementX * k,
                rotate[1] - event.sourceEvent.movementY * k
            ]);
        }

        render();
    });

canvas.call(zoom);

d3.select("#prism-zoom-in").on("click", () => {
    canvas.transition().call(zoom.scaleBy, 2);
});

d3.select("#prism-zoom-out").on("click", () => {
    const t = d3.zoomTransform(canvas.node());
    if (t.k <= 1.001)
        canvas.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
    else
        canvas.transition().call(zoom.scaleBy, 1 / 1.5);
});
d3.select("#prism-zoom-restore").on("click",
 () => {
    canvas.transition().call(zoom.transform, d3.zoomIdentity);
});

Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson?raw=1"),
  d3.csv("resources/plots/sectionfour/prism.csv")
]).then(function ([topo, eventData]) {
    //Spikes
    const spikeData = eventData.map(d => ({
        long: +d.CENTROID_LONGITUDE,
        lat: +d.CENTROID_LATITUDE,
        value: +Math.log(d.EVENTS) 
    }));

    const heightScale = d3.scaleLinear().domain([0, 1]).range([5, 15]);
    
    const maxValue = d3.max(spikeData, d => d.value);
    const colorScale = d3.scaleSequential().domain([0, maxValue]).interpolator(d3.interpolateInferno);

    function render() {
        context.clearRect(0, 0, width, height);

        //Water
        context.beginPath();
        path({type: "Sphere"});
        context.fillStyle = water_color;
        context.fill();

        context.beginPath();
        path(topo); 
        context.fillStyle = countries_color;
        context.fill();
        context.strokeStyle = borders_color;
        context.lineWidth = 0.5;
        context.stroke();

        //Spikes
        const center = projection.invert([width / 2, height / 2]);
        const spikeWidth = 3;

        spikeData.forEach(d => {
            const dist = d3.geoDistance([d.long, d.lat], center);
            
            if(dist < 1.57){
                const [x, y] = projection([d.long, d.lat]);
                const spikeLen = heightScale(d.value);
                const color = colorScale(d.value);

                const dx = x - width / 2;
                const dy = y - height / 2;
                const angle = Math.atan2(dy, dx) + (Math.PI / 2);

                context.save();
                context.translate(x, y);
                context.rotate(angle);

                //Triangles
                context.beginPath();
                context.moveTo(-spikeWidth / 2, 0);
                context.lineTo(0, -spikeLen);
                context.lineTo(spikeWidth / 2, 0);
                context.closePath();
                context.fillStyle = color;
                context.globalAlpha = 0.8;
                context.fill();

                context.restore();
            }
        });
    }

    //Interaction
    canvas.call(d3.drag()
        .on("drag", (event) => {
            const rotate = projection.rotate();
            const k = 75 / projection.scale();
            projection.rotate([
                rotate[0] + event.dx * k,
                rotate[1] - event.dy * k
            ]);

            render();
        })
    );

    d3.timer(() => {
        const rotate = projection.rotate();
        projection.rotate([rotate[0], rotate[1]]);
        
        render();
    });

    const initialTheme = document.body.classList.contains("body-mode");
    window.updatePrismMapTheme(initialTheme);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/
window.updatePrismMapTheme = function(isDarkMode) {
  water_color = isDarkMode ? cssWhite : cssBlack;
  countries_color = isDarkMode ? cssWhite : cssBlack;
  borders_color = isDarkMode ? cssBlack : cssWhite;
};