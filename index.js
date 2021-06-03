const renderBarChart = (data) => {
  const svg = d3.select(".barChart").append("svg");
  const svgWidth = 1000;
  const svgHeight = 5000;
  svg.attr("width", svgWidth).attr("height", svgHeight);
  const xValue = (d) => d.total_cases_per_million;
  const xAxisLabel = "total_cases_per_million";
  const yAxisLabel = "";
  const title = "data";
  const yValue = (d) => d.location;
  const margin = { top: 50, right: 20, bottom: 200, left: 150 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, xValue)])
    .range([0, innerWidth]);

  const yScale = d3
    .scaleBand()
    .domain(data.map(yValue))
    .range([0, innerHeight])
    .padding(0.2);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  g.append("g")
    .call(d3.axisLeft(yScale))
    .selectAll(".domain, .tick line")
    .remove();
  const xAxisG = g
    .append("g")
    .call(
      d3.axisBottom(xScale).tickFormat(d3.format(".3s")).tickSize(-innerHeight)
    )
    .attr("transform", `translate(0, ${innerHeight})`);

  xAxisG.select(".domain").remove();

  xAxisG
    .append("text")
    .attr("class", "xAxis-lable")
    .attr("x", innerWidth / 2)
    .attr("y", 50)
    .attr("fill", "black")
    .text(xAxisLabel);

  g.selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("y", (d) => yScale(yValue(d)))
    .attr("width", (d) => xScale(xValue(d)))
    .attr("height", yScale.bandwidth());

  g.append("text")
    .text(title)
    .attr("x", innerWidth / 3)
    .attr("class", "title");
};

const renderBubbleChart = (data) => {
  const svg = d3.select(".bubbleChart").append("svg");
  const svgWidth = document.body.clientWidth;
  const svgHeight = 500;
  svg.attr("width", svgWidth).attr("height", svgHeight);
  const xValue = (d) => d.total_cases_per_million;
  const yValue = (d) => d.total_deaths_per_million;
  const zValue = (d) => d.total_vaccinations_per_hundred;

  const xAxisLabel = "total_cases_per_million";
  const yAxisLabel = "total_deaths_per_million";
  const title = "Title";

  const margin = { top: 100, right: 100, bottom: 200, left: 100 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = svgHeight - margin.top - margin.bottom;
  const xScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, xValue)])
    .range([0, innerWidth])
    .nice();
  const zScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, zValue)])
    .range([0, 10]);
  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, yValue)])
    .range([innerHeight, 0])
    .nice();

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const yAxisG = g
    .append("g")
    .call(
      d3.axisLeft(yScale).tickFormat(d3.format(".2s")).tickSize(-innerWidth)
    );
  yAxisG.selectAll(".domain").remove();
  yAxisG
    .append("text")
    .attr("class", "yAxis-label")
    .text(yAxisLabel)
    .attr("fill", "black")
    .attr("transform", "rotate(-90)")
    //.attr("text-anchor", "bottom")
    .attr("x", innerHeight / 2 - 100)
    .attr("y", -50);
  const xAxisG = g
    .append("g")
    .call(
      d3.axisBottom(xScale).tickFormat(d3.format(".2s")).tickSize(-innerHeight)
    )
    .attr("transform", `translate(0, ${innerHeight})`);

  xAxisG.select(".domain").remove();

  xAxisG
    .append("text")
    .attr("class", "xAxis-label")
    .attr("x", innerWidth / 2)
    .attr("y", 50)
    .attr("fill", "black")
    .text(xAxisLabel);

  g.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cy", (d) => yScale(yValue(d)))
    .attr("cx", (d) => xScale(xValue(d)))
    .attr("r", (d) => zScale(zValue(d)));

  g.append("text")
    .text(title)
    .attr("x", innerWidth / 2)
    .attr("y", -50)
    .attr("class", "title");
};

const renderMap = (data) => {
  const margin = { top: 100, right: 300, bottom: 200, left: 300 };
  const dataToShow = "total_vaccinations";
  const dataValue = (d) => d[dataToShow];
  //const colorScale = d3.scaleSequential(d3.interpolatePiYG);

  const getTFromValue = d3
    .scaleLinear()
    .domain([
      Math.pow(d3.min(data, dataValue), 1 / 3),
      Math.pow(d3.max(data, dataValue), 1 / 3),
    ])
    .range([0, 1]);
  console.log(getTFromValue(10000));

  const colorRgb = (t) => d3.color(d3.interpolateReds(t));

  const getDataByCountryName = (countryName, dataExported) => {
    var result;
    data.forEach((d) => {
      if (d.location === countryName) {
        result = d[dataExported];
      }
    });
    return result;
  };

  const svgWidth = document.body.clientWidth;
  const svgHeight = 500;
  const svg = d3
    .select(".map")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const projection = d3.geoNaturalEarth1();
  const pathGenerator = d3.geoPath().projection(projection);
  const g = svg.append("g");
  g.append("path")
    .attr("class", "sphere")
    .attr("d", pathGenerator({ type: "Sphere" }));
  svg.call(
    d3.zoom().on("zoom", () => {
      g.attr("transform", d3.event.transform);
    })
  );
  Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
  ]).then(([data]) => {
    const countries = topojson.feature(data, data.objects.countries);
    console.log(data);

    g.selectAll("path")
      .data(countries.features)
      .enter()
      .append("path")
      .attr("class", "countries")
      .attr("d", (d) => pathGenerator(d))
      .attr("fill", (d) =>
        d3.rgb(
          colorRgb(
            getTFromValue(
              Math.pow(
                getDataByCountryName(d.properties.name, dataToShow),
                1 / 3
              )
            )
          ).r,
          colorRgb(
            getTFromValue(
              Math.pow(
                getDataByCountryName(d.properties.name, dataToShow),
                1 / 3
              )
            )
          ).g,
          colorRgb(
            getTFromValue(
              Math.pow(
                getDataByCountryName(d.properties.name, dataToShow),
                1 / 3
              )
            )
          ).b
        )
      )

      .append("title")
      .text(
        (d) =>
          d.properties.name +
          ": " +
          getDataByCountryName(d.properties.name, dataToShow)
      );
  });
};

d3.csv("owid-covid-data-final.csv").then((data) => {
  data.forEach((d) => {
    d.total_cases = +d.total_cases;
    d.total_deaths_per_million = +d.total_deaths_per_million;
    d.total_cases_per_million = +d.total_cases_per_million;
  });

  console.log(data);
  renderBarChart(data);
  renderBubbleChart(data);
  renderMap(data);
});
