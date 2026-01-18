import { Box3, BoxGeometry, Mesh, MeshStandardMaterial, Scene, Vector3 } from "three";
import { AudioManager } from "../AssetManagers/AudioManager";

export class Player {
    isActive: boolean = false

    player: Mesh | null = null
    boundingBox: Box3 | null = null
    scene: Scene
    canvas: HTMLCanvasElement

    moveDistance: number = 2
    targetX: number = 0
    speed: number = 15

    // For touch devices
    touchStartX: number = 0
    touchEndX: number = 0
    dragMinDistance: number = 25

    constructor(scene: Scene, canvas: HTMLCanvasElement) {
        this.scene = scene
        this.canvas = canvas
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
        this.canvas.addEventListener("touchstart", this.handleTouchStart)
        this.canvas.addEventListener("touchend", this.handleTouchEnd)

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
        this.canvas.removeEventListener("touchstart", this.handleTouchStart)
        this.canvas.removeEventListener("touchend", this.handleTouchEnd)

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

    private movePlayer = (dir: "left" | "right") => {
        const oldTargetX = this.targetX

        if (dir === "left") {
            if (this.targetX === this.moveDistance) {
                this.targetX = 0
            }
            else if (this.targetX === 0) {
                this.targetX = -this.moveDistance
            }
        }
        else if (dir === "right") {
            if (this.targetX === -this.moveDistance) {
                this.targetX = 0
            }
            else if (this.targetX === 0) {
                this.targetX = this.moveDistance
            }
        }

        if (oldTargetX !== this.targetX) {
            AudioManager.getInstance().playOneShot("move")
        }
        else {
            AudioManager.getInstance().playOneShot("noMove")
        }
    }

    private onKeyPress = (e: KeyboardEvent) => {
        const key = e.key

        if (key === "a" || key === "ArrowLeft") {
            this.movePlayer("left")
        }
        else if (key === "d" || key === "ArrowRight") {
            this.movePlayer("right")
        }
    }

    private handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length <= 0)
            return

        this.touchStartX = e.touches[0].clientX
    }

    private handleTouchEnd = (e: TouchEvent) => {
        if (e.changedTouches.length <= 0)
            return

        this.touchEndX = e.changedTouches[0].clientX

        // Move player if drag distance is larger than min limit
        const dragDistance = this.touchEndX - this.touchStartX

        // Swipe
        if (Math.abs(dragDistance) > this.dragMinDistance) {
            const dir = dragDistance < 0 ? "left" : "right"
            this.movePlayer(dir)
        }
        // Tap
        else {
            const screenMid = window.innerWidth / 2

            if (this.touchEndX < screenMid) {
                this.movePlayer("left")
            }
            else {
                this.movePlayer("right")
            }
        }
    }
}