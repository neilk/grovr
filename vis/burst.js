var w = 960,
    h = 700,
    r = Math.min(w, h) / 2;

var vis = d3.select("#chart").append("svg:svg")
    .attr("width", w)
    .attr("height", h)
  .append("svg:g")
    .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

function draw( org, question, colors ) { 
  var optionToColor = {};
  for (var k = 0; k < question.options.length; k++) { 
    optionToColor[question.options[k].id] = colors[k];
  }
  function voteColor(member) {
    var option = member.getEffectiveVote(question);
    if (option === null) {
      return '#999999';
    } else {
      if (optionToColor[option.id]) {
        return optionToColor[option.id];
      } else {
        return '#333333';
      }
    }
  }
  function byEffectiveVote(member1, member2) {
    function getVoteOrMax(member) {
      var vote = member.getEffectiveVote(question);
      return vote ? Number(vote.id) : -99999; 
    }
    var val1 = getVoteOrMax(member1);
    var val2 = getVoteOrMax(member2);
    console.log( member1.name + "(" + val1 + ") " + member2.name + "(" + val2 + ")" );
    return val2 - val1;
  }

  var partition = d3.layout.partition()
      .sort(byEffectiveVote)
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
      .style("fill", voteColor )
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


var population = 100;
// this is from flare.js
var org = generateRandomOrg(window.names, population);
var question = new Question( 'Lunch', [ 'pizza', 'chinese', 'falafel' ] );
org.addQuestion(question);


var proxies = [];
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
    _.each( proxies, function( proxy ) {
      console.log( "doing " + proxy[0] + " -> " + proxy[1] );
      org.setProxy( org.roster[proxy[0]], org.roster[proxy[1]] );
    } );
    //draw();
    // doProxies();
  }
}
doProxies();

var votes = [];
for ( var j = 1; j < population; j++ ) {
  if ( Math.random() * 2 > 1 ) {
    var optionIndex = Math.round( Math.random() * (question.options.length - 1) );
    var option = question.options[optionIndex];
    votes.push( [ j, question, option ] );
  }
}

function doVotes() {
  console.log( 'doVotes' );
  if ( votes.length ) {
    _.each( votes, function( vote ) {
      var member = org.roster[vote[0].toString()];
      var question = vote[1];
      var option = vote[2];
      console.log( "doing " + member.id + " voting " + question.description + " =  " + option.description );
      member.vote( question, option );  
    } );
    //draw();
  }
}
doVotes();

var colors = [ 
    '#ff0000',
    '#ffa000',
    '#00ffff',
    '#00ff00',
    '#00ccff'
  ];

draw(org, question, colors);


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
