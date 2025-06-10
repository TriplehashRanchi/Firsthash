// app/attendance/components/StatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, Icon, color, details }) => (
    <motion.div 
        className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{details}</p>
        </div>
        <div className={`rounded-full p-3 ${color.bg} ${color.text}`}>
            <Icon className="h-6 w-6" />
        </div>
    </motion.div>
);

export default StatCard;