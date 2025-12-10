import React, { useState } from "react";
import { SnakeSeekbar } from "./SnakeSeekbar";

/**
 * Demo component to showcase the SnakeSeekbar
 */
export const SnakeSeekbarDemo = () => {
  const [currentTime, setCurrentTime] = useState(30);
  const duration = 180; // 3 minutes

  return (
    <div className="p-4 bg-gray-900 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Snake Seekbar Demo</h2>

      <div className="mb-8">
        <SnakeSeekbar
          value={currentTime}
          min={0}
          max={duration}
          onChange={setCurrentTime}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-gray-400">
          <span>0:00</span>
          <span>3:00</span>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
        >
          -10s
        </button>
        <button
          className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          onClick={() => setCurrentTime(Math.min(duration, currentTime + 10))}
        >
          +10s
        </button>
      </div>
    </div>
  );
};
