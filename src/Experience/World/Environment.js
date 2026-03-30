import * as THREE from 'three'
import Experience from '../Experience.js'
import Physics from "../physics.js";

export default class Environment {
  constructor() {
    this.experience = new Experience()
    this.physics = new Physics();
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    this.debug = this.experience.debug

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('environment')
    }

    this.setSunLight()
    this.setEnvironmentMap()
  }

  setSunLight() {
    this.sunLight = new THREE.DirectionalLight('#ffffff', 4)
    this.sunLight.castShadow = true

    // Push light up and back so it covers the whole scene
    this.sunLight.position.set(20, 40, 20)
    this.sunLight.target.position.set(0, 0, 0)
    this.scene.add(this.sunLight.target)

    // Expand shadow camera to cover full map
    this.sunLight.shadow.camera.near = 0.5
    this.sunLight.shadow.camera.far = 500
    this.sunLight.shadow.camera.left = -100
    this.sunLight.shadow.camera.right = 100
    this.sunLight.shadow.camera.top = 100
    this.sunLight.shadow.camera.bottom = -100

    // Higher resolution for sharper shadows
    this.sunLight.shadow.mapSize.set(2048, 2048)
    this.sunLight.shadow.normalBias = 0.05

    this.scene.add(this.sunLight)
  }

  setEnvironmentMap() {
    this.environmentMap = {}
    this.environmentMap.intensity = 0.4
    this.environmentMap.texture = this.resources.items.environmentMapTexture

    if (this.environmentMap.texture) {
      this.environmentMap.texture.encoding = THREE.sRGBEncoding
      this.scene.environment = this.environmentMap.texture
    }

    this.environmentMap.updateMaterials = () => {
      this.scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
          child.material.envMap = this.environmentMap.texture
          child.material.envMapIntensity = this.environmentMap.intensity
          child.material.needsUpdate = true
        }
      })
    }

    this.environmentMap.updateMaterials()
  }
}