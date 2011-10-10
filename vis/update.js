
var w = 960,
    h = 2000,
    i = 0,
    duration = 500,
    root;

var tree = d3.layout.tree()
    .size([h, w - 160]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select("body").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(40,0)");

d3.json("math_map_compact_2.json", function(json) {
  json.x0 = 800;
  json.y0 = 0;
  update(root = json);
});

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse();

  // Update the nodes…
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      //.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
      
      //.style("opacity", 1e-6);
 
  // Enter any new nodes at the parent's previous position.
 
 
    nodeEnter.append("svg:circle")
      .attr("class", "node")
      .attr("cx", function(d) { return source.y0; })
      .attr("cy", function(d) { return source.x0; })
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })
      .on("click", click);

  nodeEnter.append("svg:text")
        .attr("x", function(d) { return d._children ? -8 : 8; })
    .attr("y", 3)
        //.attr("fill","#ccc")
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .text(function(d) { return d.name; });

  // Transition nodes to their new position.
 
  
  node.select("circle").transition()
      .duration(duration)
      .attr("cx", function(d) { return d.y; })
      .attr("cy", function(d) { return d.x; })
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
  
  node.select("text").transition()
      .duration(duration)
      .attr("dx", function(d) { return d._children ? -8 : 8; })
  .attr("dy", 3)
     .style("fill", function(d) { return d._children ? "lightsteelblue" : "#5babfc"; });

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit();
  
  nodeExit.select("circle").transition()
      .duration(duration)
      .attr("cx", function(d) { return source.y; })
      .attr("cy", function(d) { return source.x; })
      .remove();
  
  nodeExit.select("text").transition()
      .duration(duration)
      .remove();

  // Update the links…
  var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

d3.select(self.frameElement).style("height", "2000px");


