
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ValidationError } from '../../utils/validation';

interface ValidationNoticeProps {
    errors: ValidationError[];
    sectionId?: string;
}

export const ValidationNotice: React.FC<ValidationNoticeProps> = ({ errors, sectionId }) => {
    if (errors.length === 0) return null;

    return (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl m-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-wider text-sm">Configuration Error</h3>
            </div>
            {sectionId && <div className="text-xs text-red-300/50 font-mono mb-2">ID: {sectionId}</div>}
            <ul className="list-disc list-inside space-y-1">
                {errors.map((err, i) => (
                    <li key={i} className="text-xs text-red-200 font-mono">
                        {err.message}
                    </li>
                ))}
            </ul>
        </div>
    );
};
