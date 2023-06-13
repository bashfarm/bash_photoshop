import Spectrum, { Label } from 'react-uxp-spectrum';
import { ContextItemProps } from './ContextItemProps';
import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';

interface DropDownOption {
    value: string;
    displayName: string;
    thumbnail?: string;
}

interface ContextItemDropdownProps extends ContextItemProps {
    options: Array<DropDownOption>;
}

export default function ContextDropdown(props: ContextItemDropdownProps) {
    const [selectedOption, setSelectedOption] =
        React.useState<DropDownOption>(null);

    let saveContextToStore = useContextStore((state: ContextStoreState) => {
        return state.saveContextToStore;
    });
    let getContextFromStore = useContextStore((state: ContextStoreState) => {
        return state.getContextFromStore;
    });

    return (
        <div>
            <Label>{props.label}</Label>
            <Spectrum.Dropdown>
                <Spectrum.Menu slot="options">
                    {props.options &&
                        props.options.map((option: DropDownOption) => {
                            try {
                                return (
                                    <Spectrum.MenuItem
                                        key={option.value}
                                        className="m-0"
                                        onClick={(event: any) => {
                                            setSelectedOption(option);
                                            if (props.contextKey) {
                                                let copyOfContext =
                                                    getContextFromStore(
                                                        props.contextID
                                                    ).copy();
                                                copyOfContext[
                                                    props.contextKey
                                                ] = option.value;
                                                saveContextToStore(
                                                    copyOfContext
                                                );
                                            }
                                            props?.onChange?.(event);
                                        }}
                                        selected={
                                            selectedOption?.value ==
                                            option?.value
                                        }
                                    >
                                        {option.thumbnail && (
                                            <img
                                                src={option.thumbnail}
                                                alt={option.displayName}
                                                className="inline-block w-10 h-10 mr-1"
                                            />
                                        )}
                                        {option.displayName}
                                    </Spectrum.MenuItem>
                                );
                            } catch (e) {
                                console.error(e);
                            }
                        })}
                </Spectrum.Menu>
            </Spectrum.Dropdown>
        </div>
    );
}
