'use client';
import React, { useEffect, useRef, useState } from 'react';
import 'intl-tel-input/build/css/intlTelInput.css';
import intlTelInput from 'intl-tel-input';

const Clients = ({ company, onValidChange, onDataChange }) => {
  const phoneInputRef = useRef(null);
  const itiInstanceRef = useRef(null);

  const [step, setStep] = useState('search');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);
  const [clientName, setClientName] = useState('');
  const [relation, setRelation] = useState('');
  const [email, setEmail] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // ✅ Setup intl-tel-input once
  useEffect(() => {
    if (phoneInputRef.current && !itiInstanceRef.current) {
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
    }
  }, []);

  // ✅ Handle phone input change via React event
  const handlePhoneChange = async () => {
    if (!itiInstanceRef.current) return;

    const fullNumber = itiInstanceRef.current.getNumber();
    const isValid = itiInstanceRef.current.isValidNumber();

    setPhoneNumber(fullNumber);
    setIsPhoneNumberValid(isValid);

    if (!isValid || !company?.id) {
      setStep('search');
      return;
    }

    try {
      console.log('📞 Valid number:', fullNumber);
      const res = await fetch(
        `${API_URL}/api/clients/search?phone=${encodeURIComponent(fullNumber)}&company_id=${encodeURIComponent(company.id)}`
      );
      const data = await res.json();

      if (data.found) {
        setClientName(data.client.name || '');
        setRelation(data.client.relation || '');
        setEmail(data.client.email || '');
        setStep('existing_found');
      } else {
        setClientName('');
        setRelation('');
        setEmail('');
        setStep('new');
      }
    } catch (err) {
      console.error('❌ Error searching client:', err);
      setStep('new');
    }
  };

  // ✅ Validation
  useEffect(() => {
    let valid = false;
    if ((step === 'new' || step === 'existing_found') && isPhoneNumberValid) {
      valid = clientName.trim() !== '' && relation.trim() !== '';
    }
    onValidChange?.(valid);
  }, [clientName, relation, phoneNumber, isPhoneNumberValid, step, onValidChange]);

  // ✅ Report data to parent
  useEffect(() => {
    if (typeof onDataChange === 'function') {
      const clientDetails = (step === 'new' || step === 'existing_found') && isPhoneNumberValid
        ? { name: clientName, phone: phoneNumber, relation, email }
        : null;

      onDataChange({
        clientDetails,
        rawPhoneNumberInput: phoneInputRef.current?.value || '',
        currentStep: step,
        isPhoneNumberValid,
      });
    }
  }, [clientName, phoneNumber, isPhoneNumberValid, relation, email, step, onDataChange]);

  // Styles
  const inputBaseStyles = "w-full p-2 rounded border h-[42px]";
  const themedInputStyles = `${inputBaseStyles} bg-white text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400`;
  const themedSelectStyles = `${themedInputStyles} appearance-none`;
  const readonlyInputStyles = `${inputBaseStyles} bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800/70 dark:text-gray-300 dark:border-gray-600 cursor-default`;
  const customSelectArrow = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'
  };
  const labelStyles = "block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300";
  const sectionWrapperStyles = "mb-6 p-4 bg-white dark:bg-gray-800/50 rounded-lg shadow-md dark:shadow-gray-700/50";
  const sectionHeadingStyles = "text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200";

  return (
    <div className={sectionWrapperStyles}>
      <h2 className={sectionHeadingStyles}>Clients</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="clientPhoneNumberInput" className={labelStyles}>Client Phone*</label>
          <input
            id="clientPhoneNumberInput"
            type="tel"
            ref={phoneInputRef}
            className={themedInputStyles}
            placeholder="Enter phone to search or add new"
            onChange={handlePhoneChange} // ✅ React way
          />
          {phoneInputRef.current?.value?.length > 0 && !isPhoneNumberValid && (
            <p className="text-xs text-red-500 mt-1">Please enter a valid phone number.</p>
          )}
        </div>

        {(step === 'new' || step === 'existing_found') && isPhoneNumberValid && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t mt-4 dark:border-gray-700">
            <div>
              <input
                id="clientFullName"
                type="text"
                placeholder="Client name*"
                className={themedInputStyles}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <select
                id="clientRelation"
                className={themedSelectStyles}
                style={customSelectArrow}
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
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
            <div>
              <input
                id="clientConfirmedPhone"
                type="text"
                value={phoneNumber}
                readOnly
                className={readonlyInputStyles}
                placeholder="Phone"
              />
            </div>
            <div>
              <input
                id="clientEmailOptional"
                type="email"
                placeholder="Email"
                className={themedInputStyles}
                value={email}
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
