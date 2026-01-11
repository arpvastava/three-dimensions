import { Box3, BoxGeometry, Mesh, MeshStandardMaterial, Scene, Vector3 } from "three";
import type { Player } from "./Player";
import { StateManager } from "../../state";
import { AudioManager } from "../Audio/AudioManager";

export class Obstacle {
    obstacle: Mesh | null = null
    boundingBox: Box3 | null = null
    scene: Scene
    player: Player

    speed: number = 25

    constructor(scene: Scene, player: Player) {
        this.scene = scene
        this.player = player
    }

    setup(xPos: number) {
        // Create obstacle
        const geometry = new BoxGeometry(1, 1, 1)
        const material = new MeshStandardMaterial({ color: "skyblue" })
        this.obstacle = new Mesh(geometry, material)
        this.obstacle.position.set(xPos, 1, -50)

        this.scene.add(this.obstacle)

        // Create bounding box
        this.boundingBox = new Box3().setFromObject(this.obstacle)
    }

    update(delta: number) {
        if (!this.obstacle || !this.boundingBox)
            return

        // Move obstacle
        this.obstacle.position.z += this.speed * delta

        // Update bounding box position
        this.boundingBox.setFromCenterAndSize(
            this.obstacle.position,
            this.boundingBox.getSize(new Vector3())
        )

        // Check collision with player
        if (this.player.boundingBox && this.boundingBox.intersectsBox(this.player.boundingBox)) {
            AudioManager.getInstance().playOneShot("collided")
            this.player.destroy()
            StateManager.getInstance().setState("resultMenu")
        }
    }

    destroy() {
        if (!this.obstacle || !this.boundingBox)
            return

        // Clear main reference beforehand
        const o = this.obstacle
        this.obstacle = null
        this.boundingBox = null // Can be freed by directly setting it to null

        // Clear out geometry and material
        o.geometry.dispose()

        if (Array.isArray(o.material)) {
            o.material.forEach(m => m.dispose())
        }
        else {
            o.material.dispose()
        }

        // Remove from scene
        this.scene.remove(o)
    }
}