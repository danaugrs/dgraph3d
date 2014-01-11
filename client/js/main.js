/**
 * DGraph 0.0.1
 * 
 *      3D real-time dependency graphing using Three.js and Node.js.
 *
 */

var DepTree = require("./deptree.js");

var IntuitData = require("./intuit_data.js");
var GoogleData = require("./google_data.js");
        
// Map Data
var GoogleTree = DepTree.map(GoogleData);
var IntuitTree = DepTree.map(IntuitData);

// standard global variables
var data, container, lineMaterial, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var lastNode, nodeSelected, SELECTED, offset, plane;
var testline;

// custom global variables
var cube;
var projector, mouse = { x: 0, y: 0 }, INTERSECTED;
var sprite1;
var canvas1, context1, texture1;

var targetList = [];
var nodeObjs = [];
var lines = [];
var particleLines = []
var nodes = [];

// DEBUGGING / DEMO -----------------------------

var useServerData = true;

// -----------------------------------------------

var increment = function() {
    var i = 0;
    return function() { return i += 1; };
};
var count = increment();

exports.scene = scene;

init();
render();

var topBar = function() {
    this.displayName = 'DGraph 0.1.0';
    //this.speed = 0.8;
    //this.displayOutline = false;
    
    this.save = function() {
        console.log("Saving changes...");
        console.log(nodeSelected.node);
        nodeSelected.node.name = this.displayName;
        updateNode(nodeSelected.node);
    };
    
    this.addChild = function() {
        if (nodeSelected) {
            console.log("Adding child...");
            var node = {
                name: "Child"+count(),
                status: "Healthy",
                deps: [],
                parents: [nodeSelected.node.name]
            }
            var text = node.name + "\n" + "Status: " + node.status;
            var position = new THREE.Vector3(nodeSelected.position.x, nodeSelected.position.y - 30, nodeSelected.position.z);
		    node.object = makeNode(text, { fontsize: 32, backgroundColor: bgColor(node.status), position: position , node: node } );
            nodes.push(node);
            nodeSelected.node.deps.push(node.name);
            console.log(nodeSelected.node.name);
            createLines([nodeSelected.node]);
        }
    };
    
    this.sendError = function() {
        console.log("Sending error...");
        propagateStatus(nodeSelected.node, "Error");
    };
    
    this.setHealthy = function() {
        console.log("Sending error...");
        propagateStatus(nodeSelected.node, "Healthy");
    };
    
    this.delete = function() {
        console.log("Deleting node...");
        deleteNode(nodeSelected);
    };

    this.Google = function() {
        reset();
        data = GoogleTree;
        // Create Graph
        createTree(data);
    };

    this.Intuit = function() {
        reset();
        data = IntuitTree;
        // Create Graph
        createTree(IntuitTree);
    }

};


var Gui = new topBar();
var gui = new dat.GUI();


gui.add(Gui, 'displayName').listen();
//gui.add(text, 'speed', -5, 5);
//gui.add(text, 'displayOutline');
gui.add(Gui, 'save');
gui.add(Gui, 'addChild');
gui.add(Gui, 'delete');

var guid = gui.addFolder('Debugging');
guid.add(Gui, 'sendError');
guid.add(Gui, 'setHealthy');

var guif = gui.addFolder('Load');
guif.add(Gui, 'Intuit');
guif.add(Gui, 'Google');


function reset() {
 
    console.log("Reset!");
    var i;
    console.log(nodes);
    for (i = 0; i < nodes.length; i++) {
        deleteNode(nodes[i].object);
    }
    //for (i = 0; i < lines.length; i++) {
    //    scene.remove(lines[i].system);
    //}
    targetList = [];
    nodeObjs = [];
    lines = [];
    particleLines = [];
    nodes = [];

}

function bgColor(status) {
    if (status == "Healthy") {
        // Green
        backgroundColor= {r:100, g:200, b:100, a:1};
    }
    if (status == "Error") {
        // Green
        backgroundColor= {r:200, g:100, b:100, a:1};
    }
    if (status == "Alert") {
        // Green
        backgroundColor= {r:200, g:200, b:100, a:1};
    }
    return backgroundColor;

}

function propagateStatus(node, status) {
    node.status = status;
    updateNode(node);
    if (status == "Error") {
        setParentStatus(node, "Alert");
        
        // TODO CHANGE PARTICLE COLORS
        //var i;
        //for (i = 0; i < lines.length; i++) {
        //    var line = lines[i];
        //    var parent = line.parentNode;
        //    var child = line.childNode;
        //    if (node.name == child.object.name) {
        //        console.log(child.object.name, line.particles);
        //        line.particles.system.material.color.r = 200;
        //        line.particles.system.material.color.g = 100;
        //        line.particles.system.material.color.b = 100;
        //        line.particles.system.material.needsUpdate = true;
        //    }
        //}
    }
    if (status == "Healthy") {
        setParentStatus(node, "Healthy");

    }
}

function setParentStatus(node, status) {

    var i;
    console.log(node.parents);
    for (i = 0; i < node.parents.length; i++) {
        var n = DepTree.getNode(node.parents[i], nodes);
        if (n.status == "Error" && status == "Alert") {
            continue
        }
        n.status = status;
        updateNode(n);
        setParentStatus(n, status);
    }

}

function updateNode(node) {
    var text = node.name + "\n" + "Status: " + node.status;
    var msgtex = makeMsgTexture( text, { fontsize: 32, backgroundColor: bgColor(node.status) } );
    node.object.material.map = msgtex.texture;
    node.object.material.map.needsUpdate = true;// = tex;
    node.object.scale.x = msgtex.canvas.width * 0.3;
    node.object.scale.y = msgtex.canvas.height * 0.3;
}

var firstTime = true;

// WEBSOCKET CLIENT
//socket = new WebSocket("ws://www.norselords.com:7777", "echo-protocol");
socket = new WebSocket("ws://50.112.180.128:8000", "echo-protocol");

socket.addEventListener("open", function(event) {
    console.log("Websocket connected!");
    console.log(event.data);
});

// Display messages received from the server
socket.addEventListener("message", function(event) {
    console.log("Websocket data!");
    console.log(event.data);
    if (firstTime) {
        console.log("Received tree!");
        firstTime = false;
        if (useServerData) {
            var d = JSON.parse(event.data);
            data = DepTree.map(d);
            console.log(data);
            createTree(data);
        }
    } else if (useServerData) {
        l = event.data.split(": ");
        propagateStatus(DepTree.getNode(l[0], nodes), l[1]); 
    }
});

// Display any errors that occur
socket.addEventListener("error", function(event) {
    console.log("Websocket error.");
});

socket.addEventListener("close", function(event) {
    console.log("Websocket connection closed.");
    alert("Server offline");
});

module.exports = socket;


// FUNCTIONS 		
function init() {

    console.log("Initializing...");

    // SCENE
	scene = new THREE.Scene();
    exports.scene = scene;
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	

	// RENDERER
	if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:true} );
	else
		renderer = new THREE.CanvasRenderer(); 
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'ThreeJS' );
	container.appendChild( renderer.domElement );

	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : ']'.charCodeAt(0) });

	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );

	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,250,0);
	scene.add(light);
	
	// SKYBOX/FOG
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	//var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x444444, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
	

    // initialize object to perform world/screen calculations
	projector = new THREE.Projector();
	
    plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
    plane.visible = false;
	scene.add( plane );
	// when the mouse moves, call the given function
	
    renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	//window.addEventListener( 'resize', onWindowResize, false );
    
    ////////////
	// CUSTOM //
	////////////

    lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.8
    });

    //var geometry = new THREE.Geometry();
    //geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    //geometry.vertices.push(new THREE.Vector3(10, 10, 10));
    //geometry.dynamic = true;
    //geometry.verticesNeedUpdate = true;
    //geometry.elementsNeedUpdate = true;
    //geometry.morphTargetsNeedUpdate = true;
    //geometry.uvsNeedUpdate = true;
    //geometry.normalsNeedUpdate = true;
    //geometry.colorsNeedUpdate = true;
    //geometry.tangentsNeedUpdate = true;
    //testline = new THREE.Line(geometry, lineMaterial);
    //scene.add(testline);
    
    offset = new THREE.Vector3();
  
    //if (useServerData == false) {

    //    // Process data
    //    //data = DepTree.map(Data);
    //    data = DepTree.map(GoogleData);

    //    //console.log(data);

    //    // Create Graph
    //    createTree(data);

    //}


	//var geometry = new THREE.SphereGeometry( 100, 4, 3 );
	//geometry.mergeVertices();
	//geometry.computeCentroids();
	//var material = new THREE.MeshNormalMaterial({wireframe: true});
	//mesh = new THREE.Mesh( geometry, material );
	//mesh.position.set(0,0,0);
	//mesh.scale.x = mesh.scale.y = mesh.scale.z = 2;
	//scene.add(mesh);

	
}

function createParticleLine(origin, dest) {
    // create the particle variables
        particles = new THREE.Geometry(),
        pMaterial = new THREE.ParticleBasicMaterial({
            color: 0xFFFFFF,
            size: 5,
            map: THREE.ImageUtils.loadTexture(
              "images/particle.png"
            ),
            blending: THREE.AdditiveBlending,
            transparent: true
        });
    
    //var origin = testline.geometry.vertices[0];
    //var dest = testline.geometry.vertices[1];
    
    var origin = new THREE.Vector3(origin.x, origin.y, origin.z);
    var dest = new THREE.Vector3(dest.x, dest.y, dest.z);

    //console.log(origin, dest);

    var vector = dest.clone().sub(origin.clone());
    
    //console.log(vector.length());
    //var particleCount = Math.floor(vector.length()/2);
    var particleCount = Math.floor(vector.length()/7);

    // now create the individual particles
    for (var p = 0; p < particleCount; p++) {

        var pX = origin.x + vector.x * p / particleCount;
        var pY = origin.y + vector.y * p / particleCount;
        var pZ = origin.z + vector.z * p / particleCount;
        var particle = new THREE.Vector3(pX, pY, pZ)
    
      // add it to the geometry
      particles.vertices.push(particle);
    }

    
    // create the particle system
    var particleSystem = new THREE.ParticleSystem(
        particles,
        pMaterial);
    particleSystem.dynamic = true;
    particleSystem.sortParticles = true;
    particleSystem.geometry.verticesNeedUpdate = true;
    particleSystem.geometry.elementsNeedUpdate = true;
    particleSystem.geometry.morphTargetsNeedUpdate = true;
    particleSystem.geometry.uvsNeedUpdate = true;
    particleSystem.geometry.normalsNeedUpdate = true;
    particleSystem.geometry.colorsNeedUpdate = true;
    particleSystem.geometry.tangentsNeedUpdate = true;
    
    // add it to the scene
    
    particles.vector = vector;
    particles.origin = origin;
    particles.count = particleCount;

    particleSystem.geometry.__dirtyVertices = true;
    scene.add(particleSystem);
    particles.system = particleSystem;
    particleLines.push(particles);

    return particles;

}

function deleteNode(node) {
   console.log("Deleting node:", node.name);

   var i, j;
   for (i = 0; i < lines.length; i++) {
       var line = lines[i];
       var parent = line.parentNode;
       var child = line.childNode;
       // If line connected to selected object
       if (node.name == parent.object.name || node.name == child.object.name) {
           //recreate particle system
           //console.log(parent.object.name, child.object.name, node.name, line);

           var index = particleLines.indexOf(line.particles);
           if (index > -1) {
               particleLines.splice(index, 1);
           }
           scene.remove(line.particles.system);
           
           var index = lines.indexOf(line);
           if (index > -1) {
               lines.splice(index, 1);
               i--;
           }
           scene.remove(line);
       }
   }
   var index = nodeObjs.indexOf(node);
   if (index > -1) {
       nodeObjs.splice(index, 1);
   }
   scene.remove(node);

}

function createTree(data) {

    var i, p;

    var obj = DepTree.getParentNode(data.nodes);
    p = DepTree.getNode(obj.p, obj.nodes);


    console.log("Parent:", p.name);

    var levelHeight = 60;
    var coneRadius = 30;
    var parentZ = data.maxlevel/2;
    nodes = data.nodes;

    p.position.y = parentZ * levelHeight;
    p.position.x = 0;
    p.position.z = 0;

    positionChildren(p, nodes, parentZ, levelHeight, coneRadius);

    nodes = createNodes(nodes);
    //console.log(scene);
    //console.log(nodes);
    createLines(nodes);
    
    if (p.name == "Ghost Node") {
        console.log("Deleting ghost node");
        var l = scene.getObjectByName(p.name);
        deleteNode(l);
    }
    
    //setTimeout(function() {
    //    console.log("PROPAGATING");
    //    propagateStatus(DepTree.getNode("Quicken", nodes), "Error");
    //}, 2000);

}

function createLines(nodeList) {
    console.log("Creating lines...");
    var i, j;
    for (i = 0; i < nodeList.length; i++) {
        for (j = 0; j < nodeList[i].deps.length; j++) {
            var child = DepTree.getNode(nodeList[i].deps[j], nodes);
            //console.log(nodeList[i].deps[j], child);
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(nodeList[i].object.position.x, nodeList[i].object.position.y, nodeList[i].object.position.z));
            geometry.vertices.push(new THREE.Vector3(child.object.position.x, child.object.position.y, child.object.position.z));
            geometry.dynamic = true;
            geometry.verticesNeedUpdate = true;
            var line = new THREE.Line(geometry, lineMaterial);
            line.name = "line" + i;
            //console.log("Creating", line.name);//nodes[i], child);
            line.parentNode = nodeList[i];
            line.childNode = child;
            line.particles = createParticleLine(line.childNode.object.position, line.parentNode.object.position);
            scene.add(line);
            lines.push(line);
        }
    }
}

function positionChildren(node, nodes, parentZ, levelHeight, coneRadius) {
    var i;
    //console.log("Positioning children of:", node.name);
    if (node.deps.length == 0) {return};
    for (i = 0; i < node.deps.length; i++) { 
        var child = DepTree.getNode(node.deps[i], nodes);
        //console.log(child.name);
        if (child.angle == null) {
            child.angle = (2*Math.PI / node.deps.length ) * (i+1);
            //console.log(child.name, child.angle, node.deps.length);
            child.position = {};
            child.position.y = (parentZ - child.level + 1) * levelHeight;
            if (node.name == "Ghost Node") {
                coneR = coneRadius*7;
            } else {
                coneR = coneRadius;
            }
            child.position.x = node.position.x + Math.cos(child.angle) * coneR * child.level;
            child.position.z = node.position.z + Math.sin(child.angle) * coneR * child.level;
        }
    }
    for (i = 0; i < node.deps.length; i++) { 
        var child = DepTree.getNode(node.deps[i], nodes);
        positionChildren(child, nodes, parentZ, levelHeight, coneRadius);
    }
}

// Create sprites given list of objects with position property
function createNodes(data) {

    var i;

    for (i = 0; i < data.length; i++) {
        //console.log(data[i]);
        var text = data[i].name + "\n" + "Status: " + data[i].status;
		data[i].object = makeNode(text, { fontsize: 32, backgroundColor: bgColor(data[i].status), position: data[i].position , node: data[i]} );
		//data[i].sprite.position = data[i].position;//geometry.vertices[i].clone().multiplyScalar(1.1);
		//scene.add( data[i].sprite );
    }

    return data;

}

function makeNode( message, parameters) {
    
    var msgtex = makeMsgTexture( message, parameters );
    var texture = msgtex.texture;
    var canvas = msgtex.canvas;

    var scale = 0.3;
    
    var geometry = new THREE.CubeGeometry( 1, 1, 1); //canvas.width*scale, canvas.height*scale, 2 );

	//var texture = THREE.ImageUtils.loadTexture( 'textures/crate.gif' );
	//texture.anisotropy = renderer.getMaxAnisotropy();
    texture.needsUpdate = true;

	var material = new THREE.MeshBasicMaterial({
        map: texture,
        opacity: 0.7,
        transparent: true,
        needsUpdate: true
    });

	mesh = new THREE.Mesh( geometry, material );
    mesh.position = parameters.position;
    mesh.name = parameters.node.name;
    mesh.node = parameters.node;

    mesh.scale.x = canvas.width * scale;
    mesh.scale.y = canvas.height * scale;
    mesh.scale.z = 1;//canvas.width * scale;

	scene.add(mesh);
    nodeObjs.push(mesh);
    return mesh;

}

function makeMsgTexture( message, parameters ) {

	if ( parameters === undefined ) parameters = {};
	
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
	
	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 36; // 18
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 2; //4
	
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

	//var spriteAlignment = parameters.hasOwnProperty("alignment") ?
	//	parameters["alignment"] : THREE.SpriteAlignment.topLeft;

		

	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
    
    var lines = message.split("\n");
    var i, t, metrics = {width:0};
    
	// get max width
    for (i = 0; i < lines.length; i++) {
        t = context.measureText( lines[i] );
        if (t.width > metrics.width) {
            metrics = t;
        }
    }
    //metrics = context.measureText( message )
	var textWidth = metrics.width;
    //console.log(canvas.width, canvas.height, textWidth);
    context.canvas.width = textWidth + 2*borderThickness;
    context.canvas.height = fontsize * 1.2 * lines.length + 2*borderThickness;
	
    var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
	
	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
    //roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.2 * lines.length + borderThickness, 10);
    //roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 3.4 + borderThickness, 10); // roundness
	// 1.4 is extra height factor for text below baseline: g,j,p,q.
	
	// text color
	context.fillStyle = "rgba(0, 0, 0, 1.0)";

    for (i = 0; i < lines.length; i++) {
	    context.fillText( lines[i], borderThickness, (fontsize + borderThickness)*(i+1));
    }

    // canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;
    return {
        texture: texture,
        canvas: canvas
    };

}

// Create a text sprite
function makeTextSprite( message, parameters ) {

    var msgtex = makeMsgTexture( message, parameters );
    var texture = msgtex.texture;
    var canvas = msgtex.canvas;
	var spriteAlignment = THREE.SpriteAlignment.center;
	var spriteMaterial = new THREE.SpriteMaterial( 
		{ map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
	var sprite = new THREE.Sprite( spriteMaterial );
    
    var scale = 0.3;
    var x = canvas.width*scale;
    var y = canvas.height*scale;
	sprite.scale.set(x, y, 1.0);
    return sprite;	
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
}


function onDocumentMouseMove( event ) {

	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	//

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );


	if ( SELECTED ) {

		var intersects = raycaster.intersectObject( plane );
        //console.log(SELECTED);
		SELECTED.position = intersects[ 0 ].point.sub( offset ) ;

        // find lines attached to this node, and recreate the respective particle systems

        //console.log(SELECTED.node);

        var i;
        for (i = 0; i < lines.length; i++) {
            var line = lines[i];
            var parent = line.parentNode;
            var child = line.childNode;

            var name = line.name;
            var particles = line.particles;
            particles.origin = new THREE.Vector3(child.object.position.x, child.object.position.y, child.object.position.z);
            var dest = new THREE.Vector3(parent.object.position.x, parent.object.position.y, parent.object.position.z);
            particles.vector = dest.clone().sub(particles.origin.clone());

            var geometry = new THREE.Geometry();
            geometry.vertices.push(line.parentNode.object.position);
            geometry.vertices.push(line.childNode.object.position);
            
            var l = scene.getObjectByName(lines[i].name);
            scene.remove(l);
            
            lines[i] = new THREE.Line(geometry, lineMaterial);
            lines[i].parentNode = parent;
            lines[i].childNode = child;
            lines[i].name = name;
            lines[i].particles = particles;

            if (SELECTED.name == parent.object.name || SELECTED.name == child.object.name) {
                //recreate particle system
                console.log(parent.object.name, child.object.name, SELECTED.name, line);

                var index = particleLines.indexOf(line.particles);
                if (index > -1) {
                    particleLines.splice(index, 1);
                }
                scene.remove(line.particles.system);
                //scene.remove(line.particles.system);
                lines[i].particles = createParticleLine(line.childNode.object.position, line.parentNode.object.position);
                lines[i].particles.system.material.size = 10;

            }
            scene.add(lines[i]);

        }

		return;

	}


	var intersects = raycaster.intersectObjects( nodeObjs );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

			plane.position.copy( INTERSECTED.position );
			plane.lookAt( camera.position );

		}

		container.style.cursor = 'pointer';

	} else {

		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

		container.style.cursor = 'auto';

	}

}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects( nodeObjs );

	if ( intersects.length > 0 ) {

		controls.enabled = false;
        
        if (lastNode) {
            lastNode.material.opacity = 0.7;
        }

		SELECTED = intersects[ 0 ].object;
        nodeSelected = SELECTED;

        Gui.displayName = SELECTED.name;

		var intersects = raycaster.intersectObject( plane );
		offset.copy( intersects[ 0 ].point ).sub( plane.position );

		container.style.cursor = 'move';
        
        //console.log("Hit @ " + toString( intersects[0].point ) );
        //console.log(intersects[0]);
        SELECTED.material.opacity = 1;
        lastNode = SELECTED;

        // Bold connecting lines
        for (i = 0; i < lines.length; i++) {
            var line = lines[i];
            var parent = line.parentNode;
            var child = line.childNode;

            var name = line.name;
            var particles = line.particles;
            var material = lines[i].particles.system.material;

            if (SELECTED.name == parent.object.name || SELECTED.name == child.object.name) {
                //recreate particle system
                console.log(parent.object.name, child.object.name, SELECTED.name, line);

                
                material.size = 10;
                //material.color = 0x000044;
                //var index = particleLines.indexOf(line.particles);
                //if (index > -1) {
                //    particleLines.splice(index, 1);
                //}
                //scene.remove(line.particles.system);
                ////scene.remove(line.particles.system);
                //lines[i].particles = createParticleLine(line.childNode.object.position, line.parentNode.object.position);

            } else {
                material.size = 5;
                //material.color = 0xFFFFFF;
                // UNBOLD


            }

        }




	}

}

function onDocumentMouseUp( event ) {

	event.preventDefault();

	controls.enabled = true;

	if ( INTERSECTED ) {

		plane.position.copy( INTERSECTED.position );

		SELECTED = null;

	}

	container.style.cursor = 'auto';

}


// Loops

function update() {

    var i, j, k;

	controls.update();
	stats.update();

    // Update lines
    //
    //console.log(lines[0].parentNode.object.position);
    

    for (i = 0; i < particleLines.length; i++) {
        var particles = particleLines[i];
        for (j = 0; j < particles.vertices.length; j++) {
            var particle = particles.vertices[j];
            var s = 0.001;//001;
            
            var v = particles.vertices[j].clone().sub(particles.origin.clone());

            if (v.length() > particles.vector.length()) {
                particles.vertices[j] = particles.origin.clone();
            } else {
                particles.vertices[j].x += particles.vector.x * s;
                particles.vertices[j].y += particles.vector.y * s;
                particles.vertices[j].z += particles.vector.z * s;
            }
        }
    }

    //for (i = 0; i < nodes.length; i++) {
        //console.log(nodes[i]);
        //console.log(camera.rotation.y, nodes[i].rotation.y);
        //var vector = new THREE.Vector3(camera.position.x - nodes[i].position.x, 0, camera.position.y-nodes[i].position.z);
        //nodes[i].lookAt(camera.position);//rotation.y = camera.rotation.y;
        //nodes[i].lookAt(vector);//rotation.y = camera.rotation.y;
        //var a = controls.getAutoRotationAngle();
        //console.log(controls);
        //nodes[i].rotation.y = camera.rotation.y;
    //}

}

function render() {
    requestAnimationFrame( render );
	
    update();
	
    renderer.render( scene, camera );
}

