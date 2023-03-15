import React from 'react';
import ReactDOM from 'react-dom';

const PanelController = (
    component,
    { menuItems = [], invokeMenu = () => {} }
) => {
    // console.debug(component)
    var root = null,
        attachment = null;

    const controller = {
        create() {
            root = document.createElement('div');
            root.style.height = '100vh';
            root.style.overflow = 'auto';
            root.style.padding = '10px 20px';
            ReactDOM.render(component, root);
        },

        destroy() {
        },

        show(node) {
            if (!root) {
                controller.create();
            }
            if (!attachment) {
                attachment = node; // the body
                attachment.appendChild(root);
            }
        },

        hide() {
            if (attachment && root) {
                attachment.removeChild(root);
                attachment = null;
            }
        },
        menuItems,
        invokeMenu,
    };

    return controller;
};

export default PanelController;
