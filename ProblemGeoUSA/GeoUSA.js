/**
 * Created by hen on 3/8/14.
 */
var centered;

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 900 - margin.left - margin.right;
var height = 900 - margin.bottom - margin.top;

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var bbDetail = {
    x: 800,
    y: 200,
    w: 800,
    h: 300
};

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:800,
    height:400
}).append("g")
          .attr("class","detail")
          .attr("height",bbVis.h)
          .attr("transform","translate(70,20)")



var xScaleDetail = d3.scale.ordinal().rangeRoundBands([0, bbVis.w], 0.1);
var yScaleDetail = d3.scale.linear().range([bbVis.h,0]);

var xAxis = d3.svg.axis().scale(xScaleDetail).orient("bottom");
var yAxis = d3.svg.axis().scale(yScaleDetail).orient("left");

var canvas = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
    })



var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });


var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);
var projectionCircles = d3.geo.albersUsa();//.precision(.1);
var path = d3.geo.path().projection(projection);
var pathCircles = d3.geo.path().projection(projectionCircles);

var dataSet = {};
var stations = [];
var loadStats;


var click = 0;

//function loadStations() {
    d3.csv("../data/stations.csv",function(error,data){
        data.forEach(function(d,i){
          if (i==1) {console.log(d);};
          dataSet[d.USAF] = {"lat": +d.ISH_LAT, "lon": +d.ISH_LON, "sum": "", "hourly":{}, "station": d.STATION, "state":d.ST};
        });

      return loadStats();  
    });
//};
var loadMap;
//loadStations(console.log(stations));
function loadStats() {
    d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data){
       $.each(data, function(index, value){
        stations.push(index);
       });
       for (i=0; i<stations.length; i++) {
          dataSet[stations[i]].hourly = data[stations[i]].hourly;
          dataSet[stations[i]].sum = data[stations[i]].sum;
       };
       return createVis(); 
    });

};

var dataArray = [];

var clickedCity;

var clickCount = 1;

function createVis() {
d3.json("../data/us-named.json", function(error, data) {

    var usMap = topojson.feature(data,data.objects.states).features
   // console.log(usMap);

    svg.selectAll(".country")
    	.data(usMap).enter().append("path").attr("d", path)
    	.on("click", clicked);



      $.each(dataSet, function(index, value){
          //if (value.sum != ""){
          dataArray.push({"lat":value.lat,"lon": value.lon, "code": index, "sum":value.sum, "hourly":value.hourly, "station":value.station, "state":value.state});
          //};
      })

var radiusScale = d3.scale.linear().range([0,10]).domain([0, d3.max(dataArray.map(function(d){return d.sum;}))]);

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
;}

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return "Station: <span style='color:lightgrey'>" + toTitleCase(d.station) + ", " +d.state+ "</span>" +  
          "<br/> Total Solar Radiation: <span style='color:lightgrey'>" + d.sum + "</span>" + " Wh/m" + "<sup>2</sup";
  })

  svg.call(tip);



svg.selectAll(".dot")
   .data(dataArray)
   .enter()
   .append("circle",".dot")
   .attr("r", function(d){ 
                                        if (d.sum == "") {return 0.5;} 
                                        else {return radiusScale(d.sum)}})
   .attr("transform", function(d){return "translate(" + projection([d.lon, d.lat])+")"})
   .style("fill", function(d){
                    if (d.sum == "") {return "white";}
                    else {return "orange"} })
   .style("stroke-width", ".5px")
   .attr("stroke", "white")
   .on('mouseover', tip.show)
   .on('mouseout', tip.hide)
   .on('click', function(d) {
    if (d.sum > 0 && click == 0) { 
      return createDetailVis(d);}
      else {
        return redraw(d);}
    });
      //console.log(dataSet[690150].lat);
})

};

 
//zooming function
function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  svg.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  svg.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}

// ALL THESE FUNCTIONS are just a RECOMMENDATION !!!!
var createDetailVis = function(d){

  detailVis.selectAll(".bar").remove();
  detailVis.select(".y.axis").remove();

data = [];
data.push(d); 
hourlyData = [];
data.forEach(function(d,i){ for (i=0; i<24; i++) {hourlyData.push(d.hourly[i]);}});


xScaleDetail.domain([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23])
yScaleDetail.domain([0, d3.max(hourlyData.map(function(d){return d}))])

detailVis.append("g").attr("class", "x axis")
          .attr("transform","translate(0, 290)")
          .call(xAxis);

detailVis.append("g").attr("class","y axis")
          .call(yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 10)
          .attr("dy", ".71em")
          .style("text-anchor","end")
          .text("Solar Radiation in Wh/m^2");

detailVis.selectAll(".bar")
          .data(hourlyData)
          .enter()
          .append("rect")
          .attr("class", "bar")
	  .attr("transform","translate(0, -10)")
        .attr("x", function(e,i) { return xScaleDetail(i);})
          .attr("width", xScaleDetail.rangeBand())
          .attr("y", function(e,i){return yScaleDetail(e);})
        .attr("height", function(e,i) { return bbVis.h - yScaleDetail(e); });

click = 1;
console.log(click);
};

var redraw = function(d){


  data = [];
data.push(d); 
hourlyData = [];
data.forEach(function(d,i){ for (i=0; i<24; i++) {hourlyData.push(d.hourly[i]);}});


  detailVis.selectAll(".bar").remove();
  detailVis.select(".y.axis").remove();
  detailVis.select(".x.axis").remove();
  

  detailVis.append("g").attr("class","y axis")
          .call(yAxis)
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 10)
          .attr("dy", ".71em")
          .style("text-anchor","end")
          .text("Solar Radiation in Wh/m^2");

detailVis.selectAll(".bar")
          .data(hourlyData)
          .enter()
          .append("rect")
          .attr("class", "bar")
    .attr("transform","translate(0, -10)")
        .attr("x", function(e,i) { return xScaleDetail(i);})
          .attr("width", xScaleDetail.rangeBand())
          .attr("y", function(e,i){return yScaleDetail(e);})
        .attr("height", function(e,i) { return bbVis.h - yScaleDetail(e); });


click = 0;
console.log(click);
};



// ZOOMING
function zoomToBB() {


}

function resetZoom() {
    
}


