'use client';
import React, { useState } from 'react';
import { Trash } from 'lucide-react';

const services = ['Photography', 'Cinematography', 'Videography', 'Drone', 'Editing'];

const ShootRow = ({
    shoot,
    onChange,
    onServiceChange,
    onServiceCountChange,
    showServiceOptions,
    setShowServiceOptions,
    onDelete,
    canDelete,
    isFirst,
}) => {
    return (
        <div
            className={`grid ${isFirst ? 'grid-cols-5' : 'grid-cols-[repeat(5,minmax(0,1fr))_40px]'} gap-2 mb-2 items-center`}
        >
            <input
                placeholder="Title"
                className="bg-gray-800 p-2 rounded"
                value={shoot.title}
                onChange={e => onChange('title', e.target.value)}
            />
            <input
                type="date"
                className="bg-gray-800 p-2 rounded"
                value={shoot.date}
                onChange={e => onChange('date', e.target.value)}
            />
            <input
                type="time"
                className="bg-gray-800 p-2 rounded"
                value={shoot.time}
                onChange={e => onChange('time', e.target.value)}
            />
            <input
                placeholder="City"
                className="bg-gray-800 p-2 rounded"
                value={shoot.city}
                onChange={e => onChange('city', e.target.value)}
            />

            <div className="relative">
                <input
                    placeholder="required*"
                    readOnly
                    onClick={() => setShowServiceOptions(!showServiceOptions)}
                    value={Object.keys(shoot.selectedServices).join(', ')}
                    className="bg-gray-800 p-2 rounded w-full cursor-pointer"
                />

                {showServiceOptions && (
                    <div className="absolute z-10 bg-gray-900 p-4 rounded shadow-md mt-2 w-72">
                        <p className="text-sm font-semibold mb-2">Select Services:</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {services.map(service => (
                                <button
                                    key={service}
                                    onClick={() => onServiceChange(service)}
                                    className={`px-2 py-1 text-sm rounded border ${shoot.selectedServices[service]
                                            ? 'bg-blue-600 text-white border-blue-700'
                                            : 'bg-gray-800 text-gray-300 border-gray-700'
                                        }`}
                                >
                                    {service}
                                </button>
                            ))}
                        </div>

                        {Object.keys(shoot.selectedServices).length > 0 && (
                            <div className="space-y-2 mb-3">
                                {Object.entries(shoot.selectedServices).map(([service, count]) => (
                                    <div key={service} className="flex items-center justify-between">
                                        <span className="text-sm">{service}:</span>
                                        <input
                                            type="number"
                                            min="1"
                                            value={count}
                                            onChange={e =>
                                                onServiceCountChange(service, e.target.value)
                                            }
                                            className="bg-gray-800 p-1 w-16 rounded text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowServiceOptions(false)}
                            className="w-full bg-green-600 text-white py-1 rounded hover:bg-green-700 text-sm"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>

            {!isFirst && canDelete && (
                <button
                    onClick={onDelete}
                    className="bg-red-600 text-white rounded p-2 hover:bg-red-700 flex items-center justify-center"
                    title="Delete Shoot"
                    type="button"
                >
                    <Trash size={16} />
                </button>
            )}
        </div>
    );
};

const Shoots = () => {
    const [shoots, setShoots] = useState([
        {
            title: '',
            date: '',
            time: '',
            city: '',
            selectedServices: {},
            showServiceOptions: false,
        },
    ]);

    const handleShootChange = (index, field, value) => {
        setShoots(shoots =>
            shoots.map((shoot, i) =>
                i === index ? { ...shoot, [field]: value } : shoot
            )
        );
    };

    const handleServiceToggle = (index, service) => {
        setShoots(shoots =>
            shoots.map((shoot, i) => {
                if (i !== index) return shoot;
                const updated = { ...shoot.selectedServices };
                if (updated[service]) {
                    delete updated[service];
                } else {
                    updated[service] = 1;
                }
                return { ...shoot, selectedServices: updated };
            })
        );
    };

    const handleServiceCountChange = (index, service, count) => {
        setShoots(shoots =>
            shoots.map((shoot, i) =>
                i === index
                    ? {
                        ...shoot,
                        selectedServices: {
                            ...shoot.selectedServices,
                            [service]: Number(count),
                        },
                    }
                    : shoot
            )
        );
    };

    const handleShowServiceOptions = (index, value) => {
        setShoots(shoots =>
            shoots.map((shoot, i) =>
                i === index ? { ...shoot, showServiceOptions: value } : shoot
            )
        );
    };

    const addShoot = () => {
        setShoots([
            ...shoots,
            {
                title: '',
                date: '',
                time: '',
                city: '',
                selectedServices: {},
                showServiceOptions: false,
            },
        ]);
    };

    const handleDeleteShoot = index => {
        setShoots(shoots => shoots.filter((_, i) => i !== index));
    };

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 flex items-center">
                Shoots
                <button
                    onClick={addShoot}
                    className="ml-3 bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-blue-700"
                    title="Add Shoot"
                    type="button"
                >
                    +
                </button>
            </h2>
            {shoots.map((shoot, idx) => (
                <ShootRow
                    key={idx}
                    shoot={shoot}
                    onChange={(field, value) => handleShootChange(idx, field, value)}
                    onServiceChange={service => handleServiceToggle(idx, service)}
                    onServiceCountChange={(service, count) =>
                        handleServiceCountChange(idx, service, count)
                    }
                    showServiceOptions={shoot.showServiceOptions}
                    setShowServiceOptions={val => handleShowServiceOptions(idx, val)}
                    onDelete={() => handleDeleteShoot(idx)}
                    canDelete={idx !== 0}
                    isFirst={idx === 0}
                />
            ))}
        </div>
    );
};

export default Shoots;
