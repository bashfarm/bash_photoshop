import React, { FC, useState } from 'react';
import {
    VisibilityOffRounded,
    VisibilityRounded,
    PaletteIcon,
    GridViewIcon,
    RefreshIcon,
} from 'components/Icons';
import Tool from './Tool';

const ToolbarDivider = () => {
    return (
        <div className="border-r border-[color:var(--uxp-host-border-color)] mx-1 self-stretch"></div>
    );
};

interface ToolSectionProps {
    children: React.ReactNode;
}
const ToolSection: FC<ToolSectionProps> = ({ children }) => {
    return <div className="flex items-center justify-between">{children}</div>;
};

const ContextToolbar = () => {
    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center justify-evenly">
            <ToolSection>
                <Tool icon={VisibilityOffRounded} label="Mask" />
                <Tool icon={VisibilityRounded} label="Unmask" />
            </ToolSection>
            <ToolbarDivider />
            <ToolSection>
                <Tool icon={PaletteIcon} label="Styles" />
                <Tool icon={GridViewIcon} label="Small Details" />
            </ToolSection>
            <ToolbarDivider />
            <ToolSection>
                <Tool icon={RefreshIcon} label="Regenerate Layer" />
            </ToolSection>
        </div>
    );
};

export default ContextToolbar;
