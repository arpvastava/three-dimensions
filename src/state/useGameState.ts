import { useEffect, useSyncExternalStore } from "react";
import { StateManager } from "./StateManager";


export function useGameState() {
    const manager = StateManager.getInstance()

    const subscribe = (callback: () => void) => {
        manager.on("stateChange", callback)
        return () => manager.off("stateChange", callback)
    }

    const getSnapshot = () => manager.getState()

    return useSyncExternalStore(subscribe, getSnapshot)
}

export function useGameScore() {
    const manager = StateManager.getInstance()

    const subscribe = (callback: () => void) => {
        manager.on("scoreChange", callback)
        return () => manager.off("scoreChange", callback)
    }

    const getSnapshot = () => manager.getScore()

    return useSyncExternalStore(subscribe, getSnapshot)
}

export function useGameHighscore() {
    const manager = StateManager.getInstance()

    const subscribe = (callback: () => void) => {
        manager.on("highscoreChange", callback)
        return () => manager.off("highscoreChange", callback)
    }

    const getSnapshot = () => manager.getHighscore()

    return useSyncExternalStore(subscribe, getSnapshot)
}

export function useGameControls() {
    const manager = StateManager.getInstance()

    return {
        startGame: () => {
            manager.reset()
            manager.setState("playing")
        },
        pauseGame: () => manager.setState("paused"),
        resumeGame: () => manager.setState("playing"),
        endGame: () => manager.setState("resultMenu"),
        returnToStartMenu: () => manager.setState("startMenu")
    }
}

// Hook to listen for specific game events
export function useGameEvent<K extends "stateChange" | "highscoreChange">(
    event: K,
    callback: () => void
) {
    const manager = StateManager.getInstance()

    useEffect(() => {
        manager.on(event, callback)
        return () => manager.off(event, callback)

    }, [event, callback])
}