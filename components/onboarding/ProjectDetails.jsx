'use client';
import React from 'react';

const ProjectDetails = () => {
    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Project Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <input
                    type="text"
                    placeholder="Project name*"
                    className="bg-gray-800 p-2 rounded col-span-2"
                />

                <div className="flex items-center bg-gray-800 rounded col-span-2">
                    <span className="bg-gray-700 p-2 rounded-l">₹</span>
                    <input
                        type="number"
                        placeholder="Package cost*"
                        className="w-full bg-gray-800 p-2 rounded-r"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails;
