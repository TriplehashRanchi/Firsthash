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
    }, [step, clientName, relation, phone]);

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

        const input = phoneInputRef.current;

        const onInput = () => {
            const number = iti.getNumber();
            setPhone(number);

            if (number.length > 5) {
                setTimeout(() => {
                    if (number === '+911234567890') {
                        alert('Existing user found!');
                        setStep('search');
                    } else {
                        setStep('new');
                    }
                }, 500);
            }
        };

        input.addEventListener('input', onInput);

        return () => {
            input.removeEventListener('input', onInput);
            iti.destroy(); // Clean up plugin
        };
    }, []);

    return (
        <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Clients</h2>

            <div className="space-y-4">
                <input
                    type="tel"
                    ref={phoneInputRef}
                    placeholder="Enter phone number"
                    className="w-full bg-gray-800 p-2 rounded"
                />

                {step === 'new' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <input
                            type="text"
                            placeholder="Client name*"
                            className="bg-gray-800 p-2 rounded"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                        />
                        <select
                            className="bg-gray-800 p-2 rounded"
                            value={relation}
                            onChange={(e) => setRelation(e.target.value)}
                        >
                            <option value="">Select Relation</option>
                            <option>Friend</option>
                            <option>Family</option>
                            <option>Corporate</option>
                        </select>
                        <input
                            type="tel"
                            value={phone}
                            readOnly
                            className="bg-gray-800 p-2 rounded"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="bg-gray-800 p-2 rounded"
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
