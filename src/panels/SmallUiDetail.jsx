import React from 'react';
import { Textarea, Label, Icon, Divider, Heading } from 'react-uxp-spectrum';
import { useAppStore } from '../store/appStore';
import { TagSelector } from '@components/TagSelector';

// import '../style.css';

const dummyArray = [
    { id: 1, value: 30 },
    { id: 2, value: 40 },
    { id: 3, value: 30 },
];

const AssetItem = ({ id }) => (
    <div className="mr-2 focus:shadow hover:scale-110">
        <img
            className="rounded-sm w-[70px] hover:border"
            src="https://place.dog/500/500"
            alt="Demo Image"
            onClick={() => console.log('click image', id)}
        />
    </div>
);
export const SmallUiDetail = () => {
    const bears = useAppStore((state) => state.bears);
    const increasePopulation = useAppStore((state) => state.increasePopulation);

    return (
        <div className="flex flex-col">
            <Heading size="XS" weight="light">
                Generated Prompt
            </Heading>
            <Textarea className="w-full"></Textarea>
            <Divider className="my-2" size="small" />
            {/* <Label>Generated Images</Label> */}
            <Heading size="XS" weight="light">
                Generated Images
            </Heading>
            <div className="flex items-center">
                {dummyArray.map((item) => (
                    <AssetItem key={`asset-item-${item.id}`} {...item} />
                ))}
                <Icon size="m" name="ui:ChevronDownMedium" />
            </div>

            <Divider className="my-2" size="small" />
            <Heading size="XS" weight="light">
                Tag Selection
            </Heading>
            <TagSelector tagArray={dummyArray} />
        </div>
    );
};
