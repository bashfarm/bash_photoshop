import React, { useState } from 'react';
import { Divider, Heading, Icon, Dropdown } from 'react-uxp-spectrum';
import { useFetchFunction, useFetch } from '../hooks/fetchHooks';
import { getArtists, getArtistCategories } from '../utils/ai_service';
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

const SpMenuItems = ({ name, score, category }) => (
    <sp-menu-item> {name} </sp-menu-item>
);
export const StyleReferences = () => {
    // const { artist, loadingArtist, artistError } = useFetchFunction(getArtists);
    const {
        data: artist,
        loading: artistLoading,
        error: artistError,
    } = useFetchFunction(getArtists);

    return (
        <div className="flex flex-col">
            <Heading size="XS" weight="light">
                Artist List
            </Heading>
            {/* {artistLoading && 'Loading...'} */}
            <Dropdown>
                <sp-menu slot="options">
                    {artistLoading ? (
                        <sp-menu-item>Loading</sp-menu-item>
                    ) : (
                        artist.map((item, index) => (
                            <SpMenuItems key={index} name={item.name} />
                        ))
                    )}
                </sp-menu>
                {artist && console.log(artist)}
            </Dropdown>
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
