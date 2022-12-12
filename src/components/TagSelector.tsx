import React from 'react';
import { Icon, Slider, Textfield, ActionButton } from 'react-uxp-spectrum';

export type TagSelectorProps = {
    tagArray: Array<tag>;
};

export type tag = {
    id: number;
    value: number;
};
export const TagSelector = (props: TagSelectorProps) => {
    return (
        <div className="flex justify-between w-full bg-[#3f3f3f] border border-[#545454] rounded shadow-md hover:border-[#707070] items-center">
            <div className="flex flex-col">
                {props.tagArray.map((tag) => (
                    <Tag key={`tag-[${tag.id}]`} {...tag} />
                ))}
            </div>

            <Search />
        </div>
    );
};

export const Tag = (props: tag) => {
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
};

export const Search = () => {
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
};
