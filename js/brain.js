import { DRACOLoader } from '../three.js/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from '../three.js/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from '../three.js/examples/jsm/controls/OrbitControls.js';
import * as THREE from '../three.js/build/three.module.js';


var scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );
var camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.001, 1000 );

var renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
let time = 0;

const material = new THREE.ShaderMaterial({
    extensions:{
        derivatives: "#extension GL_OES_standard_derivatives : enable"
    },
    side: THREE.DoubleSide,
    uniforms:{
        time: {type: "f", value: 0},
        mousePos: { type: "v3", value: new THREE.Vector3(0,0,0)},
        pixels:{
            type: "v2",
            value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        },
        uvRate1:{
            value: new THREE.Vector2(1, 1)
        }
    },

    vertexShader: document.getElementById('material-vertex-shader').textContent,
    fragmentShader: document.getElementById('material-fragment-shader').textContent
});


let raycaster = new THREE.Raycaster();



camera.position.set(0,0,1.7);

let geometry = new THREE.PlaneGeometry(5,5,5,5);
let plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0x00ff55, visible:false}));
// plane.position.z = 0.5;
scene.add(plane);

const mouseV = new THREE.Vector2();

function mouse(){


    function onMouseMove( event ) {

        // calculate mouse position in normalized device coordinates
        // (-1 to +1) for both components

        mouseV.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouseV.y = - ( event.clientY / window.innerHeight ) * 2 + 1;


    }
    window.addEventListener( 'mousemove', onMouseMove, false );
}

let pointsMesh;

function render() {
    // const timer = Date.now() * 0.0003;
    //
    // camera.position.x = Math.sin( timer ) * 0.5 + 1;
    // camera.position.z = Math.cos( timer ) * 0.5 + 1;
    // camera.lookAt( 0, 0.1, 0 );
    time += 0.05;
    material.uniforms.time.value = time;

    if(pointsMesh){
        // pointsMesh.rotation.y += 0.01;
    }

    raycaster.setFromCamera( mouseV, camera );

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( [plane] );
    for ( let i = 0; i < intersects.length; i ++ ) {

        if(intersects.length>0){
            console.log('intersects', intersects[0].point);
            material.uniforms.mousePos.value = intersects[0].point;
        }
        // intersects[ i ].object.material.color.set( 0xff0000 );

    }


    requestAnimationFrame( render );
    renderer.render( scene, camera );

}

const dracoLoader = new DRACOLoader();

dracoLoader.setDecoderPath( './three.js/examples/js/libs/draco/' );
dracoLoader.setDecoderConfig( { type: 'js' } );
const loaderR = new GLTFLoader().setPath('models/');
loaderR.setDRACOLoader( dracoLoader );


loaderR.load( 'brain2.glb',
    function ( gltf ) {

        gltf.scene.traverse(function (child){
            if (child.isMesh){
                // child.material = mat;
                child.material.wireframe = true;
            }
        })

        console.log('gltf', gltf);
        // scene.add(gltf.scene);

        let geo = new THREE.BufferGeometry();

        let pos = gltf.scene.children[0].geometry.attributes.position.array;
        geo.addAttribute('position', new THREE.BufferAttribute(pos, 3));

        geo.computeBoundingBox();
        console.log(geo, pos);
        pointsMesh = new THREE.Points(geo, material);
        scene.add(pointsMesh);

    },
    function ( xhr ) {
        console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },
    // called when loading has errors
    function ( error ) {
        console.log( 'An error happened' );
    }
);


render();
mouse();
