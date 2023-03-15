import Spectrum, { Label } from 'react-uxp-spectrum';
import React from 'react';

interface DropdownProps {
    options: Array<string>;
	label: string;
	onChange?: (event: any) => void; 
}

export default function Dropdown(props: DropdownProps) {
    const [selectedValue, setSelectedValue] = React.useState<string>(null);

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
