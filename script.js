const board = document.getElementById('game-board');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');

const rows = 10;
const cols = 8;
let boardData = [];
let score = 0;
let timeLeft = 60;
const colors = ['red', 'green', 'blue', 'yellow', 'purple'];

function createBoard() {
  boardData = [];
  board.innerHTML = '';

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      row.push(color);

      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.style.backgroundColor = color;
      cell.dataset.row = r;
      cell.dataset.col = c;

      cell.addEventListener('click', () => handleClick(r, c));
      board.appendChild(cell);
    }
    boardData.push(row);
  }
}

function handleClick(r, c) {
  const color = boardData[r][c];
  if (!color) return;

  const toRemove = findConnected(r, c, color);
  if (toRemove.length < 2) return;

  toRemove.forEach(([rr, cc]) => {
    boardData[rr][cc] = null;
  });

  score += toRemove.length;
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

function updateBoard() {
  for (let i = board.children.length - 1; i >= 0; i--) {
    const cell = board.children[i];
    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);
    const color = boardData[r][c];

    if (color) {
      cell.style.backgroundColor = color;
    } else {
      cell.style.backgroundColor = '#ccc';
      cell.style.pointerEvents = 'none';
    }
  }
}

function updateScore() {
  scoreDisplay.textContent = score;
}

function startTimer() {
  const timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      alert('Lejárt az idő! Pontszám: ' + score);
    }
  }, 1000);
}

createBoard();
startTimer();
