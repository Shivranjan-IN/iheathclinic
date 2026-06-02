import React from 'react';
import { ClinicAIModules } from '../clinic/ClinicAIModules';

interface AIModulesProps {
    user?: any;
    onBack?: () => void;
}

export function AIModules({ user, onBack }: AIModulesProps) {
    const handleBack = onBack || (() => { window.history.back(); });
    return <ClinicAIModules user={user} onBack={handleBack} />;
}
