
import { ShapeType } from '../types';

const DOM_SHAPES_SET = new Set<ShapeType>(['tile', 'card', 'list', 'group']);

export const isDOMShape = (shape: ShapeType): boolean => {
    return DOM_SHAPES_SET.has(shape);
};

export const isWebGLShape = (shape: ShapeType): boolean => {
    // If it's not a DOM shape, we treat it as WebGL (primitives, storm, plane)
    return !DOM_SHAPES_SET.has(shape);
};
