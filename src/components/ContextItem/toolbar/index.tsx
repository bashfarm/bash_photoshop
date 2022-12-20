import React, { FC, ReactElement, useState } from 'react';
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';

type ToolProps = {
    icon?: FC<any>;
    label?: string;
};

const Tool = (props: ToolProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="flex items-center mr-1"
            onMouseLeave={() => setIsHovered(false)}
            onMouseEnter={() => setIsHovered(true)}
        >
            {props.icon && (
                <props.icon
                    {...{
                        style: {
                            color: isHovered
                                ? 'var(--uxp-host-text-color-secondary)'
                                : 'var(--uxp-host-text-color)',
                        },
                        fontSize: 'small',
                    }}
                />
            )}
            {props.label && (
                <div
                    className="ml-1"
                    style={{
                        color: isHovered
                            ? 'var(--uxp-host-text-color-secondary)'
                            : 'var(--uxp-host-label-text-color)',
                    }}
                >
                    {props.label}
                </div>
            )}
        </div>
    );
};

const ToolbarDivider = () => {
    return (
        <div className="border-r border-[color:var(--uxp-host-border-color)] mx-1 self-stretch"></div>
    );
};

const ContextToolbar = () => {
    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center">
            <Tool icon={VisibilityRounded} label="Unhide" />
            <Tool icon={VisibilityOffRounded} label="Hide" />
            <ToolbarDivider />
        </div>
    );
};

export default ContextToolbar;
