import * as THREE from 'three'
import Experience from '../Experience.js'
import Physics from "../physics.js";

export default class Environment {
  constructor() {
    // Setup
    this.experience = new Experience()
    this.physics = new Physics();
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    // Debug
    this.debug = this.experience.debug

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder('environment')
    }

    this.setSunLight()
    this.setEnvironmentMap()
  }

    update() {
    // Update physics before everything else
    if (this.physics) {
      this.physics.update();
    }
    
    this.camera.update();
    this.world.update();
    this.renderer.update();
  }

  setSunLight() {
    this.sunLight = new THREE.DirectionalLight('#ffffff', 4)
    this.sunLight.castShadow = true
    this.sunLight.shadow.camera.far = 15
    this.sunLight.shadow.mapSize.set(1024, 1024)
    this.sunLight.shadow.normalBias = 0.05
    this.sunLight.position.set(3, 3, -2.25)
    this.scene.add(this.sunLight)

  }

  setEnvironmentMap() {
    this.environmentMap = {}
    this.environmentMap.intensity = 0.4
    this.environmentMap.texture = this.resources.items.environmentMapTexture

    // this.environmentMap.texture.encoding = THREE.sRGBEncoding

    if (this.environmentMap.texture) {
      this.environmentMap.texture.encoding = THREE.sRGBEncoding
    }

    this.scene.environment = this.environmentMap.texture

    this.environmentMap.updateMaterials = () => {
      this.scene.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          child.material.envMap = this.environmentMap.texture
          child.material.envMapIntensity = this.environmentMap.intensity
          child.material.needsUpdate = true
        }
      })
    }
    this.environmentMap.updateMaterials()
  }
}
