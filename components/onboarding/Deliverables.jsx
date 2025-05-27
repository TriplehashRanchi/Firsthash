'use client';
import React from 'react';

const Deliverables = () => {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Deliverables</h2>
            <div className="grid grid-cols-4 gap-2">
                <input placeholder="Title" className="bg-gray-800 p-2 rounded" />
                <input placeholder="Cost" className="bg-gray-800 p-2 rounded" />
                <input placeholder="Quantity" className="bg-gray-800 p-2 rounded" />
                <input type="date" className="bg-gray-800 p-2 rounded" />
            </div>
        </div>
    );
};

export default Deliverables;