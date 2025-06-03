'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'intl-tel-input/build/css/intlTelInput.css';
import intlTelInput from 'intl-tel-input';

// Props include onDataChange, passed from Page.js
const Clients = ({ onValidChange, onDataChange }) => { 
    const phoneInputRef = useRef(null); // Ref for the phone input element
    const itiInstanceRef = useRef(null); // Ref to store the intl-tel-input instance

    // State for the data this component manages
    const [step, setStep] = useState('search'); // 'search', 'new', 'existing_found'
    const [phoneNumber, setPhoneNumber] = useState(''); // Stores the full international number
    const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
    const [clientName, setClientName] = useState('');
    const [relation, setRelation] = useState('');
    const [email, setEmail] = useState('');

    // --- Initialize intl-tel-input ---
    useEffect(() => {
        if (phoneInputRef.current && !itiInstanceRef.current) { // Initialize only once
            const iti = intlTelInput(phoneInputRef.current, {
                initialCountry: 'auto',
                geoIpLookup: (callback) => {
                    fetch('https://ipapi.co/json')
                        .then((res) => res.json())
                        .then((data) => callback(data.country_code || 'us'))
                        .catch(() => callback('us'));
                },
                utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js',
                separateDialCode: true,
            });
            itiInstanceRef.current = iti; 

            const handlePhoneInputChange = () => {
                if (itiInstanceRef.current) {
                    const currentFullNumber = itiInstanceRef.current.getNumber(); 
                    const isValid = itiInstanceRef.current.isValidNumber();
                    
                    setPhoneNumber(currentFullNumber);
                    setIsPhoneNumberValid(isValid);

                    if (isValid) {
                        // Simulate checking for an existing user
                        if (currentFullNumber === '+911234567890') { 
                            setClientName("Demo User"); 
                            setRelation("Friend"); 
                            setEmail("demo@example.com");
                            setStep('existing_found');
                        } else {
                            if(step === 'existing_found') {
                                setClientName(''); setRelation(''); setEmail('');
                            }
                            setStep('new');
                        }
                    }
                }
            };

            phoneInputRef.current.addEventListener('input', handlePhoneInputChange);
            phoneInputRef.current.addEventListener('countrychange', handlePhoneInputChange);

            return () => {
                if (itiInstanceRef.current) {
                    itiInstanceRef.current.destroy();
                    itiInstanceRef.current = null;
                }
            };
        }
    }, []); 

    // --- useEffect for Validation ---
    useEffect(() => {
        let isSectionValid = false;
        if (step === 'new' || step === 'existing_found') {
            isSectionValid =
                clientName.trim() !== '' &&
                relation.trim() !== '' &&
                isPhoneNumberValid;
        }
        onValidChange?.(isSectionValid);
    }, [clientName, relation, phoneNumber, isPhoneNumberValid, step, onValidChange]);

    // --- useEffect for Reporting Data to Parent ---
    useEffect(() => {
        if (typeof onDataChange === 'function') {
            const clientDetailsPayload = (step === 'new' || step === 'existing_found') && isPhoneNumberValid
                ? { name: clientName, phone: phoneNumber, relation: relation, email: email } 
                : null;

            const componentDataToReport = {
                clientDetails: clientDetailsPayload,
                rawPhoneNumberInput: phoneInputRef.current ? phoneInputRef.current.value : '',
                currentStep: step,
                isPhoneNumberValid: isPhoneNumberValid,
            };
            onDataChange(componentDataToReport);
        }
    }, [clientName, phoneNumber, isPhoneNumberValid, relation, email, step, onDataChange]);


    // --- Style Definitions ---
    const inputBaseStyles = "w-full p-2 rounded border h-[42px]"; // Added consistent height
    const themedInputStyles = `${inputBaseStyles} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;
    const themedSelectStyles = `${themedInputStyles} appearance-none`;
    const readonlyInputStyles = `${inputBaseStyles} bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800/70 dark:text-gray-300 dark:border-gray-600 cursor-default`;
    const customSelectArrow = { 
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center',
        backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'
    };
    const labelStyles = "block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300"; // Added standard label style
    const sectionWrapperStyles = "mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50";
    const sectionHeadingStyles = "text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200";


    return (
        <div className={sectionWrapperStyles}>
            <h2 className={sectionHeadingStyles}>Clients</h2> {/* Changed from Client Details for consistency with image */}
            <div className="space-y-4">
                <div>
                    <label htmlFor="clientPhoneNumberInput" className={labelStyles}>Client Phone*</label>
                    <input
                        id="clientPhoneNumberInput"
                        type="tel"
                        ref={phoneInputRef}
                        className={themedInputStyles}
                        placeholder="Enter phone to search or add new"
                    />
                    {phoneInputRef.current && phoneInputRef.current.value.length > 0 && !isPhoneNumberValid && (
                         <p className="text-xs text-red-500 mt-1">Please enter a valid phone number.</p>
                    )}
                </div>

                {/* Show details form if phone is valid and step is 'new' or 'existing_found' */}
                {(step === 'new' || step === 'existing_found') && isPhoneNumberValid && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t mt-4 dark:border-gray-700">
                        <div>
                            {/* <label htmlFor="clientFullName" className={labelStyles}>Full Name*</label> */}
                            <input
                                id="clientFullName" type="text" placeholder="Client name*"
                                className={themedInputStyles} value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                            />
                        </div>
                        <div>
                            {/* <label htmlFor="clientRelation" className={labelStyles}>Relation*</label> */}
                            <select
                                id="clientRelation" className={themedSelectStyles} style={customSelectArrow}
                                value={relation} onChange={(e) => setRelation(e.target.value)}
                            >
                                <option value="">Select Relation*</option>
                                <option value="Bride">Bride</option>
                                <option value="Groom">Groom</option>
                                <option value="Father">Father</option>
                                <option value="Mother">Mother</option>
                                <option value="Family">Family</option>
                                <option value="Friend">Friend</option>
                                <option value="Corporate Contact">Corporate Contact</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div> {/* Read-only phone number display as per screenshot */}
                            {/* <label htmlFor="clientConfirmedPhone" className={labelStyles}>Confirmed Phone</label> */}
                            <input
                                id="clientConfirmedPhone"
                                type="text" // Display as text
                                value={phoneNumber} // Show the full formatted phone number from state
                                readOnly
                                className={readonlyInputStyles}
                                placeholder="Phone" // Fallback placeholder
                            />
                        </div>
                        <div>
                            {/* <label htmlFor="clientEmailOptional" className={labelStyles}>Email</label> */}
                            <input
                                id="clientEmailOptional" type="email" placeholder="Email"
                                className={themedInputStyles} value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                )}
                 {step === 'search' && !phoneNumber && ( 
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter phone number to search or add a new client.
                    </p>
                )}
            </div>
        </div>
    );
};
export default Clients;