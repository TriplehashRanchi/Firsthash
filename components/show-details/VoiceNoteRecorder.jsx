'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, Play, Pause, Trash2, UploadCloud, Radio } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.esm.js';

export const VoiceNoteRecorder = ({ isOpen, onClose, task, onUpload }) => {
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null); // This will now hold ONLY the instance
    const [isRecording, setIsRecording] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [audioUrl, setAudioUrl] = useState('');
    const [audioBlob, setAudioBlob] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // This effect now ONLY handles initialization and destruction.
    useEffect(() => {
        if (isOpen && waveformRef.current) {
            // If an instance doesn't exist, create it
            const wavesurfer = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#A5B4FC',
                progressColor: '#4F46E5',
                barWidth: 3,
                barGap: 2,
                barRadius: 2,
                height: 80,
            });

            const record = wavesurfer.registerPlugin(RecordPlugin.create());
            
            record.on('record-end', (blob) => {
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                wavesurfer.load(url);
            });
            
            wavesurfer.on('play', () => setIsPlaying(true));
            wavesurfer.on('pause', () => setIsPlaying(false));
            wavesurfer.on('finish', () => setIsPlaying(false));

            wavesurferRef.current = { wavesurfer, record }; // Store both in the ref
            
        }

        // --- THE FIX: The cleanup function now runs when isOpen becomes false ---
        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.wavesurfer.destroy();
                wavesurferRef.current = null;
            }
        };
    }, [isOpen]); // This effect ONLY depends on `isOpen`

    // --- NEW: A separate effect to handle LOADING audio when the task or instance changes ---
    useEffect(() => {
        if (wavesurferRef.current && task) {
             // Reset component state whenever the task changes
            setIsRecording(false);
            setIsPlaying(false);
            setAudioBlob(null);

            if (task.voice_note_url) {
                setAudioUrl(task.voice_note_url);
                wavesurferRef.current.wavesurfer.load(task.voice_note_url);
            } else {
                setAudioUrl('');
                wavesurferRef.current.wavesurfer.empty();
            }
        }
    }, [task, wavesurferRef.current]); // Depends on the task and the wavesurfer instance


    if (!isOpen) return null;

    const startRecording = () => {
        if (wavesurferRef.current) {
            resetRecording();
            setIsRecording(true);
            wavesurferRef.current.record.startRecording();
        }
    };

    const stopRecording = () => {
        console.log('STOP RECORDING CLICKED');
        if (wavesurferRef.current) {
            setIsRecording(false);
            wavesurferRef.current.record.stopRecording();
        }
    };
    
    const togglePlayback = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.wavesurfer.playPause();
        }
    };

    const handleUploadClick = async () => {
        if (!audioBlob) return;
        setIsUploading(true);
        await onUpload(audioBlob);
        setIsUploading(false);
        onClose();
    };

    const resetRecording = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.wavesurfer.empty();
        }
        setAudioBlob(null);
        setAudioUrl('');
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="font-semibold text-gray-800 dark:text-white truncate pr-4">Voice Note: {task.title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"><X size={20} className="text-gray-500" /></button>
                </div>
                
                <div className="p-6 flex flex-col items-center justify-center space-y-6 min-h-[250px]">
                    <div ref={waveformRef} className="w-full" />
                    
                    {/* UI STATE 1: Ready to Record (no existing URL) */}
                    {!isRecording && !audioUrl && (
                        <div className="text-center">
                            <button onClick={startRecording} className="w-24 h-24 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg hover:scale-105">
                                <Mic size={48} />
                            </button>
                            <p className="mt-4 text-gray-500">Tap to record</p>
                        </div>
                    )}

                    {/* UI STATE 2: Currently Recording */}
                    {isRecording && (
                        <div className="text-center">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <Radio size={32} className="text-red-500 animate-ping absolute" />
                                <button onClick={stopRecording} className="w-20 h-20 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg z-10">
                                    <Pause size={40} />
                                </button>
                            </div>
                            <p className="mt-4 text-sm font-mono text-gray-500">Recording...</p>
                        </div>
                    )}
                    
                    {/* UI STATE 3: Playback / Upload */}
                    {audioUrl && !isRecording && (
                        <div className="w-full text-center">
                            <div className="flex w-full justify-between items-center pt-6 mt-2">
                                <button onClick={resetRecording} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} /> Re-record
                                </button>
                                <button onClick={togglePlayback} className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-all shadow-md">
                                    {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                                </button>
                                {audioBlob ? (
                                    <button onClick={handleUploadClick} disabled={isUploading} className="flex items-center gap-2 text-white bg-indigo-600 px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400">
                                        {isUploading ? 'Uploading...' : 'Save'}
                                        <UploadCloud size={16} />
                                    </button>
                                ) : (
                                    <div style={{ width: '88px' }}></div> // Placeholder to keep layout consistent
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};