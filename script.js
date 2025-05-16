const board = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const gameTimeInput = document.getElementById('gameTime');
const intervalInput = document.getElementById('intervalTime');
const playerNameInput = document.getElementById('playerName');
const highScoresList = document.getElementById('highScores');
const toggleMusicBtn = document.getElementById('toggle-music');
const backgroundMusic = document.getElementById('background-music');

const rows = 10;
const cols = 8;
const activeRows = 5;

let boardData, score, timeLeft, gameInterval, newRowInterval;
const colors = ['red', 'green', 'blue', 'yellow', 'purple'];

playerNameInput.addEventListener('input', () => {
  startButton.disabled = playerNameInput.value.trim() === '';
});

startButton.addEventListener('click', startGame);

toggleMusicBtn.addEventListener('click', () => {
    if (!backgroundMusic) return;
  
    if (backgroundMusic.muted) {
      backgroundMusic.muted = false;
      toggleMusicBtn.textContent = 'Zene ki';
    } else {
      backgroundMusic.muted = true;
      toggleMusicBtn.textContent = 'Zene be';
    }
  });

function startGame() {
  const playerName = playerNameInput.value.trim();
  if (playerName === '') {
    alert('Kérlek, adj meg egy nevet a játék indításához!');
    return;
  }

  clearInterval(gameInterval);
  clearInterval(newRowInterval);

  score = 0;
  timeLeft = parseInt(gameTimeInput.value);
  const intervalTime = parseInt(intervalInput.value);

  boardData = Array(rows).fill(null).map(() => Array(cols).fill(null));
  scoreDisplay.textContent = '0';
  timerDisplay.textContent = timeLeft;

  createInitialBoard();

  gameInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(gameInterval);
      clearInterval(newRowInterval);
      saveHighScore(playerName, score);
      alert(`Lejárt az idő, ${playerName}! Pontszámod: ${score}`);
    }
  }, 1000);

  newRowInterval = setInterval(() => {
    addNewRow();
    applyGravity();
    centerColumns();
    updateBoard();
  }, intervalTime * 1000);

  const music = document.getElementById('background-music');
  if (music) {
    music.volume = 0.3;
    music.play().catch((e) => {
      console.log('A zene csak felhasználói interakció után indulhat:', e);
    });
  }
}

function createInitialBoard() {
  board.innerHTML = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', () => handleClick(r, c));
      board.appendChild(cell);
    }
  }

  for (let r = rows - activeRows; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      boardData[r][c] = randomColor();
    }
  }

  updateBoard();
}

function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function handleClick(r, c) {
  const color = boardData[r][c];
  if (!color) return;

  const toRemove = findConnected(r, c, color);
  if (toRemove.length < 2) return;

  toRemove.forEach(([rr, cc]) => boardData[rr][cc] = null);
  score += toRemove.length;

  if (toRemove.length > 0) {
    playPopSound();
  }

  applyGravity();
  centerColumns();
  updateBoard();
  updateScore();
}

function findConnected(r, c, color, visited = {}) {
  const key = `${r},${c}`;
  if (
    r < 0 || r >= rows ||
    c < 0 || c >= cols ||
    boardData[r][c] !== color ||
    visited[key]
  ) return [];

  visited[key] = true;
  let result = [[r, c]];

  [[1,0], [-1,0], [0,1], [0,-1]].forEach(([dr, dc]) => {
    result = result.concat(findConnected(r + dr, c + dc, color, visited));
  });

  return result;
}

function applyGravity() {
  for (let c = 0; c < cols; c++) {
    for (let r = rows - 2; r >= 0; r--) {
      if (boardData[r][c] && !boardData[r + 1][c]) {
        let rr = r;
        while (rr + 1 < rows && !boardData[rr + 1][c]) {
          boardData[rr + 1][c] = boardData[rr][c];
          boardData[rr][c] = null;
          rr++;
        }
      }
    }
  }
}

function centerColumns() {
  const newCols = [];

  for (let c = 0; c < cols; c++) {
    const hasBlock = boardData.some(row => row[c] !== null);
    if (hasBlock) {
      const colData = boardData.map(row => row[c]);
      newCols.push(colData);
    }
  }

  const padding = Math.floor((cols - newCols.length) / 2);
  const newBoard = Array(rows).fill(null).map(() => Array(cols).fill(null));

  for (let i = 0; i < newCols.length; i++) {
    for (let r = 0; r < rows; r++) {
      newBoard[r][padding + i] = newCols[i][r];
    }
  }

  boardData = newBoard;
}

function updateBoard() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const cell = board.children[idx];
      const color = boardData[r][c];

      if (color) {
        cell.style.backgroundColor = color;
        cell.style.pointerEvents = 'auto';
      } else {
        cell.style.backgroundColor = '#ccc';
        cell.style.pointerEvents = 'none';
      }
    }
  }
}

function updateScore() {
  scoreDisplay.textContent = score;
}

function addNewRow() {
  for (let r = 0; r < rows - 1; r++) {
    boardData[r] = [...boardData[r + 1]];
  }

  const newRow = Array(cols).fill(null).map(() => randomColor());
  boardData[rows - 1] = newRow;

  if (boardData[0].some(cell => cell !== null)) {
    clearInterval(gameInterval);
    clearInterval(newRowInterval);
    const playerName = playerNameInput.value.trim();
    saveHighScore(playerName, score);
    alert(`A mező elérte a tetejét, ${playerName}! Játék vége. Pontszám: ${score}`);
  }
}

function saveHighScore(name, score) {
  fetch('save_score.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, score })
  }).then(() => renderHighScores());
}

function renderHighScores() {
  fetch('get_scores.php')
    .then(res => res.json())
    .then(scores => {
      highScoresList.innerHTML = '';
      scores.forEach(({ name, score }) => {
        const li = document.createElement('li');
        li.textContent = `${name}: ${score} pont`;
        highScoresList.appendChild(li);
      });
    });
}


renderHighScores();

function playPopSound() {
    const sound = document.getElementById('pop-sound');
    if (sound) {
      sound.currentTime = 0;
      sound.volume = 0.5;
      sound.play();
    }
  }