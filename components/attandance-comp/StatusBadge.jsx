// app/attendance/components/StatusBadge.jsx
import React from 'react';
import { Check, Clock, X } from 'lucide-react';

const StatusBadge = ({ status }) => {
    const config = {
        present: { styles: 'bg-green-100 text-green-800 dark:bg-green-900/70 dark:text-green-300', IconComponent: Check },
        late: { styles: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/70 dark:text-yellow-300', IconComponent: Clock },
        absent: { styles: 'bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-300', IconComponent: X },
    };

    const currentStatus = config[status];
    if (!currentStatus) return null;
    
    const Icon = currentStatus.IconComponent;

    return (
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${currentStatus.styles}`}>
            <Icon className="h-3 w-3" />
            <span className="capitalize">{status}</span>
        </div>
    );
};

export default StatusBadge;