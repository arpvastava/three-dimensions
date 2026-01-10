import './App.css'
import { useEffect, useRef } from 'react'
import { Game } from './dom/Game'
import { useGameControls, useGameState } from './state'
import { useGameScore } from './state/useGameState'

function App() {
    const gameRef = useRef<Game | null>(null)
    const gameContainerRef = useRef<HTMLDivElement>(null)

    const state = useGameState()
    const score = useGameScore()
    const scoreDisplay = Math.floor(score)
    const { startGame } = useGameControls()

    // Create game instance
    useEffect(() => {
        const game = new Game(gameContainerRef.current!)
        gameRef.current = game
        game.setup()
        game.loop()

        return () => {
            game.destroy()
            gameRef.current = null
        }

    }, [])

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

            <div className="ui">
                {state === "startMenu" && (
                    <div className="main-menu">
                        <button className="action-btn" onClick={startGame}>Start</button>
                    </div>
                )}

                {state === "playing" && (
                    <div className="playing">
                        <p className="score">{scoreDisplay}</p>
                    </div>
                )}

                {state === "resultMenu" && (
                    <div className="result-menu">
                        <button className="action-btn" onClick={startGame}>Restart</button>
                        <p className="score">{scoreDisplay}</p>
                    </div>
                )}
            </div>
        </>
    )
}

export default App
