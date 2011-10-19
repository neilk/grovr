var w = 960,
    h = 700,
    r = Math.min(w, h) / 2,
    color = d3.scale.category20c();

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

function draw( org ) { 
  var partition = d3.layout.partition()
      .sort(null)
      .size([2 * Math.PI, r * r])
      .value(function(d) { return 1; })
      .children(function(member) { 
         return org.getProxyChildren(member);
      });

  var arc = d3.svg.arc()
      .startAngle(function(d) { return d.x; })
      .endAngle(function(d) { return d.x + d.dx; })
      .innerRadius(function(d) { return Math.sqrt(d.y); })
      .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

//var json = { name: 'flare', children: [ { name: 'alpha' }, { name: 'beta' }, { name: 'gamma' } ] };
// var json = { name: 'flare' };
//, children: [ { name: 'alpha' }, { name: 'beta' }, { name: 'gamma' } ] };
var json = org.getRoot();
//debugger;
    var path = vis.data([json]).selectAll("path")
      .data(partition.nodes)
    .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("stroke", "#fff")
      .style("fill", function(d) { 
          if (d.parent) {
            colorNode = d.parent;
          } else {
            colorNode = d;
          }
          return color(colorNode.name); 
        })
      .each(stash);
 
}

// Stash the old values for transition.
function stash(d) {
  d.x0 = d.x;
  d.dx0 = d.dx;
}

// Interpolate the arcs in data space.
function arcTween(a) {
  var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
  return function(t) {
    var b = i(t);
    a.x0 = b.x;
    a.dx0 = b.dx;
    return arc(b);
  };
}


// this is from flare.js
var population = 10;
var org = generateRandomOrg(window.names, population);
draw(org);


/* 
manipulate


  d3.select("#size").on("click", function() {
    path
        .data(partition.value(function(d) { return d.size; }))
      .transition()
        .duration(1500)
        .attrTween("d", arcTween);

    d3.select("#size").classed("active", true);
    d3.select("#count").classed("active", false);
  });

  d3.select("#count").on("click", function() {
    path
        .data(partition.value(function(d) { return 1; }))
      .transition()
        .duration(1500)
        .attrTween("d", arcTween);

    d3.select("#size").classed("active", false);
    d3.select("#count").classed("active", true);
  });
*/
