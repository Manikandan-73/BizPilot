import React from 'react';
import { Target } from 'lucide-react';
import { BUSINESS_CHALLENGES, BUSINESS_GOALS, BusinessChallenge, BusinessGoal, GoalsProfile } from '../../../types/onboarding';
import { FormField } from '../FormField';
import { ChipMultiSelect, ChipSingleSelect } from '../ChoiceControls';

interface Step4GoalsProps {
  data: GoalsProfile;
  errors: Partial<Record<keyof GoalsProfile, string>>;
  onToggleGoal: (goal: BusinessGoal) => void;
  onSelectChallenge: (challenge: BusinessChallenge) => void;
}

export const Step4Goals: React.FC<Step4GoalsProps> = ({ data, errors, onToggleGoal, onSelectChallenge }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-purple-300">
        <Target className="w-4 h-4" />
        <h2 className="text-sm font-bold uppercase tracking-wider">Business Goals</h2>
      </div>

      <FormField
        label="What are you hoping to achieve with BizPilot AI?"
        required
        error={errors.goals}
        helperText="Select all that apply"
      >
        <ChipMultiSelect options={BUSINESS_GOALS} selected={data.goals} onToggle={onToggleGoal} />
      </FormField>

      <FormField label="What is your biggest current business challenge?" required error={errors.biggestChallenge}>
        <ChipSingleSelect options={BUSINESS_CHALLENGES} selected={data.biggestChallenge} onSelect={onSelectChallenge} />
      </FormField>
    </div>
  );
};