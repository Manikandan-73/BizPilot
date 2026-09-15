import React from 'react';
import { HeroSection } from './HeroSection';
import { ProblemSection } from './ProblemSection';
import { SolutionNetwork } from './SolutionNetwork';
import { ImpactSection } from './ImpactSection';
import { PricingSection } from './PricingSection';
import { TechStackSection } from './TechStackSection';
import { FinalCTA } from './FinalCTA';

interface LandingPageProps {
  onLaunchDemo: () => void;
  onOpenCreditPassport: () => void;
  onStartTrial?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDemo,
  onOpenCreditPassport,
  onStartTrial,
}) => {
  const handleStart = onStartTrial || onLaunchDemo;

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A]">
      <HeroSection 
        onLaunchDemo={onLaunchDemo} 
        onOpenCreditPassport={onOpenCreditPassport} 
      />
      <ProblemSection />
      <SolutionNetwork />
      <ImpactSection />
      <PricingSection onSelectPlan={handleStart} />
      <TechStackSection />
      <FinalCTA 
        onStartTrial={handleStart} 
        onRequestDemo={handleStart} 
      />
    </div>
  );
};
