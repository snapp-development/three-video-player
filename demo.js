// Import JS libraries
import * as THREE from 'three';

// Import THREEVideoPlayer object
import { THREEVideoPlayer } from './source/three-video-player.js';

// Import coffee video
import CoffeeVideo from './coffee.mp4';

// Create THREE JS scene
const scene3 = new THREE.Scene();

// Create THREE JS camera
const camera3 = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

// Create & initialize THREE JS renderer
const renderer3 = new THREE.WebGLRenderer();
renderer3.setSize(window.innerWidth, window.innerHeight);
renderer3.setClearColor(0x676767, 1);
document.body.appendChild(renderer3.domElement);

// Create groundPlaneObject and add to THREE JS scene
const groundPlaneObject = new THREE.Mesh(new THREE.PlaneBufferGeometry(1000, 2000), new THREE.MeshBasicMaterial({
    color: 0x444444,
    side: THREE.DoubleSide
}));
groundPlaneObject.rotation.x = -Math.PI/2.0;
scene3.add(groundPlaneObject);

// Create videoPlayerObject and add to THREE JS scene
const videoPlayerObject = new THREEVideoPlayer({
    source: CoffeeVideo,
    play_btn_color: 0x6EABDD
});
videoPlayerObject.position.y = 0.5;
scene3.add(videoPlayerObject);

// Set camera position & look at videoPlayerObject
camera3.position.z = 2.0;
camera3.position.y = 0.6;
camera3.lookAt(videoPlayerObject.position);

// Add "click" event listener to trigger video play / pause
renderer3.domElement.addEventListener('mousedown', function(event){
    // Prevent default event handling
    event.preventDefault();

    // Store event position as THREE JS Vector2
    var mousePosition = new THREE.Vector2((event.clientX/window.innerWidth)*2-1,  -(event.clientY/window.innerHeight)*2+1);

    // Create & configure raycaster
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mousePosition, camera3);

    // Check if event position intersects videoPlayerObject and if videoPlayerObject can play
    var intersects = raycaster.intersectObject(videoPlayerObject, true);
    if(intersects.length > 0 && videoPlayerObject.canPlay()){
        // Play video if paused, pause if playing
        if(videoPlayerObject.isPaused()){
            videoPlayerObject.play();
        } else {
            videoPlayerObject.pause();
        }
    }
});

// Create animation direction variable & set animation constants
var dir = "right";
const RotationSpeed = 0.002;
const RotationMax = 0.4;

// Define animation & rendering method
function animate() {
    // Request next frame
    requestAnimationFrame(animate);

    // Animate video player object
    switch(dir){
        case "right":
            videoPlayerObject.rotation.y += RotationSpeed;

            if(videoPlayerObject.rotation.y > RotationMax){
                dir = "left";
            }
            break;
        case "left":
            videoPlayerObject.rotation.y -= RotationSpeed;

            if(videoPlayerObject.rotation.y < -RotationMax){
                dir = "right"
            }
            break;
        default:
            break;
    }

    // Render frame
    renderer3.render(scene3, camera3);
}

// Begin rendering
animate();