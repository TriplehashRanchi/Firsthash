import React from 'react'
import Shoots from '../../../components/onboarding/Shoots'
import ProjectDetails from '../../../components/onboarding/ProjectDetails'
import Clients from '../../../components/onboarding/Clients'
import PaymentSchedule from '../../../components/onboarding/PaymentSchedule'
import Deliverables from '../../../components/onboarding/Deliverables'
import ReceivedAmount from '../../../components/onboarding/ReceivedAmount'
function page() {
    return (
        <div className="min-h-screen bg-black text-white p-6">
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

                    <Clients />
                    <ProjectDetails />
                </div>
                <div>
                    <Shoots />
                    <Deliverables />
                    <ReceivedAmount />
                    <PaymentSchedule />
                </div>
            </div>



        </div>
    )
}

export default page
// 