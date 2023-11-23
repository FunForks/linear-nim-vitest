/**
 * GameReducer.test.js
 *
 * The tests play three games:
 * 1. One where the "human" player starts and:
 *    * Takes two tokens before letting the AI play
 *    * Takes three tokens the second time.
 *    * Tries all possible moves the third time.
 *    This game is played out over several tests, each with a
 *    a specific purpose.
 * 2. Another where the AI starts and the "human" player
 *    follows the AI's winning algorithm... and the "human"
 *    player wins.
 * 3. A third game where the "human" player starts and tries
 *    all possible permutations of moves... and loses
 *
 * The last two games are played in a single test each. They rely
 * on the fact that all the tests for the first game pass.
 */

import { describe, test, expect } from 'vitest';
import { initialState, reducer } from './GameReducer.jsx'


describe('GameReducer should', () => {
  // Define standard action
  const SWITCH_TO_AI = {
    type: "SET_PLAYER_TO_HUMAN",
    payload: false
  }

  // Test setting the player at the start
  test(`treat initial player as human`, () => {
    expect(initialState.playerIsHuman).toBe(true)
  })

  let alteredState // updates as the game is played

  test(`set player to  AI and adjust canTake and topMove`, () => {
    const expectedState = {
      ...initialState,
      playerIsHuman: false,
      canTake: 1,
      topMove: 1,
      feedback: " You let the AI play first."
    }

    alteredState = reducer( initialState, SWITCH_TO_AI )
    expect(alteredState).toStrictEqual(expectedState)
  })


  test(`set player back to human`, () => {
    const switchToHuman = {
      type: "SET_PLAYER_TO_HUMAN",
      payload: true
    }

    const expectedState = {
      ...initialState,
      topMove: 3,
      feedback: " It's your turn now. You can take up to 3 tokens."
    }

    alteredState = reducer( alteredState, switchToHuman )
    expect(alteredState).toStrictEqual(expectedState)
  });


  // Play a game where the human will lose //

  test(`allow human to take a token`, () => {
    const action = {
      type: "TAKE_TOKEN",
      payload: alteredState
    }
    const expectedState = {
      ...initialState,
      tokensLeft: 11,
      canTake: 2,
      topMove: 3,
      feedback: "You can take up to 2 more tokens or let the AI play."
    }

    alteredState = reducer( alteredState, action )
    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`allow human to take a second token`, () => {
    const action = {
      type: "TAKE_TOKEN",
      payload: alteredState
    }

    const expectedState = {
      ...initialState,
      tokensLeft: 10,
      canTake: 1,
      topMove: 3,
      feedback: "You can take 1 more token or let the AI play."
    }

    alteredState = reducer( alteredState, action )
    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`switch to AI and calculate best topMove when asked`, () => {
    const expectedState = {
      ...alteredState,
      tokensLeft: 10,
      canTake: 2,
      topMove: 2,
      playerIsHuman: false,
      feedback: " Now it's the AI's turn to play."
    }

    alteredState = reducer( alteredState, SWITCH_TO_AI )
    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`take a token as AI`, () => {
    const action = {
      type: "TAKE_TOKEN",
      payload: alteredState
    }

    const expectedState = {
      ...alteredState,
      tokensLeft: 9,
      canTake: 1,
      topMove: 2,
      feedback: "The AI took a first token."
    }

    alteredState = reducer( alteredState, action )
    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`switch back to human automatically when AI move is over`, () => {
    const action = {
      type: "TAKE_TOKEN",
      payload: alteredState
    }

    const expectedState = {
      ...alteredState,
      tokensLeft: 8,
      canTake: 3,
      topMove: 3,
      playerIsHuman: true,
     feedback:  "The AI took a second token. It's your turn now. You can take up to 3 tokens."
    }

    alteredState = reducer( alteredState, action )
    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`switch to AI automatically after human has moved 3 times`, () => {

    for ( let ii = 0; ii < 3; ii += 1 ) {
      const action = {
        type: "TAKE_TOKEN",
        payload: alteredState
      }

      alteredState = reducer( alteredState, action )
    }

    const expectedState = {
      ...alteredState,
      tokensLeft: 5,
      canTake: 1,
      topMove: 1,
      playerIsHuman: false
    }

    expect(alteredState).toStrictEqual(expectedState)
  });


  test(`ignore switch to AI if AI is already the player`, () => {
    const switchedState = reducer( alteredState, SWITCH_TO_AI )

    expect(switchedState).toBe(alteredState)
  });


  test(`make AI take only one token when 5 tokensLeft`, () => {
    let counter = 0

    while (!alteredState.playerIsHuman) {
      const action = {
        type: "TAKE_TOKEN",
        payload: alteredState
      }

      alteredState = reducer( alteredState, action )
      counter += 1
    }

    expect(counter).toBe(1)
  });


  test(`ensure humans can't win if they start first`, () => {
    const finalHumanStartingState = { ...alteredState }

    const tokensToTake = Array.from(
      { length: alteredState.canTake }, (_, index) => index + 1
    )

    const winningState = {
      tokensLeft: 0,
      canTake: 0,
      topMove: 0, // will depend on number of tokens taken by human
      playerIsHuman: false,
      feedback: "The AI took the last token. The AI wins.",
      winner: false
    }

    tokensToTake.forEach( tokens => {
      alteredState = { ...finalHumanStartingState }

      // Final topMove depends on the value of tokens
      winningState.topMove = 4 - tokens
      // console.log(`When there are ${alteredState.tokensLeft} tokens left, if you take ${tokens} token${tokens-1 ? "s" : ""}...`)

      // Human plays the given number of times...
      while (tokens--) {
        const action = {
          type: "TAKE_TOKEN",
          payload: alteredState
        }

        alteredState = reducer( alteredState, action )
      }

      // ... then we make sure it's AI's turn
      const SWITCH_TO_AI = {
        type: "SET_PLAYER_TO_HUMAN",
        payload: false
      }

      alteredState = reducer( alteredState, SWITCH_TO_AI)

      // AI plays
      while ( !alteredState.playerIsHuman
           && alteredState.winner === undefined
      ) {
        const action = {
          type: "TAKE_TOKEN",
          payload: alteredState
        }
        alteredState = reducer( alteredState, action )
      }

      // console.log(`... you ${alteredState.winner ? "DO" : "can't"} win.`)

      expect(alteredState).toStrictEqual(winningState)
    })
  })


  test(`lose to human if human plays perfectly`, () => {
    alteredState = { ...initialState }

    // Get AI to start
    alteredState = reducer( alteredState, SWITCH_TO_AI )
    // console.log("AI to play:", alteredState);
    // {
    //   tokensLeft: 12,
    //   canTake: 1,
    //   topMove: 1,
    //   playerIsHuman: false,
    //   winner: undefined
    // }

    while(alteredState.winner === undefined) {
      // Make AI play as it wishes
      while ( !alteredState.playerIsHuman
            && alteredState.winner === undefined
      ) {
        const action = {
          type: "TAKE_TOKEN",
          payload: alteredState
        }
        alteredState = reducer( alteredState, action )
      }
      // console.log("AI completes move:", alteredState);
      // {
      //   tokensLeft: 11,
      //   canTake: 3,
      //   topMove: 0,
      //   playerIsHuman: true,
      //   winner: undefined
      // }

      let moves = (alteredState.tokensLeft % 4) || 1
      while ( moves-- && alteredState.playerIsHuman
            && alteredState.winner === undefined
      ) {
        const action = {
          type: "TAKE_TOKEN",
          payload: alteredState
        }
        alteredState = reducer( alteredState, action )
      }
      // console.log("human completes move:", alteredState);
      // {
      //   tokensLeft: 8,
      //   canTake: 1,
      //   topMove: 1,
      //   playerIsHuman: false,
      //   winner: undefined
      // }
    }

    // console.log("human is winner:", alteredState);
    // {
    //   tokensLeft: 0,
    //   canTake: 0,
    //   topMove: 0,
    //   playerIsHuman: true,
    //   winner: true
    // }

    expect(alteredState.winner).toBe(true)
  });


  test(`do nothing if the game is over`, () => {
    // Truthy winner
    let state = { ...initialState, winner: "game over" }
    const action = {
      type: "TAKE_TOKEN",
      payload: alteredState
    }

    expect(reducer( state, action )).toBe(state)
    expect(reducer( state, SWITCH_TO_AI )).toBe(state)

    // winner === true; state is arbitrary
    state = { winner: true, we: "are the champions" }
    expect(reducer( state, action )).toBe(state)
    expect(reducer( state, SWITCH_TO_AI )).toBe(state)

    // winner === false; state is arbitrary
    state = { winner: false, whatever: "whatever" }
    expect(reducer( state, action )).toBe(state)
    expect(reducer( state, SWITCH_TO_AI )).toBe(state)
  });


  test(`win every time if the human plays first`, () => {
    // Create an array of all the possible human moves
    const permutations = Array.from({length: 27}, (_, ii) => {
      const a = (ii % 3)
      const b = (ii - a) / 3 % 3
      const c = ((ii - a - b * 3) / 9) % 3
      return [a + 1, b + 1, c + 1]
    })
    // console.log("permutations:", permutations);
    // [
    //   [ 1, 1, 1 ], [ 2, 1, 1 ], [ 3, 1, 1 ],
    //   [ 1, 2, 1 ], [ 2, 2, 1 ], [ 3, 2, 1 ],
    //   [ 1, 3, 1 ], [ 2, 3, 1 ], [ 3, 3, 1 ],
    //   [ 1, 1, 2 ], [ 2, 1, 2 ], [ 3, 1, 2 ],
    //   [ 1, 2, 2 ], [ 2, 2, 2 ], [ 3, 2, 2 ],
    //   [ 1, 3, 2 ], [ 2, 3, 2 ], [ 3, 3, 2 ],
    //   [ 1, 1, 3 ], [ 2, 1, 3 ], [ 3, 1, 3 ],
    //   [ 1, 2, 3 ], [ 2, 2, 3 ], [ 3, 2, 3 ],
    //   [ 1, 3, 3 ], [ 2, 3, 3 ], [ 3, 3, 3 ]
    // ]

    const aiWinsEveryTime = permutations.every( moves => {
      alteredState = { ...initialState }

      while (alteredState.winner === undefined) {
        // Play the human's moves
        moves.forEach( move => {
          while ( move-- && alteredState.playerIsHuman) {
            const action = {
              type: "TAKE_TOKEN",
              payload: alteredState
            }
            alteredState = reducer( alteredState, action )
          }
        })

        // It's just possible that the human player might be the
        // winner, but in that case no AI moves would be played,
        // and switching the player to the AI would have no effect.

        // Switch to AI
        alteredState = reducer(alteredState, SWITCH_TO_AI)

        // Play the AI's moves until the AI wins or passes the
        // turn back to the human
        while ( !alteredState.playerIsHuman
              && alteredState.winner === undefined
        ) {
          const action = {
            type: "TAKE_TOKEN",
            payload: alteredState
          }
          alteredState = reducer( alteredState, action )
        }
      }

      // We will get here as soon as alteredState.winner is
      // set to a boolean
      return alteredState.winner === false
    })

    expect(aiWinsEveryTime).toBe(true)
  });
});