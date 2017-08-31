export interface Building {
    id: number;
}

export interface Machine {
    id: number;
    idUnidad: number;
}

export interface Contract {
    id: number;
}

export interface BuildingContract {
    idUnidad: number;
    idContrato: number;
}

export const unidades: Building[] = [
    { id: 1, },
    { id: 2, },
    { id: 3, },
    { id: 4, }
];

export const equipos: Machine[] = [
    //3 equipos en la unidad 1
    { id: 1, idUnidad: 1 },
    { id: 2, idUnidad: 1 },
    { id: 3, idUnidad: 1 },
    //1 en la unidad 2
    { id: 4, idUnidad: 2 },
    //2 en la unidad 4
    { id: 5, idUnidad: 4, },
    { id: 6, idUnidad: 4 }
];

export const contratos: Contract[] = [
    { id: 1 },
    { id: 2 },
    { id: 3 }
];

export const contratoUnidad: BuildingContract[] = [
    //La unidad 1 tiene los contratos 1 y 2
    { idUnidad: 1, idContrato: 1 },
    { idUnidad: 1, idContrato: 2 },

    //La unidad 2 tiene los contratos 2 y 3
    { idUnidad: 2, idContrato: 2 },
    { idUnidad: 2, idContrato: 3 },

    //La unidad 3 tiene los contratos 3 y 1
    { idUnidad: 3, idContrato: 1 },
    { idUnidad: 3, idContrato: 3 }
];