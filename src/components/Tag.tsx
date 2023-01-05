import React from 'react';
import { Icon, Slider } from 'react-uxp-spectrum';

export type TagProps = {
    id: number;
    value: number;
};

export default function Tag(props: TagProps) {
    const [rangeValue, setValue] = React.useState(props.value);
    return (
        <div className="flex items-center w-full">
            <Icon size="s" name="ui:CrossSmall" className="mr-2 px-4" />
            <p className="text-xs mr-5">Blizzard Games</p>
            <Slider
                min={0}
                max={100}
                value={rangeValue}
                className="w-1/3 py-2 mr-2"
                showValue={true}
                valueLabel="%"
                onInput={(event) => setValue(parseInt(event.target.value))}
            ></Slider>

            <p>{rangeValue}%</p>
        </div>
    );
}
