# Linear Nim with React (Vite) #

[Demo](https://funforks.github.io/linear-nim-vitest/)

A React version of the [pure JS Linear Nim game](https://github.com/FunForks/linear-nim) (demoed [here](https://funforks.github.io/linear-nim/)).

This version uses:
* An (unchanging) component for the Rules
* An interactive component for the Game
* A Context (which is not strictly necessary)
* A Reducer to take care of the game logic

It also contains a series of tests, run by Vitest.
Try:
```bash
npm test
```

The output should look something like this:

> react-vitest@0.0.0 test  
> vitest  
>
> DEV  v0.34.6 /Users/james/Documents/DCI/Repos/FunForks/> LinearNim/react+vitest  
>
> ✓ src/reducer/GameReducer.test.js (15)  
>   ✓ GameReducer should (15)  
>     ✓ treat initial player as human  
>     ✓ set player to  AI and adjust canTake and topMove  
>     ✓ set player back to human  
>     ✓ allow human to take a token  
>     ✓ allow human to take a second token  
>     ✓ switch to AI and calculate best topMove when asked  
>     ✓ take a token as AI  
>     ✓ switch back to human automatically when AI move >is over  
>     ✓ switch to AI automatically after human has moved >3 times  
>     ✓ ignore switch to AI if AI is already the player  
>     ✓ make AI take only one token when 5 tokensLeft  
>     ✓ ensure humans can't win if they start first  
>     ✓ lose to human if human plays perfectly  
>     ✓ do nothing if the game is over  
>     ✓ win every time if the human plays first  
>
> Test Files  1 passed (1)  
>      Tests  15 passed (15)  
>   Start at  13:42:42  
>   Duration  214ms (transform 43ms, setup 0ms, collect >33ms, tests 5ms, environment 0ms, prepare 62ms)
>
>
> PASS  Waiting for file changes...  
>       press h to show help, press q to quit