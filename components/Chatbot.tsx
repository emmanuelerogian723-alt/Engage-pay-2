import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ChatMessage } from '../types';
import { SendIcon, BrainIcon, CloseIcon, MapPinIcon } from './icons';

const Chatbot: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'initial', role: 'model', text: 'Hello! I am your Erogian Social assistant. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isThinkingMode, setThinkingMode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: inputValue,
        };
        setMessages((prev) => [...prev, userMessage]);
        const currentInput = inputValue;
        setInputValue('');
        setIsLoading(true);
        setError(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            let response;
            const isLocationQuery = /near me|in [A-Z][a-z]+|restaurants|coffee shops|bars|directions to/i.test(currentInput);

            if (isThinkingMode) {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-pro',
                    contents: currentInput,
                    config: {
                        thinkingConfig: { thinkingBudget: 32768 },
                    }
                });
            } else if (isLocationQuery) {
                const userLocation = await new Promise<{ latitude: number, longitude: number }>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(
                        (position) => resolve(position.coords),
                        (error) => reject(error)
                    );
                }).catch(err => {
                    setError('Could not get your location. Please enable location services.');
                    return null;
                });

                if (!userLocation) {
                    setIsLoading(false);
                    return;
                }

                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: currentInput,
                    config: {
                        tools: [{ googleMaps: {} }],
                        toolConfig: {
                            retrievalConfig: {
                                latLng: {
                                    latitude: userLocation.latitude,
                                    longitude: userLocation.longitude,
                                }
                            }
                        }
                    }
                });
            } else {
                response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: currentInput
                });
            }
            
            const modelMessage: ChatMessage = {
                id: Date.now().toString() + '-model',
                role: 'model',
                text: response.text,
            };

            const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks && groundingChunks.length > 0) {
                modelMessage.grounding = groundingChunks
                    .filter((chunk: any) => chunk.maps)
                    .map((chunk: any) => ({
                        uri: chunk.maps.uri,
                        title: chunk.maps.title,
                    }));
            }
            
            setMessages((prev) => [...prev, modelMessage]);

        } catch (err) {
            console.error(err);
            setError('Sorry, something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`fixed bottom-24 right-6 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <header className="bg-gray-100 dark:bg-gray-900 p-4 rounded-t-lg flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold">Erogian Social Assistant</h3>
                <div className="flex items-center space-x-2">
                    <button 
                        onClick={() => setThinkingMode(!isThinkingMode)} 
                        title="Toggle Thinking Mode"
                        className={`p-2 rounded-full transition-colors ${isThinkingMode ? 'bg-primary-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                    >
                        <BrainIcon className="w-5 h-5"/>
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <CloseIcon className="w-6 h-6"/>
                    </button>
                </div>
            </header>

            <div className="p-4 h-96 overflow-y-auto">
                <div className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-lg max-w-sm ${msg.role === 'user' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                {msg.grounding && msg.grounding.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                                        <p className="text-xs font-bold mb-1">Sources:</p>
                                        <ul className="space-y-1">
                                            {msg.grounding.map((g, index) => (
                                                <li key={index}>
                                                    <a href={g.uri} target="_blank" rel="noopener noreferrer" className="text-xs flex items-center space-x-1 hover:underline">
                                                        <MapPinIcon className="w-3 h-3 flex-shrink-0"/>
                                                        <span>{g.title}</span>
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex justify-start">
                            <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                </div>
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-gray-100 dark:bg-gray-700 border-transparent rounded-full py-2 px-4 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isLoading}
                />
                <button type="submit" className="bg-primary-600 text-white p-3 rounded-full hover:bg-primary-700 disabled:bg-primary-300" disabled={isLoading || !inputValue.trim()}>
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default Chatbot;