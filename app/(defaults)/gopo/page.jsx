'use client';
import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Shoots from '../../../components/onboarding/Shoots';
import ProjectDetails from '../../../components/onboarding/ProjectDetails';
import Clients from '../../../components/onboarding/Clients';
import PaymentSchedule from '../../../components/onboarding/PaymentSchedule';
import Deliverables from '../../../components/onboarding/Deliverables';
import ReceivedAmount from '../../../components/onboarding/ReceivedAmount';

function Page() {
    // You will collect validation flags from each section
    const [isClientsValid, setIsClientsValid] = useState(false);
    const [isProjectDetailsValid, setIsProjectDetailsValid] = useState(false);
    const [isShootsValid, setIsShootsValid] = useState(false);
    const [isDeliverablesValid, setIsDeliverablesValid] = useState(false);
    const [isReceivedValid, setIsReceivedValid] = useState(false);
    const [isScheduleValid, setIsScheduleValid] = useState(false);

    const handleSave = () => {
        if (
            isClientsValid &&
            isProjectDetailsValid &&
            isShootsValid &&
            isDeliverablesValid &&
            isReceivedValid &&
            isScheduleValid
        ) {
            toast.success("All data valid. Ready to send to backend.");

            // Backend integration goes here
            // Example: axios.post('/api/projects', fullProjectData)

        } else {
            toast.error("Please fill all required sections before saving.");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <ToastContainer />
            <div className="mt-8 text-left">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold">New Project</h1>
                    <button className="bg-blue-600 text-white px-4 py-2 text-xl rounded hover:bg-blue-700">
                        Create
                    </button>
                </div>
            </div>

            <div className="grid gap-8">
                <div>
                    <Clients onValidChange={setIsClientsValid} />
                    <ProjectDetails onValidChange={setIsProjectDetailsValid} />
                </div>
                <div>
                    <Shoots onValidChange={setIsShootsValid} />
                    <Deliverables onValidChange={setIsDeliverablesValid} />
                    <ReceivedAmount onValidChange={setIsReceivedValid} />
                    <PaymentSchedule onValidChange={setIsScheduleValid} />
                </div>
            </div>

            {/* Save Button at the Bottom */}
            <div className="mt-10 text-center">
                <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-6 py-3 rounded text-lg hover:bg-green-700"
                >
                    Save
                </button>
            </div>
        </div>
    );
}

export default Page;
