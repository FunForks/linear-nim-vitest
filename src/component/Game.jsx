/**
 * Game.jsx
 */

import { useContext, useEffect } from 'react'
import { GameContext } from '../context/GameContext'



export const Game = (props) => {
  const { state, dispatch } = useContext(GameContext)
  const {
    tokensLeft,
    canTake,
    playerIsHuman,
    feedback,
    winner
  } = state



  const takeToken = () => {
    const action = {
      type: "TAKE_TOKEN",
      payload: { tokensLeft, canTake }
    }
    dispatch(action)
  }


  const switchToAI = () => {
    dispatch({ type: "SET_PLAYER_TO_HUMAN", payload: false })
  }


  const playAIMove = () => {
    if (!playerIsHuman) {
      setTimeout(takeToken, 1000)
    }
  }


  const playAgain = () => {
    dispatch({ type: "NEW_GAME" })
  }


  useEffect(playAIMove)


  const cantSwitch = tokensLeft < 12
                  && ( !playerIsHuman
                     || canTake === 3
                     )

  return (
    <>
      <p>
          Tokens left: <span id="tokens-left">{tokensLeft}</span>
      </p>

      <button
        onClick={takeToken}
        disabled={!playerIsHuman}
      >
        Take a token
      </button>
      <button
        onClick={switchToAI}
        disabled={cantSwitch}
      >
        Let the AI play
      </button>

      <p
        id="feedback"
      >{feedback}</p>


      <button
        className={winner === undefined ? "hidden" : ""}
        onClick={playAgain}
      >
        Play Again
      </button>

    </>
  )
}