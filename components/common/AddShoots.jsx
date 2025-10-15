"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import IconPlusCircle from "../icon/icon-plus-circle";

export default function AddShootModal({ onAddShoot }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shootTitle, setShootTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const title = shootTitle.trim();
    if (!title) return;

    try {
      setLoading(true);
      await onAddShoot(title); // parent-provided callback (e.g. handleAddMasterTitle)
      setShootTitle("");
      setIsOpen(false);
    } catch (err) {
      console.error("Error adding shoot:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-100  flex justify-space-between items-center px-2 py-2 text-xs text-blue-700 rounded-md border-blue-200 hover:bg-blue-200 transition-all"
      >
        <IconPlusCircle/> &nbsp; Add Shoot Title
      </button>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Modal Box */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 relative border border-gray-200 dark:border-gray-700">
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                title="Close"
              >
                <X size={18} />
              </button>

              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                Add New Shoot Title
              </h3>

              <input
                type="text"
                value={shootTitle}
                onChange={(e) => setShootTitle(e.target.value)}
                placeholder="Enter shoot title..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!shootTitle.trim() || loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save & Close"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
