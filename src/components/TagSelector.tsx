import _ from 'lodash';
import ContextTag from 'models/ContextTag';
import React from 'react';
import { ContextStoreState, useContextStore } from 'store/contextStore';
import { ContextProps } from './Context/ContextProps';
import Search from './Search';
import Tag from './Tag';

export interface TagSelectorProps extends ContextProps {
    suggestions: Array<string>;
}

export default function TagSelector(props: TagSelectorProps) {
    let getContextFromStore = useContextStore(
        (state: ContextStoreState) => state.getContextFromStore
    );
    let saveContextToStore = useContextStore(
        (state: ContextStoreState) => state.saveContextToStore
    );
    let tags = getContextFromStore(props.contextID, props.contextType).tags;
    console.log(tags);

    function removeTagFromContext(tag: ContextTag) {
        let copyOfContext = getContextFromStore(
            props.contextID,
            props.contextType
        ).copy();
        copyOfContext.removeTag(tag);
        saveContextToStore(copyOfContext);
    }

    function addTagToContext(tag: ContextTag) {
        let copyOfContext = getContextFromStore(
            props.contextID,
            props.contextType
        ).copy();
        copyOfContext.addTag(tag);
        saveContextToStore(copyOfContext);
    }

    return (
        <div className="flex justify-between w-full bg-[#3f3f3f] border border-[#545454] rounded shadow-md hover:border-[#707070] items-center">
            <div className="flex flex-col">
                {Object.values(tags).map(
                    (tag: ContextTag) => (
                        console.log(tag),
                        (
                            <Tag
                                key={_.uniqueId()}
                                onClick={() => {
                                    console.log('tag click');
                                }}
                                value={tag.value}
                                text={tag?.text ?? ''}
                                onDelete={() => removeTagFromContext(tag)}
                                onSliderChange={(value: number) => {
                                    let copyOfContext = getContextFromStore(
                                        props.contextID,
                                        props.contextType
                                    ).copy();
                                    let copyOfTag = tag.copy();
                                    copyOfTag.value = value;
                                    copyOfContext.addTag(copyOfTag);

                                    console.log(copyOfContext);
                                    saveContextToStore(copyOfContext);
                                }}
                            />
                        )
                    )
                )}
            </div>

            <Search
                searchableArray={props.suggestions}
                onKeydownEnter={(currentValue) => {
                    console.log('enter');
                    addTagToContext(new ContextTag({ text: currentValue }));
                }}
                onAdd={(currentValue) => {
                    console.log('add');
                    console.log(currentValue);
                    addTagToContext(new ContextTag({ text: currentValue }));
                }}
                noButton={true}
            />
        </div>
    );
}
