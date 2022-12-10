import React from 'react';
import { Heading } from 'react-uxp-spectrum';

export type ContextLabelProps = {
    value: string | number;
    labelText: string;
};

export const ContextLabel = (props: ContextLabelProps) => {
    return (
        <div className="flex flex-row">
            <Heading className="text-lg text-brand">{props.labelText}</Heading>
            <span className="text-lg text-white">{` ${props.value}`}</span>
        </div>
    );
};
