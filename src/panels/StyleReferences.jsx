import React, { useState } from 'react';
import { Divider, Heading, Icon, Dropdown, Label } from 'react-uxp-spectrum';
import { useFetchFunction, useFetch } from '../hooks/fetchHooks';
import { getArtists, getArtistCategories } from '../utils/ai_service';
import { useArtistStore } from '../store/artistStore';
const dummyArray = [
    { id: 1, value: 30, src: 'img/cat.jpg' },
    { id: 2, value: 40, src: 'img/cat.jpg' },
    { id: 3, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
    { id: 4, value: 30, src: 'img/cat.jpg' },
];

const StyleImages = (props) => {
    return (
        <img
            className="rounded-sm w-1/5 m-2"
            src={props.src}
            alt="Demo Image"
            // onClick={() => handleClick(src)}
        />
    );
};

// TODO: @kevmok convert into its own component
const ArtistDropdowns = () => {
    const { data: artists } = useFetchFunction(getArtists);
    const { data: category, loading: categoryLoading } =
        useFetchFunction(getArtistCategories);

    const { selectedCategory, selectedArtist, selectCategory, selectArtist } =
        useArtistStore((state) => ({
            selectedCategory: state.category,
            selectedArtist: state.artist,
            selectCategory: state.selectCategory,
            selectArtist: state.selectArtist,
        }));

    let filteredArtists = [];
    if (selectedCategory) {
        filteredArtists = artists.filter(
            (artist) => artist.category === selectedCategory
        );
    }

    return (
        <div className="flex">
            <sp-picker size="s">
                <Label slot="label">Categories</Label>
                <sp-menu slot="options">
                    {categoryLoading ? (
                        <sp-menu-item>Loading categories...</sp-menu-item>
                    ) : (
                        category.map((name, index) => (
                            <sp-menu-item
                                onClick={(e) => selectCategory(e.target.value)}
                                key={`${name}-${index}`}
                            >
                                {name}
                            </sp-menu-item>
                        ))
                    )}
                </sp-menu>
            </sp-picker>

            <sp-picker size="s">
                <Label slot="label">Artists</Label>
                <sp-menu slot="options">
                    {!selectedCategory ? (
                        <sp-menu-item disabled>
                            Select a category...
                        </sp-menu-item>
                    ) : (
                        filteredArtists.map((item, index) => (
                            <sp-menu-item
                                onClick={(e) => selectArtist(e.target.value)}
                                key={`${item.name}-${index}`}
                            >
                                {item.name}
                            </sp-menu-item>
                        ))
                    )}
                </sp-menu>
            </sp-picker>
        </div>
    );
};

export const StyleReferences = () => {
    return (
        <div className="flex flex-col">
            {/* <Heading size="XS" weight="light">
                Artist List
            </Heading> */}
            <ArtistDropdowns />

            <Divider className="my-2" size="small" />

            <div className="flex flex-wrap mb-4 w-full justify-center">
                {dummyArray.map((item) => (
                    <StyleImages key={`asset-item-${item.id}`} src={item.src} />
                ))}
            </div>

            <div className="flex w-1/4 justify-between mx-auto">
                <Icon size="m" name="ui:ChevronLeftMedium"></Icon>
                <Icon size="m" name="ui:ChevronRightMedium"></Icon>
            </div>
        </div>
    );
};
