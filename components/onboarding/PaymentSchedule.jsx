'use client';
import React from 'react';

const PaymentSchedule = () => {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Payment Schedule</h2>
            <div className="grid grid-cols-3 gap-2">
                <input placeholder="Amount" className="bg-gray-800 p-2 rounded" />
                <input placeholder="Description" className="bg-gray-800 p-2 rounded" />
                <input type="date" className="bg-gray-800 p-2 rounded" />
            </div>
        </div>
    );
};

export default PaymentSchedule;
