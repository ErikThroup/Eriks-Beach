import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'

export default class Camera {
  constructor(experience) {
    this.experience = experience
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this.mode = 'orbit'
    this.orbitTarget = new THREE.Vector3(0, 1, 0)
    this.followTarget = null
    
    this.followDistance = 8
    this.followHeight = 3
    
    this.setInstance()
    this.setControls()
    this.setupKeyboardControls()
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      45,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    )
    this.instance.position.set(0, 5, 10)
    this.scene.add(this.instance)
  }

  setControls() {
    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 3
    this.controls.maxDistance = 50
    this.controls.maxPolarAngle = Math.PI / 1.5
    this.controls.minPolarAngle = 0.3
    this.controls.target.copy(this.orbitTarget)
  }

  setFollowTarget(targetMesh) {
    this.followTarget = targetMesh
    this.mode = 'follow'
    this.controls.enabled = true
    this.controls.minDistance = this.followDistance
    this.controls.maxDistance = this.followDistance
  }

  setOrbitTarget(targetMesh) {
    this.orbitTargetMesh = targetMesh
    this.mode = 'orbit'
    this.controls.enabled = true
    this.controls.minDistance = 3
    this.controls.maxDistance = 50
  }

  update() {
    if (this.mode === 'follow' && this.followTarget) {
      this.updateFollowMode()
    } else {
      this.updateOrbitMode()
    }
    this.controls.update()
  }

  updateFollowMode() {
    if (!this.followTarget || !this.followTarget.position) return
    const boxPos = this.followTarget.position.clone()
    boxPos.y += 0.5
    this.controls.target.copy(boxPos)
  }

  updateOrbitMode() {
    if (this.orbitTargetMesh && this.orbitTargetMesh.position) {
      this.orbitTarget.lerp(this.orbitTargetMesh.position, 0.1)
      this.controls.target.copy(this.orbitTarget)
    }
  }

  setupKeyboardControls() {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase()
      
      // F - follow mode (fixed distance, mouse rotation)
      if (key === 'f') {
        const world = this.experience.world
        if (world && world.movableBox && world.movableBox.mesh) {
          this.setFollowTarget(world.movableBox.mesh)
        }
      }
      
      // O - free orbit mode
      if (key === 'o') {
        const world = this.experience.world
        if (world && world.movableBox && world.movableBox.mesh) {
          this.setOrbitTarget(world.movableBox.mesh)
        }
      }
      
      // R - reset camera
      if (key === 'r') {
        this.mode = 'orbit'
        this.controls.minDistance = 3
        this.controls.maxDistance = 50
        this.instance.position.set(0, 5, 10)
        this.controls.target.set(0, 1, 0)
      }

      if (key === '1') {
        this.instance.position.set(0, 10, 0)
        this.controls.target.set(0, 0, 0)
      }
      if (key === '2') {
        this.instance.position.set(10, 3, 0)
        this.controls.target.set(0, 1, 0)
      }
      if (key === '3') {
        this.instance.position.set(0, 3, 10)
        this.controls.target.set(0, 1, 0)
      }
    })
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }
}