import React, { ReactElement } from 'react';
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';

type ToolProps = {
    icon?: ReactElement;
    label?: string;
};

const ToolbarDivider = () => {
    return (
        <div className="border-r border-[color:var(--uxp-host-border-color)] mx-1 self-stretch"></div>
    );
};

const Tool = (props: ToolProps) => {
    const iconComponent = props?.icon;
    return (
        <div className="flex items-center">
            {props.icon &&
                React.cloneElement(iconComponent, {
                    fontSize: 'small',
                    className: 'hover:border',
                })}
            {props?.label}
        </div>
    );
};

const ContextToolbar = () => {
    return (
        <div className="flex w-full border-b border-[color:var(--uxp-host-border-color)] mb-1 p-1 items-center">
            <div>ContextToolbar</div>
            <ToolbarDivider />
            <Tool icon={<VisibilityOffRounded />} label="Hide" />
        </div>
    );
};

export default ContextToolbar;
