import { BoxGeometry, Mesh, MeshBasicMaterial, Scene } from "three";

export class Player {
    player: Mesh | null = null
    scene: Scene

    moveDistance: number = 2
    targetX: number = 0
    speed: number = 10

    constructor(scene: Scene) {
        this.scene = scene
    }

    setup() {
        const geometry = new BoxGeometry(1, 1, 1)
        const material = new MeshBasicMaterial({ color: "#ff6969" })

        this.player = new Mesh(geometry, material)
        this.player.position.set(0, 0, 0)

        this.scene.add(this.player)

        // Add player movement
        window.addEventListener("keydown", this.onKeyPress)
    }

    update(delta: number) {
        if (!this.player)
            return

        this.player.position.x += (this.targetX - this.player.position.x) * this.speed * delta
    }

    destroy() {
        if (!this.player)
            return

        // Remove event listeners
        window.removeEventListener("keydown", this.onKeyPress)

        // Clear main reference beforehand
        const p = this.player
        this.player = null

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
        }
        else if (key === "d" || key === "ArrowRight") {
            if (this.targetX === -this.moveDistance) {
                this.targetX = 0
            }
            else if (this.targetX === 0) {
                this.targetX = this.moveDistance
            }
        }
    }
}