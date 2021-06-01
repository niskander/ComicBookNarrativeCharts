
    //$('a[title]').qtip({ style: { name: 'cream', tip: true } })
function setup_diagram() {
    //console.log(comic.transition_matrix);
    width = 720, 
        height = 720,
        outerRadius = Math.min(width, height) / 2 - 10,
        innerRadius = outerRadius - 24;

   formatPercent = d3.format(".1%");

   arc = d3.svg.arc()
	.innerRadius(innerRadius)
	.outerRadius(outerRadius);

   layout = d3.layout.chord()
	.padding(.04)
	.sortSubgroups(d3.descending)
	.sortChords(d3.ascending);

   path = d3.svg.chord()
	.radius(innerRadius);

   svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height)
      .append("g")
	.attr("id", "circle")
	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.append("circle")
	.attr("r", outerRadius);
}

function create_diagram(comic, transition_types) {
    /*
    // Remove the transition types that occur 0 times
    var index_id_map = [];
    var deletions = 0;
    for (var i = 0; i < comic.transition_matrix.length; i++) {
	var sum = 0;
	for (var j = 0; j < comic.transition_matrix[i].length; j++) {
	    sum += comic.transition_matrix[i][j];
	}
	if (sum == 0) {
	    comic.transition_matrix.splice(i, 1);
	    i--;
	    deletions += 1;
	    //console.log("Deleted row " + i);
	} else {
	    index_id_map[i] = i + deletions;
	}
    } // for
    */
    var index_id_map = comic.index_id_map;

    // Compute the groups and the chords
    layout.matrix(comic.transition_matrix);
    var groups = layout.groups(); // Used for the mouseover
    var total = 0;
    for (var i = 0; i < groups.length; i++) {
	total += groups[i].value;
    }
    // Remove any old groups and chords
    svg.selectAll(".group").remove();
    svg.selectAll(".chord").remove();

    // Add a group per neighborhood.
    var group = svg.selectAll(".group")
        .data(layout.groups)
      .enter().append("g")
        .attr("class", "group")
        .attr("title", function(d, i) { return transition_types[index_id_map[i]].name + ": " + formatPercent(groups[i].value/total); })
        .on("mouseover", mouseover);

    // Add the group arc.
    var groupPath = group.append("path")
        .attr("id", function(d, i) { return "group" + i; })
        .attr("d", arc)
        .style("fill", function(d, i) { return transition_types[index_id_map[i]].color; });
        //.on("mouseover", group_mouseover);
    

    // Add a text label.
    var groupText = group.append("text")
        .attr("x", 6)
        .attr("dy", 15);

    groupText.append("textPath")
        .attr("xlink:href", function(d, i) { return "#group" + i; })
        .text(function(d, i) { return transition_types[index_id_map[i]].name; });

    // Remove the labels that don't fit. :(
    groupText.filter(function(d, i) { return groupPath[0][i].getTotalLength() / 2 - 30 < this.getComputedTextLength(); })
        .remove();

    
    // Add the chords.
    var chord = svg.selectAll(".chord")
        .data(layout.chords)
      .enter().append("path")
        .attr("class", "chord")
        .style("fill", function(d) { return transition_types[index_id_map[d.source.index]].color; })
        .attr("d", path);

    /*
    // Add an elaborate mouseover title for each chord.
    chord.append("title").text(function(d) {
      return transition_types[index_id_map[d.source.index]].name
          + " to " + transition_types[index_id_map[d.target.index]].name
          + ": " + formatPercent(d.source.value/groups[d.source.index].value)
          + "\n" + transition_types[index_id_map[d.target.index]].name
          + " to " + transition_types[index_id_map[d.source.index]].name
          + ": " + formatPercent(d.target.value/groups[d.target.index].value);
    });
    */

    chord.attr("title", function(d) {
	return transition_types[index_id_map[d.source.index]].name
            + " --> " + transition_types[index_id_map[d.target.index]].name
            + ": " + formatPercent(d.source.value/groups[d.source.index].value)
            + "<br>" + transition_types[index_id_map[d.target.index]].name
            + " --> " + transition_types[index_id_map[d.source.index]].name
            + ": " + formatPercent(d.target.value/groups[d.target.index].value);
    });

    $(".chord").qtip({
	//content: "This is an active list element",
	show: "mouseover",
	hide: "mouseout",
	tip: true
    });

    function mouseover(d, i) {
      chord.classed("fade", function(p) {
        return p.source.index != i
            && p.target.index != i;
      });
    }

    
    $(".group").qtip({
	//content: "This is an active list element",
	show: "mouseover",
	hide: "mouseout",
	position: {
	    corner: {
		target: "topMiddle",
		tooltip: "topMiddle"
	    }
	},
	tip: true
    });
    /*
    function group_mouseover(d, i) {
	//console.log(d);
	//console.log(i);
	//new Opentip("#group0", "tooltip");
	//$(".group").tipTip({content: "tooltip"});
	//Tipped.create("#group0", "some tooltip text");
	console.log("Done.");
    }
    */
}

function setup() {
    // Names of the comic books displayed in this graph
    var names = [ "sandman1", "luckyluke6", "drmcninja25" ];
    var from_page = [1, 1, 1];
    var to_page = [20, 20, 20];
    var comics = read_comics(names, from_page, to_page);
    
    var transition_types = read_transitions();

    for (var i = 0; i < comics.length; i++) {
	comics[i].count_transitions(transition_types);
	console.log(comics[i].transition_matrix.length);
	console.log(comics[i].transition_matrix);
	for (var j = 0; j < comics[i].transition_matrix.length; j++) {
	    for (var k = 0; k < comics[i].transition_matrix[j].length; k++) {
		j_ = comics[i].index_id_map[j];
		//k_ = comics[i].id_index_map[k];
		k_ = comics[i].index_id_map[k];
		console.log(j + ", " + k + ":" + j_ + ", " + k_);
		if (j_ == -1 || k_ == -1) continue;
		console.log(transition_types[j_].name + " --> " + transition_types[k_].name + ": " + comics[i].transition_matrix[j][k]);
	    }
	}
    }
    
    setup_diagram();
    create_diagram(comics[0], transition_types);

    var comic_list = document.getElementById("comic-list");
    for (var i = 0; i < comics.length; i++) {
	var li = document.createElement("li");
	li.setAttribute("name", i);
	li.innerHTML = comics[i].name;
	comic_list.appendChild(li);
	li.addEventListener('click', function() {
	    var index = parseInt(this.getAttribute("name"));
	    create_diagram(comics[index], transition_types);
	    //console.log("index = " + index);
	});
    }
}