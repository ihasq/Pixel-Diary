import React, { useState, useRef, useCallback } from 'react';
import { Tool, GridState } from './types';
import { Icon } from './components/Icon';
import { ColorPicker } from './components/ColorPicker';

// Initial 4x4 blank grid (white)
const INITIAL_GRID: GridState = Array(16).fill('#ffffff');

const App: React.FC = () => {
  const [grid, setGrid] = useState<GridState>(INITIAL_GRID);
  const [history, setHistory] = useState<GridState[]>([INITIAL_GRID]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('#000000');
  const [currentTool, setCurrentTool] = useState<Tool>(Tool.BRUSH);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const lastSavedGridRef = useRef<GridState>(INITIAL_GRID);

  // Helper function to check if two grids have the same content
  const gridsAreEqual = useCallback((grid1: GridState, grid2: GridState): boolean => {
    if (grid1.length !== grid2.length) return false;
    return grid1.every((color, idx) => color === grid2[idx]);
  }, []);

  const handleCellAction = useCallback((index: number) => {
    setGrid(prevGrid => {
      let newGrid = prevGrid;

      if (currentTool === Tool.BRUSH) {
        newGrid = [...prevGrid];
        newGrid[index] = selectedColor;
      } else if (currentTool === Tool.ERASER) {
        newGrid = [...prevGrid];
        newGrid[index] = '#ffffff';
      } else if (currentTool === Tool.BUCKET) {
        const targetColor = prevGrid[index];
        newGrid = prevGrid.map(c => c === targetColor ? selectedColor : c);
      } else if (currentTool === Tool.DROPPER) {
        setSelectedColor(prevGrid[index]);
        setCurrentTool(Tool.BRUSH);
        return prevGrid;
      }

      // Save full canvas state to history after each change
      // Use deep equality check to prevent double-saving the same grid content
      if (!gridsAreEqual(newGrid, prevGrid) && !gridsAreEqual(newGrid, lastSavedGridRef.current)) {
        lastSavedGridRef.current = newGrid;

        // Update history index and array separately, using functional updates
        setHistoryIndex(prevIndex => {
          const newIndex = prevIndex + 1;
          // Schedule history update with the new index
          setHistory(prevHistory => [...prevHistory.slice(0, newIndex), newGrid]);
          return newIndex;
        });
      }

      return newGrid;
    });
  }, [currentTool, selectedColor, gridsAreEqual]);

  // Mouse handlers for drag-to-draw
  const handleMouseDown = (index: number) => {
    setIsDrawing(true);
    handleCellAction(index);
  };

  const handleMouseEnter = (index: number) => {
    if (isDrawing) {
      handleCellAction(index);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setGrid(history[newIndex]);
    }
  };

  const handleClearClick = () => {
    setShowResetDialog(true);
  };

  const handleConfirmClear = () => {
    setGrid(INITIAL_GRID);
    setHistory([INITIAL_GRID]);
    setHistoryIndex(0);
    lastSavedGridRef.current = INITIAL_GRID;
    setShowResetDialog(false);
  };

  const handleCancelClear = () => {
    setShowResetDialog(false);
  };

  const handleSendClick = () => {
    // Show Turnstile when button is clicked
    setShowTurnstile(true);
  };

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 4x4 grid, export as 512x512
    canvas.width = 512;
    canvas.height = 512;
    const cellSize = 128;

    grid.forEach((color, i) => {
      const x = (i % 4) * cellSize;
      const y = Math.floor(i / 4) * cellSize;
      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellSize, cellSize);
    });

    const link = document.createElement('a');
    link.download = `pixel-art-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div
      className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <header className="mb-8 text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 tracking-tight">
          Pixel Diary
        </h1>
        <p className="text-gray-600 text-sm">今の気分を16マスであらわすなら？</p>
      </header>

      <main className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 lg:gap-12 items-start justify-center">


        {/* Right Column: Colors, AI, Actions */}
        <div className="flex flex-col items-center gap-6 w-full lg:w-96 order-2 lg:order-2">
          
          <ColorPicker selectedColor={selectedColor} onChange={setSelectedColor} />

          {/* Text Input */}
          <div className="flex flex-col gap-3 bg-white p-4 rounded-xl shadow-lg border border-gray-200 w-full max-w-md">
            <label htmlFor="message-input" className="text-gray-600 text-sm font-medium uppercase tracking-wider">
              題名（ひらがな8文字）
            </label>
            <textarea
              id="message-input"
              placeholder="Enter your message here..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows={3}
            />
          </div>

          {/* Cloudflare Turnstile */}
          {showTurnstile && (
            <div className="w-full max-w-md">
              <div
                className="cf-turnstile"
                data-sitekey="1x00000000000000000000AA"
                data-theme="light"
              ></div>
            </div>
          )}

          {/* Actions */}
           <button
            onClick={handleSendClick}
            className="group flex items-center justify-center gap-3 px-6 py-4 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl border border-gray-300 hover:border-gray-400 font-bold transition-all shadow-md active:scale-[0.99]"
          >
            <Icon name="upload" className="group-hover:translate-y-0.5 transition-transform" />
            <span>だれかと交換する</span>
          </button>

        </div>
        
        {/* Left Column: Canvas & Drawing Tools */}
        <div className="flex flex-col items-center gap-6 w-full lg:w-auto lg:flex-1 order-1 lg:order-1">
          
          {/* Canvas Area with framing */}
          <div className="relative p-1 bg-white rounded-2xl shadow-2xl border border-gray-200">
             <div
              className="grid grid-cols-4 gap-1 p-2 bg-gray-200 rounded-xl border border-gray-200"
            >
              {grid.map((color, index) => (
                <div
                  key={index}
                  onMouseDown={() => handleMouseDown(index)}
                  onMouseEnter={() => handleMouseEnter(index)}
                  className="w-[18vw] h-[18vw] sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-sm cursor-pointer hover:brightness-110 transition-transform active:scale-95 shadow-inner"
                  style={{ backgroundColor: color }}
                  role="button"
                  aria-label={`Pixel ${index + 1}, color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap justify-center gap-3 bg-white p-3 rounded-2xl border border-gray-200 shadow-md w-full sm:w-auto">
            {[
              { id: Tool.BRUSH, icon: 'brush', label: 'ブラシ' },
              { id: Tool.BUCKET, icon: 'format_color_fill', label: '塗りつぶし' },
              { id: Tool.DROPPER, icon: 'colorize', label: '色を取る' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setCurrentTool(t.id)}
                title={t.label}
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all ${
                  currentTool === t.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <Icon name={t.icon} className="text-2xl mb-0.5" />
                <span className="text-[10px] font-bold uppercase">{t.label}</span>
              </button>
            ))}
            <div className="w-px bg-gray-300 mx-1 hidden sm:block"></div>
             <button
                onClick={handleUndo}
                disabled={historyIndex === 0}
                title="Undo"
                className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all ${
                  historyIndex === 0
                    ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                <Icon name="undo" className="text-2xl mb-0.5" />
                <span className="text-[10px] font-bold uppercase">もどす</span>
              </button>
             <button
                onClick={handleClearClick}
                title="Clear"
                className="flex flex-col items-center justify-center w-14 h-14 rounded-xl text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-all"
              >
                <Icon name="delete_outline" className="text-2xl mb-0.5" />
                <span className="text-[10px] font-bold uppercase">リセット</span>
              </button>
          </div>
        </div>

      </main>

      {/* Reset Confirmation Dialog */}
      {showResetDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Icon name="warning" className="text-red-600 text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">本当にリセットしますか？</h2>
            </div>

            <p className="text-gray-600 text-sm pl-15">
              全ての変更が失われます。この操作は取り消せません。
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancelClear}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl font-medium transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmClear}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all"
              >
                リセットする
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;