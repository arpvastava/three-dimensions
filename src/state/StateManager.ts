import { AudioManager } from "../dom/Audio/AudioManager"

export type GameState = "startMenu" | "playing" | "paused" | "resultMenu"

type GameEvents = {
    stateChange: GameState
    scoreChange: number
    highscoreChange: number
}

type EventListener<T> = (data: T) => void

export class StateManager {
    private static instance: StateManager | null = null
    private state: GameState = "startMenu"
    private score: number = 0
    private highscore: number = 0
    private isBgmStarted: boolean = false
    private listeners: Map<keyof GameEvents, Set<EventListener<any>>> = new Map()

    constructor() {

    }

    // -------------------------------------------------Event System-------------------------------------------------
    on<K extends keyof GameEvents>(event: K, listener: EventListener<GameEvents[K]>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set())
        }

        this.listeners.get(event)!.add(listener)
    }

    off<K extends keyof GameEvents>(event: K, listener: EventListener<GameEvents[K]>): void {
        const eventListeners = this.listeners.get(event)
        if (eventListeners) {
            eventListeners.delete(listener)
        }
    }

    emit<K extends keyof GameEvents>(event: K, data: GameEvents[K]): void {
        const eventListeners = this.listeners.get(event)
        if (eventListeners) {
            eventListeners.forEach(listener => listener(data))
        }
    }

    reset(): void {

    }

    destroy(): void {
        this.listeners.clear()
    }

    // -------------------------------------------------Methods-------------------------------------------------
    static getInstance(): StateManager {
        if (!StateManager.instance) {
            StateManager.instance = new StateManager()
        }

        return StateManager.instance
    }

    getState(): GameState {
        return this.state
    }

    setState(newState: GameState): void {
        this.state = newState
        this.emit("stateChange", this.state)
    }

    getScore(): number {
        return this.score
    }

    setScore(newScore: number): void {
        this.score = newScore
        this.emit("scoreChange", this.score)

        // Update highscore if score is higher
        if (this.score > this.highscore) {
            this.highscore = this.score
            this.emit("highscoreChange", this.highscore)
        }
    }

    getHighscore(): number {
        return this.highscore
    }

    startBGM() {
        if (this.isBgmStarted)
            return

        AudioManager.getInstance().playLoop("main")
        this.isBgmStarted = true
    }
}