import create from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface ArtistState {
    artist: string;
    category: string;
    selectArtist: (aritstSelected: string) => void;
    selectCategory: (categorySelected: string) => void;
}

// Log every time state is changed
const log = (config: any) => (set: Function, get: Function, api: any) =>
    config(
        (...args: any) => {
            set(...args);
            console.log('👊ARTIST STORE👊 NEW STATE:', get());
        },
        get,
        api
    );

export const useArtistStore = create(immer(log((set: any, get: any) => ({}))));
