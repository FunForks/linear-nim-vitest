/**
 * GameReducer.jsx
 *
 * Use useReducer when:
 * + The next state depends on the previous state
 * + The state is complex
 * + You want to keep business logic:
 *   + as a pure function
 *   + in a separate module
 * + You want to be able to test easily
 *
 * This reducer accepts three different action types:
 * 1. NEW_GAME
 * 2. SET_PLAYER_TO_HUMAN
 * 1. TAKE_TOKEN
 */



// Strings for feedback must be defined before getFeedback() is
// called
const STRINGS = {
  start: "Start the game. Take a token or let the AI play first.",
  aiStarts: "You let the AI play first.",
  aiTurn: "Now it's the AI's turn to play.",
  justOne: "The AI took just one token.",
  nthToken: "The AI took a %s token.",
  yourTurn: "It's your turn now. ",
  canTake: "You can take%s %s%s %s%s",
  stop: ".",
  letAIPlay :" or let the AI play.",
  youWin: "You took the last token. You win!",
  aiWins: "The AI took the last token. The AI wins.",
  ordinals: [ "first", "second", "third" ],
}

// Define house rules
const STARTING_TOTAL = 12
const MAX_TAKEN = 3


const initialState = {
  // Initialize according to house rules
  tokensLeft: STARTING_TOTAL,
  canTake: MAX_TAKEN,

  // We assume the human player will call takeToken first
  playerIsHuman: true,
  feedback: STRINGS.start,

  // // The following values will be set later
  // topMove: undefined,
  // winner: undefined
}


const reducer = ( state, action) => {
  const { type, payload } = action

  if (type == "NEW_GAME") {
    return initialState
  }

  if (state.winner !== undefined) {
    return state // Can't play after the game is over
  }

  switch (type) {
    case "SET_PLAYER_TO_HUMAN":
      return setPlayerToHuman(state, payload) // true or false

    case "TAKE_TOKEN":
      return takeToken(state, payload)

    default: // Should never happen
      return {...state}
  }
}


/**
 * setPlayerToHuman
 * Ensures that state.playerIsHuman is the given value. If the
 * value of state.playerIsHuman changes, the values for canTake
 * and topMove will be recalculated for the new player.
 *
 * @param {object} state { tokensLeft    : <integer <= 12>,,
 *                         canTake       : <1|2|3>,
 *                         playerIsHuman : <boolean>,
 *                         feedback      : <string>,
 *                         topMove       : <undefined|1|2|3>,
 *                         winner        : <undefined|boolean>
 *                       }
 * @param {boolean}   playerIsHuman
 * @param {autoSwitg} boolean: true if the AI has just passed
 *                    the turn to the human player
 *
 * @returns {object} updated clone of state. playerIsHuman will
 * be the given value. The values for canTake and topMove may also
 * change.
 */
function setPlayerToHuman( state, playerIsHuman, autoSwitch ) {
  if (playerIsHuman === state.playerIsHuman) {
    return state
  }

  // If the AI has just finished, first show its final move
  // (we'll add a prompt for the human player after it)
  const feedback = autoSwitch ? getFeedback(state) : ""

  // Assume playerIsHuman
  let canTake = Math.min(MAX_TAKEN, state.tokensLeft)
  let topMove = canTake

  if (!playerIsHuman) {
    // Calculate the AI's best (legal) move
    topMove = (state.tokensLeft % (MAX_TAKEN + 1)) || 1
    // To simplify the calculation of when to swap turns, make
    // canTake the same as the number that the AI will take
    canTake = topMove
  }

  // We might already have feedback about the AI's last move.
  // If so, show it before the feedback for the current state.
  state = { ...state, playerIsHuman, canTake, topMove }
  state.feedback = feedback + " " + getFeedback(state)

  return state
}



/**
 * takeToken
 * Reduces the number of tokensLeft by 1.
 * Checks if the current player can choose to take another token.
 * If not, passes the turn to the other player
 *
 * @param {object} state { tokensLeft    : <integer <= 12>,,
 *                         canTake       : <1|2|3>,
 *                         playerIsHuman : <boolean>,
 *                         feedback      : <string>,
 *                         topMove       : <undefined|1|2|3>,
 *                         winner        : <undefined|boolean>
 *                       }
 * @returns {object} updated clone of state. All values except
 * topMove might change.
 */
function takeToken( state, { tokensLeft, canTake } ) {
  tokensLeft -= 1
  canTake -= 1
  state = { ...state, tokensLeft, canTake }

  if (!canTake) {
    if (tokensLeft) {
      // Pass the turn to the other player
      const playerIsHuman = !state.playerIsHuman
      return setPlayerToHuman( state, playerIsHuman, playerIsHuman )

    } else {
      state.winner = state.playerIsHuman
    }
  }

  state = { ...state, canTake, tokensLeft }
  state.feedback = getFeedback(state)

  return state
}


// Generating custom strings //

function getFeedback(state) {
  if (!state) {
    return STRINGS.start
  }

  const {
    tokensLeft,
    canTake,
    playerIsHuman,
    topMove,
    winner,
  } = state

  let string

  if (playerIsHuman) {
    if (winner) {
      return STRINGS.youWin
    }

    // Say "It's your turn now" only if human's turn has only just
    // started (in which case canTake _will_ be 3)
    string = canTake === 3 ? STRINGS.yourTurn : ""

    // Don't say "_up to_ n tokens" if you can take only one
    let upto = ( canTake === 1 )
      ? ""
      : " up to"
    // Don't say "n tokens _more_" if you haven't taken any yet
    let more = (canTake === topMove)
      ? ""
      : " more"
    // Don't say "or let the AI play" before you take a first token
    let stop = (canTake === 3)
      ? "."
      : STRINGS.letAIPlay
    // Add an "s" only in the plural
    let tokens = (canTake > 1) ? "tokens" : "token"

    const options = [
      upto,
      canTake,
      more,
      tokens,
      stop
    ]
    string += replace(STRINGS.canTake, options)

  } else {
    // Player is AI
    if (winner === false) {
      string = STRINGS.aiWins

    } else if (tokensLeft === 12) {
      string = STRINGS.aiStarts

    } else if (canTake === topMove) { // AI has not taken yet
        //"Now it's the AI's turn to play.
        string = STRINGS.aiTurn

    } else if (topMove === 1) { // AI planned to take only one
      // The AI took just one token.
      string = STRINGS.justOne

    } else {
      // The AI takes a nth token
      const nth = STRINGS.ordinals[topMove - canTake - 1]
      string = replace(STRINGS.nthToken, [ nth ])
    }
  }

  return string
}


/**
 * replace() replaces each occurrence of %s in a string with the
 * string at the appropriate place in the options array
 *
 * @param {string}   string containing 0 or more occurrences of %s
 * @param {string[]} options: an array which contains as many
 *                   string entries as <string> contains %s
 * @returns {string}
 */
function replace(string, options) {
  while( options.length ) {
    const option = options.shift()
    string = string.replace("%s", option)
  }

  return string
}



export { initialState, reducer }