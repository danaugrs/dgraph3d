
var nodes = [
    
    {
    name: "node4",
    deps: ["node5", "node2"]
    },

    {
    name: "node2",
    deps: []
    },

    {
    name: "node3",
    deps: ["node2", "node4", "node5"]
    },

    {
    name: "node5",
    deps: []
    },
    
    {
    name: "node1",
    deps: ["node2", "node3"]
    }

]

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
    p = getParentNode(nodes);

    while (nodesToProcess(nodes).length > 0) {
        processLevel(p, nodes);
    }

    return {
        nodes: nodes,
        maxlevel: getMaxLevel(nodes)
    }
}

function getParentNode(nodes) {
    for (i = 0; i < nodes.length; i++) {
        if (nodes[i].parents.length == 0) {
            return nodes[i];          
        }
    }

}

function getMaxLevel(pnodes) {
    var maxlevel = 0;
    for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].level > maxlevel) {
            maxlevel = nodes[i].level;
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
    //} else {
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

exports.example = nodes;
exports.map = map;
exports.getParentNode = getParentNode;
exports.getNode = getNode;
