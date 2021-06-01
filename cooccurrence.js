
function round(n) {
    return Math.round(n*100) / 100;
}

function Graph(m) {
    console.log(m);
    this.matrix = []; // Adjacency matrix
    for (var i = 0; i < m.length; i++) {
	this.matrix[i] = [];
	for (var j = 0; j < m[i].length; j++) {
	    this.matrix[i][j] = m[i][j];
	}
    };

    this.addSelfLoops = function() {
	for (var i = 0; i < this.matrix.length; i++) {
	    this.matrix[i][i] = 1;
	}
    };

    // Column normalizes matrix
    this.normalize = function() {
        // Find the sum of each column
        var sums = [];
        for(var col=0; col<this.matrix.length;col++) {
            var sum = 0;
            for(var row=0;row<this.matrix.length;row++)
                sum += this.matrix[row][col];
	    //this.matrix[col][col] = sum;
            sums[col] = sum;
	    //if (sum == 0) console.log("sum is zero.");
        }

        // For every value in the matrix divide by the sum
        for(var col=0;col<this.matrix.length;col++) 
            for(var row=0;row<this.matrix.length;row++)
		// TODO: See if this is ok
		if (sums[col] != 0) 
                    this.matrix[row][col] = round(this.matrix[row][col] / sums[col]);
    };
    
    // Logs the matrix
    this.print = function() {
        for(var i=0;i<this.matrix.length;i++) {
            for(var j=0;j<this.matrix[i].length;j++) {
                document.write((j==0?'':',')+this.matrix[i][j]);
            }
            document.write('<br>');
        }
    };
        
    // Take the (power)th power of the matrix effectively multiplying it with
    // itself pow times
    this.matrixExpand = function(pow) {
	//console.log(this.matrix);
        var resultMatrix = [];
        for(var row=0;row<this.matrix.length;row++) {
            resultMatrix[row] = [];
            for(var col=0;col<this.matrix.length;col++) {
                var result = 0;
                for(var c=0;c<this.matrix.length;c++) {
		
                    result += this.matrix[row][c] * this.matrix[c][col];
		}
		//console.log("result = " + result);
                resultMatrix[row][col] = result;
            }
        }
	//console.log(resultMatrix);
        this.copy(resultMatrix);
    }; 

    this.copy = function(m) {
	this.matrix = []; // Adjacency matrix
	for (var i = 0; i < m.length; i++) {
	    this.matrix[i] = [];
	    for (var j = 0; j < m[i].length; j++) {
		this.matrix[i][j] = m[i][j];
	    }
	}
    }
        
    // Applies a power of X to each item in the matrix
    this.matrixInflate = function(pow) {
        for(var row=0;row<this.matrix.length;row++) 
            for(var col=0;col<this.matrix.length;col++) {
		//console.log(this.matrix[row][col] + "^" + pow + " --> " + Math.pow(this.matrix[row][col], pow));
                this.matrix[row][col] = Math.pow(this.matrix[row][col], pow);
	    }
    };
    
    // Are the two matrices equal?
    this.equals = function(a,b) {
        for(var i=0;i<a.length;i++) 
            for(var j=0;j<a[i].length;j++) 
                if(b[i] === undefined || b[i][j] === undefined || a[i][j] - b[i][j] > 0.1) return false;
        return true;
    };
    
    // Girvan–Newman algorithm
    this.getMarkovCluster = function(power, inflation) {
        var lastMatrix = [];
        
	//this.addSelfLoops();
        //this.print();        
        this.normalize();  
        
        this.matrixExpand(power);  
	//document.write("after exapnd <br>");
	//this.print();
        this.matrixInflate(inflation);                               
	//document.write("after inflate <br>");
	//this.print();
        this.normalize();
	//document.write("after normalize <br>");
        //this.print();
        var c = 0;
        while(!this.equals(this.matrix,lastMatrix)) {
            lastMatrix = this.matrix.slice(0);

            this.matrixExpand(power);                
            this.matrixInflate(inflation);         
            this.normalize();            
            //document.write("in loop <br>");
	    //this.print();
            if(++c > 500) break; //JIC, fiddle fail
        }
	console.log("c = " + c + ", result:");
	console.log(this.matrix);
        
    };

    this.getGroups = function() {
	var saw_row = [];
	for (var i = 0; i < this.matrix.length; i++) {
	    saw_row[i] = false;
	}
	var groups = [];
	var index = -1;
	/*
	for (var col = 0; col < this.matrix.length; col++) {
	    var group_started = false;
	    for (var row = 0; row < this.matrix.length; row++) {
		if (this.matrix[row][col] > 0 && saw_row[row]==false) {
		    if (group_started == false) {
			index += 1;
			groups[index] = [];
		    }
		    //groups[index].push(col);
		    // Attract the rest of the row
		    for (var c = 0; c < this.matrix.length; c++) {
			if (this.matrix[row][c] > 0) {
			    groups[index].push(c);
			}
		    }
		    saw_row[row] = true;
		} // if
	    } // for
	} // for
	*/
	var group_started = false;
	for (var row = 0; row < this.matrix.length; row++) {
	    group_started = false;
	    for (var col = 0; col < this.matrix.length; col++) {
		if (this.matrix[row][col] > 0) {
		    if (group_started == false) {
			index ++;
			groups[index] = [];
			group_started = true;
		    }
		    groups[index].push(col);
		} // if
	    } // for each column
	} // for each row
	console.log(groups);
	return groups;
    }; // getGroups
} // Graph

function init_cooccurrence() {
    //var comic = read_comics(["sandman1"], [1], [17])[0];
    var comic = read_comics(["luckyluke6"], [1], [35])[0];

    // Find max character id because ids will be used as indices
    // in the adjacency matrix.
    // TODO: Do something about invalid ids
    var max_id = 0;
    for (var i = 0; i < comic.characters.length; i++) {
	if (comic.characters[i].id > max_id) max_id = comic.characters[i].id;
    } // for each character



    // Create the adjacency matrix
    adj = [];
    for (var i = 0; i <= max_id; i++) {
	adj[i] = [];
    }

    // Initialize the values in the matrix to zeroes
    for (var i = 0; i <= max_id; i++) {
	for (var j = 0; j <= max_id; j++) {
	    adj[i][j] = 0;
	    //console.log("i, j: " + i + ", " + j);
	    
	}
	adj[i][i] = comic.characters.length;
    }
    
    for (var i = 0; i < comic.pages.length; i++) {
	// sort the panels by panel number
	comic.pages[i].panels.sort(function(a, b) { return a.number - b.number; });
	for (var j = 0; j < comic.pages[i].panels.length; j++) {
	    // sort the characters by id because we'll only look at the upper triangle of the
	    // matrix
	    comic.pages[i].panels[j].characters.sort(function(a, b) { return a.id - b.id; });
	    for (var l = 0; l < comic.pages[i].panels[j].characters.length; l++) {
		for (var k = l + 1; k < comic.pages[i].panels[j].characters.length; k++) {
		    var id1 = comic.pages[i].panels[j].characters[l];
		    var id2 = comic.pages[i].panels[j].characters[k];
		    //console.log("y: id1, id2: " + id1 + ", " + id2);
		    adj[id1][id2] += 1;
		}
	    } // for each character in the panel
	} // for each panel
    } // for each page

    // Only the upper trianlge of the matrix was filled, fill the lower half
    for (var i = 0; i <= max_id; i++) {
	for (var j = 0; j < i; j++) {
	    adj[i][j] = adj[i][max_id-j];
	}
    }
    /*
    adj = []
    adj[0] = [100, 100, 1,   0,   0,   0];
    adj[1] = [100, 100,   0,   0,   0,   0];
    adj[2] = [1,   0,   100,   100, 50,  0];
    adj[3] = [0,   0,   100, 100,   100, 0];
    adj[4] = [0,   0,   50,  100, 100,   100];
    adj[5] = [0,   0,   0,   50,  100, 100];
    */
    graph = new Graph(adj);
    //graph.print();
    graph.getMarkovCluster(8, 4);
    //graph.print();
    var groups = graph.getGroups();
    // Assign groups
    for (var g = 0; g < groups.length; g++) {
	console.log("Group " + g);
	for (var m = 0; m < groups[g].length; m++) {
	    
	    for (var c = 0; c < comic.characters.length; c++) {
		if (comic.characters[c].id == groups[g][m]) {
		    console.log(comic.characters[c].name);
		    comic.characters[c].group = g;
		}
	    }
	}
    }
    
    // sort the characters by id
    comic.characters.sort(function(a, b) { return a.number - b.number; });

    // The json accepted by the d3 force layout defines source and target of a link as
    // indices in the nodes array, so we need to make ids to indices
    idtoi = [];
    for (var i = 0; i < comic.characters.length; i++) {
	idtoi[comic.characters[i].id] = i;
    }

    var l = comic.characters.length;
    //var l = adj.length;
    // Create the json for the links
    var linksjs = new Array();
    for (var i = 0; i < l; i++) {
	for (var j = i+1; j <l; j++) {
	    id1 = comic.characters[i].id;
	    id2 = comic.characters[j].id;
	    if (adj[id1][id2] <= 0) continue;
	    //console.log("id1, id2: " + id1 + ", " + id2);
	    linksjs.push({"source": idtoi[id1], "target": idtoi[id2], "value": adj[id1][id2]});
	}
    }

    // Create the json for the nodes
    var nodesjs = new Array();
    for (var i = 0; i < comic.characters.length; i++) {
	nodesjs.push({"name": comic.characters[i].name, "group": comic.characters[i].group});
    }
    console.log(linksjs);

    var width = 960,
        height = 500;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .gravity(0.05)
	.charge(-100)
	.distance(100)
	.size([width, height]);

    var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);

    force
	.nodes(nodesjs)
	.links(linksjs)
	.start();

    var link = svg.selectAll(".link")
	.data(linksjs)
	.enter().append("line")
	.attr("class", "link")
	.style("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = svg.selectAll(".node")
	.data(nodesjs)
      .enter().append("g")
	.attr("class", "node")
	.call(force.drag);

    
    node.append("circle")
	.attr("r", 5)
	.style("fill", function(d) { return color(d.group); })

/*
    node.append("image")
      .attr("xlink:href", "https://github.com/favicon.ico")
      .attr("x", -8)
      .attr("y", -8)
      .attr("width", 16)
      .attr("height", 16);
      */
    node.append("title")
	.text(function(d) { return d.name; });

    node.append("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(function(d) { return d.name });

    force.on("tick", function() {
	link.attr("x1", function(d) { return d.source.x; })
	    .attr("y1", function(d) { return d.source.y; })
	    .attr("x2", function(d) { return d.target.x; })
	    .attr("y2", function(d) { return d.target.y; });

	//node.attr("cx", function(d) { return d.x; })
	//    .attr("cy", function(d) { return d.y; });
	node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
 
} // init_cooccurrence