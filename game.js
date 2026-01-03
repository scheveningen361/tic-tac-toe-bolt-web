// Vanishing TicTacToe Game - JavaScript implementation

const BOARD_SIZE = 3;
const CELL_SIZE = 200;
const LINE_WIDTH = 5;

// Colors
const COLORS = {
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY: '#808080',
    RED: '#FF0000',
    BLUE: '#0000FF',
    GREEN: '#00FF00',
    LIGHT_BLUE: '#ADD8E6',
    LIGHT_RED: '#FFB6C1'
};

class GameState {
    constructor() {
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.currentPlayer = 'O';  // O starts first
        this.oPositions = [];  // Store O positions in order (max 3)
        this.xPositions = [];  // Store X positions in order (max 3)
        this.oVanishCount = new Map();  // {(row, col): remaining half-moves until vanish}
        this.xVanishCount = new Map();  // {(row, col): remaining half-moves until vanish}
        this.gameOver = false;
        this.winner = null;
        this.winningCells = [];  // List of [row, col] tuples for winning cells
    }

    placeMark(row, col) {
        if (this.board[row][col] !== null) {
            return false;
        }

        // Decrease vanish count for all existing marks
        for (const [pos, count] of this.oVanishCount.entries()) {
            const newCount = count - 1;
            if (newCount <= 0) {
                // This mark should vanish
                const [r, c] = pos.split(',').map(Number);
                const idx = this.oPositions.findIndex(p => p[0] === r && p[1] === c);
                if (idx !== -1) {
                    this.oPositions.splice(idx, 1);
                    this.board[r][c] = null;
                }
                this.oVanishCount.delete(pos);
            } else {
                this.oVanishCount.set(pos, newCount);
            }
        }

        for (const [pos, count] of this.xVanishCount.entries()) {
            const newCount = count - 1;
            if (newCount <= 0) {
                // This mark should vanish
                const [r, c] = pos.split(',').map(Number);
                const idx = this.xPositions.findIndex(p => p[0] === r && p[1] === c);
                if (idx !== -1) {
                    this.xPositions.splice(idx, 1);
                    this.board[r][c] = null;
                }
                this.xVanishCount.delete(pos);
            } else {
                this.xVanishCount.set(pos, newCount);
            }
        }

        if (this.currentPlayer === 'O') {
            // Place O
            if (this.oPositions.length >= 3) {
                // Remove first O
                const [oldRow, oldCol] = this.oPositions.shift();
                this.board[oldRow][oldCol] = null;
                this.oVanishCount.delete(`${oldRow},${oldCol}`);
            }

            this.board[row][col] = 'O';
            this.oPositions.push([row, col]);
            this.oVanishCount.set(`${row},${col}`, 6);  // New mark starts with 6
            this.currentPlayer = 'X';
        } else {
            // Place X
            if (this.xPositions.length >= 3) {
                // Remove first X
                const [oldRow, oldCol] = this.xPositions.shift();
                this.board[oldRow][oldCol] = null;
                this.xVanishCount.delete(`${oldRow},${oldCol}`);
            }

            this.board[row][col] = 'X';
            this.xPositions.push([row, col]);
            this.xVanishCount.set(`${row},${col}`, 6);  // New mark starts with 6
            this.currentPlayer = 'O';
        }

        return true;
    }

    boardToPos(row, col) {
        return row * BOARD_SIZE + col;
    }

    posToBoard(pos) {
        return [Math.floor(pos / BOARD_SIZE), pos % BOARD_SIZE];
    }

    getCurrentState() {
        // Convert GUI state to solver State format
        // Ensure arrays are used (not null) for non-terminal states
        const oQueue = this.oPositions.length > 0 
            ? this.oPositions.map(([r, c]) => this.boardToPos(r, c))
            : [];
        const xQueue = this.xPositions.length > 0
            ? this.xPositions.map(([r, c]) => this.boardToPos(r, c))
            : [];
        const turn = this.currentPlayer;
        return [oQueue, xQueue, turn];
    }

    checkWinner() {
        this.winningCells = [];

        // Check rows
        for (let row = 0; row < BOARD_SIZE; row++) {
            if (this.board[row][0] !== null) {
                if (this.board[row][0] === this.board[row][1] && 
                    this.board[row][1] === this.board[row][2]) {
                    this.winningCells = [[row, 0], [row, 1], [row, 2]];
                    return this.board[row][0];
                }
            }
        }

        // Check columns
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (this.board[0][col] !== null) {
                if (this.board[0][col] === this.board[1][col] && 
                    this.board[1][col] === this.board[2][col]) {
                    this.winningCells = [[0, col], [1, col], [2, col]];
                    return this.board[0][col];
                }
            }
        }

        // Check diagonals
        if (this.board[0][0] !== null) {
            if (this.board[0][0] === this.board[1][1] && 
                this.board[1][1] === this.board[2][2]) {
                this.winningCells = [[0, 0], [1, 1], [2, 2]];
                return this.board[0][0];
            }
        }

        if (this.board[0][2] !== null) {
            if (this.board[0][2] === this.board[1][1] && 
                this.board[1][1] === this.board[2][0]) {
                this.winningCells = [[0, 2], [1, 1], [2, 0]];
                return this.board[0][2];
            }
        }

        return null;
    }

    reset() {
        this.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
        this.currentPlayer = 'O';
        this.oPositions = [];
        this.xPositions = [];
        this.oVanishCount.clear();
        this.xVanishCount.clear();
        this.gameOver = false;
        this.winner = null;
        this.winningCells = [];
    }
}

class GameRenderer {
    constructor(canvas, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gameState = gameState;
        this.cellSize = CELL_SIZE;
        
        // Set canvas size
        this.canvas.width = BOARD_SIZE * this.cellSize;
        this.canvas.height = BOARD_SIZE * this.cellSize;
    }

    drawBoard() {
        const ctx = this.ctx;
        const cellSize = this.cellSize;

        // Clear canvas
        ctx.fillStyle = COLORS.WHITE;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Highlight winning cells if game is over
        if (this.gameState.gameOver && this.gameState.winner && this.gameState.winningCells.length > 0) {
            // Convert system winner to display winner for color selection
            const displayWinner = this._swapMarkForDisplay(this.gameState.winner);
            const highlightColor = displayWinner === 'O' ? COLORS.GREEN : COLORS.RED;
            ctx.fillStyle = highlightColor + '66';  // Add transparency
            for (const [row, col] of this.gameState.winningCells) {
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }

        // Draw grid lines
        ctx.strokeStyle = COLORS.BLACK;
        ctx.lineWidth = LINE_WIDTH;
        for (let i = 1; i < BOARD_SIZE; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, this.canvas.height);
            ctx.stroke();

            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(this.canvas.width, i * cellSize);
            ctx.stroke();
        }

        // Draw marks (swap for display: system O -> display X, system X -> display O)
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const systemMark = this.gameState.board[row][col];
                const displayMark = this._swapMarkForDisplay(systemMark);
                if (displayMark === 'X') {
                    // System O -> Display X
                    this.drawX(row, col, 'O');
                } else if (displayMark === 'O') {
                    // System X -> Display O
                    this.drawO(row, col, 'X');
                }
            }
        }
    }

    drawO(row, col, systemMark = 'O') {
        // systemMark: 'O' or 'X' - the actual system mark type
        // This function draws an O on screen, but may represent system X
        const ctx = this.ctx;
        const cellSize = this.cellSize;
        const centerX = col * cellSize + cellSize / 2;
        const centerY = row * cellSize + cellSize / 2;
        const radius = cellSize / 3;

        const posKey = `${row},${col}`;
        // Get vanish count based on system mark type
        const vanishIn = systemMark === 'O' 
            ? this.gameState.oVanishCount.get(posKey)
            : this.gameState.xVanishCount.get(posKey);

        ctx.strokeStyle = COLORS.BLUE;
        ctx.lineWidth = LINE_WIDTH;

        if (vanishIn === 1) {
            // 1 half-move ahead - 20% opacity
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        } else if (vanishIn === 2) {
            // 2 half-moves ahead - 50% opacity
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        } else {
            // Normal O
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        }

        // Draw vanish count in bottom right corner
        if (vanishIn !== undefined) {
            ctx.fillStyle = COLORS.GRAY;
            ctx.font = '24px Arial';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(
                vanishIn.toString(),
                col * cellSize + cellSize - 10,
                row * cellSize + cellSize - 10
            );
        }
    }

    drawX(row, col, systemMark = 'X') {
        // systemMark: 'O' or 'X' - the actual system mark type
        // This function draws an X on screen, but may represent system O
        const ctx = this.ctx;
        const cellSize = this.cellSize;
        const centerX = col * cellSize + cellSize / 2;
        const centerY = row * cellSize + cellSize / 2;
        const offset = cellSize / 3;

        const posKey = `${row},${col}`;
        // Get vanish count based on system mark type
        const vanishIn = systemMark === 'O'
            ? this.gameState.oVanishCount.get(posKey)
            : this.gameState.xVanishCount.get(posKey);

        ctx.strokeStyle = COLORS.RED;
        ctx.lineWidth = LINE_WIDTH;

        if (vanishIn === 1) {
            // 1 half-move ahead - 20% opacity
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.moveTo(centerX - offset, centerY - offset);
            ctx.lineTo(centerX + offset, centerY + offset);
            ctx.moveTo(centerX - offset, centerY + offset);
            ctx.lineTo(centerX + offset, centerY - offset);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        } else if (vanishIn === 2) {
            // 2 half-moves ahead - 50% opacity
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(centerX - offset, centerY - offset);
            ctx.lineTo(centerX + offset, centerY + offset);
            ctx.moveTo(centerX - offset, centerY + offset);
            ctx.lineTo(centerX + offset, centerY - offset);
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        } else {
            // Normal X
            ctx.beginPath();
            ctx.moveTo(centerX - offset, centerY - offset);
            ctx.lineTo(centerX + offset, centerY + offset);
            ctx.moveTo(centerX - offset, centerY + offset);
            ctx.lineTo(centerX + offset, centerY - offset);
            ctx.stroke();
        }

        // Draw vanish count in bottom right corner
        if (vanishIn !== undefined) {
            ctx.fillStyle = COLORS.GRAY;
            ctx.font = '24px Arial';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            ctx.fillText(
                vanishIn.toString(),
                col * cellSize + cellSize - 10,
                row * cellSize + cellSize - 10
            );
        }
    }

    getCellFromPos(x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
            return [row, col];
        }
        return null;
    }

    /**
     * Swap mark for display: system O -> display X, system X -> display O
     * This makes it appear that X plays first (traditional Tic-Tac-Toe rule)
     * while the internal system still uses O-first logic.
     */
    _swapMarkForDisplay(mark) {
        if (mark === 'O') return 'X';
        if (mark === 'X') return 'O';
        return null;
    }
}

class VanishingTicTacToeGame {
    constructor(canvas, database) {
        this.canvas = canvas;
        this.database = database;
        this.gameState = new GameState();
        this.renderer = new GameRenderer(canvas, this.gameState);
        this.aiPlayer = null;  // 'O' or 'X' - computer plays as this player
        this.aiMoveTime = null;  // Time when AI should make move
        this.showingPlayerSelection = true;
    }

    createPositionKey() {
        /**
         * Create position key in format: "o_positions|x_positions|current_player|o_vanish|x_vanish"
         * Example: "0,0,1,1|0,1|O|0,0:5,1,1:6|0,1:4"
         */
        const oPositions = this.gameState.oPositions.map(([r, c]) => `${r},${c}`).join(',');
        const xPositions = this.gameState.xPositions.map(([r, c]) => `${r},${c}`).join(',');
        const currentPlayer = this.gameState.currentPlayer;
        
        // Create vanish count strings
        const oVanishEntries = Array.from(this.gameState.oVanishCount.entries())
            .map(([pos, count]) => `${pos}:${count}`)
            .sort()
            .join(',');
        const xVanishEntries = Array.from(this.gameState.xVanishCount.entries())
            .map(([pos, count]) => `${pos}:${count}`)
            .sort()
            .join(',');
        
        return `${oPositions}|${xPositions}|${currentPlayer}|${oVanishEntries}|${xVanishEntries}`;
    }

    showPlayerSelection() {
        this.showingPlayerSelection = true;
        // This will be handled by the UI
    }

    setPlayer(player) {
        // player is 'O' or 'X' - human player
        this.aiPlayer = player === 'O' ? 'X' : 'O';
        this.showingPlayerSelection = false;
        this.gameState.reset();
        // If AI goes first, schedule the move
        if (this.gameState.currentPlayer === this.aiPlayer) {
            this.aiMoveTime = Date.now() + 300;
            console.log('AI: Game started, AI goes first');
        }
    }

    makeAIMove() {
        if (this.gameState.gameOver) {
            console.log('AI: Game over, cannot move');
            return false;
        }

        if (this.gameState.currentPlayer !== this.aiPlayer) {
            console.log('AI: Not AI turn', {
                currentPlayer: this.gameState.currentPlayer,
                aiPlayer: this.aiPlayer
            });
            return false;
        }

        try {
            // Create position key
            const positionKey = this.createPositionKey();
            console.log('AI: Looking up position key:', positionKey);
            console.log('AI: Game state:', {
                oPositions: this.gameState.oPositions,
                xPositions: this.gameState.xPositions,
                currentPlayer: this.gameState.currentPlayer,
                oVanishCount: Object.fromEntries(this.gameState.oVanishCount),
                xVanishCount: Object.fromEntries(this.gameState.xVanishCount)
            });
            
            // Look up in database - try exact match first
            let positionData = this.database[positionKey];
            
            // If not found, try to find a key with same board positions and current player
            // (vanish counts may differ due to different game paths)
            if (!positionData) {
                console.warn('AI: Exact position not found, searching for similar...');
                const allKeys = Object.keys(this.database);
                const keyParts = positionKey.split('|');
                const oPosStr = keyParts[0];
                const xPosStr = keyParts[1];
                const currentPlayer = keyParts[2];
                
                // Find keys with same board positions and current player
                const matchingKeys = allKeys.filter(k => {
                    const parts = k.split('|');
                    return parts.length === 5 &&
                           parts[0] === oPosStr &&
                           parts[1] === xPosStr &&
                           parts[2] === currentPlayer;
                });
                
                if (matchingKeys.length > 0) {
                    // Use the first matching key (they should have same best_moves)
                    const matchedKey = matchingKeys[0];
                    positionData = this.database[matchedKey];
                    console.log('AI: Found matching position with different vanish counts:', matchedKey);
                } else {
                    console.warn('AI: No matching position found in database');
                    return false;
                }
            }
            
            // Get best moves
            const bestMoves = positionData.best_moves;
            console.log('AI: Found position data, best moves:', bestMoves);
            
            if (bestMoves && bestMoves.length > 0) {
                // Randomly select from best moves
                const randomIndex = Math.floor(Math.random() * bestMoves.length);
                const bestPos = bestMoves[randomIndex];
                const [row, col] = this.gameState.posToBoard(bestPos);
                console.log('AI: Making move at position', bestPos, '->', row, col);
                
                if (this.gameState.placeMark(row, col)) {
                    // Check for winner
                    const winner = this.gameState.checkWinner();
                    if (winner) {
                        this.gameState.winner = winner;
                        this.gameState.gameOver = true;
                    }
                    console.log('AI: Move successful');
                    return true;
                } else {
                    console.warn('AI: Failed to place mark at', row, col);
                }
            } else {
                console.warn('AI: No best moves found in position data');
            }
            
            return false;
        } catch (error) {
            console.error('AI: Error in makeAIMove:', error);
            return false;
        }
    }

    handleClick(x, y) {
        if (this.showingPlayerSelection || this.gameState.gameOver) {
            return;
        }

        // Only allow human moves if it's not AI's turn
        if (this.gameState.currentPlayer !== this.aiPlayer) {
            const cell = this.renderer.getCellFromPos(x, y);
            if (cell) {
                const [row, col] = cell;
                if (this.gameState.placeMark(row, col)) {
                    // Check for winner
                    const winner = this.gameState.checkWinner();
                    if (winner) {
                        this.gameState.winner = winner;
                        this.gameState.gameOver = true;
                    } else {
                        // Schedule AI move 300ms later
                        if (this.gameState.currentPlayer === this.aiPlayer) {
                            this.aiMoveTime = Date.now() + 300;
                        }
                    }
                    this.render();
                }
            }
        }
    }

    handleKeyDown(key) {
        if (key === 'r' || key === 'R') {
            // Reset game and return to player selection
            this.gameState.reset();
            this.showingPlayerSelection = true;
            this.aiMoveTime = null;
            return true;  // Signal to show player selection
        }
        return false;
    }

    update() {
        // Make AI move if it's AI's turn and time has passed
        if (!this.gameState.gameOver && !this.showingPlayerSelection) {
            if (this.gameState.currentPlayer === this.aiPlayer) {
                const currentTime = Date.now();
                if (this.aiMoveTime === null) {
                    // Schedule AI move 300ms later
                    this.aiMoveTime = currentTime + 300;
                    console.log('AI: Scheduled move in 300ms');
                } else if (currentTime >= this.aiMoveTime) {
                    // Time to make AI move
                    console.log('AI: Time to make move');
                    if (this.makeAIMove()) {
                        // Check for winner after AI move (already checked in makeAIMove)
                        this.render();
                    } else {
                        console.error('AI: Failed to make move');
                    }
                    this.aiMoveTime = null;
                }
            }
        }
    }

    render() {
        this.renderer.drawBoard();
    }
}

