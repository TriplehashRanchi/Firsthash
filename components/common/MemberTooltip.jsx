'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EMPLOYEE_TYPE_MAP = {
  0: 'Freelancer',
  1: 'In-house',
  2: 'Manager',
};

const TYPE_COLORS = {
  0: 'from-amber-500 to-yellow-600',
  1: 'from-blue-500 to-indigo-600',
  2: 'from-purple-500 to-pink-600',
};

const MemberTooltip = ({ member, children }) => {
  const [visible, setVisible] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const ref = useRef(null);

  // Detect whether tooltip should open upwards (if near bottom of viewport)
  useEffect(() => {
    if (visible && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenUpwards(spaceBelow < 300); // open upwards if not enough space below
    }
  }, [visible]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      ref={ref}
    >
      {children}

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: openUpwards ? 8 : -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: openUpwards ? 8 : -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`absolute left-1/2 ${
              openUpwards ? 'bottom-full mb-3' : 'top-full mt-3'
            } z-50 w-80 -translate-x-1/2 rounded-2xl shadow-2xl border backdrop-blur-lg 
            bg-white/80 dark:bg-gray-900/85 border-gray-300 dark:border-gray-700
            text-gray-900 dark:text-white p-5 text-sm`}
            style={{
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gray-300 dark:border-gray-700 pb-3 mb-3">
              <div
                className={`h-11 w-11 rounded-full bg-gradient-to-br ${
                  TYPE_COLORS[member.employee_type] ||
                  'from-gray-400 to-gray-600'
                } flex items-center justify-center text-lg font-semibold shadow-md`}
              >
                {member.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base truncate">{member.name}</p>
                {member.email && (
                  <p className="text-gray-600 dark:text-gray-400 text-xs truncate">
                    {member.email}
                  </p>
                )}
                {member.employee_type !== undefined && (
                  <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full 
                  bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700">
                    {EMPLOYEE_TYPE_MAP[member.employee_type]}
                  </span>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="space-y-2 text-gray-700 dark:text-gray-300 leading-relaxed break-words">
              {member.phone && (
                <div className="flex justify-between flex-wrap">
                  <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                  <span className="font-medium">{member.phone}</span>
                </div>
              )}
              {member.alternate_phone && (
                <div className="flex justify-between flex-wrap">
                  <span className="text-gray-500 dark:text-gray-400">Alt Phone:</span>
                  <span className="font-medium">{member.alternate_phone}</span>
                </div>
              )}
              {member.roles?.length > 0 && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Roles:</span>
                  <p className="font-medium mt-1 text-sm whitespace-pre-wrap">
                    {member.roles.map((r) => r.role_name).join(', ')}
                  </p>
                </div>
              )}
              {member.address && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Address:</span>
                  <p className="font-medium mt-1 whitespace-pre-wrap">{member.address}</p>
                </div>
              )}
              {member.salary && (
                <div className="flex justify-between flex-wrap">
                  <span className="text-gray-500 dark:text-gray-400">Salary:</span>
                  <span className="font-medium">₹ {member.salary}</span>
                </div>
              )}
              <p className="text-gray-500 dark:text-gray-500 text-xs pt-2 border-t border-gray-300 dark:border-gray-700 mt-3">
                Joined: {new Date(member.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Tooltip arrow */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 
              ${openUpwards ? '-bottom-1.5' : '-top-1.5'}
              bg-white/80 dark:bg-gray-900/85 border-l border-t border-gray-300 dark:border-gray-700`}
            ></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemberTooltip;
