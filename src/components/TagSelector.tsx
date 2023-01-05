import React from 'react';
import Search from './Search';
import Tag, { TagProps } from './Tag';

export type TagSelectorProps = {
    tagArray: Array<TagProps>;
};

export default function TagSelector(props: TagSelectorProps) {
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
}
