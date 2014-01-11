
function map(nodes) {
    
    var p;

    // initialize new properties
    for (i = 0; i < nodes.length; i++) {
        nodes[i].level = 0;
        nodes[i].parents = [];
        nodes[i].processed = false;
        nodes[i].position = {};
        nodes[i].angle = null;
    }

    // process parents
    for (i = 0; i < nodes.length; i++) {
        processParents(nodes[i], nodes);
    }

    // TODO Implement several parents (loop anywhere there is a reference to one parent)
    var obj = getParentNode(nodes);
    
    var p = obj.p;
    var nodes = obj.nodes;

    console.log(obj);

    while (nodesToProcess(nodes).length > 0) {
        processLevel(p, nodes);
    }

    return {
        nodes: nodes,
        maxlevel: getMaxLevel(nodes)
    }
}

function getParentNode(nodes) {
    var p = [];
    var i, o;
    for (i = 0; i < nodes.length; i++) {
        if (nodes[i].parents.length == 0) {
            pushUnique(p, nodes[i].name);          
        }
    }
    // If multiple parents add them all under an imaginary parent
    if (p.length > 1) {
        var o = {
            name: "Ghost Node",
            deps: p,
            parents: [],
            processed: false,
            position: {}
            //angle = null

        };
        nodes.push(o);
        for (i = 0; i < nodes.length; i++) {
            processParents(nodes[i], nodes);
        }
        console.log("GN", nodes);
        return {
            p: o,
            nodes: nodes
        };
    } else {
        return {
            p: p[0],
            nodes: nodes
        };
    }
}

function getMaxLevel(pnodes) {
    var maxlevel = 0;
    for (var i = 0; i < pnodes.length; i++) {
        if (pnodes[i].level > maxlevel) {
            maxlevel = pnodes[i].level;
        }
    }
    return maxlevel;
}

function processLevel(node, nodes) {
    var j, n, temp = 0;
    //console.log("ATTEMPTING", node.name);
    // iterate through parents and find highest level. set level of this nodes to highest level + 1
    if (node.processed == true) {
        return;
    }
    for (j = 0; j < node.parents.length; j++) {
        //console.log("  parent", node.next[j]);
        n = getNode(node.parents[j],nodes);
        if (n.processed == false) { // if parent node has not level set yet
            //console.log("  parent NOT PROCESSED", node.parents[j]);
            return
        }
        //console.log("  parent", n.name, n.level);
        //var temp = n.level;
        if (n.level > node.level) {
            node.level = n.level;
            //console.log("    ", n.level);
        }
    }
    node.level += 1;
    //}
    // repeat with children
    node.processed = true;
    //console.log("PROCESSED", node.name);
    for (j = 0; j < node.deps.length; j++) {
        n = getNode(node.deps[j], nodes);
        // TODO Process Level first of nodes that have the least amoun of parents (next)
        processLevel(n, nodes);
        //n.level += 1;
        //n.level = node.level + 1;
    }
}

function processParents(node, nodes) {
    var j, n;
    
    //if (node.analyzed) {return}
    //node.analyzed = true;
    for (j = 0; j < node.deps.length; j++) {
        n = getNode(node.deps[j], nodes);
        //console.log("node.d", node.deps[j]);
        //n.level += 1;
        //n.level = node.level + 1;
        pushUnique(n.parents, node.name);
        processParents(n, nodes);
    }
}

function nodesToProcess(nodes) {
    var ntp = [];
    for (i = 0; i < nodes.length; i++) {
        if (nodes[i].processed == false) {
            ntp.push(nodes[i]);
        }
    }
    return ntp;
}


function getNode(name, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].name == name) {
            return list[i];
        }
    }
}

function pushUnique(list, item) {
    if (list.indexOf(item) == -1) {
        list.push(item);
    }
}

function printNodes(nodes) {
    var i;
    for (i = 0; i < nodes.length; i++) {
        console.log(nodes[i].name, nodes[i].parents, nodes[i].level);
    }
}

//console.log(nodes);
//map(nodes);
//console.log(nodes);
//printNodes(nodes);

exports.map = map;
exports.getParentNode = getParentNode;
exports.getNode = getNode;
