import { Box3, BoxGeometry, Mesh, MeshStandardMaterial, Scene, Vector3 } from "three";
import { AudioManager } from "../Audio/AudioManager";

export class Player {
    isActive: boolean = false

    player: Mesh | null = null
    boundingBox: Box3 | null = null
    scene: Scene

    moveDistance: number = 2
    targetX: number = 0
    speed: number = 15

    constructor(scene: Scene) {
        this.scene = scene
    }

    setup() {
        // Create player
        const geometry = new BoxGeometry(1, 1, 1)
        const material = new MeshStandardMaterial({ color: "#ff6969" })

        this.player = new Mesh(geometry, material)
        this.player.position.set(0, 1, 0)

        this.scene.add(this.player)

        // Create bounding box
        this.boundingBox = new Box3().setFromObject(this.player)

        // Add player movement
        window.addEventListener("keydown", this.onKeyPress)

        // Reset values
        this.targetX = 0

        // Set status to active
        this.isActive = true
    }

    update(delta: number) {
        if (!this.player || !this.boundingBox)
            return

        // Movement
        this.player.position.x += (this.targetX - this.player.position.x) * this.speed * delta

        // Update bounding box position
        this.boundingBox.setFromCenterAndSize(
            this.player.position,
            this.boundingBox.getSize(new Vector3())
        )
    }

    destroy() {
        if (!this.player || !this.boundingBox)
            return

        // Remove event listeners
        window.removeEventListener("keydown", this.onKeyPress)

        // Clear main reference beforehand
        const p = this.player
        this.player = null
        this.boundingBox = null // Can be freed by directly setting it to null

        // Clear out geometry and material
        p.geometry.dispose()

        if (Array.isArray(p.material)) {
            p.material.forEach(m => m.dispose())
        }
        else {
            p.material.dispose()
        }

        // Remove from scene
        this.scene.remove(p)

        // Set status to inactive
        this.isActive = false
    }

    private onKeyPress = (e: KeyboardEvent) => {
        const key = e.key

        if (key === "a" || key === "ArrowLeft") {
            if (this.targetX === this.moveDistance) {
                this.targetX = 0
            }
            else if (this.targetX === 0) {
                this.targetX = -this.moveDistance
            }

            AudioManager.getInstance().playOneShot("move")
        }
        else if (key === "d" || key === "ArrowRight") {
            if (this.targetX === -this.moveDistance) {
                this.targetX = 0
            }
            else if (this.targetX === 0) {
                this.targetX = this.moveDistance
            }

            AudioManager.getInstance().playOneShot("move")
        }
    }
}