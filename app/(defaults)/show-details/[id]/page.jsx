"use client"
import { useParams } from "next/navigation";

export default function Page() {

    const params = useParams();
    const projectId = params.id;

    return (
        <div className="p-6 bg-white dark:bg-gray-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Project Details</h1>
            <p className="text-gray-600 dark:text-gray-400">This is a placeholder for the project details page.</p>
            <p>{projectId}</p>
        </div>
    );
}