// Main application logic

let gameDatabase = null;
let game;

// Load game database
function loadDatabase() {
    return new Promise((resolve, reject) => {
        try {
            console.log('Loading game database...');
            const startTime = performance.now();
            
            fetch('game_database.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    gameDatabase = data;
                    const endTime = performance.now();
                    console.log(`Database loaded in ${(endTime - startTime).toFixed(2)}ms!`);
                    console.log(`Total positions: ${Object.keys(gameDatabase).length}`);
                    resolve();
                })
                .catch(error => {
                    console.error('Error loading database:', error);
                    reject(error);
                });
        } catch (error) {
            console.error('Error in loadDatabase:', error);
            reject(error);
        }
    });
}

// Initialize game
function initGame() {
    const canvas = document.getElementById('game-canvas');
    if (!gameDatabase) {
        console.error('Database not loaded');
        return;
    }
    game = new VanishingTicTacToeGame(canvas, gameDatabase);
    game.render();
}

// Show player selection screen
function showPlayerSelection() {
    document.getElementById('player-selection').classList.remove('hidden');
    document.getElementById('game-container').classList.add('hidden');
}

// Show loading state
function showLoading() {
    const loading = document.getElementById('loading-message');
    const buttons = document.getElementById('player-buttons');
    if (loading) loading.classList.remove('hidden');
    if (buttons) buttons.classList.add('hidden');
}

// Hide loading and show buttons
function hideLoading() {
    const loading = document.getElementById('loading-message');
    const buttons = document.getElementById('player-buttons');
    if (loading) loading.classList.add('hidden');
    if (buttons) buttons.classList.remove('hidden');
}

// Show game screen
function showGame() {
    document.getElementById('player-selection').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
}

// Handle player selection
function handlePlayerSelection(player) {
    if (!game) {
        initGame();
    }
    game.setPlayer(player);
    showGame();
    game.render();
}

// Setup event listeners
function setupEventListeners() {
    // Player selection buttons
    document.querySelectorAll('.player-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const player = btn.dataset.player;
            handlePlayerSelection(player);
        });
    });

    // Canvas click
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('click', (e) => {
        if (game && !game.showingPlayerSelection) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            game.handleClick(x, y);
        }
    });

    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (game) {
            if (e.key === 'r' || e.key === 'R') {
                const shouldShowSelection = game.handleKeyDown(e.key);
                if (shouldShowSelection) {
                    showPlayerSelection();
                } else {
                    game.render();
                }
            }
        }
    });

    // Game loop for AI moves
    function gameLoop() {
        if (game && !game.showingPlayerSelection) {
            game.update();
        }
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
}

// Initialize on page load
window.addEventListener('load', async () => {
    showPlayerSelection();
    showLoading();
    setupEventListeners();
    
    // Load database asynchronously
    try {
        await loadDatabase();
        console.log('Ready to play!');
        hideLoading();
    } catch (error) {
        console.error('Failed to load database:', error);
        const loading = document.getElementById('loading-message');
        if (loading) {
            loading.textContent = 'Failed to load database. Please refresh the page.';
            loading.style.color = '#FF0000';
        }
    }
});

