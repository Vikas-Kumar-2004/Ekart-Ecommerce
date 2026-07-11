import React from 'react';
import { Check, Truck, Package, Clock } from 'lucide-react';

const OrderTracker = ({ status }) => {
    // Define the sequence of steps
    const steps = [
        { key: 'Pending', label: 'Pending', icon: Clock },
        { key: 'Processing', label: 'Processing', icon: Package },
        { key: 'Shipped', label: 'Shipped', icon: Truck },
        { key: 'Delivered', label: 'Delivered', icon: Check }
    ];

    // Determine current step index
    // If status is Paid, treat it as Pending for tracking purposes.
    // If status is Failed, we might not show tracking or show it as failed.
    let currentStepIndex = 0;
    if (status === 'Paid') currentStepIndex = 0;
    else if (status === 'Processing') currentStepIndex = 1;
    else if (status === 'Shipped') currentStepIndex = 2;
    else if (status === 'Delivered') currentStepIndex = 3;
    else if (status === 'Pending') currentStepIndex = 0;

    return (
        <div className="w-full py-6 px-2 mt-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
            <h4 className="text-sm font-semibold text-gray-700 mb-6">Tracking Details</h4>
            
            <div className="relative">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
                
                {/* Animated Progress Line */}
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-pink-500 -translate-y-1/2 z-0 rounded-full transition-all duration-700 ease-in-out"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {/* Steps */}
                <div className="relative z-10 flex justify-between">
                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        const Icon = step.icon;

                        return (
                            <div key={step.key} className="flex flex-col items-center">
                                {/* Icon Circle */}
                                <div 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all duration-500 ${
                                        isCompleted ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-200 text-gray-400'
                                    } ${isCurrent ? 'ring-4 ring-pink-100 scale-110' : ''}`}
                                >
                                    <Icon className="w-4 h-4" />
                                </div>
                                
                                {/* Label */}
                                <div className={`mt-2 text-xs font-semibold ${isCompleted ? 'text-pink-600' : 'text-gray-400'}`}>
                                    {step.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {status === 'Failed' && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm font-medium rounded border border-red-100">
                    Your order payment failed or was cancelled. Tracking is unavailable.
                </div>
            )}
        </div>
    );
};

export default OrderTracker;
