# Tic-Tac-Toe Bolt - Web Version

A web-based implementation of Tic-Tac-Toe Bolt vs AI, 100% client-side.

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

- Pure JavaScript (ES6+)
- Canvas API for rendering
- No server required - 100% client-side
- AI solver uses retrograde analysis with Bellman equation for distance calculation

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

