/**
 * Animations and Visual Effects
 *
 * Handles character animations, screen effects, and visual polish for the 3D scene.
 */

import * as THREE from 'three';

/**
 * Character idle animation
 * Subtle breathing and swaying motion
 */
export class IdleAnimation {
  private time = 0;
  private breathingSpeed = 1.5;
  private swaySpeed = 0.8;
  private breathingAmount = 0.02;
  private swayAmount = 0.05;

  update(character: THREE.Object3D, delta: number): void {
    this.time += delta;

    // Breathing effect (scale)
    const breathScale = 1 + Math.sin(this.time * this.breathingSpeed) * this.breathingAmount;
    character.scale.y = breathScale;

    // Swaying motion (rotation)
    const swayRotation = Math.sin(this.time * this.swaySpeed) * this.swayAmount;
    character.rotation.y = swayRotation;

    // Slight head bob (position)
    const bobOffset = Math.sin(this.time * this.breathingSpeed * 0.5) * 0.01;
    character.position.y = bobOffset;
  }
}

/**
 * Typing animation for character
 * Simulates typing gesture when AI is responding
 */
export class TypingAnimation {
  private isTyping = false;
  private time = 0;
  private typingSpeed = 3;

  start(): void {
    this.isTyping = true;
    this.time = 0;
  }

  stop(): void {
    this.isTyping = false;
  }

  update(character: THREE.Object3D, delta: number): void {
    if (!this.isTyping) return;

    this.time += delta;

    // Find arms or hands (if they exist in the model)
    character.traverse((object) => {
      if (object.name.toLowerCase().includes('arm') || object.name.toLowerCase().includes('hand')) {
        // Subtle arm movement for typing
        const movement = Math.sin(this.time * this.typingSpeed) * 0.1;
        object.rotation.x = movement;
      }
    });
  }

  isAnimating(): boolean {
    return this.isTyping;
  }
}

/**
 * Screen glow effect when new message arrives
 */
export class ScreenGlowEffect {
  private glowIntensity = 0;
  private targetIntensity = 0;
  private duration = 0.5; // seconds
  private elapsed = 0;

  trigger(): void {
    this.targetIntensity = 1.0;
    this.elapsed = 0;
  }

  update(screenMesh: THREE.Mesh, delta: number): void {
    if (this.glowIntensity === 0 && this.targetIntensity === 0) return;

    this.elapsed += delta;

    // Fade in to target intensity
    if (this.elapsed < this.duration) {
      this.glowIntensity = THREE.MathUtils.lerp(
        this.glowIntensity,
        this.targetIntensity,
        this.elapsed / this.duration,
      );
    }
    // Fade out
    else {
      this.glowIntensity = THREE.MathUtils.lerp(this.glowIntensity, 0, 0.05);

      if (this.glowIntensity < 0.01) {
        this.glowIntensity = 0;
        this.targetIntensity = 0;
      }
    }

    // Apply glow to screen material
    if (screenMesh.material instanceof THREE.MeshBasicMaterial) {
      const material = screenMesh.material;
      // Enhance emissive color for glow
      const glowColor = new THREE.Color(0x00ff41);
      glowColor.multiplyScalar(this.glowIntensity * 0.3);
      material.color.lerp(glowColor, this.glowIntensity);
    }
  }
}

/**
 * Particle system for cyberpunk atmosphere
 * Matrix-style falling code particles (desktop only)
 */
export class MatrixParticles {
  private particles: THREE.Points | null = null;
  private particleCount = 100;
  private velocities: Float32Array;

  constructor(particleCount = 100) {
    this.particleCount = particleCount;
    this.velocities = new Float32Array(particleCount * 3);

    // Initialize random velocities
    for (let i = 0; i < particleCount; i++) {
      this.velocities[i * 3] = 0; // x velocity
      this.velocities[i * 3 + 1] = -0.5 - Math.random() * 0.5; // y velocity (falling)
      this.velocities[i * 3 + 2] = 0; // z velocity
    }
  }

  create(scene: THREE.Scene): void {
    // Create particle geometry
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      // Random position in room
      positions[i * 3] = (Math.random() - 0.5) * 10; // x
      positions[i * 3 + 1] = Math.random() * 3; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // z

      // Matrix green color with variation
      const brightness = 0.5 + Math.random() * 0.5;
      colors[i * 3] = 0; // r
      colors[i * 3 + 1] = brightness; // g (green)
      colors[i * 3 + 2] = 0.25 * brightness; // b (slight blue tint)
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create particle material
    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    scene.add(this.particles);
  }

  update(delta: number): void {
    if (!this.particles) return;

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const positions = this.particles.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.particleCount; i++) {
      // Update position based on velocity
      positions[i * 3] += this.velocities[i * 3] * delta;
      positions[i * 3 + 1] += this.velocities[i * 3 + 1] * delta;
      positions[i * 3 + 2] += this.velocities[i * 3 + 2] * delta;

      // Reset particles that fall below floor
      if (positions[i * 3 + 1] < 0) {
        positions[i * 3 + 1] = 3; // Reset to ceiling
        positions[i * 3] = (Math.random() - 0.5) * 10; // Randomize x
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10; // Randomize z
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  dispose(): void {
    if (this.particles) {
      this.particles.geometry.dispose();
      if (this.particles.material instanceof THREE.Material) {
        this.particles.material.dispose();
      }
    }
  }
}

/**
 * Smooth camera transition
 */
export class CameraTransition {
  private startPosition: THREE.Vector3 = new THREE.Vector3();
  private targetPosition: THREE.Vector3 = new THREE.Vector3();
  private startRotation: THREE.Euler = new THREE.Euler();
  private targetRotation: THREE.Euler = new THREE.Euler();
  private progress = 1; // 0 to 1
  private duration = 1; // seconds
  private isTransitioning = false;

  start(
    camera: THREE.Camera,
    targetPos: THREE.Vector3,
    targetRot: THREE.Euler,
    duration = 1,
  ): void {
    this.startPosition.copy(camera.position);
    this.targetPosition.copy(targetPos);
    this.startRotation.copy(camera.rotation);
    this.targetRotation.copy(targetRot);
    this.progress = 0;
    this.duration = duration;
    this.isTransitioning = true;
  }

  update(camera: THREE.Camera, delta: number): void {
    if (!this.isTransitioning) return;

    this.progress += delta / this.duration;

    if (this.progress >= 1) {
      this.progress = 1;
      this.isTransitioning = false;
    }

    // Smooth easing (ease-in-out)
    const t = this.easeInOutCubic(this.progress);

    // Interpolate position
    camera.position.lerpVectors(this.startPosition, this.targetPosition, t);

    // Interpolate rotation
    camera.rotation.set(
      THREE.MathUtils.lerp(this.startRotation.x, this.targetRotation.x, t),
      THREE.MathUtils.lerp(this.startRotation.y, this.targetRotation.y, t),
      THREE.MathUtils.lerp(this.startRotation.z, this.targetRotation.z, t),
    );
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  isActive(): boolean {
    return this.isTransitioning;
  }
}

/**
 * Hover glow effect for interactive objects
 */
export function applyHoverGlow(object: THREE.Object3D, isHovering: boolean): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const material = child.material;

      if (material instanceof THREE.MeshStandardMaterial) {
        if (isHovering) {
          // Increase emissive for glow
          material.emissive.setHex(0x00ff41);
          material.emissiveIntensity = 0.3;
        } else {
          // Reset emissive
          material.emissiveIntensity = 0;
        }
      }
    }
  });
}
