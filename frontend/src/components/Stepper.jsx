import React from "react";
import { Check } from "lucide-react";

const steps = ["Cart", "Address", "Payment"];

const Stepper = ({ currentStep }) => {
  return (
    <div className="flex items-center justify-center space-x-8 my-10">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={index} className="flex items-center space-x-2">
            {/* Step circle */}
            <div
              className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2
                ${isCompleted ? "bg-green-500 border-green-500 text-white" : ""}
                ${isActive ? "border-pink-600 text-pink-600" : ""}
                ${!isCompleted && !isActive ? "border-gray-300 text-gray-400" : ""}
              `}
            >
              {isCompleted ? <Check size={20} /> : index + 1}
            </div>

            {/* Step label */}
            <span
              className={`
                text-sm font-medium
                ${isActive ? "text-pink-600" : "text-gray-500"}
              `}
            >
              {step}
            </span>

            {/* Line between steps */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-16 h-[2px]
                  ${isCompleted ? "bg-green-500" : "bg-gray-300"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
