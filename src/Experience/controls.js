export default class Controls {
    constructor() {
        this.experience = window.experience;
        this.physicsBox = null; // Reference to box we control
        
        this.keys = {};
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (event) => {
            this.keys[event.key.toLowerCase()] = true;
            this.handleInput();
        });
        
        window.addEventListener('keyup', (event) => {
            this.keys[event.key.toLowerCase()] = false;
        });
    }
    
    setControlledBox(box) {
        this.physicsBox = box;
    }
    
    handleInput() {
        if (!this.physicsBox || !this.physicsBox.physicsBody) return;
        
        const forceStrength = 10;
        const impulse = { x: 0, y: 0, z: 0 };
        
        // WASD controls
        if (this.keys['w'] || this.keys['arrowup']) {
            impulse.z = -forceStrength;
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            impulse.z = forceStrength;
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            impulse.x = -forceStrength;
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            impulse.x = forceStrength;
        }
        if (this.keys[' ']) { // Spacebar
            impulse.y = forceStrength * 2;
        }
        
        // Apply force to physics body
        if (impulse.x !== 0 || impulse.y !== 0 || impulse.z !== 0) {
            this.physicsBox.physicsBody.rigidBody.applyImpulse(
                impulse,
                true
            );
        }
    }
    
    update() {
        this.handleInput();
    }
}