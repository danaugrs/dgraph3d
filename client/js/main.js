/**
 * DGraph 0.0.1
 * 
 *      3D real-time dependency graphing using Three.js and Node.js.
 *
 */

var DepTree = require("./deptree.js");
var Data = require("./data.js");

// standard global variables
var data, container, lineMaterial, scene, camera, renderer, controls, stats;
var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();
var lastNode, selectedNode;

// custom global variables
var cube;
var projector, mouse = { x: 0, y: 0 }, INTERSECTED;
var sprite1;
var canvas1, context1, texture1;
var targetList = [];
var nodes = [];

init();
render();

// FUNCTIONS 		
function init() {

    console.log("Initializing...");

    // SCENE
	scene = new THREE.Scene();

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
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });

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
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
	

    // initialize object to perform world/screen calculations
	projector = new THREE.Projector();
	
	// when the mouse moves, call the given function
	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	
    ////////////
	// CUSTOM //
	////////////

    lineMaterial = new THREE.LineBasicMaterial({
        color: 0x0000ff
    });

    makeNode("HELLO!", {position:{x: 0, y: 0, z: 0}});
   
    // Process data
    data = DepTree.map(Data);

    // Create Graph
    createTree(data);


	var geometry = new THREE.SphereGeometry( 100, 4, 3 );
	geometry.mergeVertices();
	geometry.computeCentroids();
	var material = new THREE.MeshNormalMaterial({wireframe: true});
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(0,0,0);
	scene.add(mesh);
	
	
}

function createTree(data) {

    var i, p;

    p = DepTree.getParentNode(data.nodes);

    var levelHeight = 40;
    var coneRadius = 10;
    var parentZ = data.maxlevel/2;

    p.position.y = parentZ * levelHeight;
    p.position.x = 0;
    p.position.z = 0;

    positionChildren(p, data.nodes, parentZ, levelHeight, coneRadius);

    createNodes(data.nodes);
    createLines(data.nodes);

}

function createLines(nodes) {
    var i, j;
    for (i = 0; i < nodes.length; i++) {
        for (j = 0; j < nodes[i].deps.length; j++) {
            var child = DepTree.getNode(nodes[i].deps[j], nodes);
            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z));
            geometry.vertices.push(new THREE.Vector3(child.position.x, child.position.y, child.position.z));
            var line = new THREE.Line(geometry, lineMaterial);
            scene.add(line);
        }

    }

}

function positionChildren(node, nodes, parentZ, levelHeight, coneRadius) {
    var i;
    if (node.deps.length == 0) {return};
    for (i = 0; i < node.deps.length; i++) { 
        var child = DepTree.getNode(node.deps[i], nodes);
        if (child.angle == null) {
            console.log(node.angle);
            child.angle = (2*Math.PI / node.deps.length ) * (i+1);
            console.log(child.name, child.angle, node.deps.length);
            child.position = {};
            child.position.y = (parentZ - child.level + 1) * levelHeight;
            child.position.x = node.position.x + Math.cos(child.angle) * coneRadius * child.level;
            child.position.z = node.position.z + Math.sin(child.angle) * coneRadius * child.level;
        }
    }
    for (i = 0; i < node.deps.length; i++) { 
        positionChildren(child, nodes, parentZ, levelHeight, coneRadius);
    }
}

// Create sprites given list of objects with position property
function createNodes(data) {

    var i;

    for (i = 0; i < data.length; i++) {
		data[i].object = makeNode(data[i].name, { fontsize: 32, backgroundColor: {r:255, g:100, b:100, a:1}, position: data[i].position } );
		//data[i].sprite.position = data[i].position;//geometry.vertices[i].clone().multiplyScalar(1.1);
		//scene.add( data[i].sprite );
        //targetList.push(data[i].sprite);
    }

}

function makeNode( message, parameters) {

    
    var msgtex = makeMsgTexture( message, parameters );
    var texture = msgtex.texture;
    var canvas = msgtex.canvas;

    var scale = 0.3;
    
    var geometry = new THREE.CubeGeometry( canvas.width*scale, canvas.height*scale, 2 );

	//var texture = THREE.ImageUtils.loadTexture( 'textures/crate.gif' );
	texture.anisotropy = renderer.getMaxAnisotropy();

	var material = new THREE.MeshBasicMaterial({
        map: texture,
        opacity: 0.7,
        transparent: true
    });

	mesh = new THREE.Mesh( geometry, material );
    mesh.position = parameters.position;
	scene.add(mesh);
    nodes.push(mesh);

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
    console.log(canvas.width, canvas.height, textWidth);
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

function onDocumentMouseDown( event ) {
	// the following line would stop any other event handler from firing
	// (such as the mouse's TrackballControls)
	event.preventDefault();
	
	console.log("Click.");
	
	// update the mouse variable
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	
	// find intersections

	// create a Ray with origin at the mouse position
	//   and direction into the scene (camera direction)
	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
	projector.unprojectVector( vector, camera );
	var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	// create an array containing all objects in the scene with which the ray intersects
	var intersects = ray.intersectObjects( nodes );
	
	// if there is one (or more) intersections
	if ( intersects.length > 0 ) {
        if (lastNode) {
            lastNode.material.opacity = 0.7;
        }
        selectedNode = intersects[0].object;		
        //console.log("Hit @ " + toString( intersects[0].point ) );
        //console.log(intersects[0]);
        selectedNode.material.opacity = 1;
        lastNode = selectedNode;



		
        // change the color of the closest face.
		//intersects[ 0 ].face.color.setRGB( 0.8 * Math.random() + 0.2, 0, 0 ); 
		//intersects[ 0 ].object.geometry.colorsNeedUpdate = true;
	}

}

// Loops

function update() {

    var i;

	controls.update();
	stats.update();

    for (i = 0; i < nodes.length; i++) {
        //console.log(nodes[i]);
        //console.log(camera.rotation.y, nodes[i].rotation.y);
        var vector = new THREE.Vector3(camera.position.x - nodes[i].position.x, 0, camera.position.y-nodes[i].position.z);
        //nodes[i].lookAt(camera.position);//rotation.y = camera.rotation.y;
        //nodes[i].lookAt(vector);//rotation.y = camera.rotation.y;
        //var a = controls.getAutoRotationAngle();
        //console.log(controls);
        //nodes[i].rotation.y = camera.rotation.y;
    }

}

function render() {
    requestAnimationFrame( render );
	
    update();
	
    renderer.render( scene, camera );
}

