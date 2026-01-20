import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'

export default class Camera {
  constructor(experience) {
    this.experience = experience
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    // Camera modes
    this.mode = 'orbit' // 'orbit' or 'follow'
    this.orbitTarget = new THREE.Vector3(0, 1, 0)
    this.followTarget = null
    
    // Follow mode settings
    this.followOffset = new THREE.Vector3(0, 2, 5) // Camera behind and above box
    this.followSmoothness = 0.1
    
    this.setInstance()
    this.setControls()
    this.setupKeyboardControls()
    
    console.log('📷 Camera initialized - Press F for follow, O for orbit')
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
    
    // Set orbit limits
    this.controls.minDistance = 3
    this.controls.maxDistance = 50
    this.controls.maxPolarAngle = Math.PI / 1.5
    this.controls.minPolarAngle = 0.3
    
    this.controls.target.copy(this.orbitTarget)
  }

  setFollowTarget(targetMesh) {
    this.followTarget = targetMesh
    this.mode = 'follow'
    this.controls.enabled = false // Disable orbit controls in follow mode
    
    console.log('🎯 Camera following box (press O to orbit)')
  }

  setOrbitTarget(targetMesh) {
    this.orbitTargetMesh = targetMesh
    this.mode = 'orbit'
    this.controls.enabled = true
    
    console.log('🎯 Camera orbiting around box (press F to follow)')
  }

  update() {
    if (this.mode === 'follow' && this.followTarget) {
      this.updateFollowMode()
    } else {
      // Orbit mode
      this.updateOrbitMode()
    }
    
    // Always update controls (they handle damping)
    this.controls.update()
  }

  updateFollowMode() {
    if (!this.followTarget || !this.followTarget.position) return
    
    const boxPos = this.followTarget.position.clone()
    
    // Get box's forward direction (from its rotation)
    const boxForward = new THREE.Vector3(0, 0, -1)
    boxForward.applyEuler(this.followTarget.rotation)
    boxForward.y = 0 // Keep horizontal
    boxForward.normalize()
    
    // Calculate camera position: behind the box
    const offset = this.followOffset.clone()
    
    // Apply box's forward direction to offset (so camera stays behind)
    const cameraPos = boxPos.clone()
    cameraPos.x -= boxForward.x * offset.z
    cameraPos.y += offset.y // Always above box
    cameraPos.z -= boxForward.z * offset.z
    
    // Smoothly move camera
    this.instance.position.lerp(cameraPos, this.followSmoothness)
    
    // Look at the box (slightly above its center for better view)
    const lookAtPos = boxPos.clone()
    lookAtPos.y += 0.5 // Look at box's center height
    this.instance.lookAt(lookAtPos)
    
    // Update orbit target too (for smooth transition back to orbit)
    this.orbitTarget.copy(boxPos)
    this.controls.target.copy(boxPos)
  }

  updateOrbitMode() {
    // Update orbit center to follow box
    if (this.orbitTargetMesh && this.orbitTargetMesh.position) {
      // Smoothly move orbit center towards box
      this.orbitTarget.lerp(this.orbitTargetMesh.position, 0.1)
      this.controls.target.copy(this.orbitTarget)
    }
  }

  setupKeyboardControls() {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase()
      
      // F key to follow the box
      if (key === 'f') {
        const world = this.experience.world
        if (world && world.movableBox && world.movableBox.mesh) {
          this.setFollowTarget(world.movableBox.mesh)
        }
      }
      
      // O key to orbit around the box
      if (key === 'o') {
        const world = this.experience.world
        if (world && world.movableBox && world.movableBox.mesh) {
          this.setOrbitTarget(world.movableBox.mesh)
        }
      }
      
      // R key to reset camera
      if (key === 'r') {
        this.instance.position.set(0, 5, 10)
        this.controls.target.set(0, 1, 0)
        console.log('📷 Camera reset')
      }
      
      // 1-3 for preset views
      if (key === '1') {
        // Top-down view
        this.instance.position.set(0, 15, 0)
        this.controls.target.set(0, 0, 0)
      }
      
      if (key === '2') {
        // Side view
        this.instance.position.set(10, 3, 0)
        this.controls.target.set(0, 1, 0)
      }
      
      if (key === '3') {
        // Front view
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