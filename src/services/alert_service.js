import photoshop from 'photoshop';

const alert = (s) => {
    return photoshop.app.showAlert(s);
};

export { alert };
