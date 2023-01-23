import React from 'react';
import { ActionButton, Icon } from 'react-uxp-spectrum';

export type SearchProps = {
    searchableArray: Array<string>;
    withIcon?: boolean;
    noButton?: boolean;
    onKeydownEnter: (currentValue: string) => void;
    onAdd: (currentValue: string) => void;
};

export default function Search(props: SearchProps) {
    let textFieldRef = React.useRef<HTMLInputElement>(null);

    let [currentTagInput, setCurrentTagInput] = React.useState<string>('');

    function onEnter(e: any) {
        if (e.key === 'Enter') {
            console.log('pressed Enter', currentTagInput);

            props.onKeydownEnter(currentTagInput);
        }
    }

    function onInput(e: any) {
        if (textFieldRef.current) {
            setCurrentTagInput(e.target.value);
        }
    }

    React.useEffect(() => {
        textFieldRef?.current?.addEventListener('keydown', onEnter);

        return () => {
            textFieldRef?.current?.removeEventListener('keydown', onEnter);
        };
    });

    React.useEffect(() => {
        textFieldRef?.current?.addEventListener('input', onInput);

        return () => {
            textFieldRef?.current?.removeEventListener('input', onInput);
        };
    });

    return (
        <div className="flex flex-col items-center">
            <sp-textfield
                ref={textFieldRef}
                class="w-full mb-3"
                placeholder="Enter a tag ..."
            >
                {' '}
            </sp-textfield>
            {!props.noButton && (
                <ActionButton
                    onClick={(e: any) => {
                        props.onAdd(currentTagInput);
                    }}
                >
                    {props.withIcon && (
                        <Icon name="ui:CheckmarkMedium" size="xs" slot="icon" />
                    )}
                    Add
                </ActionButton>
            )}
        </div>
    );
}
