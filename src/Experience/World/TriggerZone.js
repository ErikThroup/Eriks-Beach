import * as THREE from 'three'

export default class TriggerZone {
  constructor(position, size, zoneData, scene) {
    this.position = position
    this.size = size
    this.zoneData = zoneData
    this.scene = scene
    this.isPlayerInside = false

    this.createTriggerBox()
    this.createVisualIndicator()
    this.createBanner()
    this.createPopupElement()
  }

  createTriggerBox() {
    const geometry = new THREE.BoxGeometry(this.size.x, this.size.y, this.size.z)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.3,
      visible: false
    })
    this.triggerMesh = new THREE.Mesh(geometry, material)
    this.triggerMesh.position.set(this.position.x, this.position.y, this.position.z)
    this.scene.add(this.triggerMesh)
  }

  createVisualIndicator() {
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

    this.particles = []
    for (let i = 0; i < 8; i++) {
      const geo = new THREE.SphereGeometry(0.1, 4, 4)
      const mat = new THREE.MeshStandardMaterial({ color: 0xffaa44, emissive: 0x442200 })
      const particle = new THREE.Mesh(geo, mat)
      particle.userData = {
        offsetX: (Math.random() - 0.5) * 3,
        offsetZ: (Math.random() - 0.5) * 3,
        speed: 0.5 + Math.random(),
        height: 0.5 + Math.random()
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

  createBanner() {
    // Create canvas texture with the zone title
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const ctx = canvas.getContext('2d')

    // Background
    ctx.fillStyle = 'rgba(10, 10, 20, 0.85)'
    ctx.roundRect(0, 0, 512, 128, 20)
    ctx.fill()

    // Border
    ctx.strokeStyle = '#ffaa44'
    ctx.lineWidth = 6
    ctx.roundRect(0, 0, 512, 128, 20)
    ctx.stroke()

    // Text
    ctx.fillStyle = '#ffaa44'
    ctx.font = 'bold 48px Segoe UI, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.zoneData.title, 256, 64)

    const texture = new THREE.CanvasTexture(canvas)

    const bannerGeometry = new THREE.PlaneGeometry(4, 1)
    const bannerMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    })

    this.banner = new THREE.Mesh(bannerGeometry, bannerMaterial)
    // Float above the ring
    this.banner.position.set(this.position.x, this.position.y + 2.5, this.position.z)
    this.scene.add(this.banner)
  }

  createPopupElement() {
    if (!document.getElementById('trigger-zone-styles')) {
      const style = document.createElement('style')
      style.id = 'trigger-zone-styles'
      style.textContent = `
        @keyframes popupFadeIn {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to   { opacity: 1; transform: translate(-50%, -50%); }
        }
        .trigger-popup {
          display: none;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(10, 10, 20, 0.95);
          color: #f0f0f0;
          padding: 28px;
          border-radius: 14px;
          max-width: 520px;
          width: 90%;
          z-index: 1000;
          font-family: 'Segoe UI', Arial, sans-serif;
          border: 2px solid #ffaa44;
          box-shadow: 0 0 40px rgba(255, 170, 68, 0.3);
          animation: popupFadeIn 0.3s ease forwards;
          overflow-y: auto;
          max-height: 85vh;
        }
        .trigger-popup h2 {
          color: #ffaa44;
          margin: 0 0 14px 0;
          font-size: 1.4rem;
        }
        .trigger-popup p {
          line-height: 1.6;
          color: #cccccc;
          margin: 0 0 16px 0;
        }
        .trigger-popup img {
          width: 100%;
          border-radius: 8px;
          margin: 8px 0;
          display: block;
        }
        .trigger-popup iframe {
          width: 100%;
          height: 260px;
          border: none;
          border-radius: 8px;
          margin: 10px 0;
        }
        .trigger-popup .exit-hint {
          margin-top: 16px;
          font-size: 0.78rem;
          color: #888;
          text-align: center;
        }
        .trigger-popup .refocus-btn {
          display: block;
          margin: 10px auto 0;
          padding: 8px 20px;
          background: #ffaa44;
          color: #000;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: bold;
        }
        .trigger-popup .refocus-btn:hover {
          background: #ffcc77;
        }
      `
      document.head.appendChild(style)
    }

    this.popup = document.createElement('div')
    this.popup.classList.add('trigger-popup')

    const imagesHtml = (this.zoneData.images || [])
      .map(src => `<img src="${src}" alt="project image" />`)
      .join('')

    const videoHtml = this.zoneData.videoUrl
      ? `<iframe src="${this.zoneData.videoUrl}" allowfullscreen></iframe>`
      : ''

    this.popup.innerHTML = `
      <h2>${this.zoneData.title}</h2>
      <p>${this.zoneData.description}</p>
      ${imagesHtml}
      ${videoHtml}
      <div class="exit-hint">Walk out of the zone to close</div>
      <button class="refocus-btn">▶ Click here to resume controls</button>
    `

    this.popup.querySelector('.refocus-btn').addEventListener('click', () => {
      document.querySelector('canvas.webgl').focus()
    })

    document.body.appendChild(this.popup)
  }

  showPopup() {
    this.popup.style.animation = 'none'
    this.popup.offsetHeight
    this.popup.style.animation = ''
    this.popup.style.display = 'block'
  }

  hidePopup() {
    this.popup.style.display = 'none'
  }

  checkCollision(playerPosition) {
    const halfX = this.size.x / 2
    const halfZ = this.size.z / 2

    const isInside =
      playerPosition.x > this.position.x - halfX &&
      playerPosition.x < this.position.x + halfX &&
      playerPosition.z > this.position.z - halfZ &&
      playerPosition.z < this.position.z + halfZ

    if (isInside && !this.isPlayerInside) {
      this.onPlayerEnter()
    } else if (!isInside && this.isPlayerInside) {
      this.onPlayerExit()
    }

    this.isPlayerInside = isInside
  }

  onPlayerEnter() {
    console.log(`🎯 Entered: ${this.zoneData.title}`)
    if (this.ring) this.ring.material.emissiveIntensity = 1
    this.showPopup()
  }

  onPlayerExit() {
    console.log(`🚪 Left: ${this.zoneData.title}`)
    if (this.ring) this.ring.material.emissiveIntensity = 0.2
    this.hidePopup()
    document.querySelector('canvas.webgl').focus()
  }

  updateParticles(time) {
    this.particles.forEach((particle, i) => {
      particle.position.y = this.position.y + 0.2 +
        Math.sin(time * particle.userData.speed + i) * particle.userData.height * 0.5
      particle.rotation.y += 0.05
    })
  }

  // Pass playerPosition in so banner can face the box
  updateBanner(playerPosition) {
    if (!this.banner) return
    this.banner.lookAt(
      playerPosition.x,
      this.banner.position.y,
      playerPosition.z
    )
  }

  update(playerPosition, time) {
    this.checkCollision(playerPosition)
    this.updateParticles(time)
    this.updateBanner(playerPosition)
  }
}