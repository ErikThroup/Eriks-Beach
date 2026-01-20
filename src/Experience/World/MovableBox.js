// src/Experience/World/MovableBox.js
import * as THREE from 'three'
import Experience from '../Experience.js'

export default class MovableBox {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources;
    
    // Physics properties
    this.velocity = new THREE.Vector3(0, 0, 0)
    this.gravity = -0.02
    this.isOnGround = false
    this.moveSpeed = 0.15
    this.jumpForce = 0.5
    
    // Track pressed keys
    this.keys = {}
    this.setupControls()

    // Setup box geometry immediately
    this.setGeometry()
    
    // Create a placeholder material first
    this.createPlaceholderMaterial()
    this.setMesh()
    
    console.log('🎮 Movable box created! Use WASD to move, SPACE to jump')
    
    // Wait for resources to load, then apply textures
    this.waitForResources()
  }

  setGeometry() {
    this.geometry = new THREE.BoxGeometry(1, 1, 1)
  }
  
  createPlaceholderMaterial() {
    // Temporary material until textures load
    this.material = new THREE.MeshStandardMaterial({
      color: 0x808080, // Gray placeholder
      roughness: 0.5,
      metalness: 0.1
    })
  }

  waitForResources() {
    if (this.resources.items.wallColorTexture) {
      // Textures are already loaded
      this.setTextures()
      this.updateMaterial()
    } else {
      // Wait for textures to load
      this.resources.on('ready', () => {
        console.log('✅ Resources ready, applying textures to movable box')
        this.setTextures()
        this.updateMaterial()
      })
    }
  }

  setTextures() {
    this.textures = {}
    
    // Check if textures exist
    if (!this.resources.items.wallColorTexture) {
      console.warn('⚠️ wallColorTexture not found, using placeholder')
      return
    }
    
    if (!this.resources.items.wallNormalTexture) {
      console.warn('⚠️ wallNormalTexture not found, using placeholder')
      return
    }
    
    // Use the same textures as your Floor class
    this.textures.color = this.resources.items.wallColorTexture
    this.textures.color.encoding = THREE.sRGBEncoding
    this.textures.color.repeat.set(1.5, 1.5)
    this.textures.color.wrapS = THREE.RepeatWrapping
    this.textures.color.wrapT = THREE.RepeatWrapping

    this.textures.normal = this.resources.items.wallNormalTexture
    this.textures.normal.repeat.set(1.5, 1.5)
    this.textures.normal.wrapS = THREE.RepeatWrapping
    this.textures.normal.wrapT = THREE.RepeatWrapping
    
    console.log('✅ Textures loaded for movable box')
  }

  updateMaterial() {
    // Update existing material with textures
    if (this.textures.color && this.textures.normal) {
      this.material.map = this.textures.color
      this.material.normalMap = this.textures.normal
      this.material.needsUpdate = true
      console.log('✅ Material updated with textures')
    } else {
      // Fallback to colored material
      this.material.color.set(0x00ff00) // Green
      this.material.roughness = 0.3
      this.material.metalness = 0.2
    }
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.set(0, 3, 0) // Start above ground
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true
    this.scene.add(this.mesh)
  }

  setupControls() {
    // Keyboard controls
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase()
      this.keys[key] = true
      
      // Map arrow keys to WASD
      if (key === 'arrowup') this.keys['w'] = true
      if (key === 'arrowdown') this.keys['s'] = true
      if (key === 'arrowleft') this.keys['a'] = true
      if (key === 'arrowright') this.keys['d'] = true
      
      // Jump when space is pressed
      if (key === ' ' && this.isOnGround) {
        this.velocity.y = this.jumpForce
        this.isOnGround = false
      }
    })

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase()
      this.keys[key] = false
      
      // Clear arrow keys too
      if (key === 'arrowup') this.keys['w'] = false
      if (key === 'arrowdown') this.keys['s'] = false
      if (key === 'arrowleft') this.keys['a'] = false
      if (key === 'arrowright') this.keys['d'] = false
    })
  }

  handleMovement() {
    if (!this.mesh) return
    
    // Apply gravity
    this.velocity.y += this.gravity
    
    // Horizontal movement
    const moveX = (this.keys['d'] ? 1 : 0) + (this.keys['a'] ? -1 : 0)
    const moveZ = (this.keys['w'] ? -1 : 0) + (this.keys['s'] ? 1 : 0)
    
    this.velocity.x = moveX * this.moveSpeed
    this.velocity.z = moveZ * this.moveSpeed

    // Apply velocity to position
    this.mesh.position.x += this.velocity.x
    this.mesh.position.y += this.velocity.y
    this.mesh.position.z += this.velocity.z

    // Ground collision (floor is at y = 0.5 for box center)
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