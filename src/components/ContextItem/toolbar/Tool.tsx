import React, { FC, useState } from 'react';

type ToolProps = {
    icon?: FC<any>;
    label?: string;
    onClick?: Function;
};

const Tool = (props: ToolProps) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="flex items-center mr-1 cursor-pointer"
            onMouseLeave={() => setIsHovered(false)}
            onMouseEnter={() => setIsHovered(true)}
            onClick={() => props.onClick()}
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

export default Tool;
