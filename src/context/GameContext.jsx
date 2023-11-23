/**
 * GameContext.jsx
 * description
 */

import React, { createContext, useReducer } from 'react'
import { initialState, reducer } from '../reducer/GameReducer.jsx'

export const GameContext = createContext()

export const GameProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <GameContext.Provider
      value ={{
        state,
        dispatch
      }}
    >
      {children}
    </GameContext.Provider>
  )
}