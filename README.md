# Cube Animation 
Cube animation made with Three.js and Tween.js.


https://github.com/user-attachments/assets/8d4dd5fd-1136-4dd6-b161-c5031cd5b4f4


## Description
This project is an interactive 3D web animation built using Three.js and Tween.js, inspired by the legendary GameCube intro. Made solely for educational purposes. Code itself is far from perfect, I designed it so that each animation step had to be implemented manually for full control over the process.

## Code Structure and Functionality

### Scene Configuration:

- Camera: Uses an OrthographicCamera to achieve an isometric perspective where parallel lines do not converge.

- Lighting: A combination of AmbientLight for base visibility and two DirectionalLight sources to create depth and cast soft shadows (PCFSoftShadowMap).

- Renderer: Configured with antialiasing and alpha transparency to blend with the web page.

### Core Mechanics:

- manualRoll(): This is the physics simulation engine. Instead of using a physics library, it uses a geometric approach. It attaches the cube to a temporary pivotHelper located at the bottom edge of the cube. The pivot rotates 90 degrees, carrying the cube with it to simulate a realistic "flop," and then reattaches the cube to the scene at its new coordinates.

- createFootprint(): Generates flattened RoundedBoxGeometry meshes at the cube's previous position. It dynamically calculates dimensions based on the direction of travel (North, South, East, West, Up, Down) to ensure corners connect cleanly.

### Animation Sequence:

- Choreography (step1 to step16): A recursive chain of callback functions. Each step triggers a roll in a specific direction and spawns a footprint, creating the final shape.

- triggerFirstImpact / triggerSecondImpact: Uses Tweening on the scene's rotation and position to simulate "camera shake" when the heavy cube hits the floor.

- transformToSilver: A visual transition that creates a new group of geometries matching the footprints, fades out the purple materials, and fades in a reflective silver material.

### User Interaction:

- Left Click: Initializes the audio context and triggers the animation sequence (startIntro).

- Right Click: Toggles the visibility of the floor grid (gridHelper).

- Resize: Automatically adjusts the camera frustum and renderer size to maintain the aspect ratio.

## Sources
- [Three.js Documentation](https://threejs.org/docs/)
- [Tween.js](https://github.com/tweenjs/tween.js/)
- [Class Notes](https://github.com/otsedom/otsedom.github.io/blob/main/IG/S11/README.md)
