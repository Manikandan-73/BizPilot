import React from 'react';
import { MSMERegistrationFlow } from './MSMERegistrationFlow';
import { Organization } from '../../types/business';

interface RegisterPageProps {
  onSuccess: (org?: Organization) => void;
  onSwitchToLogin: () => void;
  onGoHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onSwitchToLogin,
  onGoHome,
}) => {
  return (
    <MSMERegistrationFlow
      onRegistrationComplete={(org) => onSuccess(org)}
      onSwitchToLogin={onSwitchToLogin}
      onGoHome={onGoHome}
    />
  );
};
