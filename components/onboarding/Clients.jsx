'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'intl-tel-input/build/css/intlTelInput.css';
import intlTelInput from 'intl-tel-input';

const Clients = () => {
    const phoneInputRef = useRef(null);
    const [step, setStep] = useState('search');
    const [phone, setPhone] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (phoneInputRef.current) {
            const iti = intlTelInput(phoneInputRef.current, {
                initialCountry: 'auto',
                geoIpLookup: function (callback) {
                    fetch('https://ipapi.co/json')
                        .then((res) => res.json())
                        .then((data) => callback(data.country_code))
                        .catch(() => callback('us'));
                },
                utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js',
            });

            const input = phoneInputRef.current;

            const onInput = () => {
                const number = iti.getNumber();
                setPhone(number);
                setIsTyping(true);

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

            return () => input.removeEventListener('input', onInput);
        }
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
                        />
                        <select className="bg-gray-800 p-2 rounded">
                            <option>Select Relation</option>
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
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clients;
