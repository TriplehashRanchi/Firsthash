'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const AddNewBundleButton = () => {
    const { role } = useAuth();
    const base = role === 'manager' ? 'manager' : 'admin';

    return (
        <Link href={`/${base}/task-bundles`}>
            <button className="inline-flex items-center gap-1.5 px-3 py-1 text-sm border border-indigo-200 text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-300 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30">
                <Plus size={14} />
                Add New Bundle
            </button>
        </Link>
    );
};

export default AddNewBundleButton;
