import './style.css'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
import { setKeyDown, setKeyUp } from './functions.js'
// import * as ENABLE3D from '/scripts/enable3d.ammoPhysics.0.23.0.min.js'

const gui = new dat.GUI()
gui.close()

const canvas = document.querySelector('canvas.webgl')
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const debugObject = {
    color: 0x999999,
    anim: false,
}

let keys = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
    shift: false
}

let count = 0

const scene = new THREE.Scene()

const testCube = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1), new THREE.MeshBasicMaterial( {color: 0x00ff00} ))
testCube.visible = false
gui.add(testCube, 'visible').name('cameraCube visible')
// const cubeTextureLoader = new THREE.CubeTextureLoader()
const geometry = new THREE.PlaneBufferGeometry( 500, 500 )
const material = new THREE.MeshPhongMaterial({ color: debugObject.color, depthWrite: false })
const mesh = new THREE.Mesh(geometry, material)
mesh.rotation.x = -Math.PI / 2
mesh.receiveShadow = true
gui.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('elevation')
gui.add(mesh, 'visible')
gui.addColor(debugObject, 'color').onChange(() => mesh.material.color.set(debugObject.color))
scene.add(mesh)

scene.background = new THREE.Color( 0xa0a0a0 );
scene.fog = new THREE.Fog( 0xa0a0a0, 50, 200 );
// scene.background = cubeTextureLoader.load([
//     '/Standard-Cube-Map/px.png',
//     '/Standard-Cube-Map/nx.png',
//     '/Standard-Cube-Map/py.png',
//     '/Standard-Cube-Map/py.png',
//     '/Standard-Cube-Map/pz.png',
//     '/Standard-Cube-Map/pz.png'
// ])

const gridHelper = new THREE.GridHelper( 100, 40 );
scene.add( gridHelper );

let model
let mixer
let actions = {}
const loader = new FBXLoader()
loader.load( '/fbx/ybot.fbx', function ( object ) {
    model = object
    object.scale.setScalar(0.1)
    mixer = new THREE.AnimationMixer( object )

    const action = mixer.clipAction( object.animations[0] )
    actions['idle'] = action
    action.play()

    object.traverse( function ( child ) {
        if ( child.isMesh ) {
        child.castShadow = true
        child.receiveShadow = true
        }
        if (child.material) {
            child.material = new THREE.MeshNormalMaterial()
        }
    })
    gui.add(model.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.01).name('rotate')
    object.add(testCube)
    scene.add( object )
    loader.load('/fbx/Running.fbx', function ( object ) {
        //const mixer = new THREE.AnimationMixer( object )
    
        const action = mixer.clipAction( object.animations[0] )
        scene.add(object)
        actions['run'] = action
        loader.load('/fbx/Run.fbx', function ( object ) {
            //const mixer = new THREE.AnimationMixer( object )
        
            const action = mixer.clipAction( object.animations[0] )
            scene.add(object)
            actions['ninja'] = action
        })
        loader.load('/fbx/Running Backward.fbx', function ( object ) {
            //const mixer = new THREE.AnimationMixer( object )
        
            const action = mixer.clipAction( object.animations[0] )
            scene.add(object)
            actions['back'] = action
        })
        loader.load('/fbx/Jumping.fbx', function ( object ) {
            //const mixer = new THREE.AnimationMixer( object )
        
            const action = mixer.clipAction( object.animations[0] )
            action.setLoop( THREE.LoopOnce )
            scene.add(object)
            actions['jump'] = action
        })
    })
} )

console.log(actions);
gui.add(debugObject, 'anim').onChange(() => actions['run'].play)
testCube.position.set(0, 200, -400)

let light = new THREE.HemisphereLight( 0xffffff, 0x444444 );
light.position.set( 0, 200, 0 );
scene.add( light );

const shadowSize = 200;
light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 0, 200, 100 );
light.castShadow = true;
light.shadow.camera.top = shadowSize;
light.shadow.camera.bottom = -shadowSize;
light.shadow.camera.left = -shadowSize;
light.shadow.camera.right = shadowSize;
scene.add( light );


const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 2000)
camera.position.set( 0, 20, 40 );
camera.lookAt(scene.position)
//scene.add(camera)

const controls = new PointerLockControls(camera, canvas)
// controls.target.set( 0, 10, 0 );
//controls.enableDamping = true
canvas.addEventListener('click', () => {
    controls.lock()
})

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const listener = new THREE.AudioListener();
camera.add( listener );
const sound = new THREE.Audio( listener );
const soundJump = new THREE.Audio( listener );
const soundWin = new THREE.Audio( listener );
const soundCling = new THREE.Audio( listener );
const audioLoader = new THREE.AudioLoader();
audioLoader.load( '/sounds/calm1.ogg', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
});
audioLoader.load( '/sounds/cloth1.ogg', function( buffer ) {
	soundJump.setBuffer( buffer );
    soundJump.setVolume( 0.1 );
});
audioLoader.load( '/sounds/harp.ogg', function( buffer ) {
	soundCling.setBuffer( buffer );
    soundCling.setVolume( 0.5 );
});
audioLoader.load( '/sounds/cat.ogg', function( buffer ) {
	soundWin.setBuffer( buffer );
    soundWin.setVolume( 0.7 );
});

gui.add(sound, 'pause')
gui.add(sound, 'play')

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

document.addEventListener('keydown', (event) => setKeyDown(keys, event))
document.addEventListener('keyup', (event) => setKeyUp(keys, event))


gui.add(testCube.position, 'x').min(-800).max(800).step(0.01).name('cube x')
gui.add(testCube.position, 'y').min(0).max(800).step(0.01).name('cube y')
gui.add(testCube.position, 'z').min(-800).max(800).step(0.01).name('cube z')

// function collision() {
//     var originPoint = model.position.clone();
//     for (var vertexIndex = 0; vertexIndex < model.geometry.vertices.length; vertexIndex++) {   
//         var ray = new THREE.Raycaster( model.position, model.geometry.vertices[vertexIndex] );
//         var collisionResults = ray.intersectObjects( '' );
//         if ( collisionResults.length > 0)  {
//            hit = true;
//         }
//     } 
// }   

let temp = new THREE.Vector3
let speed = 10
let action = actions['idle']
const update = (delta) => {
    if (model) {
        // collision()
        // controls.target.set(model.position.x +10 , model.position.y, model.position.z + 10)
        //camera.lookAt(model.position)
        // model.position.z += 100 * delta
        let forward = new THREE.Vector3()
        camera.getWorldDirection(forward)
        let right = new THREE.Vector3().crossVectors(camera.up, forward)
        forward.normalize()
        right.normalize()
        if (keys.shift) speed = 80
            else speed = 40
        if (keys.forward) {
            if (!keys.shift && action !== actions['run'] && action !== actions['jump']) {
                action = actions['run']
                mixer.stopAllAction()
                action.play()
            } else if (keys.shift && action !== actions['ninja']) {
                    action = actions['ninja']
                    mixer.stopAllAction()
                    action.play()
            }
            model.position.addScaledVector(forward, speed * delta);
        }
        if (keys.backward) {
            if (action !== actions['back'] && action !== actions['jump'] && action !== actions['jump']) {
                action = actions['back']
                mixer.stopAllAction()
                action.play()
            }
            model.position.addScaledVector(forward, -speed * delta);
        }
        if (keys.left) {
            //model.position.addScaledVector(right, speed * delta);
            model.rotation.y += 3 * delta
        }
        if (keys.right) {
            //model.position.addScaledVector(right, -speed * delta);
            model.rotation.y -= 3 * delta
        }
        if (keys.space || action === actions['jump']) {
            if (action !== undefined && action === actions['jump'] && !action.isRunning()) {
            action = actions['idle']
            count++
            if (count < 10)
                document.getElementById('jumps').textContent = count
            mixer.stopAllAction()
            action.play()
            soundCling.play()
                if (count === 10) {
                document.getElementById('score').innerHTML = "You WIN !!!!!!!!!!"
                sound.stop()
                soundWin.play()
                }
            }
            else if (keys.space && action !== actions['jump']) {
                action = actions['jump']
                mixer.stopAllAction()
                action.play()
                soundJump.play()
            }
        }
        if (!keys.forward && !keys.backward && action !== actions['idle'] && action !== undefined && action !== actions['jump']) {
            action = actions['idle']
            mixer.stopAllAction()
            action.play()
        }
        model.position.y = 0
        temp.setFromMatrixPosition(testCube.matrixWorld)
        camera.position.lerp(temp, 0.2)
        camera.lookAt( model.position.x, model.position.y + 12, model.position.z)
    }
    if ( mixer ) mixer.update( delta )
}

const clock = new THREE.Clock()
const tick = () =>
{
    // const elapsedTime = clock.getElapsedTime()
    const delta = clock.getDelta()
    update(delta)
    //controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()