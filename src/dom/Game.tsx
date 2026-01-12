import { AmbientLight, DirectionalLight, FogExp2, PerspectiveCamera, Scene, WebGLRenderer } from "three"
import { Player } from "./classes/Player"
import { Ground } from "./classes/Ground"
import { ObstaclesManager } from "./classes/ObstaclesManager"
import { StateManager } from "../state"
import type { GameState } from "../state/StateManager"
import { AudioManager } from "./AssetManagers/AudioManager"
import { TextureManager } from "./AssetManagers/TextureManager"

export class Game {
    private stateManager: StateManager
    private audioManager: AudioManager
    private textureManager: TextureManager
    private isDestroyed: boolean = false

    private container: HTMLDivElement
    private width: number
    private height: number
    private scene: Scene
    private camera: PerspectiveCamera
    private renderer: WebGLRenderer

    private lastTime: number = 0
    private player: Player | null = null
    private ground: Ground | null = null
    private obstaclesManager: ObstaclesManager | null = null

    constructor(container: HTMLDivElement) {
        this.container = container

        // Setup managers
        this.stateManager = StateManager.getInstance()
        this.audioManager = AudioManager.getInstance()
        this.textureManager = TextureManager.getInstance()

        // Set width and height
        this.width = window.innerWidth
        this.height = window.innerHeight

        // Create camera
        this.camera = new PerspectiveCamera(
            60,
            this.width / this.height,
            0.1,
            1000
        )

        // Create scene
        this.scene = new Scene()

        // Create renderer
        this.renderer = new WebGLRenderer()
        this.renderer.setSize(this.width, this.height)
        this.container.appendChild(this.renderer.domElement)

        // Listen for events
        window.addEventListener("resize", this.handleScreenResize)
        document.addEventListener("visibilitychange", this.handleVisibilityChange)
    }

    private handleScreenResize = () => {
        this.width = window.innerWidth
        this.height = window.innerHeight

        // Update camera
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

        // Update renderer
        this.renderer.setSize(this.width, this.height)
        this.renderer.render(this.scene, this.camera)

        // Adjust camera position as per current screen size
        this.handleCameraPosition()
    }

    private handleVisibilityChange = () => {
        if (document.hidden && this.stateManager.getState() === "playing") {
            this.stateManager.setState("paused")
        }
    }

    private setupEnvironment() {
        const ambientLight = new AmbientLight("white", 0.5)
        this.scene.add(ambientLight)

        const dirLight = new DirectionalLight("white", 1)
        dirLight.position.set(0, 10, 0)
        this.scene.add(dirLight)

        this.scene.fog = new FogExp2("#111111", 0.06)
        this.renderer.setClearColor(this.scene.fog.color)
    }

    async setup() {
        // Setup environment
        this.setupEnvironment()

        // Set camera position
        this.handleCameraPosition()

        // Load assets
        await this.audioManager.setup(this.camera)
        if (this.isDestroyed) return

        await this.textureManager.setup()
        if (this.isDestroyed) return

        this.stateManager.setState("startMenu")

        // Create ground
        this.ground = new Ground(this.scene)
        this.ground.setup()

        // Create player
        this.player = new Player(this.scene)
        this.player.setup()

        // Create obstacles manager
        this.obstaclesManager = new ObstaclesManager(this.scene, this.player)
        this.obstaclesManager.setup()

        // Render
        this.renderer.render(this.scene, this.camera)

        // Events handling
        this.stateManager.on("stateChange", this.onStateChange)
    }

    loop() {
        this.renderer.setAnimationLoop((time: DOMHighResTimeStamp) => {
            // Set delta time
            const delta = (time - this.lastTime) / 1000
            this.lastTime = time

            // Main Loop
            if (this.stateManager.getState() !== "paused") {
                this.ground?.update(delta)

                if (this.stateManager.getState() === "playing") {
                    this.obstaclesManager?.update(delta)

                    // Update score
                    this.stateManager.setScore(
                        this.stateManager.getScore() + (1 * delta)
                    )
                }

                this.player?.update(delta)
            }

            // Render
            this.renderer.render(this.scene, this.camera)
        })
    }

    destroy() {
        this.isDestroyed = true

        // Remove event listeners
        this.stateManager.off("stateChange", this.onStateChange)
        window.removeEventListener("resize", this.handleScreenResize)
        document.removeEventListener("visibilitychange", this.handleVisibilityChange)

        // Remove game objects
        this.ground?.destroy()
        this.obstaclesManager?.destroy()
        this.player?.destroy()

        // Remove scene and camera
        this.scene.clear()
        this.camera.clear()

        // Disable and remove renderer
        this.renderer.dispose()
        this.container.removeChild(this.renderer.domElement)
    }

    // Event handling methods
    private onStateChange = (state: GameState) => {
        if (state === "playing" && this.player && this.player.isActive === false) {
            this.player.setup()
        }
    }

    // Other methods
    private handleCameraPosition = () => {
        const aspectRatio = this.width / this.height

        // For landscape orientation
        if (aspectRatio >= 1.02) {
            this.camera.position.set(0, 2, 5)
        }
        // For portrait orientation
        else {
            this.camera.position.set(0, 4, 12)
        }
    }
}