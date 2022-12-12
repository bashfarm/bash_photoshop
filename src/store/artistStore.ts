import create from 'zustand';

export interface ArtistState {
    artist: string;
    category: string;
    selectArtist: (aritstSelected: string) => void;
    selectCategory: (categorySelected: string) => void;
}

export const useArtistStore = create((set) => ({
    artist: '',
    category: '',
    selectArtist: (artistSelected: string) => set({ artist: artistSelected }),
    selectCategory: (categorySelected: string) =>
        set({ category: categorySelected }),
    // increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
}));
