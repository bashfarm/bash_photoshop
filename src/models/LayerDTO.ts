export class LayerDTO {
    name: string;
    _docid?: number;
    _id?: number;

    constructor(name: string, id: number, _docid?: number, _id?: number) {
        this.name = name;
        this._docid = _docid;
        this._id = _id;
    }

    get id(): number {
        return this._id;
    }

    set id(id: number) {
        this._docid = id;
    }

    get docid(): number {
        return this._id;
    }

    set docid(id: number) {
        this._docid = id;
    }
}
