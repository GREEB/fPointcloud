<template>
  <div>
    <v-snackbar
      v-model="io.show"
      left
      bottom
      flat
      dense
      :color="io.connected ? 'success' : 'warning'"
      outlined
      timeout="1500"
    >
      {{ io.text }}
    </v-snackbar>
    <div class="GUI" />
    <div class="STATS" />
    <div class="THREE" />
  </div>
</template>

<script>
import { WebGLRenderer, PointsMaterial, Object3D, Vector3, PerspectiveCamera, Scene, Color, BufferGeometry, Float32BufferAttribute, Points, BoxHelper } from 'three/build/three.module.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import Stats from 'three/examples/jsm/libs/stats.module.js'
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js'
// import { io } from 'socket.io-client'

export default {
  data () {
    return {
      io: {
        show: false,
        connected: false,
        text: 'Hello, I\'m a snackbar'
      },
      points: null,
      controls: null,
      material: null,
      geometry: null,
      box: null,
      renderer: null,
      scene: null,
      camera: null,
      stats: null,

      pointsCount: null,
      lastBgColor: [50, 50, 50],

      guiLet: {},
      colors: {}
    }
  },
  mounted () {
    // TODO: Move Socket logic and handle reconnection if unsuccessfully connection
    // category=Three
    // FIXME: Dont read auth from here read from callback
    // const socket = io.connect('http://localhost:9000');
    // socket.on('connect', () => {
    //   socket
    //     .emit('authenticate', { token: jwt }) //send the jwt
    //     .on('authenticated', () => {
    //       //do other things
    //     })
    //     .on('unauthorized', (msg) => {
    //       console.log(`unauthorized: ${JSON.stringify(msg.data)}`);
    //       throw new Error(msg.data.type);
    //     })
    // });
    //     const cookie = JSON.stringify({loggedIn: fasle})

    // if (this.$auth.loggedIn) {
    //       const cookie = JSON.stringify({ ...this.$auth.$storage.getCookies(), ...this.$auth.user })

    //   console.log({ ...this.$auth.$storage.getCookies(), ...this.$auth.user })
    // }
    // let cookie = { auth: false }
    // if (this.$auth.loggedIn) {
    //   cookie = { ...this.$auth.$storage.getCookies(), ...this.$auth.user }
    // }
    // const socket = io(this.$config.url + ':' + this.$config.socketPort, { auth: { cookie } })

    // socket.on('connect', () => {
    //   this.io.text = 'Sockets Connected: ' + socket.id
    //   this.io.show = true
    //   this.io.connected = true
    // })
    // socket.on('disconnect', () => {
    //   this.io.text = 'look he disconnected: ' + socket.id
    //   this.io.connected = false
    //   this.io.show = true
    // })
    // socket
    //   .on('chord', (msg, cb) => {
    //     this.parsePoint(msg)
    //   })
    // socket
    //   .on('chordPack', (msg, cb) => {
    //     for (let index = 0; index < msg.length; index++) {
    //       const element = msg[index]
    //       this.parsePoint(element)
    //     }
    //   })

    Object3D.DefaultUp = new Vector3(0, 0, 1)

    this.camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 13000)
    this.scene = new Scene()
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
    this.material = new PointsMaterial({
      size: 20,
      vertexColors: true
      // blending: AdditiveBlending,
      // transparent: true,
      // sizeAttenuation: true,
      // opacity: 0.4
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
    // document.getElementsByClassName('STATS')[0].appendChild(this.stats.dom)
    window.addEventListener('resize', this.onWindowResize)
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    this.controls.screenSpacePanning = true

    this.geometry.computeBoundingBox()
    this.camera.position.z = 4522
    this.camera.position.x = 5905
    this.camera.position.y = -2704
    const bBox = this.geometry.boundingBox
    const center = new Vector3()
    bBox.getCenter(center)
    this.controls.target.copy(center)

    const self = this
    this.guiLet = {
      boxVisible: false,
      colorSchema: 'Height',
      backgroundColor: this.lastBgColor,
      pointsCount: 0
    }
    const gui = new GUI({ autoPlace: false })
    const optionFolder = gui.addFolder('Options')
    optionFolder.add(this.guiLet, 'pointsCount').listen()
    optionFolder.add({ add () { } }, 'add')
    optionFolder.add(this.guiLet, 'colorSchema', ['Height', 'Terrain']).onChange(function (v) { self.changeColor(v) })
    optionFolder.add(this.material, 'opacity', 0, 1).listen()
    optionFolder.add(this.material, 'size', 0.1, 10).listen()
    optionFolder.addColor(this.guiLet, 'backgroundColor').name('Background').onChange(function (value) { self.setBackgroundColor(value) })
    optionFolder.add(this.guiLet, 'boxVisible').name('Bounding box').onChange(function (value) { this.box.visible = value })

    const cubeFolder = gui.addFolder('Scene')
    cubeFolder.add(this.scene.rotation, 'x', 0, Math.PI * 2).listen()
    cubeFolder.add(this.scene.rotation, 'y', 0, Math.PI * 2).listen()
    cubeFolder.add(this.scene.rotation, 'z', 0, Math.PI * 2).listen()
    const cameraFolder = gui.addFolder('Camera')
    cameraFolder.add(this.camera.position, 'z').listen()
    cameraFolder.add(this.camera.position, 'x').listen()
    cameraFolder.add(this.camera.position, 'y').listen()
    gui.close()
    document.body.appendChild(gui.domElement)
    // scene.rotation.z = Math.PI / 2
    // MISC function
    // const setBackgroundColor = (arrayRGB) => {
    //   this.lastBgColor = arrayRGB
    //   console.log(arrayRGB)
    //   this.renderer.setClearColor(new Color().setRGB(arrayRGB[0], arrayRGB[1], arrayRGB[2]))
    //   // this.renderer.clear(true, true, true)
    // }
    this.animate()
  },
  methods: {
    // TODO: update client data only every x seconds or something else completely
    // category=Three
    addPoint2Store () {
      // this.$store.commit('points/increment')
    },
    addPoint (xyz, heightRGB, terrainRGB) {
      const positions = this.points.geometry.attributes.position.array
      const defaultColor = this.points.geometry.attributes.color.array

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
      this.geometry.computeBoundingBox()
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
      const xyz = [
        parseFloat(posData.x),
        parseFloat(posData.y),
        parseFloat(posData.z)
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
      this.controls.update()

      requestAnimationFrame(this.animate)
      this.render()
      this.stats.update()
    },
    render () {
      this.renderer.render(this.scene, this.camera)
    }
  }

}
</script>
