// src/Experience/World/MovableBox.js
import * as THREE from 'three'
import Experience from '../Experience.js'

export default class MovableBox {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources
    
    // Physics properties
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.gravity = -0.02
    this.isOnGround = false
    this.moveSpeed = 0.15
    this.jumpForce = 0.5
    
    // Track pressed keys
    this.keys = {}
    this.setupControls()

    this.setGeometry()
    this.createPlaceholderMaterial()
    this.setMesh()
    this.waitForResources()
  }

  setGeometry() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1)
  }
  
  createPlaceholderMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      color: 0x808080,
      roughness: 0.5,
      metalness: 0.1
    })
  }

  waitForResources() {
    if (this.resources.items.wallColorTexture) {
      this.setTextures()
      this.updateMaterial()
    } else {
      this.resources.on('ready', () => {
        this.setTextures()
        this.updateMaterial()
      })
    }
  }

  setTextures() {
    this.textures = {}
    this.textures.color = this.resources.items.wallColorTexture
    this.textures.color.encoding = THREE.sRGBEncoding
    this.textures.color.repeat.set(1.5, 1.5)
    this.textures.color.wrapS = THREE.RepeatWrapping
    this.textures.color.wrapT = THREE.RepeatWrapping

    this.textures.normal = this.resources.items.wallNormalTexture
    this.textures.normal.repeat.set(1.5, 1.5)
    this.textures.normal.wrapS = THREE.RepeatWrapping
    this.textures.normal.wrapT = THREE.RepeatWrapping
  }

  updateMaterial() {
    if (this.textures.color && this.textures.normal) {
      this.material.map = this.textures.color
      this.material.normalMap = this.textures.normal
      this.material.needsUpdate = true
    } 
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.set(0, 3, 0) 
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.scene.add(this.mesh)
  }

  setupControls() {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase()
      this.keys[key] = true
      if (key === 'arrowup') this.keys['w'] = true
      if (key === 'arrowdown') this.keys['s'] = true
      if (key === 'arrowleft') this.keys['a'] = true
      if (key === 'arrowright') this.keys['d'] = true
      
      if (key === ' ' && this.isOnGround) {
        this.velocity.y = this.jumpForce
        this.isOnGround = false
      }
    })

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase()
      this.keys[key] = false
      if (key === 'arrowup') this.keys['w'] = false
      if (key === 'arrowdown') this.keys['s'] = false
      if (key === 'arrowleft') this.keys['a'] = false
      if (key === 'arrowright') this.keys['d'] = false
    })
  }

  handleMovement() {
    if (!this.mesh) return

    // Get camera from experience
    const camera = this.experience.camera.instance

    // Get camera forward direction (flat on XZ plane)
    const cameraForward = new THREE.Vector3()
    camera.getWorldDirection(cameraForward)
    cameraForward.y = 0
    cameraForward.normalize()

    // Get camera right direction
    const cameraRight = new THREE.Vector3()
    cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0))
    cameraRight.normalize()

    // Build move direction from input
    const moveDir = new THREE.Vector3(0, 0, 0)
    if (this.keys['w']) moveDir.add(cameraForward)
    if (this.keys['s']) moveDir.sub(cameraForward)
    if (this.keys['d']) moveDir.add(cameraRight)
    if (this.keys['a']) moveDir.sub(cameraRight)

    // Normalize so diagonal isn't faster
    if (moveDir.length() > 0) {
      moveDir.normalize()

      // Rotate box to face movement direction
      const targetAngle = Math.atan2(moveDir.x, moveDir.z)
      this.mesh.rotation.y = targetAngle
    }

    // Apply gravity
    this.velocity.y += this.gravity

    // Apply horizontal movement
    this.velocity.x = moveDir.x * this.moveSpeed
    this.velocity.z = moveDir.z * this.moveSpeed

    // Apply velocity
    this.mesh.position.x += this.velocity.x
    this.mesh.position.y += this.velocity.y
    this.mesh.position.z += this.velocity.z

    // Ground collision
    if (this.mesh.position.y <= 0.5) {
      this.mesh.position.y = 0.5
      this.velocity.y = 0
      this.isOnGround = true
    }
  }

  update() {
    this.handleMovement()
  }
}