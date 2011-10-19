
function draw() {
  console.log( 'draw' );

  var nodes = tree(org.getRoot());
  var node = vis.selectAll("g.node")
      .data(nodes, nodeId)    // <---- this is where the data is added
    .enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
      .attr("cx", function(d) { return d.parent ? d.parent.data.x0 : d.data.x; })
      .attr("cy", function(d) { return d.parent ? d.parent.data.y0 : d.data.y; });
  
  node.transition()
      .duration(duration)
      .attr("cx", cacheOldX)
      .attr("cy", cacheOldY);
 
  node.append("svg:circle")
      .attr("r", 4.5);

  var link = vis.selectAll("path.link")
      .data(tree.links(nodes))   // <-- data is added here too
    .enter().append("svg:path")
      .attr("class", "link")
      .attr("d", diagonal);

  node.append("svg:text")
      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
      .text(function(member) { return member.data.name; });

}



var r = 960 / 2;

var duration = 500;

var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });


var vis = d3.select("#chart").append("svg:svg")
    .attr("width", r * 2)
    .attr("height", r * 2 - 150)
  .append("svg:g")
    .attr("transform", "translate(" + r + "," + r + ")");


// this is from flare.js
var population = 10;
var org = generateRandomOrg( window.names, population );

var tree = d3.layout.tree()
  .size([360, r - 120])
  .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; })
  .children( function(member) { 
      return org.getProxyChildren(member);
  } );

draw();

proxies = [];
for ( var i = 1; i < population; i++ ) {
  if ( Math.random() * 2 > 1 ) {
    var target = Math.round( Math.sqrt( Math.random() * population ) );
    if ( i !== target && i !== 0 && target !== 0 ) {
      proxies.push( [ i.toString(), target.toString() ] );
    }
  }
}
// console.log( proxies );

function doProxies() {
  console.log( 'doProxies' );
  if ( proxies.length ) {
    var proxy = proxies.shift();
    console.log( "doing " + proxy[0] + " -> " + proxy[1] );
    org.setProxy( org.roster[proxy[0]], org.roster[proxy[1]] );
    draw();
    // doProxies();
  }
}

window.setTimeout( doProxies, 1000 );


function cacheOldX(d) {
  return d.data.x0 = d.x;
}

function cacheOldY(d) {
  return d.data.y0 = d.y;
}

function nodeId(d) {
  return d.data.id;
}
