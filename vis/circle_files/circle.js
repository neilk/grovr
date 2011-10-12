
var drawCircle = function(r, max) {
  // creates all the relationships between nodes at once
  // creates an array of arrays where the key is the node number, the value is the children
  // of that node (by index number). 
  function compute() {
    // create a random graph without cycles
    // node 0 is the root node
    var index = { '0': [] };
    
    for (var c = 1; c < max; c++) {
      index[c.toString()] = [];
      var parentNode = Math.round(Math.random() * (c-1));
      console.log( "making " + c + " a child of " + parentNode );
      index[parentNode.toString()].push(c);
    }
    return index;
  }

  // get children accessor function 
  // normally this is just d children
  function treeChildren(max) {
    /**
     * @param node   index
     * @param depth   depth that this node is at ?
     * @return index of this node, or null
    */
    return function(node, depth) {
      return index[node];
    };
  }

  var index = compute();
      tree = d3.layout.tree()
        .size([360, r - 20])
        .sort(null)
        .value(String)
        .separation(function(a, b) { return a.parent == b.parent ? 6.5 : 5.5; });

  var oldNodes = {};

  function plot(depth, duration) {
    return function() {
      var vis = this,
          nodes = tree.children(treeChildren(depth))(0);

      var link = vis.selectAll("g.link")
          .data(nodes, function(d) { return d.data; });

      var linkEnter = link.enter().append("svg:g")
          .attr("class", "link");

      // the data providing function of the line is the function "children"
      var line = link.selectAll("line").data(children);

      // when the line enters, it links itself to the old position of the parent
      line.enter().append("svg:line")
          .attr("x1", function(d) { return xs(d.oldParent); })
          .attr("y1", function(d) { return ys(d.oldParent); })
          .attr("x2", function(d) { return xs(d.child); })
          .attr("y2", function(d) { return ys(d.child); });

      // and then transitions to where the parent is
      line.transition()
          .duration(duration)
          .attr("x1", function(d) { return xs(d.parent); })
          .attr("y1", function(d) { return ys(d.parent); })
          .attr("x2", function(d) { return xs(d.child); })
          .attr("y2", function(d) { return ys(d.child); });
      line.exit().remove();

      link.exit().remove();

      var node = vis.selectAll("g.node")
          .data(nodes, function(d) { return d.data; });

      // when the node enters, it has these...
      var nodeEnter = node.enter().append("svg:g")
          .attr("class", "node")
          .attr("transform", function(d) {
            var p = d; //d.parent || d;
            return "translate(" + xs(p) + "," + ys(p) + ")";
          });

      node.transition()
          .duration(duration)
          .attr("transform", function(d) { return "translate(" + xs(d) + "," + ys(d) + ")"; });

      node.select("text")
          .text(function(d) { return d.data; })
          .attr("dx", function(d) { return d.x <= 270 && d.x >= 90 ? 8 : -8; })
          .attr("text-anchor", function(d) { return d.x <= 270 && d.x >= 90 ? "start" : "end"; })
          .attr("transform", function(d) {
            var o = oldNodes[d.data];
            return "rotate(" + (o.x + (d.x <= 270 && d.x >= 90 ? -180 : 0)) + ")";
          })
        .transition()
          .duration(duration)
          .attr("transform", function(d) { return "rotate(" + (d.x > 270 || d.x < 90 ? d.x : d.x - 180) + ")"; })
          .attr("opacity", 1);

      nodeEnter.append("svg:circle")
          .attr("r", 5);

      nodeEnter.append("svg:text")
          .attr("dx", function(d) { return d.x <= 270 && d.x >= 90 ? 8 : -8; })
          .attr("text-anchor", function(d) { return d.x <= 270 && d.x >= 90 ? "start" : "end"; })
          .attr("dy", ".31em")
          .attr("transform", function(d) { return "rotate(" + (d.x > 270 || d.x < 90 ? d.x : d.x - 180) + ")"; })
          .attr("opacity", 0.01)
          .text(function(d) { return d.data; })
        .transition()
          .duration(duration)
          .attr("opacity", 1);

      node.exit().remove();

      oldNodes = {};
      _.each(nodes, function(node) {
        oldNodes[node.data] = node;
      });
    };
  }

  function getOldParent(d) {
    var n = d;
    while (n) {
      var old = oldNodes[n.data];
      if (old) return old;
      n = n.parent;
    }
    return d;
  }

  // Returns parent+child objects for any children of `d`.
  function children(d, i) {
    return (d.children || []).map(function(v) {
      return {
        oldParent: getOldParent(d),
        parent: d,
        child: v
      };
    });
  }

  // Radial scales for x and y.
  function xs(d) { return d.y * Math.cos((d.x - 90) / 180 * Math.PI); }
  function ys(d) { return d.y * Math.sin((d.x - 90) / 180 * Math.PI); }

  return plot;
};


/*
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
*/
