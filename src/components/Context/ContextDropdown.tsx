import Spectrum, { Label } from 'react-uxp-spectrum';
import { ContextProps } from './ContextProps';
import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';

interface ContextDropdownProps extends ContextProps {
    options: Array<string>;
}

export default function ContextDropdown(props: ContextDropdownProps) {
    const [selectedValue, setSelectedValue] = React.useState<string>(null);

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
                        props.options.map((value: string) => {
                            try {
                                return (
                                    <Spectrum.MenuItem
                                        key={value}
                                        onClick={(event: any) => {
                                            setSelectedValue(value);
                                            if (props.contextKey) {
                                                let copyOfContext =
                                                    getContextFromStore(
                                                        props.contextID,
                                                        props.contextType
                                                    ).copy();
                                                copyOfContext[
                                                    props.contextKey
                                                ] = value;
                                                saveContextToStore(
                                                    copyOfContext
                                                );
                                            }
                                            props?.onChange?.(event);
                                        }}
                                        selected={selectedValue == value}
                                    >
                                        {value}
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
