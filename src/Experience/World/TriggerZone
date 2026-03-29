import * as THREE from 'three'

export default class TriggerZone {
  constructor(position, size, zoneData, scene) {
    this.position = position
    this.size = size
    this.zoneData = zoneData // { title, description, imageUrl, projectLink }
    this.scene = scene
    this.isPlayerInside = false
    this.hasTriggered = false
    
    // Create invisible trigger box
    this.createTriggerBox()
    
    // Create visual indicator (optional - visible area)
    this.createVisualIndicator()
  }
  
  createTriggerBox() {
    const geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z)
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      transparent: true, 
      opacity: 0.3,
      visible: false // Set to true for debugging
    })
    this.triggerMesh = new THREE.Mesh(geometry, material)
    this.triggerMesh.position.set(this.position.x, this.position.y, this.position.z)
    this.scene.add(this.triggerMesh)
  }
  
  createVisualIndicator() {
    // Optional: Add a visual ring or glowing effect to show where zones are
    const ringGeometry = new THREE.RingGeometry(2, 2.5, 32)
    const ringMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffaa00, 
      emissive: 0x442200,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    })
    this.ring = new THREE.Mesh(ringGeometry, ringMaterial)
    this.ring.rotation.x = -Math.PI / 2
    this.ring.position.set(this.position.x, this.position.y + 0.05, this.position.z)
    this.scene.add(this.ring)
    
    // Floating particles for effect
    this.particles = []
    for (let i = 0; i < 8; i++) {
      const particleGeo = new THREE.SphereGeometry(0.1, 4, 4)
      const particleMat = new THREE.MeshStandardMaterial({ color: 0xffaa44, emissive: 0x442200 })
      const particle = new THREE.Mesh(particleGeo, particleMat)
      particle.userData = {
        offsetX: (Math.random() - 0.5) * 3,
        offsetZ: (Math.random() - 0.5) * 3,
        speed: 0.5 + Math.random() * 1,
        height: 0.5 + Math.random() * 1
      }
      particle.position.set(
        this.position.x + particle.userData.offsetX,
        this.position.y + 0.2,
        this.position.z + particle.userData.offsetZ
      )
      this.scene.add(particle)
      this.particles.push(particle)
    }
  }
  
  checkCollision(playerPosition) {
    // Check if player is inside the zone (axis-aligned bounding box)
    const halfSizeX = this.size.x / 2
    const halfSizeZ = this.size.z / 2
    
    const isInside = 
      playerPosition.x > this.position.x - halfSizeX &&
      playerPosition.x < this.position.x + halfSizeX &&
      playerPosition.z > this.position.z - halfSizeZ &&
      playerPosition.z < this.position.z + halfSizeZ
    
    // Trigger when player enters zone
    if (isInside && !this.isPlayerInside) {
      this.onPlayerEnter()
    }
    // Optional: Trigger when player leaves zone
    else if (!isInside && this.isPlayerInside) {
      this.onPlayerExit()
    }
    
    this.isPlayerInside = isInside
  }
  
  onPlayerEnter() {
    console.log(`🎯 Entered zone: ${this.zoneData.title}`)
    this.hasTriggered = true
    
    // Play a little animation
    if (this.ring) {
      this.ring.material.emissiveIntensity = 0.5
      setTimeout(() => {
        if (this.ring) this.ring.material.emissiveIntensity = 0.2
      }, 200)
    }
    
    // Show popup
    this.showPopup()
  }
  
  onPlayerExit() {
    console.log(`🚪 Left zone: ${this.zoneData.title}`)
    this.hasTriggered = false
    
    // Hide popup if you want popup to close on exit
    // this.hidePopup()
  }
  
  showPopup() {
    // Create or update popup HTML element
    let popup = document.getElementById('info-popup')
    
    if (!popup) {
      popup = document.createElement('div')
      popup.id = 'info-popup'
      popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        max-width: 400px;
        z-index: 1000;
        font-family: Arial, sans-serif;
        border: 2px solid #ffaa44;
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
        animation: fadeIn 0.3s ease;
      `
      document.body.appendChild(popup)
      
      // Add close button
      const closeBtn = document.createElement('button')
      closeBtn.innerHTML = '✕'
      closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
      `
      closeBtn.onclick = () => this.hidePopup()
      popup.appendChild(closeBtn)
    }
    
    // Populate content
    popup.innerHTML = `
      <button style="position:absolute; top:10px; right:10px; background:none; border:none; color:white; font-size:20px; cursor:pointer;">✕</button>
      <h2 style="color:#ffaa44; margin-top:0;">${this.zoneData.title}</h2>
      ${this.zoneData.imageUrl ? `<img src="${this.zoneData.imageUrl}" style="max-width:100%; border-radius:5px; margin:10px 0;">` : ''}
      <p>${this.zoneData.description}</p>
      ${this.zoneData.projectLink ? `<a href="${this.zoneData.projectLink}" target="_blank" style="color:#ffaa44; display:inline-block; margin-top:10px;">View Project →</a>` : ''}
    `
    
    // Re-attach close button event
    const closeBtn = popup.querySelector('button')
    if (closeBtn) {
      closeBtn.onclick = () => this.hidePopup()
    }
    
    popup.style.display = 'block'
  }
  
  hidePopup() {
    const popup = document.getElementById('info-popup')
    if (popup) {
      popup.style.display = 'none'
    }
  }
  
  updateParticles(time) {
    // Animate floating particles
    this.particles.forEach((particle, i) => {
      particle.position.y = this.position.y + 0.2 + Math.sin(time * particle.userData.speed + i) * particle.userData.height * 0.5
      particle.rotation.y += 0.05
    })
  }
  
  update(playerPosition, time) {
    this.checkCollision(playerPosition)
    if (this.particles) {
      this.updateParticles(time)
    }
  }
}
