export interface ExtendedHTMLDialogElement extends HTMLDialogElement {
    uxpShowModal(options: any): Promise<void>;
}
