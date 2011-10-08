
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
