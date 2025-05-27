'use client';
import React from 'react';

const ReceivedAmount = () => {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-1">Received Amount</h2>
            <p className="text-sm text-gray-400 mb-2">Amount already paid by client while creating this project. This field is optional</p>
            <div className="grid grid-cols-3 gap-2">
                <input placeholder="Amount" className="bg-gray-800 p-2 rounded" />
                <input placeholder="Description" className="bg-gray-800 p-2 rounded" />
                <input type="date" className="bg-gray-800 p-2 rounded" />
            </div>
        </div>
    );
};

export default ReceivedAmount;