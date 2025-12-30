import React from 'react';
import ThreeDHamburger from './ThreeDHamburger';

interface HamburgerProgressProps {
  currentStep: 'intro' | 'body' | 'conclusion' | 'complete';
}

const HamburgerProgress: React.FC<HamburgerProgressProps> = ({ currentStep }) => {
  const steps = [
    { id: 'intro', label: 'Mở Bài', color: 'bg-orange-400' },
    { id: 'body', label: 'Thân Bài', color: 'bg-green-500' },
    { id: 'conclusion', label: 'Kết Bài', color: 'bg-orange-600' },
  ];

  return (
    <div className="flex flex-col items-center py-4 bg-white rounded-2xl hamburger-shadow mb-6 overflow-hidden">
      <h3 className="text-sm font-bold text-orange-800 mb-2 uppercase tracking-wide">Tiến độ bài viết</h3>
      
      <ThreeDHamburger currentStep={currentStep} />

      <div className="flex items-center gap-2 mt-4 px-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`flex flex-col items-center px-2 py-1 rounded-lg transition-all duration-300 ${
              currentStep === step.id ? 'bg-orange-100 ring-2 ring-orange-400' : 'opacity-40'
            }`}>
              <span className={`text-[10px] font-black whitespace-nowrap ${currentStep === step.id ? 'text-orange-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="w-2 h-0.5 bg-gray-100 rounded-full" />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {currentStep === 'complete' && (
        <div className="mt-3 px-3 py-1 bg-yellow-400 text-white text-[10px] font-bold rounded-full animate-bounce">
          🎉 HOÀN THÀNH XUẤT SẮC!
        </div>
      )}
    </div>
  );
};

export default HamburgerProgress;