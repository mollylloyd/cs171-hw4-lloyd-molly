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

var width = 1060 - margin.left - margin.right;
var height = 800 - margin.bottom - margin.top;

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var detailVis = d3.select("#detailVis").append("svg").attr({
    width:350,
    height:200
})

var canvas = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
    })

var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });


var projection = d3.geo.albersUsa().translate([width / 2, height / 2]);//.precision(.1);
var path = d3.geo.path().projection(projection);


var dataSet = {};
var stations = [];
var loadStats;


//function loadStations() {
    d3.csv("../data/stations.csv",function(error,data){
        data.forEach(function(d,i){
          //stations.push(d.USAF);
          dataSet[d.USAF] = {"lat": +d.ISH_LAT, "lon": +d.ISH_LON, "sum": 0, "hourly":{} };
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
       console.log(dataSet);
       return loadMap();
    });

};

function loadMap() {
d3.json("../data/us-named.json", function(error, data) {

    var usMap = topojson.feature(data,data.objects.states).features
   // console.log(usMap);

    svg.selectAll(".country")
    	.data(usMap).enter().append("path").attr("d", path)
    	.on("click", clicked);
  console.log(dataSet);
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
var createDetailVis = function(){

}


var updateDetailVis = function(data, name){
  
}



// ZOOMING
function zoomToBB() {


}

function resetZoom() {
    
}


