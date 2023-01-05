import React from 'react';
import { Heading } from 'react-uxp-spectrum';

export type ContextLabelProps = {
    value: string | number;
    labelText: string;
};

export default function ContextLabel(props: ContextLabelProps) {
    return (
        <div className="flex flex-row">
            <Heading
                size="XS"
                className="text-xs text-[color:var(--uxp-host-text-color)] rounded"
            >
                {props.labelText}
            </Heading>
            <span className="text-xs text-[color:var(--uxp-host-text-color-secondary)] ml-3">{` ${props.value}`}</span>
        </div>
    );
}
