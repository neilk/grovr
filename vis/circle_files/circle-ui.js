$(function() {
  var timer = null,
      level = 0,
      max = 18,
      duration = 1000,
      r = 720 / 2,
      drawnCircle = drawCircle(r, max);

  var vis = d3.select("#vis")
    .append("svg:svg")
      .attr("width", r * 2)
      .attr("height", r * 2)
    .append("svg:g")
      .attr("transform", "translate(" + r + "," + r + ")");

  function plotLevel() {
    if (level <= max) {
      $('#level').slider({value: level});
      $('#level-val').text(level);
      vis.call(drawnCircle(level, duration));
      level++;
    }
  }

  $('#level').slider({
    value: level, min: 0, max: max, slide: function(e, ui) {
      level = ui.value;
      plotLevel();
    }
  });

  $('#play').click(function() {
    if (level > max) level = 0;
    plotLevel();
    if (timer) clearInterval(timer);
    timer = setInterval(function() {
      if (level <= max) plotLevel();
      else $('#stop').click();
    }, duration);
    $(this).hide();
    $('#stop').show();
  }).click();

  $('#stop').click(function() {
    if (timer) clearInterval(timer);
    $(this).hide();
    $('#play').show();
  });
});
