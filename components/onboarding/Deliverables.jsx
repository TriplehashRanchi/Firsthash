'use client';
import React, { useState } from 'react';
import { Plus, Trash2, X } from 'lucide-react';

const deliverableOptions = {
    wedding: [{ title: 'Wedding Shoot', cost: 10000 }],
    photoshoot: [{ title: 'Photoshoot', cost: 5000 }],
    videography: [{ title: 'Videography', cost: 8000 }],
    fullWedding: [
        { title: 'Wedding Shoot', cost: 10000 },
        { title: 'Photography', cost: 7000 },
        { title: 'Videography', cost: 8000 },
        { title: 'Drone Shoot', cost: 5000 },
    ],
};

const Deliverables = () => {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const addDeliverablesFromOption = (optionKey) => {
        const selectedItems = deliverableOptions[optionKey].map((item) => ({
            ...item,
            quantity: 1,
            date: '',
        }));
        setItems((prev) => [...prev, ...selectedItems, { title: '', cost: 0, quantity: 1, date: '' }]);
        setShowModal(false);
    };

    const addManualDeliverable = () => {
        setItems((prev) => [...prev, { title: '', cost: 0, quantity: 1, date: '' }]);
    };

    const handleChange = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = field === 'cost' || field === 'quantity' ? parseInt(value) || 0 : value;
        setItems(updated);
    };

    const handleRemove = (index) => {
        const updated = items.filter((_, i) => i !== index);
        setItems(updated);
    };

    const totalCost = items.reduce((sum, item) => sum + item.cost * item.quantity, 0);

    return (
        <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-white">Deliverables</h2>

            {/* Controls */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 text-white rounded"
                >
                    <Plus size={18} /> Add From Preset
                </button>

                <button
                    onClick={addManualDeliverable}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white rounded"
                >
                    <Plus size={18} /> Custom
                </button>
            </div>

            {/* Header Labels */}
            {items.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-2 text-sm text-gray-300 px-1">
                    <div className="flex-1 min-w-[200px]">Title</div>
                    <div className="w-32">Cost (₹)</div>
                    <div className="w-20">Qty</div>
                    <div className="w-44">Date</div>
                    <div className="w-10"></div>
                </div>
            )}

            {/* Deliverables List */}
            {items.map((item, index) => (
                <div
                    key={index}
                    className="flex flex-wrap gap-3 items-start bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-md"
                >
                    <input
                        type="text"
                        placeholder="Title"
                        value={item.title}
                        onChange={(e) => handleChange(index, 'title', e.target.value)}
                        className="bg-gray-800 text-white p-2 rounded flex-1 min-w-[200px]"
                    />
                    <input
                        type="number"
                        placeholder="Cost"
                        value={item.cost}
                        onChange={(e) => handleChange(index, 'cost', e.target.value)}
                        className="bg-gray-800 text-white p-2 rounded w-32"
                    />
                    <input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleChange(index, 'quantity', e.target.value)}
                        className="bg-gray-800 text-white p-2 rounded w-20"
                    />
                    <input
                        type="date"
                        value={item.date}
                        onChange={(e) => handleChange(index, 'date', e.target.value)}
                        className="bg-gray-800 text-white p-2 rounded w-44"
                    />
                    <button
                        onClick={() => handleRemove(index)}
                        className="text-red-500 hover:text-red-700 p-2"
                        title="Remove"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            ))}

            {/* Total Cost */}
            {items.length > 0 && (
                <div className="mt-6 text-right text-xl font-semibold text-green-400">
                    Total Cost: ₹{totalCost.toLocaleString()}
                </div>
            )}

            {/* Modal for Preset Selection */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
                    <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg w-[90%] max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Select Deliverables Package</h3>
                            <button onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-3">
                            {Object.keys(deliverableOptions).map((key) => (
                                <button
                                    key={key}
                                    onClick={() => addDeliverablesFromOption(key)}
                                    className="w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
                                >
                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Deliverables;
