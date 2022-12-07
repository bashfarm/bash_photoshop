import create from 'zustand';

export const useArtistStore = create((set) => ({
    artist: '',
    category: '',
    selectArtist: (artistSelected) => set({ artist: artistSelected }),
    selectCategory: (categorySelected) => set({ category: categorySelected }),
    increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
}));
