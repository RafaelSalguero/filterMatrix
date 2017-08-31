import { intersectKeys, pipe, first } from "keautils";
export type MatrixInput<ItemTypes> = {[K in keyof ItemTypes]: ItemTypes[K][]};
export interface ListFilter<TListItem, TValue> {
    (list: TListItem[], value: TValue): TListItem[];
}

/**
 * A type that defines a filter matrix
 */
export type FilterMatrix<ItemTypes> = {[K1 in (keyof ItemTypes)]: {[K2 in (keyof ItemTypes)]: ListFilter<ItemTypes[K1], ItemTypes[K2]> } };
export type PartialFilterMatrix<ItemTypes> = {[K1 in (keyof ItemTypes)]: {[K2 in (keyof ItemTypes)]?: ListFilter<ItemTypes[K1], ItemTypes[K2]> } };


/**Apply a filter matrix */
export function applyFilterMatrix<ItemTypes extends {}>(matrix: FilterMatrix<ItemTypes>, lists: {[K in keyof ItemTypes]: ItemTypes[K][]}, values: ItemTypes): ItemTypes {
    //Type of a row/column of the matrix
    type Row = keyof ItemTypes;
    type Column = Row;

    const matrixKeys = Object.keys(matrix) as (keyof ItemTypes)[];

    //Apply a single cell filter to an input element
    function applyCellFilter<TInputRow extends Row>(row: TInputRow, column: Column, rowInput: ItemTypes[TInputRow]) {
        const columnKey = values[column];
        const func = matrix[row][column];
        if (func) {
            return func(rowInput, columnKey)
        } else {
            return rowInput;
        }
    }

    //Apply a full row of filters to an input element
    function applyRowFilter<TInputRow extends Row>(row: TInputRow, input: ItemTypes[TInputRow]) {
        return matrixKeys.reduce((key, value) => applyCellFilter(row, key, value), input);
    }

    let ret: any = {};
    for (const inputRow of matrixKeys) {
        ret[inputRow] = applyRowFilter(inputRow, lists[inputRow]);
    }

    return ret;
}


/**
 * Invert a filter matrix function in the form of (list, value) => filter onto the form of (value, list) => filter.
 * Usefull for creating filters that depend exclusively on its matrix counterpart
 */
export function invertFilter<TListItem, TValue>(cell: (list: TListItem[], value: TValue) => TListItem[]): (list: TValue[], value: TListItem) => TValue[]
export function invertFilter<TListItem, TValue, TExtraData>(cell: (list: TListItem[], value: TValue, extraData: TExtraData) => TListItem[]): (list: TValue[], value: TListItem, extraData: TExtraData) => TValue[]
export function invertFilter<TListItem, TValue, TExtraData>(cell: (list: TListItem[], value: TValue, extraData: TExtraData) => TListItem[]): (list: TValue[], value: TListItem, extraData: TExtraData) => TValue[] {
    return (list, value, extraData) => {
        //Un de TValueKey encaja con uno de TListKey si el filtro cell para ([valor], elemento) devuelve mas de 0 elementos
        const testFunction = (item: TValue) => cell([value], item, extraData).length > 0;
        return list.filter(testFunction);
    };
}

/**
 * Filter a list by a given many to many relationship
 * @param relations All relations between the list items and the possible values
 * @param list The list to filter
 * @param idValue The key of the filter value
 * @param listKeySelector Select a list key
 * @param relationListSelector Select the list key for a many to many relationship item
 * @param relationValueSelector Select the value key of a many to many relationship item
 */
export function manyToManyFilter<TRelation, TKey, TList, TValue>(
    relations: TRelation[], list: TList[], idValue: TKey, listKeySelector: (item: TList) => TKey, relationListSelector: (item: TRelation) => TKey, relationValueSelector: (item: TRelation) => TKey) {
    return pipe(
        relations,
        x => x.map(y => ({ idList: relationListSelector(y), idValue: relationValueSelector(y) })),
        x => x.filter(y => y.idValue == idValue),
        x => x.map(y => y.idList),
        x => intersectKeys(list, x, listKeySelector)
    );
}

/**
 * Get a filter in the form of (list: TOut[], value: TIn) given two filters on the form: (list: TMid[], value: TOut) and (list: TMid[], value: TIn)
 * @param filterMidByOut A filter in the form (list: TMid[], value: TOut)
 * @param filterMidByIn A filter in the form (list: TMid[], value: TIn)
 */
export function joinFilter<TOut, TIn, TMid>(
    filterMidByOut: ListFilter<TMid, TOut>,
    filterMidByIn: ListFilter<TMid, TIn>,
) {
    return (list: TOut[], value: TIn, allMid: TMid[]) => {
        const filteredMid = filterMidByIn(allMid, value);
        return intersectArrayByFilter(list, filteredMid, (a, b) => filterMidByOut(a, b));
    };
}


/**
 * Return the intersection of two lists given a filter that define the relationship between these lists.
 * This is equal to get a list of TList, given a list of TKey and a filter of (TKey[], TList)
 * @param items 
 * @param keys 
 * @param filter 
 */
export function intersectArrayByFilter<TList, TKey>(items: TList[], keys: TKey[], filter: (items: TKey[], value: TList) => TKey[]) {
    return items.filter(item => filter(keys, item).length > 0);
}

