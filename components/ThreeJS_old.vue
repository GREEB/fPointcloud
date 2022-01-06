<template>
  <div>
    <div class="GUI" />
    <div class="STATS" />
    <div class="THREE" />

    <script id="vertexshader" type="x-shader/x-vertex">
      attribute float size;
      varying vec3 vColor;
      varying vec3 vPos;

      void main() {
      vColor = color;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      vPos = position;

      gl_PointSize = color.r * 5.0;

      }
    </script>

    <script id="fragmentshader" type="x-shader/x-fragment">
      varying vec3 vColor;
      varying vec3 vPos;
      void main() {
      gl_FragColor = vec4((vPos.z / 50.0) * 3.0,0.51,0.51, 1.0);
      //gl_FragColor = vec4((vPos.z / 255.0) * 3.0 ,(vPos.x / 255.0) * 6.0),(vPos.y / 255.0) * 6.0 ), 1.0);
      }
    </script>
  </div>
</template>

<script>
import {
  AxesHelper,
  BoxGeometry,
  BufferGeometry,
  // PointLight,
  BoxHelper,
  Color,
  Clock,
  Float32BufferAttribute,
  MeshBasicMaterial,
  Mesh,
  Vector2,
  Object3D,
  ShaderMaterial,
  PointLight,
  PerspectiveCamera,
  Points,
  Raycaster,
  Scene,
  Vector3,
  WebGLRenderer,
  Quaternion
} from 'three/build/three.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import TWEEN from '@tweenjs/tween.js'
// import { io } from 'socket.io-client'
export default {
  data () {
    return {
      points: null,
      controls: null,
      material: null,
      geometry: null,
      box: null,
      renderer: null,
      scene: null,
      camera: null,
      stats: null,
      raycaster: new Raycaster(),
      mouse: new Vector2(),
      pointsCount: null,
      lastBgColor: [50, 50, 50],

      guiLet: {},
      colors: {},
      // Pointer Vars
      intersection: null,
      spheresIndex: 0,
      clock: null,
      toggle: 0,
      spheres: [],
      cube: null,
      car: null,
      //
      keepingTrackOfTweens: [],
      firstChord: true,
      gui: null,
      goalCamera: new Object3D(),
      aCamera: new Vector3(),
      bCamera: new Vector3(),
      directionCamera: new Vector3(),
      tempCamera: new Vector3()
    }
  },
  computed: {
    chords () {
      return this.$store.state.chord
    },
    chordPack () {
      return this.$store.state.chordPack
    }
  },
  watch: {
    chords (val) {
      // if first chord add "car" pos

      this.parsePoint(val)
      // this.tweenToWhite({ index: (this.pointsCount / 3) - 1 }, 5000)

      const fromRotation = new Quaternion()
      const toRotation = new Quaternion()

      fromRotation.copy(this.car.quaternion)
      // // quaternion.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)
      toRotation.setFromAxisAngle(new Vector3(0, 0, 1), val.yaw - (val.yaw * 2))

      // // this.cube.quaternion.slerpQuaternions(fromRotation, toRotation, 1)
      const fromPostion = this.car.position
      const toPosition = new Vector3(parseFloat(val.x) / 20, parseFloat(val.z) / 20, parseFloat(val.y) / 20)

      // // this.car.children[0].children here are the wheels we could turn front wheels?
      this.car.position.lerpVectors(fromPostion, toPosition, 0.5)

      this.car.quaternion.slerpQuaternions(fromRotation, toRotation, 0.5)
      this.controls.target.copy(this.car.position)

      // this.camera.lookAt(this.car)
      // this.camera.rotation.z = Math.PI / 2
      // this.camera.position.x = this.car.position.x
      // this.camera.position.y = this.car.position.y
      this.camera.position.z = 2.5 // this.car.position.lerp(new Vector3(parseFloat(val.x) / 20, parseFloat(val.z) / 20, parseFloat(val.y) / 20), 0.5)

      this.aCamera.lerp(this.car.position, 0.4)
      this.bCamera.copy(this.goalCamera.position)

      this.directionCamera.copy(this.aCamera).sub(this.bCamera).normalize()
      const dis = this.aCamera.distanceTo(this.bCamera) - 5
      this.goalCamera.position.addScaledVector(this.directionCamera, dis)
      // this.goalCamera.position.lerp(this.tempCamera, 0.02)

      // this.tempCamera.setFromMatrixPosition(this.goalCamera.matrixWorld)

      // this.camera.position.lerp(this.tempCamera, 0.2)
      this.camera.lookAt(this.car.position)

      // this.cube.quaternion.slerp(new Vector3(0, 1, 0), Math.PI / 2)
      // this.cube.rotation.lerp(new Vector3(val.roll - (val.roll * 2), val.pitch - (val.pitch * 2), val.yaw - (val.yaw * 2), 0.1))
      // console.loswg(this.cube.rotation)
      // console.log(val.roll, val.pitch, val.yaw)
      // this.cube.position.lerp(new Vector3(parseFloat(val.x) / 20, parseFloat(val.z) / 20, parseFloat(val.y) / 20), 1)
      // this.cube.position
      // this.cube.needsUpdate = true
      this.car.needsUpdate = true
      this.camera.needsUpdate = true
    },
    chordPack (val) {
      const now = new Date()
      for (let i = 0; i < val.alluserPos.length; i++) {
        this.parsePoint(val.alluserPos[i], 'pack')

        if ((val.alluserPos.length - 1) === i) {
          this.geometry.computeBoundingSphere()
          this.geometry.computeBoundingBox()
          this.$toast.info(`${val.alluserPos.length} points drawn in ${(new Date() - now)} ms`)
        }
      }
    }
  },
  mounted () {
    Object3D.DefaultUp = new Vector3(0, 0, 1)

    this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)
    this.goalCamera.add(this.camera)
    this.scene = new Scene()
    this.clock = new Clock()

    // this.scene.fog = new Fog(0x050505, 1, 15000)
    const particles = 500000
    this.geometry = new BufferGeometry()
    const positions = new Float32Array(particles * 3)
    this.colors.default = new Float32Array(particles * 3)
    this.colors.height = new Float32Array(particles * 3)
    this.colors.terrain = new Float32Array(particles * 3)
    this.geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
    this.geometry.setAttribute('color', new Float32BufferAttribute(this.colors.default, 3))

    // TODO: Change shape can be done with a texture but not cool maybe shader? not sure what any paras do
    // category=Three
    this.material = new ShaderMaterial({
      vertexShader: document.getElementById('vertexshader').textContent,
      fragmentShader: document.getElementById('fragmentshader').textContent,
      // blending: AdditiveBlending,
      // transparent: true,
      // sizeAttenuation: true,
      // opacity: 0.4
      vertexColors: true,
      depthWrite: false
      // blending: AdditiveBlending,
      // depthTest: false,
      // transparent: true
    })

    // this.material.blending = CustomBlending
    // this.material.blendSrc = OneFactor
    // this.material.blendDst = OneMinusSrcAlphaFactor
    this.points = new Points(this.geometry, this.material)
    this.scene.add(this.points)

    // FIXME: Fix BoxHelper updates fine but wrong position
    // category=Three
    this.box = new BoxHelper(this.points, 0xFFFFFF)
    this.box.visible = true
    // this.scene.add(this.box)
    this.geometry.setDrawRange(0, 0)

    this.renderer = new WebGLRenderer({
      preserveDrawingBuffer: false,
      antialias: true
    })

    this.renderer.setClearColor(new Color(0x0D0D0D))

    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    document.getElementsByClassName('THREE')[0].appendChild(this.renderer.domElement)
    this.stats = new Stats()
    document.getElementsByClassName('STATS')[0].appendChild(this.stats.dom)
    window.addEventListener('resize', this.onWindowResize)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    // this.controls.screenSpacePanning = true

    this.geometry.computeBoundingBox()
    this.camera.position.z = 500
    const bBox = this.geometry.boundingBox
    const center = new Vector3()
    bBox.getCenter(center)
    this.controls.target.copy(center)

    const axes2 = new AxesHelper(100)
    axes2.position.x = -520
    axes2.position.y = -300
    this.scene.add(axes2)

    // scene.rotation.z = Math.PI / 2
    // MISC function
    // const setBackgroundColor = (arrayRGB) => {
    //   this.lastBgColor = arrayRGB
    //   console.log(arrayRGB)
    //   this.renderer.setClearColor(new Color().setRGB(arrayRGB[0], arrayRGB[1], arrayRGB[2]))
    //   // this.renderer.clear(true, true, true)
    // }
    // const pointLight = new PointLight(0xFFFFFF, 1, 1000)
    // pointLight.position.set(50, 50, 50)
    // this.scene.add(pointLight)
    const light = new PointLight(0xFFFFFF, 1)
    light.position.set(0, 0, 500)
    this.scene.add(light)

    const loader = new GLTFLoader()
    const self = this
    loader.load(
      // resource URL
      'models/race.glb',
      // called when the resource is loaded
      function (gltf) {
        gltf.scene.children[0].rotation.x = Math.PI / 2
        self.car = gltf.scene
        self.car.scale = new Vector3(0.25, 0.25, 0.25)
        // const quaternion = new Quaternion()
        // quaternion.setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2)
        // self.car.applyQuaternion(quaternion)
        self.scene.add(gltf.scene)
      },
      // called while loading is progressing
      function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded')
      },
      // called when loading has errors
      function (error) {
        console.log('An error happened', error)
      }
    )
    // window.addEventListener('mousemove', this.onMouseMove, false)
    // window.addEventListener('mousedown', this.onMouseDown, true)
    this.initGui()
    this.animate()
  },
  methods: {
    initGui () {
      const self = this
      this.guiLet = {
        boxVisible: false,
        colorSchema: 'Height',
        backgroundColor: this.lastBgColor,
        pointsCount: 0
      }
      this.gui = new GUI({ autoPlace: false })
      const optionFolder = this.gui.addFolder('Options')
      optionFolder.add(this.guiLet, 'pointsCount').listen()
      optionFolder.add({ add () { } }, 'add')
      optionFolder.add(this.guiLet, 'colorSchema', ['Height', 'Terrain']).onChange(function (v) { self.changeColor(v) })
      optionFolder.add(this.material, 'opacity', 0, 1).listen()
      // optionFolder.add(this.material, 'size', 0.1, 10).listen()
      optionFolder.addColor(this.guiLet, 'backgroundColor').name('Background').onChange(function (value) { self.setBackgroundColor(value) })
      optionFolder.add(this.guiLet, 'boxVisible').name('Bounding box').onChange(function (value) { this.box.visible = value })
      const cameraFolder = this.gui.addFolder('Camera')
      cameraFolder.add(this.camera.position, 'z', 0, 100).listen()
      cameraFolder.add(this.camera.position, 'x', 0, 100).listen()
      cameraFolder.add(this.camera.position, 'y', 0, 100).listen()
      this.gui.close()
      document.body.appendChild(this.gui.domElement)
    },
    initQuadGui () {
      const cubeFolder = this.gui.addFolder('Scene')
      cubeFolder.add(this.cube.quaternion, 'x', 0, Math.PI).listen()
      cubeFolder.add(this.cube.quaternion, 'y', 0, Math.PI).listen()
      cubeFolder.add(this.cube.quaternion, 'z', 0, Math.PI).listen()
      const cameraFolder = this.gui.addFolder('Camera')
      cameraFolder.add(this.cube.position, 'z', 0, 1000).listen()
      cameraFolder.add(this.cube.position, 'x', 0, 1000).listen()
      cameraFolder.add(this.cube.position, 'y', 0, 1000).listen()
    },
    createCar () {
      const bg = new BoxGeometry(1, 1, 1)
      const bm = new MeshBasicMaterial({ color: 0xFF0000 })
      this.cube = new Mesh(bg, bm)
      this.scene.add(this.cube)

      const quaternion = new Quaternion()
      quaternion.setFromAxisAngle(new Vector3(0, 0, 1), 0)
      this.cube.applyQuaternion(quaternion)
      this.initQuadGui()
      // this.$store.commit('points/increment')
    },
    addPoint (xyz, heightRGB, terrainRGB) {
      const positions = this.points.geometry.attributes.position.array
      const defaultColor = this.points.geometry.attributes.color.array

      /**
     * Scaling down chords helps threejs with camera not tested best way
     */
      positions[this.pointsCount] = xyz[0]
      positions[this.pointsCount + 1] = xyz[1]
      positions[this.pointsCount + 2] = xyz[2]

      defaultColor[this.pointsCount] = heightRGB[0]
      defaultColor[this.pointsCount + 1] = heightRGB[1]
      defaultColor[this.pointsCount + 2] = heightRGB[2]

      this.colors.default[this.pointsCount] = 255
      this.colors.default[this.pointsCount + 1] = 255
      this.colors.default[this.pointsCount + 2] = 255

      this.colors.height[this.pointsCount] = heightRGB[0]
      this.colors.height[this.pointsCount + 1] = heightRGB[1]
      this.colors.height[this.pointsCount + 2] = heightRGB[2]

      this.colors.terrain[this.pointsCount] = terrainRGB[0]
      this.colors.terrain[this.pointsCount + 1] = terrainRGB[1]
      this.colors.terrain[this.pointsCount + 2] = terrainRGB[2]

      this.points.geometry.attributes.position.needsUpdate = true // required after the first render
      this.points.geometry.attributes.color.needsUpdate = true
      // this.geometry.computeBoundingBox()
      // this.geometry.computeBoundingSphere()
      // this.geometry.computeVertexNormals()
      this.geometry.setDrawRange(0, this.pointsCount / 3)
      this.pointsCount += 3
      this.guiLet.pointsCount = this.pointsCount
      // this.addPoint2Store()
      // const bBox = this.geometry.boundingBox
      // const center = new Vector3()
      // bBox.getCenter(center)
      // this.controls.target.copy(center)

      // const centroid = this.geometry.boundingBox.getCenter()
      // centroid.applyMatrix4(this.box.matrixWorld)
      // this.box.update()
    // camera.position.z = xyz[0];
    // camera.position.x = xyz[1];
    // camera.position.y = xyz[2];
    },
    parsePoint (posData) {
      if (!this.points) { return }
      // each point must be 3D
      const heightRGB = [100 / 255, 100 / 255, posData.y / 510]
      let terrainRGB
      if (posData.s === 1) {
        terrainRGB = [136 / 255, 119 / 255, 89 / 255]
      } else if (posData.s === 2) {
        terrainRGB = [30 / 255, 62 / 255, 73 / 255]
      } else {
        terrainRGB = [205 / 255, 205 / 255, 205 / 255]
      }
      /**
       * TODO: We flip cordinate system here to line up with our three scene there probably is a better way
       * Could also be we fuck up when saving this data earlier idk
       **/
      const xyz = [
        parseFloat(posData.x / 20),
        parseFloat(posData.z / 20),
        parseFloat(posData.y / 20)
      ]

      this.addPoint(xyz, heightRGB, terrainRGB)
    },
    setBackgroundColor (arrayRGB) {
      this.lastBgColor = arrayRGB
      this.renderer.setClearColor(new Color().setRGB(arrayRGB[0], arrayRGB[1], arrayRGB[2]))
      // this.renderer.clear(true, true, true)
    },
    changeColor (color) {
      const sel = color.toLowerCase()
      this.points.geometry.attributes.color.array = this.colors[sel]
      this.points.geometry.attributes.color.needsUpdate = true
    },
    onWindowResize () {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    animate () {
      requestAnimationFrame(this.animate)

      this.controls.update()
      // TWEEN.update()
      this.render()
      this.stats.update()
    },
    render () {
      // this.raycaster.setFromCamera(this.mouse, this.camera)
      // const intersects = this.raycaster.intersectObject(this.points)
      // this.intersection = (intersects.length) > 0 ? intersects[0] : null

      // for (let i = 0; i < intersects.length; i++) {
      //   this.tweenToWhite(intersects[i], 500)
      //   // intersects[i].object.material.color.set(0xFF0000)
      // }

      // console.log(this.intersection)
      // if (this.toggle > 0.02 && this.intersection !== null) {
      //   this.spheres[this.spheresIndex].position.copy(this.intersection.point)
      //   this.spheres[this.spheresIndex].scale.set(1, 1, 1)
      //   this.spheresIndex = (this.spheresIndex + 1) % this.spheres.length

      //   this.toggle = 0
      // }

      // for (let i = 0; i < this.spheres.length; i++) {
      //   const sphere = this.spheres[i]
      //   sphere.scale.multiplyScalar(0.98)
      //   sphere.scale.clampScalar(0.01, 1)
      // }

      // this.toggle += this.clock.getDelta()
      this.renderer.render(this.scene, this.camera)
    },
    onMouseMove (event) {
      const canvas = this.renderer.domElement

      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      this.mouse.x = (x / canvas.clientWidth) * 2 - 1
      this.mouse.y = (y / canvas.clientHeight) * -2 + 1
    },
    onMouseDown (event) {

      // if (intersects.length) {
      //   this.controls.target.copy(intersects[0].point.clone())
      // }
    },
    tweenToWhite (el, duration) {
      if (this.keepingTrackOfTweens.includes(el.index)) {
        return
      }
      this.keepingTrackOfTweens.push(el.index)
      // this.points.geometry.attributes.color.array[el.index * 3] = Color.lerpHSL(0, 1)
      // this.points.geometry.attributes.color.array[el.index * 3 + 1] = Color.lerpHSL(0, 1)
      // this.points.geometry.attributes.color.array[el.index * 3 + 2] = Color.lerpHSL(0, 1)
      // this.points.geometry.attributes.color.needsUpdate = true

      const target = {
        r: this.points.geometry.attributes.color.array[el.index * 3],
        g: this.points.geometry.attributes.color.array[el.index * 3 + 1],
        b: this.points.geometry.attributes.color.array[el.index * 3 + 2]
      }
      const original = {
        r: this.points.geometry.attributes.color.array[el.index * 3],
        g: this.points.geometry.attributes.color.array[el.index * 3 + 1],
        b: this.points.geometry.attributes.color.array[el.index * 3 + 2]
      }
      const that = this
      const tweenTo = new TWEEN.Tween(target)
        .to({ r: 1, g: 1, b: 1 }, duration / 10)
        .onUpdate(function () {
          that.updatePointColor(target, el)
        })
        .start()

      const tweenBacl = new TWEEN.Tween(target)
        .to(original, duration)
        .onUpdate(function () {
          that.updatePointColor(target, el)
        })
        .onComplete(function () {
          that.keepingTrackOfTweens = that.keepingTrackOfTweens.filter(item => item !== el.index)
        })
      tweenTo.chain(tweenBacl)
    },
    updatePointColor (color, el) {
      this.points.geometry.attributes.color.array[el.index * 3] = color.r
      this.points.geometry.attributes.color.array[el.index * 3 + 1] = color.g
      this.points.geometry.attributes.color.array[el.index * 3 + 2] = color.b
      this.points.geometry.attributes.color.needsUpdate = true
    }
  }

}
</script>
