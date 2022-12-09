import photoshop from 'photoshop';

const alert = (s: string): Promise<void> => {
    return photoshop.app.showAlert(s);
};

export { alert };
