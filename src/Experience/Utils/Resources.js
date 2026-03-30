import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import EventEmitter from './EventEmitter.js'

export default class Resources extends EventEmitter {
  constructor(sources) {
    super()

    this.sources = sources
    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0

    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    this.loaders = {}

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('/Eriks-Beach/draco/')

    this.loaders.gltfLoader = new GLTFLoader()
    this.loaders.gltfLoader.setDRACOLoader(dracoLoader)

    this.loaders.textureLoader = new THREE.TextureLoader()
    this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
  }

  startLoading() {
    for (const source of this.sources) {
      if (source.type === 'gltfModel') {
        this.loaders.gltfLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      } else if (source.type === 'texture') {
        this.loaders.textureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      } else if (source.type === 'cubeTexture') {
        this.loaders.cubeTextureLoader.load(source.path, (file) => {
          this.sourceLoaded(source, file)
        })
      }
    }
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file
    this.loaded++

    // Update loading bar
    const progress = (this.loaded / this.toLoad) * 100
    const bar = document.getElementById('loading-bar')
    if (bar) bar.style.width = `${progress}%`

    if (this.loaded === this.toLoad) {
      // Hide loading screen after short delay
      setTimeout(() => {
        const screen = document.getElementById('loading-screen')
        if (screen) {
          screen.classList.add('hidden')
          setTimeout(() => screen.remove(), 800)
        }
      }, 500)

      this.trigger('ready')
    }
  }
}