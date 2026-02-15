
import { SceneObject } from '../types';

export const flattenScene = (objects: SceneObject[]): SceneObject[] => {
    const result: SceneObject[] = [];
    const traverse = (obj: SceneObject) => {
        result.push(obj);
        if (obj.children) {
            obj.children.forEach(traverse);
        }
    };
    objects.forEach(traverse);
    return result;
};
