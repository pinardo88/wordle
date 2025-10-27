import { useState, useEffect } from 'react'
import './App.css'

// get and set random winning word

const randomWords = ['thank', 'house', 'beach', 'sound', 'golfs',
                     'tower', 'plane', 'plain', 'bagel', 'mouse',
                     'eight', 'smile', 'swing', 'rules', 'elope',
                     'sands', 'stand', 'think', 'meant', 'choir',
                     'flown', 'smack', 'plank', 'steep', 'church',
                     'throw', 'sleep', 'hinge', 'spell', 'fleet']

function pickRandomWord() {
  let randomWord = randomWords[Math.floor(Math.random()*30)];
  let randomWordArr = randomWord.split('');
  console.log("winning word: " + randomWord);
  return randomWordArr;
}

let firstRandomWord = pickRandomWord();


// create Block elements (representing each letter)

function Block({className, bgColor, children}) {

    return(
        <div
            className= {className}
            style= {{
              backgroundColor: bgColor
            }}
        >
            {children}
        </div>
    );
}

// create WordGrid where the guessed words are going to into
let guessGrid = [['','','','',''], ['','','','',''], ['','','','',''],
                 ['','','','',''], ['','','','',''], ['','','','','']];

let colorGrid = guessGrid.map(row => row.map(() => "#FBFAF2"));

// build 3x3 grid with block components
function WordGrid({board, colorBoard}) {
  return(
    <div className = "entireGuessBoard">
     {board.map((row, x) => (
        <div className= "eachBoardRow" key={x}>
          {row.map((obj, y) => (
                                  <Block 
                                    key={y}
                                    className = "guessGrid"
                                    bgColor = {colorBoard[x][y]}
                                  >
                                    {obj}
                                  </Block>
          ))}
        </div>
     ))}
    </div>
  )
}

// create keyboard below input
const keyboardLetters = [['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
                         ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
                         ['z', 'x', 'c', 'v', 'b', 'n', 'm']]

let keyboardColorGrid = keyboardLetters.map(row => row.map(() => "#DBDBDB"));

function Keyboard({keyboardColors}) {
  return(
    <div>
      {keyboardLetters.map((obj, x) => <div className= "KeyboardRow">
                                            {obj.map((eachItem, y) => 
                                                <Block 
                                                bgColor= {keyboardColors[x][y]}
                                                className = "keyboardBlocks"
                                                >
                                                {eachItem}
                                                </Block>)}
                                        </div>
                            )}
    </div>
  )
}

// game logic
async function isWord(guessedWord){

  try {
      const response = await fetch('https://api.dictionaryapi.dev/api/v2/entries/en/'+guessedWord);
      if (!response.ok) {
        alert("Not in word list. Try again.")
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log("valid word");
      return true;
  } catch (error) {
      console.error('Fetch error with async/await:', error);
      return false;
  }
}


function App() {
  // state to remember input from input box
  let [ifInputBoxUsed, setifInputBoxUsed] = useState(false);
  let [inputBoxAnswer, setInputBoxAnswer] = useState('');

  // states for the boards
  let [board, setBoard] = useState(guessGrid);
  let [colorBoard, setColorBoard] = useState(colorGrid);
  let [colorKeyboardBoard, setcolorKeyboardBoard] = useState(keyboardColorGrid);

  // states for location in the board
  let [thisCol, setThisCol] = useState(0);
  let [thisRow, setThisRow] = useState(0);

  // state for win/lose condition
  let [winState, setWinState] = useState(false);
  let [gameOver, setGameOver] = useState(false);
  let [winAnswer, setWinAnswer] = useState(firstRandomWord);

  // functions
  const changeKeyboardColors = (letter, color) => {
      setcolorKeyboardBoard((prev) => {
      const newGrid = prev.map(row => row.slice());
        for (let x = 0; x<keyboardLetters.length; x++) {
          for (let y = 0; y<keyboardLetters[x].length; y++) {
          if(newGrid[x][y] != 'green' && keyboardLetters[x][y] == letter){
              newGrid[x][y] = color;
          }
        }
      }
      return newGrid;
    })
  }

  const checkAnswer = async (userGuess) => {

    let thisGuess = userGuess;

      // Check if you've won:
      // not sure if this is the best way, but I couldn't compare the two bc
      // they're essentially different strings
      if(thisGuess.join('') === winAnswer.join('')){
        alert("That's it, you've got it!")
        setWinState(true);
        setGameOver(true);
      }

      // if valid word, check if letter is in the word
      if (await isWord(thisGuess.join(''))){
        // console.log("valid word!")
        let newColorRow = thisGuess.map((letter, i) => {
                                          if (winAnswer[i] === letter) {
                                            changeKeyboardColors(letter, 'green');
                                            return 'green';
                                          } else if (winAnswer.includes(letter)) {
                                            changeKeyboardColors(letter, 'yellow');
                                            return 'yellow';
                                          } else {
                                            changeKeyboardColors(letter, 'grey');
                                            return 'grey';
                                          }
                                      })
        setColorBoard((prev) => {
          const newGrid = prev.map(row => row.slice());
          newGrid[thisRow] = newColorRow;
          return newGrid;
        })

        // update rows and columns
        setThisRow(thisRow + 1);
        setThisCol(0);

        // losing condition
        if (thisRow == 5) {
          alert("The answer was: " + winAnswer.join(""));
          setGameOver(true);
        }
      }
  }

  const restartGame = () => {
    if(winState) {
      setWinAnswer(pickRandomWord());
    }
    setBoard(guessGrid);
    setColorBoard(colorGrid);
    setcolorKeyboardBoard(keyboardColorGrid)
    setThisCol(0);
    setThisRow(0);
    setWinState(false);
    setGameOver(false);
    setInputBoxAnswer('');
    setifInputBoxUsed(false);
  }

  useEffect(() => {
    async function onKeyDown(e){
      if(winState) {
        return;
      }
      if (!ifInputBoxUsed){
        if (/^[a-z]$/.test(e.key)) {
          if (thisCol < 5) {
            setBoard((prev)=> {
              const newGrid = prev.map(row => row.slice());
              newGrid[thisRow][thisCol] = e.key;
              return newGrid;
            });
            setThisCol(thisCol + 1);
          }
        } else if (thisCol == 5 && e.key === 'Enter') {
            checkAnswer(board[thisRow]);
        } else if (e.key === 'Backspace'){
          if(thisCol > 0) {
            setBoard((prev)=> {
              const newGrid = prev.map(row => row.slice());
              newGrid[thisRow][thisCol-1] = '';
              return newGrid;
            });
            setThisCol(thisCol - 1);
          }
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  })

  const doOnSubmit = async (e) => {
    e.preventDefault();
    if (gameOver || winState) return;
    if (inputBoxAnswer.length != 5) {
      alert("5 letter word needed, try another word")
      return;
    }
    // console.log("inputBoxAnswer: " + inputBoxAnswer)
    // console.log("board[thisRow]: " + board[thisRow])

    setBoard((prev)=> {
      const newGrid = prev.map(row => row.slice());
      for (let i = 0; i < inputBoxAnswer.length; i++){
        newGrid[thisRow][i] = inputBoxAnswer[i];
      }
      return newGrid;
    });

      await checkAnswer(inputBoxAnswer.split(''));
  }

  return (
    <div>
      {gameOver ? (<button className= "restartBtn" onClick={restartGame}>Restart</button>): null}
        <div className= "game">
          {/* <h1 className = "heading">CS120 Wordle</h1> */}
          <WordGrid board= {board} colorBoard={colorBoard} />
          <form className = "inputSpaceNButton" onSubmit= {doOnSubmit}>
            <input className= "inputSpace"
                   onFocus={() => (setifInputBoxUsed(true))}
                   onBlur={(e) => { e.target.value = '';
                                    setifInputBoxUsed(false)}}
                   onChange={(e) => setInputBoxAnswer(e.target.value.trim().toLowerCase())}></input>
            <button className= "submitBtn" type= "submit">Submit</button>
          </form>
          <Keyboard keyboardColors= {colorKeyboardBoard}/>
      </div>
    </div>
  )
}

export default App
