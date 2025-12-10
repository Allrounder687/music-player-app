import React from "react";
import { SnakeSeekbarDemo } from "../components/SnakeSeekbarDemo";

export const SnakeSeekbarTest = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Snake Seekbar Test</h1>

      <div className="max-w-2xl mx-auto">
        <SnakeSeekbarDemo />
      </div>

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Implementation Notes</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            The snake seekbar visualizes audio playback with a dynamic, animated
            snake
          </li>
          <li>
            The snake's appearance changes based on audio characteristics (bass,
            mid, treble)
          </li>
          <li>
            Users can click or drag anywhere on the seekbar to change playback
            position
          </li>
          <li>
            A tooltip shows the time position when hovering over the seekbar
          </li>
          <li>
            The component is fully accessible with keyboard navigation and ARIA
            attributes
          </li>
          <li>
            Animation performance is optimized using requestAnimationFrame with
            cleanup
          </li>
        </ul>
      </div>
    </div>
  );
};
