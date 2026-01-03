# Tic-Tac-Toe Bolt - Play Disappearing Tic-Tac-Toe vs Perfect AI

A web-based implementation of Tic-Tac-Toe Bolt - a dynamic variant where marks disappear after 6 half-moves. Challenge an unbeatable AI opponent powered by retrograde analysis and game theory. 100% client-side, no server required.

**Play online:** [https://scheveningen361.github.io/tic-tac-toe-bolt-web/](https://scheveningen361.github.io/tic-tac-toe-bolt-web/)

## 🎮 What is Tic-Tac-Toe Bolt?

Tic-Tac-Toe Bolt is a strategic variant of the classic Tic-Tac-Toe game with a unique twist: marks disappear after 6 half-moves (3 full turns). This creates a dynamic gameplay where players must constantly adapt their strategy as marks vanish and reappear. The game features a perfect AI opponent that uses retrograde analysis to ensure optimal play.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Running the Application

**Important**: Due to browser security restrictions (CORS), you cannot open the HTML file directly. You must run a local web server.

### Option 1: Using Python (Recommended)

1. Navigate to the `web` directory:
   ```bash
   cd web
   ```

2. Run the server:
   ```bash
   python server.py
   ```

3. Open your browser and go to:
   ```
   http://localhost:8000
   ```

### Option 2: Using Python's Built-in Server

If you don't have the `server.py` script, you can use Python's built-in HTTP server:

```bash
cd web
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Using Node.js

If you have Node.js installed:

```bash
cd web
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

## Features

- Perfect AI opponent (all game states precomputed)
- Clean, modern interface
- Responsive design (mobile and desktop)
- Player selection screen
- Winning cells highlighting
- Vanishing marks with transparency indicators

## Game Rules

Tic-Tac-Toe Bolt is similar to regular Tic-Tac-Toe, but with a twist:

- Players take turns placing their marks (O or X) on a 3×3 grid
- The goal is to get 3 marks in a row (horizontal, vertical, or diagonal)
- **Special rule:** After placing your 4th mark, your oldest mark disappears
- Each player can have a maximum of 3 marks on the board at any time
- Marks disappear after 6 half-moves (3 full turns)
- This creates a dynamic game where marks constantly vanish and reappear!

## How to Play

1. Start the local web server (see "Running the Application" above)
2. Open `http://localhost:8000` in your web browser
3. Read the game rules on the player selection screen
4. Choose to play as O or X
5. Click on an empty cell to place your mark
6. The AI will automatically make its move after 300ms
7. Win by getting 3 in a row (horizontal, vertical, or diagonal)

## Controls

- **Mouse Click**: Place your mark on an empty cell
- **R**: Reset game and return to player selection

## Technical Details

- **Pure JavaScript (ES6+)** - Modern, fast, and efficient
- **Canvas API** for rendering - Smooth, responsive graphics
- **100% Client-side** - No server required, works offline after initial load
- **Retrograde Analysis** - AI uses backward induction from terminal positions
- **Bellman Equation** - Fixed-point iteration for accurate distance calculation in game graphs with cycles
- **Precomputed Database** - All game states and optimal moves pre-calculated for instant AI responses
- **Game Theory** - Zero-sum game with perfect information, solved using minimax principles

## 🧠 AI Algorithm: Retrograde Analysis

The AI opponent uses **retrograde analysis**, a technique commonly used in chess programming and game theory. Unlike forward-searching algorithms like minimax, retrograde analysis works backwards:

1. **Start from terminal positions** (wins, losses, draws)
2. **Propagate backwards** to determine optimal outcomes for all reachable states
3. **Handle cycles** using Bellman equations with fixed-point iteration
4. **Precompute all positions** - Every possible board state with different vanish counts is analyzed

This ensures the AI is a **perfect player** - it will never lose when a draw or win is possible, and will win as fast as possible when winning is guaranteed.

## 🔍 SEO & Keywords

This project targets keywords including:
- `disappearing tic-tac-toe`
- `vanishing tic-tac-toe`
- `unbeatable ai tic-tac-toe`
- `retrograde analysis`
- `game theory`
- `minimax algorithm`
- `zero-sum game`
- `perfect ai opponent`
- `javascript strategy game`

## Files

- `index.html` - Main HTML file
- `style.css` - Styling
- `game.js` - Game logic and rendering
- `app.js` - Main application logic and event handling
- `game_database.json` - Precomputed game database (all positions and best moves)
- `server.py` - Simple HTTP server for local development

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- Canvas API
- CSS3

