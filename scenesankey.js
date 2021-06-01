
var link_width = 3;
var link_gap = 15;
var panel_shift = 6;
var node_width = 15;
var panel_width;
var color = d3.scale.category20();

// This function is copied from d3's sankey plugin
function get_path(link) {
    var curvature = 0.5;
    //var x0 = link.from.x + link.from.width;
    //var x1 = link.to.x;
    var x0 = link.x0;
    var x1 = link.x1;
    var xi = d3.interpolateNumber(x0, x1);
    var x2 = xi(curvature);
    var x3 = xi(1 - curvature);
    //var y0 = (link.from.height/link.from.chars.length)*link.from.out_link_count + link_width/2;
    //var y1 = (link.to.height/link.to.chars.length)*link.to.in_link_count + link_width/2;
    var y0 = link.y0;
    var y1 = link.y1;
    //link.from.out_link_count++;
    //link.to.in_link_count++;
    
    
    return "M" + x0 + "," + y0
        + "C" + x2 + "," + y0
        + " " + x3 + "," + y1
        + " " + x1 + "," + y1;
	
    //var xkcd_interp = d3.svg.line().interpolate(xinterp);
    //return xkcd_interp([[x0,y0], [x1,y1]]);
}

function Character_(name, id, group) {
    this.name = name;
    this.id = id;
    this.group = group;
    this.first_scene = null;
}

function MockData() {
    // Characters
    var chars = [];
    for (var i = 0; i < 10; i++) {
	chars[i] = new Character_("char" + i, i);
    }
    this.chars = chars;

    // Scenes 
    var scenes = [];
    scenes[0] = new SceneNode([0, 1, 2, 3], 0, 10, 0);
    scenes[1] = new SceneNode([2, 3, 4, 5], 10, 10, 1);
    scenes[2] = new SceneNode([0, 1, 6, 7, 8, 9], 20, 10, 2);
    this.scenes = scenes;
    this.total_panels = 30;
}

function SceneNode(chars, start, duration, id) {
    this.chars = chars; // List of characters in the Scene
    this.start = start; // Scene starts after this many panels
    this.duration = duration; // Scene lasts for this many panels

    this.id = id;
    // Determined later
    this.x = 0;
    this.y = 0;
    
    this.width = node_width; // Same for all nodes
    this.height = 0; // Will be set later; proportional to link count

    this.in_links = [];
    this.out_links = [];

    this.name = "";

    this.has_char = function(id) {
	for (var i = 0; i < this.chars.length; i++) {
	    if (id == this.chars[i]) 
		return true;
	}
	return false;
    }
    this.char_node = false;
}

function Link(from, to, group, char_id) {
    // to and from are ids of scenes
    this.from = from;
    this.to = to;
    this.char_id = char_id;
    this.group = group;
    this.x0 = 0;
    this.y0 = -1;
    this.x1 = 0;
    this.y1 = -1;
}

function generate_links(chars, scenes) {
    var links = [];
    for (var i = 0; i < chars.length; i++) {
	var char_scenes = [];
	for (var j = 0; j < scenes.length; j++) {
	    if (scenes[j].has_char(chars[i].id)) {
		char_scenes[char_scenes.length] = scenes[j];
	    } // if
	} // for

	char_scenes.sort(function(a, b) { return a.start - b.start; });
	chars[i].first_scene = char_scenes[0];
	for (var j = 1; j < char_scenes.length; j++) {
	    links[links.length] = new Link(char_scenes[j-1], char_scenes[j], chars[i].group, chars[i].id);
	    //console.log("char name = " + chars[i].name + ", group = " + chars[i].group);
	    char_scenes[j-1].out_links[char_scenes[j-1].out_links.length] = links[links.length-1];
	    char_scenes[j].in_links[char_scenes[j].in_links.length] = links[links.length-1];
	    //console.log(char_scenes[j].in_links[char_scenes[j].in_links.length-1].y0);
	}
    } // for
    return links;
} // generate_links

function calculate_node_positions(chars, scenes, total_panels, chart_width, chart_height, char_scenes) {
    //console.log("link width = " + link_width + ", link gap = " + link_gap);

    panel_width = chart_width/total_panels;
    
    scenes.forEach(function(scene) {
	if (!scene.char_node) {
	    // Height
	    //var in_height = scene.in_links.length*link_width + (scene.in_links.length - 1)*link_gap;
	    //var out_height = scene.out_links.length*link_width + (scene.out_links.length - 1)*link_gap;
	    scene.height = scene.chars.length*link_width + (scene.chars.length - 1)*link_gap;
	    //console.log("in links length = " + scene.in_links.length);
	    //console.log("scene height = " + scene.height);

	    // Width
	    scene.width = panel_width;
	    
	    // Position
	    var node_height = chars.length*(link_width+link_gap);
	    var maxy = 0;
	    var miny = chart_height - node_height;
	    var sum = 0;
	    scene.chars.forEach(function(c) {
		// Look through char scenes to find the node corresponding to that
		for (var i = 0; i < char_scenes.length; i++) {
		    
		    if (char_scenes[i].chars[0] == c) {
			/*
			console.log(char_scenes[i].chars[0] + " == " + c);
			if (char_scenes[i].y > maxy) {
			    maxy = char_scenes[i].y;
			}  
			if (char_scenes[i].y < miny) {
			    miny = char_scenes[i].y;
			} // if
			*/
			sum += char_scenes[i].y;
		    } else {
			console.log(char_scenes[i].chars[0] + " != " + c);
		    }
		} // for
	    }); // forEach
	    scene.x = scene.start*panel_width;
	    // TODO
	    //scene.y = Math.max(0, Math.random()*(chars.length*(link_width+link_gap) - scene.height));
	    //scene.y = Math.random()*(maxy - miny) + miny;
	    var avg = sum/scene.chars.length;
	    scene.y = avg - scene.height/2;
	}
    });
}

// The positions of the nodes have to be set before this is called
// (The positions of the links are determined according to the positions
// of the nodes they link.)
function calculate_link_positions(scenes) {
    scenes.forEach(function(scene) {
	for (var i = 0; i < scene.out_links.length; i++) {
	    scene.out_links[i].y0 = -1;
	}

	for (var i = 0; i < scene.in_links.length; i++) {
	    // These are links incoming to the node, so we're setting the 
	    // co-cordinates for the last point on the link path
	    if (scene.in_links[i].y1 == -1) {
		scene.in_links[i].y1 = (link_width + link_gap)*i + scene.y + 0.5*link_width;
	    }
	    // TODO: Make this more efficient
	    for (var j = 0; j < scene.out_links.length; j++) { 
		if (scene.out_links[j].char_id == scene.in_links[i].char_id) {
		    scene.out_links[j].y0 = scene.in_links[i].y1;
		    break;
		}
	    }
	    scene.in_links[i].x1 = scene.x + 0.5*scene.width;
	}

	for (var i = 0; i < scene.out_links.length; i++) {
	    if (scene.out_links[i].y0 == -1) {
		//console.log("start not set yet");
		scene.out_links[i].y0 = (link_width + link_gap)*i + scene.y + 0.5*link_width;
	    }
	    scene.out_links[i].x0 = scene.x + 0.5*scene.width;
	}
    });
}

// How to determine links?
// 1. Get list of scenes a character appears in
// 2. Order them by start time
// 3. Links between each two consecutive 
function draw_nodes(scenes, svg, chart_width, chart_height) {
    var node = svg.append("g").selectAll(".node")
      .data(scenes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
      .attr("scene_id", function(d) { return d.id; })
    .call(d3.behavior.drag()
      .origin(function(d) { return d; })
      .on("dragstart", function() { this.parentNode.appendChild(this); })
      .on("drag", dragmove));


    node.append("rect")
      .attr("width", function(d) { return d.width; })
      .attr("height", function(d) { return d.height; })
      .style("fill", function(d) { return "#1f77b4"; })
      //.style("stroke", function(d) { return "#0f3a58"; })
      .attr("rx", 30)
      .attr("ry", 30)
    .append("title")
      .text(function(d) { return d.name; });

    node.append("text")
	.attr("x", -6)
	.attr("y", function(d) { return d.width / 2; })
	.attr("dy", ".35em")
	.attr("text-anchor", "end")
	.attr("transform", null)
	.text(function(d) { return d.name; })
      .filter(function(d) { return d.x < chart_width / 2; })
	.attr("x", function(d) { return 6 + d.width; })
	.attr("text-anchor", "start");

    function dragmove(d) {
	//console.log('d.y = ' + d.y);
	//console.log('d3.event.y = ' + d3.event.y);
	//console.log('d.x = ' + d.x);
	var newy = Math.max(0, Math.min(chart_height - d.height, d3.event.y));
	var ydisp = d.y - newy;
	d3.select(this).attr("transform", "translate(" 
			     + (d.x = Math.max(0, Math.min(chart_width - d.width, d3.event.x))) + "," 
			     + (d.y = Math.max(0, Math.min(chart_height - d.height, d3.event.y))) + ")");
	reposition_node_links(d.id, d.x, d.y, d.width, d.height, svg, ydisp);
	//sankey.relayout();
	//link.attr("d", path);
    }
}

function draw_links(links, svg) {
    var link = svg.append("g").selectAll(".link")
          .data(links)
	.enter().append("path")
	  .attr("class", "link")
	  .attr("d", function(d) { return get_path(d); })
          .attr("from", function(d) { return d.from.id; })
	  .attr("to", function(d) { return d.to.id; })
          .attr("charid", function(d) { return d.char_id; })
          .style("stroke", function(d) { return color(d.group); })
	  .style("stroke-width", link_width)
          .style("stroke-opacity", "0.6")
	  //.sort(function(a, b) { return b.dy - a.dy; });
          .on("mouseover", mouseover_cb)
          .on("mouseout", mouseout_cb);

    function mouseover_cb(d) {
	d3.selectAll("[charid=\"" + d.char_id + "\"]").style("stroke-opacity", "0.9");
    }
    
    function mouseout_cb(d) {
	d3.selectAll("[charid=\"" + d.char_id + "\"]").style("stroke-opacity", "0.6");
    }
}

function reposition_node_links(scene_id, x, y, width, height, svg, ydisp) {
    // $("[href='default.htm']")
    //console.log(d3.selectAll("[from='" + scene_id + "']"));
    //console.log("[from=\"" + scene_id + "\"]");
    // "[from='" + scene_id + "']"
    //console.log(d3.selectAll("[from=\"" + scene_id + "\"]").length)
    

    
    var counter = 0;
    d3.selectAll("[to=\"" + scene_id + "\"]")
	.each(function(d) {
	    //var l = new Link(d.from, d.to);
	    //l.x = x + width + counter*(link_width + gap_width);
	    d.x1 =  x + width/2;
	    //d.y1 = y + counter*(link_width + link_gap);
	    d.y1 -= ydisp;
	    /*
	    d3.selectAll("[from=\"" + scene_id + "\"]")
		.selectAll("[charid=\"" + d.char_id + "\"]")
		.each(function(d2) {
		    d2.x0 = x + width/2;
		    d2.y0 = d.y1;
		})
		.attr("d", function(d2) { return get_path(d2); });
	    */
	    counter += 1;
	    
	})
	.attr("d", function(d) { return get_path(d); });

    counter = 0;
    d3.selectAll("[from=\"" + scene_id + "\"]")
	.each(function(d) {
	    //var l = new Link(d.from, d.to);
	    //l.x = x + width + counter*(link_width + gap_width);
	    d.x0 =  x + width/2;
	    //d.y0 = y + counter*(link_width + link_gap);
	    d.y0 -= ydisp;
	    counter += 1;
	})
	.attr("d", function(d) { return get_path(d); });
}

// Called before link positions are determined
function add_char_scenes(chars, scenes, links) {
    // Shit starting times for the rest of the scenes panel_shift panels to the left
    var char_scenes = [];
    scenes.forEach(function(scene) {
	scene.start += panel_shift;
    });

    chars.sort(function(a,b) { return a.group - b.group; })
    //console.log("Characters have been sorted.");

    for (var i = 0; i < chars.length; i++) {
	var s = new SceneNode([chars[i].id], [0], [1]);
	s.char_node = true;
	s.y = i*(link_width+link_gap);
	s.x = 0;
	s.width = 5;
	s.height = link_width;
	s.name = chars[i].name;
	s.chars[s.chars.length] = chars[i].id;
	if (chars[i].first_scene != null) {
	    var l = new Link(s, chars[i].first_scene, chars[i].group, chars[i].id);
	    s.out_links[s.out_links.length] = l;
	    chars[i].first_scene.in_links[chars[i].first_scene.in_links.length] = l;
	    links[links.length] = l;
	} // if
	scenes[scenes.length] = s;
	char_scenes[char_scenes.length] = s;
    } // for
    return char_scenes;
} // add_char_scenes

function init_sankey() {

    var comic = read_comics(["luckyluke6"], [1], [40])[0];
    // New scene has id 0
    
    var data = new MockData();
    data.total_panels += panel_shift;

    data.scenes = [];
    data.chars = [];

    for (var i = 0; i < comic.characters.length; i++) {
	data.chars[data.chars.length] = new Character_(comic.characters[i].name, comic.characters[i].id, comic.characters[i].group);
    }
    
    
    var cur_scene;
    var panel_count = 0;
    //var scene_count = 0;
    for (var i = 0; i < comic.pages.length; i++) {
	// we sort the panels by panel number
	comic.pages[i].panels.sort(function(a, b) { return a.number - b.number; });
	for (var j = 0; j < comic.pages[i].panels.length; j++) {
	    // Is it a new scene?
	    panel_count += 1;
	    for (var k = 0; k < comic.pages[i].panels[j].tags.length; k++) {
		if (comic.pages[i].panels[j].tags[k].id == 0) {
		    if (cur_scene != NaN && cur_scene != undefined && cur_scene.chars.length > 0) {
			cur_scene.duration = panel_count - cur_scene.start;
			data.scenes[data.scenes.length] = cur_scene;
			//scene_count += 1;
		    }
		    cur_scene = new SceneNode([], panel_count, 0, data.scenes.length);
		}
	    }
	    if (cur_scene != NaN) {
		cur_scene.duration += 1;
		for (var l = 0; l < comic.pages[i].panels[j].characters.length; l++) {
		    // check if the that character is already in the scene
		    if (isNaN(comic.pages[i].panels[j].characters[l])) {
			
			continue;
		    } else {
			//console.log("char = " + comic.pages[i].panels[j].characters[l]);
		    }    
		    var in_scene = false;
		    for (var m = 0; m < cur_scene.chars.length; m++) {
			if (cur_scene.chars[m] == comic.pages[i].panels[j].characters[l]) {
			    in_scene = true;
			    break;
			}
		    } // for each char already in scene
		    if (!in_scene) {
			cur_scene.chars[cur_scene.chars.length] =  comic.pages[i].panels[j].characters[l];
		    }    
		} // for
	    } // if
	} // for each panel
    } // for each page

    for (var i = 0; i < data.scenes.length; i++) {
	//console.log(data.scenes[i].chars);
    }
    data.total_panels = panel_count + panel_shift;
    
    //console.log(data.chars);
    //console.log(data.scenes);

    var margin = {top: 1, right: 1, bottom: 6, left: 1},
         width = 4500 - margin.left - margin.right,
         height = 600 - margin.top - margin.bottom;
    var svg = d3.select("#chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
      .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    //link_width = height/(data.chars.length+1)*0.4;
    //link_gap = height/(data.chars.length+1)*0.8;

    var links = generate_links(data.chars, data.scenes);
    var char_scenes = add_char_scenes(data.chars, data.scenes, links);
    calculate_node_positions(data.chars, data.scenes, data.total_panels, width, height, char_scenes);
    calculate_link_positions(data.scenes);
    draw_links(links, svg);
    draw_nodes(data.scenes, svg, width, height);

    var x_scale = d3.scale.ordinal()
        .domain(d3.range(data.total_panels))
        .rangeRoundBands([0, width], 0);
        //.range(d3.range(data.total_panels + panel_shift));

    var xAxis = d3.svg.axis()
	.scale(x_scale)
	.tickSize(5)
	.tickPadding(5)
        //.ticks(data.total_panels + panel_shift)
	.orient("bottom");

    svg.append("g")
        .attr("transform", "translate(" + (margin.left) + "," + (margin.top + height - 150) + ")")
        .attr("class", "x axis")
        .call(xAxis);
}