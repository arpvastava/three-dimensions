import type { Scene } from "three";
import type { Player } from "./Player";
import { Obstacle } from "./Obstacle";

const INTERVAL = 1 // seconds

export class ObstaclesManager {
    scene: Scene
    player: Player

    obstacles: Obstacle[] = []
    lastObPos: number = 0
    offset: number = 2
    currentInterval: number = INTERVAL 

    constructor(scene: Scene, player: Player) {
        this.scene = scene
        this.player = player
    }

    setup() {
        this.reset()
    }

    update(delta: number) {
        // Carry out obstacles spawn
        this.currentInterval -= delta

        if (this.currentInterval <= 0) {
            this.currentInterval = INTERVAL

            // Have two obstacles in a row
            this.spawnNextObstacle()
            this.spawnNextObstacle()
        }

        // Carry out existing obstacles movement
        this.obstacles = this.obstacles.filter(ob => {
            ob.update(delta)

            // Remove obstacle if its past the player and screen
            if (ob.obstacle!.position.z > 10) {
                ob.destroy()
                return false
            }

            return true
        })
    }

    destroy() {
        this.reset()
    }

    private spawnNextObstacle() {
        let newPos: number = 0

        if (this.lastObPos === 0) {
            newPos = Math.random() > 0.5 ? -this.offset : this.offset
        }
        else if (this.lastObPos === -this.offset) {
            newPos = Math.random() > 0.5 ? 0 : this.offset
        }
        else if (this.lastObPos === this.offset) {
            newPos = Math.random() > 0.5 ? 0 : -this.offset
        }

        this.lastObPos = newPos

        // Create obstacle
        const obstacle = new Obstacle(this.scene)
        obstacle.setup(newPos)

        // Add to obstacles list
        this.obstacles.push(obstacle)
    }

    private reset() {
        this.currentInterval = INTERVAL

        this.obstacles.forEach(ob => ob.destroy())
        this.obstacles = []
    }
}