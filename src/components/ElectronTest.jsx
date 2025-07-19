import React, { useState, useEffect } from "react";

export const ElectronTest = () => {
  const [electronInfo, setElectronInfo] = useState({
    isElectron: false,
    apis: [],
    fsApis: [],
  });

  useEffect(() => {
    // Check if we're running in Electron
    const isElectron = window.electron !== undefined;

    // Get available APIs
    const apis = isElectron ? Object.keys(window.electron) : [];

    // Get available FS APIs
    const fsApis =
      isElectron && window.electron.fs ? Object.keys(window.electron.fs) : [];

    setElectronInfo({
      isElectron,
      apis,
      fsApis,
    });
  }, []);

  const testOpenDialog = async () => {
    if (window.electron?.fs?.openDialog) {
      try {
        const result = await window.electron.fs.openDialog({
          properties: ["openFile", "multiSelections"],
        });
        console.log("Dialog result:", result);
        alert(
          `Dialog result: ${
            result.canceled
              ? "Canceled"
              : `Selected ${result.files?.length || 0} files`
          }`
        );
      } catch (error) {
        console.error("Error opening dialog:", error);
        alert(`Error: ${error.message}`);
      }
    } else {
      alert("openDialog API not available");
    }
  };

  return (
    <div className="p-4 bg-gray-800 text-white rounded-lg">
      <h2 className="text-xl font-bold mb-4">Electron Bridge Test</h2>

      <div className="mb-4">
        <p>
          Running in Electron:{" "}
          <span className="font-mono">
            {electronInfo.isElectron.toString()}
          </span>
        </p>
      </div>

      <div className="mb-4">
        <p className="mb-2">Available Electron APIs:</p>
        <ul className="list-disc pl-5">
          {electronInfo.apis.length > 0 ? (
            electronInfo.apis.map((api) => (
              <li key={api} className="font-mono">
                {api}
              </li>
            ))
          ) : (
            <li className="text-red-400">None</li>
          )}
        </ul>
      </div>

      <div className="mb-4">
        <p className="mb-2">Available FS APIs:</p>
        <ul className="list-disc pl-5">
          {electronInfo.fsApis.length > 0 ? (
            electronInfo.fsApis.map((api) => (
              <li key={api} className="font-mono">
                {api}
              </li>
            ))
          ) : (
            <li className="text-red-400">None</li>
          )}
        </ul>
      </div>

      <button
        onClick={testOpenDialog}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md"
      >
        Test Open Dialog
      </button>
    </div>
  );
};
