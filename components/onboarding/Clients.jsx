'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'intl-tel-input/build/css/intlTelInput.css';
import intlTelInput from 'intl-tel-input';

const Clients = ({ onValidChange }) => {
    const phoneInputRef = useRef(null);
    const [step, setStep] = useState('search');
    const [phone, setPhone] = useState('');
    const [clientName, setClientName] = useState('');
    const [relation, setRelation] = useState('');
    const [email, setEmail] = useState('');

    // Sync validation with parent
    useEffect(() => {
        if (step === 'new') {
            const isValid =
                clientName.trim() !== '' &&
                relation.trim() !== '' &&
                phone.length > 5;
            onValidChange?.(isValid);
        } else {
            onValidChange?.(false);
        }
    }, [step, clientName, relation, phone, onValidChange]);

    useEffect(() => {
        if (!phoneInputRef.current) return;

        const iti = intlTelInput(phoneInputRef.current, {
            initialCountry: 'auto',
            geoIpLookup: (callback) => {
                fetch('https://ipapi.co/json')
                    .then((res) => res.json())
                    .then((data) => callback(data.country_code))
                    .catch(() => callback('us'));
            },
            utilsScript:
                'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js',
        });

        const inputElement = phoneInputRef.current;
        const handleInput = () => {
            const currentNumber = iti.getNumber();
            setPhone(currentNumber);
            if (currentNumber.length > 5) {
                setTimeout(() => {
                    if (currentNumber === '+911234567890') {
                        alert('Existing user found!');
                        setStep('search');
                    } else {
                        setStep('new');
                    }
                }, 500);
            }
        };
        inputElement.addEventListener('input', handleInput);
        return () => {
            inputElement.removeEventListener('input', handleInput);
            iti.destroy();
        };
    }, []);

    // --- Styles for Light/Dark Mode ---
    const inputBaseStyles = "w-full p-2 rounded border"; // Common styles

    // Default (Light Mode) + Dark Mode specific styles
    // For inputs that should have a distinct background
    const themedInputStyles = `${inputBaseStyles} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;

    // For select elements (includes appearance-none for custom arrow styling)
    const themedSelectStyles = `${themedInputStyles} appearance-none`;

    // For readonly inputs, adjust background for light/dark
    const readonlyInputStyles = `${inputBaseStyles} bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 cursor-not-allowed`;

    // Custom select arrow (can also be themed if needed)
    const customSelectArrowLight = { /* styles for light mode arrow */ };
    const customSelectArrowDark = { /* styles for dark mode arrow */ };
    // Or a single style if the arrow color works for both:
    const customSelectArrow = {
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, // A mid-gray arrow
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.5rem center',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem'
    };


    return (
        // Section wrapper: light bg in light mode, darker bg in dark mode
        <div className="mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50">
            <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Clients</h2>

            <div className="space-y-4">
                {/* Phone input for search */}
                <input
                    type="tel"
                    ref={phoneInputRef}
                    placeholder="Enter phone number"
                    className={themedInputStyles}
                />

                {step === 'new' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Client name*"
                            className={themedInputStyles}
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                        />
                        <select
                            className={themedSelectStyles}
                            style={customSelectArrow} // Apply custom arrow
                            value={relation}
                            onChange={(e) => setRelation(e.target.value)}
                        >
                            <option value="">Select Relation*</option>
                            <option>Friend</option>
                            <option>Family</option>
                            <option>Corporate</option>
                        </select>
                        <input
                            type="tel"
                            value={phone}
                            readOnly
                            className={readonlyInputStyles}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className={themedInputStyles}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clients;