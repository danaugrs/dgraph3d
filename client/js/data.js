module.exports = [
    
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

];
