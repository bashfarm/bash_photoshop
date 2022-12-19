import _ from 'lodash';

export class BashfulObject {
    // return a deep dopy of the object using lodash deepclone and type the return type as the current object
    public copy(): this {
        return _.cloneDeep(this);
    }
}
