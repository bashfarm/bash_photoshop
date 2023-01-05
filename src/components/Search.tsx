import React from 'react';
import { Textfield, ActionButton, Icon } from 'react-uxp-spectrum';

export default function Search() {
    return (
        <div className="flex flex-col items-center">
            <Textfield className="w-full mb-3" placeholder="Enter a tag ...">
                {' '}
            </Textfield>
            <ActionButton>
                <Icon name="ui:Magnifier" size="xs" slot="icon" />
                Search
            </ActionButton>
        </div>
    );
}
