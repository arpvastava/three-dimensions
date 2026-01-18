import './App.css'
import { useEffect, useRef, useState } from 'react'
import { Game } from './dom/Game'
import { useGameControls, useGameState } from './state'
import { useGameEvent, useGameHighscore, useGameScore } from './state/useGameState'
import { AudioManager } from './dom/AssetManagers/AudioManager'
import { LuLoader } from 'react-icons/lu'
import { PiPause } from 'react-icons/pi'

function App() {
    const gameRef = useRef<Game | null>(null)
    const gameContainerRef = useRef<HTMLDivElement>(null)

    const state = useGameState()
    const score = useGameScore()
    const scoreDisplay = Math.floor(score)
    const highscore = useGameHighscore()
    const highscoreDisplay = Math.floor(highscore)

    const { startGame, pauseGame, resumeGame } = useGameControls()

    // UI refs and states
    const uiRef = useRef<HTMLDivElement>(null)
    const [isNewHighscore, setIsNewHighscore] = useState(false)

    // Create game instance
    useEffect(() => {
        const initGame = async () => {
            const game = new Game(gameContainerRef.current!)
            gameRef.current = game

            await game.setup()
            game.loop()
        }

        initGame()

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy()
                gameRef.current = null
            }
        }

    }, [])

    // Update UI size on screen resize (as CSS is failing for some reason)
    useEffect(() => {
        const refreshUISize = () => {
            const width = window.innerWidth
            const height = window.innerHeight

            const ui = uiRef.current
            if (ui) {
                ui.style.width = `${width}px`
                ui.style.height = `${height}px`
            }
        }

        refreshUISize()

        window.addEventListener("resize", refreshUISize)

        return () => window.removeEventListener("resize", refreshUISize)
    })

    // Listen for game events
    useGameEvent(("stateChange"), () => {
        if (state === "playing") {
            setIsNewHighscore(false)
        }
    })

    useGameEvent(("highscoreChange"), () => {
        setIsNewHighscore(true)
    })

    // React event handlers
    function onStartOrRestart() {
        startGame()
        AudioManager.getInstance().playOneShot("click")
    }

    function onPause() {
        pauseGame()
        AudioManager.getInstance().playOneShot("click")
    }

    function onResume() {
        resumeGame()
        AudioManager.getInstance().playOneShot("click")
    }

    return (
        <>
            <div
                ref={gameContainerRef}
                style={{
                    position: "absolute",
                    top: "0px",
                    left: "0px"
                }}
            />

            <div ref={uiRef} className="ui">
                {state === "loading" && (
                    <div className="loading">
                        <LuLoader />
                    </div>
                )}

                {state === "startMenu" && (
                    <div className="menu">
                        <button className="action-btn" onClick={onStartOrRestart}>Start</button>
                        <p className="highscore">🏆 {highscoreDisplay}</p>
                    </div>
                )}

                {state === "playing" && (
                    <div className="menu">
                        <p className="score">{scoreDisplay}</p>
                        <button className="pause-btn" onClick={onPause}>
                            <PiPause />
                        </button>
                    </div>
                )}

                {state === "paused" && (
                    <div className="menu">
                        <button className="action-btn" onClick={onResume}>Resume</button>
                    </div>
                )}

                {state === "resultMenu" && (
                    <div className="menu">
                        <button className="action-btn" onClick={onStartOrRestart}>Restart</button>
                        {
                            isNewHighscore ?
                                <>
                                    <p className="score-result">🏆 {scoreDisplay}</p>
                                    <p className="highscore-message">New highscore!</p>
                                </>
                                :
                                <p className="score-result">⭐ {scoreDisplay}</p>
                        }
                    </div>
                )}
            </div>
        </>
    )
}

export default App
