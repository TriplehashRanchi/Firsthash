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
            className={`grid ${
                isFirst ? 'grid-cols-5' : 'grid-cols-[repeat(5,minmax(0,1fr))_auto]'
            } gap-2 mb-2 items-center`}

            
        >
            {/* Input for Title */}
            <input
                placeholder="Title"
                className="bg-gray-800 p-2 rounded"
                value={shoot.title}
                onChange={e => onChange('title', e.target.value)}
            />
            {/* Input for Date */}
            <input
                type="date"
                className="bg-gray-800 p-2 rounded"
                value={shoot.date}
                onChange={e => onChange('date', e.target.value)}
            />
            {/* Input for Time */}
            <input
                type="time"
                className="bg-gray-800 p-2 rounded"
                value={shoot.time}
                onChange={e => onChange('time', e.target.value)}
            />
            
            {/* Requirements input and its dropdown, grouped into one relative div */}
            <div className="relative">
                <input
                    placeholder="requirements*"
                    readOnly
                    onClick={() => setShowServiceOptions(!showServiceOptions)}
                    value={Object.keys(shoot.selectedServices).join(', ') || 'Select services...'}
                    className="bg-gray-800 p-2 rounded w-full cursor-pointer"
                />
                {showServiceOptions && (
                    <div className="absolute z-10 bg-gray-900 p-4 rounded shadow-lg mt-2 w-72 right-0 md:left-0">
                        <p className="text-sm font-semibold mb-2">Select Services:</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {services.map(service => (
                                <button
                                    key={service}
                                    type="button" // Good practice for buttons in forms/dynamic UIs
                                    onClick={() => onServiceChange(service)}
                                    className={`px-2 py-1 text-sm rounded border ${shoot.selectedServices[service]
                                            ? 'bg-blue-600 text-white border-blue-700'
                                            : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
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
                                            className="bg-gray-800 p-1 w-16 rounded text-sm text-center"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            type="button" // Good practice
                            onClick={() => setShowServiceOptions(false)}
                            className="w-full bg-green-600 text-white py-1 rounded hover:bg-green-700 text-sm"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>

            {/* Input for City */}
            <input
                placeholder="City"
                className="bg-gray-800 p-2 rounded"
                value={shoot.city}
                onChange={e => onChange('city', e.target.value)}
            />
            
            {/* Delete button: Renders only if not the first row AND canDelete is true */}
            {/* `canDelete` is passed as `idx !== 0` from Shoots component */}
            {!isFirst && canDelete && (
                <button
                    onClick={onDelete}
                    className="bg-red-600 text-white rounded p-2 h-10 w-10 flex items-center justify-center hover:bg-red-700"
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
            id: Date.now(), // Added an ID for more stable keys
            title: '',
            date: '',
            time: '',
            city: '',
            selectedServices: {},
            showServiceOptions: false,
        },
    ]);

    const handleShootChange = (id, field, value) => {
        setShoots(prevShoots =>
            prevShoots.map(shoot =>
                shoot.id === id ? { ...shoot, [field]: value } : shoot
            )
        );
    };

    const handleServiceToggle = (id, service) => {
        setShoots(prevShoots =>
            prevShoots.map(shoot => {
                if (shoot.id !== id) return shoot;
                const updatedSelectedServices = { ...shoot.selectedServices };
                if (updatedSelectedServices[service]) {
                    delete updatedSelectedServices[service];
                } else {
                    updatedSelectedServices[service] = 1; // Default to 1 when adding
                }
                return { ...shoot, selectedServices: updatedSelectedServices };
            })
        );
    };

    const handleServiceCountChange = (id, service, count) => {
        const newCount = Math.max(1, Number(count)); // Ensure count is at least 1 and is a number
        setShoots(prevShoots =>
            prevShoots.map(shoot =>
                shoot.id === id
                    ? {
                        ...shoot,
                        selectedServices: {
                            ...shoot.selectedServices,
                            [service]: newCount,
                        },
                    }
                    : shoot
            )
        );
    };

    const handleShowServiceOptions = (id, value) => {
        setShoots(prevShoots =>
            prevShoots.map(shoot =>
                // If opening this one, set its showServiceOptions to value (true)
                // and close all others by setting their showServiceOptions to false.
                // If closing this one (value is false), just update this one.
                shoot.id === id 
                ? { ...shoot, showServiceOptions: value } 
                : { ...shoot, showServiceOptions: value ? false : shoot.showServiceOptions }
            )
        );
    };
    // Simpler logic for handleShowServiceOptions if only one can be open at a time:
    const toggleServiceOptions = (id) => {
        setShoots(prevShoots =>
            prevShoots.map(shoot => {
                if (shoot.id === id) {
                    return { ...shoot, showServiceOptions: !shoot.showServiceOptions };
                }
                return { ...shoot, showServiceOptions: false }; // Close others
            })
        );
    };


    const addShoot = () => {
        setShoots(prevShoots => [
            ...prevShoots,
            {
                id: Date.now(), // Unique ID
                title: '',
                date: '',
                time: '',
                city: '',
                selectedServices: {},
                showServiceOptions: false,
            },
        ]);
    };

    const handleDeleteShoot = id => {
        setShoots(prevShoots => prevShoots.filter(shoot => shoot.id !== id));
    };

    return (
        <div className="mb-6 p-4 bg-gray-850 text-white"> {/* Added a background for context */}
            <h2 className="text-xl font-semibold mb-4 flex items-center">
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
                    key={shoot.id} // Use stable ID for key
                    shoot={shoot}
                    onChange={(field, value) => handleShootChange(shoot.id, field, value)}
                    onServiceChange={service => handleServiceToggle(shoot.id, service)}
                    onServiceCountChange={(service, count) =>
                        handleServiceCountChange(shoot.id, service, count)
                    }
                    showServiceOptions={shoot.showServiceOptions}
                    // Use the toggle function for cleaner open/close behavior
                    setShowServiceOptions={() => toggleServiceOptions(shoot.id)} 
                    onDelete={() => handleDeleteShoot(shoot.id)}
                    canDelete={idx !== 0} // Original logic: only non-first rows can be deleted
                    // Alternatively, if you want to allow deleting any row as long as there's more than one:
                    // canDelete={shoots.length > 1} 
                    isFirst={idx === 0}
                />
            ))}

            {shoots.length === 0 && (
                <p className="text-gray-500">No shoots added yet. Click the '+' button to add one.</p>
            )}
        </div>
    );
};

export default Shoots;

