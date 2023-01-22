import React from 'react';
import { Button, Icon, Slider } from 'react-uxp-spectrum';

export type TagProps = {
    text: string;
    value: number;
    onClick: (e: any) => void;
    onDelete: (e: any) => void;
    onSliderChange: (value: number) => void;
};

export default function Tag(props: TagProps) {
    const [rangeValue, setValue] = React.useState(props.value);
    return (
        <div className="flex items-center w-full" onClick={props.onClick}>
            <Button onClick={props.onDelete} className="bg-transparent">
                <Icon size="s" name="ui:CrossSmall" className="mr-2 px-4" />
                {props.text}
            </Button>
            <Slider
                min={0}
                max={100}
                value={rangeValue}
                className="w-1/3 py-2 mr-2"
                showValue={true}
                valueLabel="%"
                onInput={(event) => {
                    console.log(event.target.value);
                    console.log('above is the tag slider value');
                    setValue(parseInt(event.target.value));
                    console.log('afterevent');
                    console.log(rangeValue);

                    props.onSliderChange(parseInt(event.target.value));
                    console.log(rangeValue);
                }}
            />

            <p>{rangeValue}%</p>
        </div>
    );
}
