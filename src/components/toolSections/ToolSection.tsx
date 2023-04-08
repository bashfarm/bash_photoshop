import React, { FC } from 'react';

interface ToolSectionProps {
    children: React.ReactNode;
}

export const ToolSection: FC<ToolSectionProps> = ({ children }: any) => {
    return <div className="flex items-center justify-between">{children}</div>;
};
