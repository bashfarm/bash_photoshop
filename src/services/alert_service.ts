const photoshop = require('photoshop');

const alert = (s: string): Promise<void> => {
    return photoshop.app.showAlert(s);
};

export { alert };
