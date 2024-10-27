"use client";

import React, { useState, useCallback, useEffect } from "react";

export default function KnightTour() {
  const [boardSize, setBoardSize] = useState(5);
  const [board, setBoard] = useState([]);
  const [knightPosition, setKnightPosition] = useState(null);
  const [gameStatus, setGameStatus] = useState("setup"); // 'setup', 'playing', 'won', 'lost'
  const [moveCount, setMoveCount] = useState(0);
  const [validMoves, setValidMoves] = useState([]);
  const [startPosition, setStartPosition] = useState(null);

  // Knight's possible moves
  const knightMoves = [
    [2, 1],
    [1, 2],
    [-1, 2],
    [-2, 1],
    [-2, -1],
    [-1, -2],
    [1, -2],
    [2, -1],
  ];

  const initializeBoard = useCallback(
    (n) =>
      Array(n)
        .fill(null)
        .map(() => Array(n).fill(-1)),
    []
  );

  const isValidMove = useCallback(
    (x, y, board) =>
      x >= 0 && y >= 0 && x < boardSize && y < boardSize && board[x][y] === -1,
    [boardSize]
  );

  // Calculate valid moves from current position
  const calculateValidMoves = useCallback(
    (position) => {
      if (!position) return [];

      return knightMoves
        .map(([dx, dy]) => ({
          x: position.x + dx,
          y: position.y + dy,
        }))
        .filter(({ x, y }) => isValidMove(x, y, board));
    },
    [knightMoves, isValidMove, board]
  );

  // Start new game
  const startGame = useCallback(
    (x, y) => {
      const newBoard = initializeBoard(boardSize);
      newBoard[x][y] = 0;
      setBoard(newBoard);
      setKnightPosition({ x, y });
      setStartPosition({ x, y });
      setMoveCount(1);
      setGameStatus("playing");
      setValidMoves(calculateValidMoves({ x, y }));
    },
    [boardSize, initializeBoard, calculateValidMoves]
  );

  // Handle cell click
  const handleCellClick = useCallback(
    (x, y) => {
      if (gameStatus === "setup") {
        startGame(x, y);
        return;
      }

      if (gameStatus !== "playing") return;

      // Check if clicked position is a valid move
      const isValid = validMoves.some((move) => move.x === x && move.y === y);

      if (!isValid) {
        setGameStatus("lost");
        return;
      }

      // Make the move
      const newBoard = [...board];
      newBoard[x][y] = moveCount;
      setBoard(newBoard);
      setKnightPosition({ x, y });
      setMoveCount(moveCount + 1);

      // Calculate new valid moves
      const newValidMoves = calculateValidMoves({ x, y });
      setValidMoves(newValidMoves);

      // Check win condition
      if (moveCount === boardSize * boardSize - 1) {
        setGameStatus("won");
      } else if (newValidMoves.length === 0) {
        setGameStatus("lost");
      }
    },
    [
      gameStatus,
      validMoves,
      board,
      moveCount,
      boardSize,
      calculateValidMoves,
      startGame,
    ]
  );

  const handleSizeChange = (e) => {
    const newSize = Math.max(5, Math.min(8, parseInt(e.target.value) || 5));
    setBoardSize(newSize);
    setBoard(initializeBoard(newSize));
    setGameStatus("setup");
    setMoveCount(0);
    setKnightPosition(null);
    setStartPosition(null);
    setValidMoves([]);
  };

  // Initialize board
  useEffect(() => {
    setBoard(initializeBoard(boardSize));
  }, [boardSize, initializeBoard]);

  // Highlight cell based on its state
  const getCellClassName = useCallback(
    (rowIndex, colIndex) => {
      const isKnightPosition =
        knightPosition?.x === rowIndex && knightPosition?.y === colIndex;
      const isValidMove = validMoves.some(
        (move) => move.x === rowIndex && move.y === colIndex
      );
      const isVisited = board[rowIndex][colIndex] !== -1;

      return `relative flex items-center justify-center w-14 h-14 border cursor-pointer
        ${
          isKnightPosition
            ? "bg-blue-500 shadow-[0_0_15px_5px_rgba(59,130,246,0.5)]"
            : isValidMove && gameStatus === "playing"
            ? "bg-green-200 hover:bg-green-300 shadow-[0_0_10px_2px_rgba(16,185,129,0.5)]"
            : isVisited
            ? "bg-gray-200"
            : gameStatus === "setup"
            ? "hover:bg-gray-100"
            : "bg-white"
        }
        font-semibold rounded transition-all duration-300 ease-in-out`;
    },
    [knightPosition, validMoves, board, gameStatus]
  );

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-gray-900 text-white min-h-screen">
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
        Futuristic Knight's Tour
      </h1>

      <div className="flex flex-col items-center gap-4">
        <label className="flex items-center space-x-2">
          <span className="text-lg">Board Size (5-8):</span>
          <input
            type="number"
            min="5"
            max="8"
            value={boardSize}
            onChange={handleSizeChange}
            className="w-20 p-2 border border-gray-300 rounded-md text-center bg-gray-800 text-white"
          />
        </label>

        <div className="text-xl font-semibold text-center">
          {gameStatus === "setup" && "Select starting position"}
          {gameStatus === "playing" &&
            `Moves made: ${moveCount - 1} / ${boardSize * boardSize - 1}`}
          {gameStatus === "won" && (
            <span className="text-green-400">
              Congratulations! You completed the tour! 🎉
            </span>
          )}
          {gameStatus === "lost" && (
            <span className="text-red-400">
              Game Over! No valid moves remaining 😢
            </span>
          )}
        </div>

        {(gameStatus === "won" || gameStatus === "lost") && (
          <button
            onClick={() => startGame(startPosition.x, startPosition.y)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            Play Again
          </button>
        )}
      </div>

      <div
        className="grid gap-1 mt-4 p-4 bg-gray-800 rounded-lg shadow-lg"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 60px)`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell !== -1 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-300">{cell}</span>
                  {cell > 0 && (
                    <span className="text-[10px] text-gray-400">
                      Jump {cell}
                    </span>
                  )}
                </div>
              )}
              {knightPosition?.x === rowIndex &&
                knightPosition?.y === colIndex && (
                  <span className="text-2xl text-white animate-pulse">♞</span>
                )}
            </div>
          ))
        )}
      </div>

      {gameStatus === "playing" && (
        <div className="text-gray-400 mt-4">
          Click on the highlighted cells to make valid knight moves
        </div>
      )}

      <footer className="mt-8 p-4 bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
          Design and Analysis of Algorithms
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p>Swaraj Mahadik</p>
            <p className="text-gray-400">PRN: 122B1B159</p>
          </div>
          <div>
            <p>Anuj Loharkar</p>
            <p className="text-gray-400">PRN: 122B1B154</p>
          </div>
          <div>
            <p>Anurag Lengure</p>
            <p className="text-gray-400">PRN: 122B1B152</p>
          </div>
          <div>
            <p>Rushikesh Magdum</p>
            <p className="text-gray-400">PRN: 122B1B158</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
