import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as TWEEN from '@tweenjs/tween.js';
import soundUrl from './gmcb_sound.mp3';

// Config
const CUBE_COLOR = 0x6559C2; 
const BG_COLOR = 0x111111;
const SPEED = 170; 
const PAUSE = 0; 

document.body.style.margin = '0';
document.body.style.overflow = 'hidden';

const scene = new THREE.Scene();
scene.background = new THREE.Color(BG_COLOR);

const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 10;
const camera = new THREE.OrthographicCamera(
    frustumSize * aspect / -2, frustumSize * aspect / 2,
    frustumSize / 2, frustumSize / -2,
    0.1, 1000
);
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

const listener = new THREE.AudioListener();
camera.add(listener);

// Audio
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();

let audioLoaded = false;

audioLoader.load(soundUrl, function(buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(false); 
    sound.setVolume(0.5); 
    audioLoaded = true;
});

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Ambient Light
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); 
scene.add(ambientLight);

// Directional Light 1
const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(-10, 20, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
scene.add(dirLight);

// Directional Light 2
const dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
dirLight2.position.set(5, -20, 15);
dirLight2.castShadow = true;
dirLight2.shadow.mapSize.set(2048, 2048);
scene.add(dirLight2);

const gridHelper = new THREE.GridHelper(6, 6, 0x555555, 0x333333);
gridHelper.position.y = 0; 
scene.add(gridHelper);

const footprintsGroup = new THREE.Group();
scene.add(footprintsGroup);

// Cube material
const material = new THREE.MeshPhongMaterial({ 
    color: CUBE_COLOR, 
    shininess: 10, 
    specular: 0xEEEEEE,
    transparent: true,
    opacity: 1
});

// Footprint material
const fpMat = new THREE.MeshBasicMaterial({ 
    color: CUBE_COLOR,
    transparent: true,
    opacity: 1
});

// Final object material (was supposed to be silver initially)
const silverMaterial = new THREE.MeshPhongMaterial({ 
    color: CUBE_COLOR, 
    shininess: 10, 
    specular: 0xEEEEEE,
    transparent: true,
    opacity: 0
});

// Cube
const geometry = new RoundedBoxGeometry(1, 1, 1, 4, 0.07);
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;

// Final object
let silverGroup = new THREE.Group();
scene.add(silverGroup);

// Pivot
const pivotHelper = new THREE.Object3D();
scene.add(pivotHelper);

// First impact on drop
function triggerFirstImpact() {
    new TWEEN.Tween(scene.rotation)
        .to({ z: -0.1 }, 200)
        .easing(TWEEN.Easing.Elastic.Out)
        .yoyo(true)
        .repeat(1)
        .start();
}

// Second impact on drop
function triggerSecondImpact() {
    new TWEEN.Tween(scene.position)
        .to({ y: -0.5 }, 200)
        .easing(TWEEN.Easing.Elastic.Out)
        .yoyo(true)
        .repeat(1)
        .start();
}

// Rotate with pivot
function manualRoll(pivotX, pivotY, pivotZ, axis, angle, nextStep) {
    pivotHelper.position.set(pivotX, pivotY, pivotZ);
    pivotHelper.rotation.set(0, 0, 0);
    pivotHelper.updateMatrixWorld();

    pivotHelper.attach(cube);

    const targetRot = { x: 0, y: 0, z: 0 };
    targetRot[axis] = angle;

    new TWEEN.Tween(pivotHelper.rotation)
        .to(targetRot, SPEED)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {
            scene.attach(cube);
            cube.position.x = Math.round(cube.position.x * 2) / 2;
            cube.position.y = Math.round(cube.position.y * 2) / 2;
            cube.position.z = Math.round(cube.position.z * 2) / 2;
            cube.rotation.set(
                Math.round(cube.rotation.x / 1.57) * 1.57,
                Math.round(cube.rotation.y / 1.57) * 1.57,
                Math.round(cube.rotation.z / 1.57) * 1.57
            );
            setTimeout(nextStep, PAUSE);
        })
        .start();
}

// Footprint creation logic
function createFootprint(cx, cy, cz, side) {
    const thickness = 0.01; 
    const size = 0.9;
    const radius = 0.1; 
    const segments = 4; 
    
    let w, h, d;
    let px = cx, py = cy, pz = cz;

    switch(side.toLowerCase()) {
        case 'up':
            w = size; h = thickness; d = size;
            py += 0.5;
            break;
        case 'down':
            w = size; h = thickness; d = size;
            py -= 0.5;
            break;
        case 'east': 
            w = thickness; h = size; d = size;
            px += 0.5;
            break;
        case 'west': 
            w = thickness; h = size; d = size;
            px -= 0.5;
            break;
        case 'south': 
            w = size; h = size; d = thickness;
            pz += 0.5;
            break;
        case 'north': 
            w = size; h = size; d = thickness;
            pz -= 0.5;
            break;
        default:
            return;
    }

    const fpGeo = new RoundedBoxGeometry(w, h, d, segments, radius);
    const footprint = new THREE.Mesh(fpGeo, fpMat);
    footprint.position.set(px, py, pz);
    footprint.receiveShadow = true;
    
    footprintsGroup.add(footprint);
}

cube.position.set(-0.5, 9, -2.5); 
scene.add(cube);

// First drop
function startIntro() {
    setTimeout(triggerFirstImpact, 75);

    new TWEEN.Tween(cube.position)
        .to({ y: 0.5 }, 300)
        .easing(TWEEN.Easing.Elastic.Out)
        .delay(0)
        .onComplete(() => {
            setTimeout(step1_RollLeft, 100);
        })
        .start();
}

function step1_RollLeft() {
    manualRoll(cube.position.x - 0.5, cube.position.y - 0.5, cube.position.z, 'z', Math.PI / 2, step2_RollLeft);
}
function step2_RollLeft() {
    createFootprint(-1.5, 0.5, -2.5, 'down');
    manualRoll(cube.position.x - 0.5, cube.position.y - 0.5, cube.position.z, 'z', Math.PI / 2, step3_RollForward);
}
function step3_RollForward() {
    createFootprint(-2.5, 0.5, -2.5, 'down');
    manualRoll(cube.position.x, cube.position.y - 0.5, cube.position.z + 0.5, 'x', Math.PI / 2, step4_RollForward);
}
function step4_RollForward() {
    createFootprint(-2.5, 0.5, -1.5, 'down');
    manualRoll(cube.position.x, cube.position.y - 0.5, cube.position.z + 0.5, 'x', Math.PI / 2, step5_RollDown);
}
function step5_RollDown() {
    createFootprint(-2.5, 0.5, -0.5, 'down');
    manualRoll(cube.position.x, cube.position.y - 0.5, cube.position.z + 0.5, 'x', Math.PI, step6_RollDown);
}
function step6_RollDown() {
    createFootprint(-2.5, -0.5, 0.5, 'north');
    manualRoll(cube.position.x, cube.position.y - 0.5, cube.position.z - 0.5, 'x', Math.PI/2, step7_RollDown);
}
function step7_RollDown() {
    createFootprint(-2.5, -1.5, 0.5, 'north');
    manualRoll(cube.position.x, cube.position.y - 0.5, cube.position.z - 0.5, 'x', Math.PI/2, step8_RollRight);
}
function step8_RollRight() {
    createFootprint(-2.5, -2.5, 0.5, 'north');
    manualRoll(cube.position.x + 0.5, cube.position.y, cube.position.z - 0.5, 'y', Math.PI/2, step9_RollRight);
}
function step9_RollRight() {
    createFootprint(-1.5, -2.5, 0.5, 'north');
    manualRoll(cube.position.x + 0.5, cube.position.y, cube.position.z - 0.5, 'y', Math.PI/2, step10_RollRight);
}
function step10_RollRight() {
    createFootprint(-0.5, -2.5, 0.5, 'north');
    manualRoll(cube.position.x + 0.5, cube.position.y, cube.position.z - 0.5, 'y', Math.PI, step11_RollBack);
}
function step11_RollBack() {
    createFootprint(0.5, -2.5, -0.5, 'west');
    manualRoll(cube.position.x - 0.5, cube.position.y, cube.position.z - 0.5, 'y', Math.PI/2, step12_RollBack);
}
function step12_RollBack() {
    createFootprint(0.5, -2.5, -1.5, 'west');
    manualRoll(cube.position.x - 0.5, cube.position.y, cube.position.z - 0.5, 'y', Math.PI/2, step13_RollUp);
}
function step13_RollUp() {
    createFootprint(0.5, -2.5, -2.5, 'west');
    manualRoll(cube.position.x - 0.5, cube.position.y + 0.5, cube.position.z, 'z', Math.PI/2, step14_RollUp);
}
function step14_RollUp() {
    createFootprint(0.5, -1.5, -2.5, 'west');
    manualRoll(cube.position.x - 0.5, cube.position.y + 0.5, cube.position.z, 'z', Math.PI/2, step15_RollForward);
}
function step15_RollForward() {
    createFootprint(0.5, -0.5, -2.5, 'west');
    manualRoll(cube.position.x - 0.5, cube.position.y, cube.position.z + 0.5, 'y', -Math.PI/2, step16_RollForward);
}
function step16_RollForward() {
    createFootprint(0.5, -0.5, -1.5, 'west');
    manualRoll(cube.position.x - 0.5, cube.position.y, cube.position.z + 0.5, 'y', -Math.PI/2, finishAnimation);
}

// Jump & Roll
function finishAnimation() {
    const jumpDuration = 400;
    const topHeight = 4;
    const targetScale = 1.5;
    const spins = 20;

    new TWEEN.Tween(cube.position)
        .to({ x: 0, y: topHeight, z: 0 }, jumpDuration)
        .easing(TWEEN.Easing.Cubic.Out) 
        .start();

    new TWEEN.Tween(cube.scale)
        .to({ x: targetScale, y: targetScale, z: targetScale }, jumpDuration)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    new TWEEN.Tween(cube.rotation)
        .to({ 
            z: cube.rotation.z + (-Math.PI * 2 * spins) 
        }, jumpDuration)
        .easing(TWEEN.Easing.Cubic.Out)
        .onComplete(() => {
            setTimeout(() => {
                dropToFloor();
            }, 300); 
        })
        .start();
}

// Final drop
function dropToFloor() {
    setTimeout(triggerSecondImpact, 100);

    new TWEEN.Tween(cube.position)
        .to({ x: -0.745, y: -0.75, z: -0.745 }, 250)
        .easing(TWEEN.Easing.Elastic.Out)
        .onComplete(() => {
            isAnimating = false;
            transformToSilver();
        })
        .start();
}

function transformToSilver() {
    silverMaterial.opacity = 0;
    silverMaterial.transparent = true;

    const createExpandedGeo = (mesh) => {
        mesh.geometry.computeBoundingBox();
        const size = new THREE.Vector3();
        mesh.geometry.boundingBox.getSize(size);
        
        const newW = size.x > 0.5 ? 1 : size.x;
        const newH = size.y > 0.5 ? 1 : size.y;
        const newD = size.z > 0.5 ? 1 : size.z;
        
        return new THREE.BoxGeometry(newW, newH, newD);
    };
    
    // Join everything together
    const addSilverMesh = (originalMesh) => {
        const geo = createExpandedGeo(originalMesh);
        const silver = new THREE.Mesh(geo, silverMaterial);
        const fillGeo = new THREE.BoxGeometry(0.5, 0.01, 1);
        const filler = new THREE.Mesh(fillGeo, silverMaterial);

        silver.position.copy(originalMesh.position);
        silver.quaternion.copy(originalMesh.quaternion);
        silver.scale.copy(originalMesh.scale);
        silver.castShadow = true;
        silver.receiveShadow = true;

        filler.position.set(-0.75, 0, -2.5);
        filler.receiveShadow = true;

        silverGroup.add(silver);
        silverGroup.add(filler);
        silverGroup.scale.set(1.01, 1.01, 1.01);
    };

    footprintsGroup.children.forEach(fp => {
        addSilverMesh(fp);
    });

    addSilverMesh(cube);

    const transitionDuration = 450;

    new TWEEN.Tween(material)
        .to({ opacity: 0 }, transitionDuration)
        .start();

    new TWEEN.Tween(fpMat)
        .to({ opacity: 0 }, transitionDuration)
        .start();

    new TWEEN.Tween(silverMaterial)
        .to({ opacity: 1 }, transitionDuration)
        .onComplete(() => {
            silverMaterial.transparent = false;
        })
        .start();
}

let isAnimating = false;

window.addEventListener('click', () => {
    if (isAnimating) return;
    
    isAnimating = true;

    if (listener.context.state === 'suspended') {
        listener.context.resume();
    }

    if (audioLoaded) {
        if (sound.isPlaying) sound.stop();
        sound.play();
    }

    silverGroup.clear();
    
    material.opacity = 1;
    material.transparent = true;
    fpMat.opacity = 1;
    fpMat.transparent = true;
    silverMaterial.opacity = 0;

    footprintsGroup.clear(); 
    
    scene.attach(cube); 
    cube.position.set(-0.5, 9, -2.5);
    cube.rotation.set(0, 0, 0);
    cube.scale.set(1, 1, 1);
    
    startIntro();
});

window.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    gridHelper.visible = !gridHelper.visible;
});

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = -frustumSize / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate(time) {
    requestAnimationFrame(animate);
    TWEEN.update(time);
    controls.update();
    renderer.render(scene, camera);
}
animate();