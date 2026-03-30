import * as THREE from 'three'
import Experience from '../Experience.js'

export default class MovableBox {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.resources = this.experience.resources

    this.keys = {}
    this.moveSpeed = 8
    this.jumpForce = 6
    this.isOnGround = false
    this.playerBody = null

    this.setupControls()
    this.setGeometry()
    this.createPlaceholderMaterial()
    this.setMesh()
    this.waitForResources()
    this.waitForPhysics()
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

  waitForPhysics() {
    const physics = this.experience.world?.environment?.physics
      || window.experience?.world?.environment?.physics

    const tryInit = () => {
      const phys = window.experience?.world?.environment?.physics
      if (phys && phys.ready) {
        this.playerBody = phys.createPlayerBody({ x: 0, y: 3, z: 0 })
      } else {
        setTimeout(tryInit, 100)
      }
    }
    setTimeout(tryInit, 500)
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
    if (this.textures?.color && this.textures?.normal) {
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

    // If Rapier body is ready use physics movement
    if (this.playerBody) {
      this.handlePhysicsMovement()
    } else {
      this.handleFallbackMovement()
    }
  }

  handlePhysicsMovement() {
    const camera = this.experience.camera.instance

    const cameraForward = new THREE.Vector3()
    camera.getWorldDirection(cameraForward)
    cameraForward.y = 0
    cameraForward.normalize()

    const cameraRight = new THREE.Vector3()
    cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0))
    cameraRight.normalize()

    const moveDir = new THREE.Vector3()
    if (this.keys['w']) moveDir.add(cameraForward)
    if (this.keys['s']) moveDir.sub(cameraForward)
    if (this.keys['d']) moveDir.add(cameraRight)
    if (this.keys['a']) moveDir.sub(cameraRight)

    if (moveDir.length() > 0) {
      moveDir.normalize()
      const targetAngle = Math.atan2(moveDir.x, moveDir.z)
      this.mesh.rotation.y = targetAngle
    }

    const vel = this.playerBody.linvel()
    const newVelX = moveDir.x * this.moveSpeed
    const newVelZ = moveDir.z * this.moveSpeed

    this.isOnGround = Math.abs(vel.y) < 0.5

    if (this.keys[' '] && this.isOnGround) {
      this.playerBody.setLinvel({ x: newVelX, y: this.jumpForce, z: newVelZ }, true)
      this.isOnGround = false
    } else {
      this.playerBody.setLinvel({ x: newVelX, y: vel.y, z: newVelZ }, true)
    }

    const translation = this.playerBody.translation()
    this.mesh.position.set(translation.x, translation.y, translation.z)
}

  handleFallbackMovement() {
    // Fallback if physics not ready yet
    const camera = this.experience.camera.instance
    const cameraForward = new THREE.Vector3()
    camera.getWorldDirection(cameraForward)
    cameraForward.y = 0
    cameraForward.normalize()

    const cameraRight = new THREE.Vector3()
    cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0))

    const moveDir = new THREE.Vector3()
    if (this.keys['w']) moveDir.add(cameraForward)
    if (this.keys['s']) moveDir.sub(cameraForward)
    if (this.keys['d']) moveDir.add(cameraRight)
    if (this.keys['a']) moveDir.sub(cameraRight)

    if (moveDir.length() > 0) moveDir.normalize()

    this.mesh.position.x += moveDir.x * 0.1
    this.mesh.position.z += moveDir.z * 0.1

    if (this.mesh.position.y > 0.5) {
      this.mesh.position.y -= 0.02
    } else {
      this.mesh.position.y = 0.5
    }
  }

  update() {
    this.handleMovement()
  }
}