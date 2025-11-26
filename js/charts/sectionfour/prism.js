import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const cssBlack = getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
const cssWhite = getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
const cssOrange = getComputedStyle(document.documentElement).getPropertyValue("--orange").trim();
const cssGray = getComputedStyle(document.documentElement).getPropertyValue("--gray").trim();

var margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 1000 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

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

const container = d3.select("#prism")
  .style("position", "relative")
  .node();

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
camera.position.set(0, 0, 450);

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(1, 1, 1);
scene.add(light);

//Globe
const radius = 150;
const globeGeom = new THREE.SphereGeometry(radius, 64, 64);
const globeMat = new THREE.MeshPhongMaterial({
  color: cssGray,
  shininess: 10
});

const globe = new THREE.Mesh(globeGeom, globeMat);
scene.add(globe);

//Convert lat/long to 3D
function latLonToXYZ(lat, lon, r = radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

const path = d3.geoPath().projection(null);
const scaleHeight = d3.scaleLinear().range([2, 40]);

Promise.all([
  d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  d3.csv("resources/plots/sectionfour/hex.csv")
]).then(function (loadData) {
    const topo = loadData[0];
    const csvData = loadData[1];

    const bordersGroup = new THREE.Group();
    scene.add(bordersGroup);

    topo.features.forEach(f => {
        const coords = f.geometry.coordinates;

        coords.forEach(poly => {
            poly.forEach(ring => {
                const borderPoints = [];

                ring.forEach(([lon, lat]) => {
                    borderPoints.push(latLonToXYZ(lat, lon, radius + 0.2));
                });

                const borderGeom = new THREE.BufferGeometry().setFromPoints(borderPoints);
                const borderMat = new THREE.LineBasicMaterial({
                    color: cssBlack,
                    linewidth: 1
                });

                const borderLine = new THREE.LineLoop(borderGeom, borderMat);
                bordersGroup.add(borderLine);
            });
        });
    });

    const countMap = new Map();
    csvData.forEach(row => {
        countMap.set(row.COUNTRY, +row.count);
    });

    scaleHeight.domain(d3.extent(csvData, d => +d.count));

    const spikesGroup = new THREE.Group();
    scene.add(spikesGroup);

    topo.features.forEach(f => {
        const name = f.properties.name;

        const count = countMap.get(name);
        if(!count)
            return;

        const centroid = d3.geoCentroid(f);
        if(!centroid)
            return;

        const [lon, lat] = centroid;
        const surfacePoint = latLonToXYZ(lat, lon, radius);

        const height = scaleHeight(count);

        const spikeGeom = new THREE.CylinderGeometry(0, 1.2, height, 16);  

        const spikeMat = new THREE.MeshPhongMaterial({
            color: cssOrange
        });

        const spike = new THREE.Mesh(spikeGeom, spikeMat);

        const normal = surfacePoint.clone().normalize();

        const midPoint = latLonToXYZ(lat, lon, radius + height / 2);
        spike.position.copy(midPoint);

        const axis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(axis, normal);
        spike.quaternion.copy(quaternion);

        spike.userData = { name, count };
        spikesGroup.add(spike);
    });

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let mousePageX = 0;
    let mousePageY = 0;

    function onMouseMove(event){
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        mousePageX = event.pageX;
        mousePageY = event.pageY;
    }
    window.addEventListener("mousemove", onMouseMove);

    function animate() {
        requestAnimationFrame(animate);
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(spikesGroup.children);

        if (intersects.length > 0) {
            const spike = intersects[0].object;
            const { name, count } = spike.userData;

            tooltip
                .html(`<strong>${name}</strong><br/>${count} events`)
                .style("opacity", 1)
                .style("top", (mousePageY + 15) + "px")
                .style("left", (mousePageX + 15) + "px");
        } else
            tooltip.style("opacity", 0);

        renderer.render(scene, camera);
    }

    animate();

    let isDragging = false, prevX = 0, prevY = 0;

    renderer.domElement.addEventListener("mousedown", e => {
        isDragging = true;
        prevX = e.clientX;
        prevY = e.clientY;
    });

    window.addEventListener("mouseup", () => isDragging = false);

    renderer.domElement.addEventListener("mousemove", e => {
        if(!isDragging)
            return;

        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;

        scene.rotation.y += dx * 0.005;
        scene.rotation.x += dy * 0.005;

        prevX = e.clientX;
        prevY = e.clientY;
    });

    const initialTheme = document.body.classList.contains("body-mode");
    window.updatePrismMapTheme(initialTheme);
});

/*/*//*/*//*/*//*/*//*/*//*/*//*/*//*/*
DARK MODE
/*//*/*//*//*//*//*//*//*//*//*//*//*/
window.updatePrismMapTheme = function(isDarkMode) {
    const borders = d3.selectAll("#prism .borders");
    if(!borders.empty())
        borders.attr("stroke", isDarkMode ? cssBlack : cssWhite);

    const legendText = d3.selectAll("#prism .legend text");
    if (!legendText.empty())
        legendText.style("fill", isDarkMode ? cssWhite : cssBlack);
    
    if (!tooltip.empty()) {
        tooltip
        .style("background-color", isDarkMode ? cssBlack : cssWhite)
        .style("color", isDarkMode ? cssWhite : cssBlack)
        .style("border", `1px solid ${isDarkMode ? cssWhite : cssBlack}`);
    }
};