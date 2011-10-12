var r = 960 / 2;

var org = undefined; // defined below

var tree = d3.layout.tree()
    .size([360, r - 120])
    .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; })
    .children( function(member) { 
        return org.getProxyChildren(member);
    } );

var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", r * 2)
    .attr("height", r * 2 - 150)
  .append("svg:g")
    .attr("transform", "translate(" + r + "," + r + ")");

function update() {

  // member0 is the root
  var nodes = tree.nodes(org.getRoot());

  var link = vis.selectAll("path.link")
      .data(tree.links(nodes))   // <-- data is added here too
    .enter().append("svg:path")
      .attr("class", "link")
      .attr("d", diagonal);

  var node = vis.selectAll("g.node")
      .data(nodes)    // <---- this is where the data is added
    .enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; });

  node.append("svg:circle")
      .attr("r", 4.5);

  node.append("svg:text")
      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .attr("transform", function(d) { return d.x < 180 ? null : "rotate(180)"; })
      .text(function(d) { return d.name; });
}

// this is from flare.js
org = generateRandomOrg( window.names, 10 );
var proxies = [ [ '2', '4' ], [ '3', '4' ], [ '4', '6' ] ];
function doProxies() {
  console.log( 'doProxies' );
  if ( proxies.length ) {
    var proxy = proxies.shift();
    org.setProxy( org.roster[proxy[0]], org.roster[proxy[1]] );
    doProxies(); // window.setTimeout( doProxies, 1000 );
  }
}
doProxies();
update();



