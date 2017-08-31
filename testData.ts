export interface Unidad {
    id: number;
}

export interface Equipo {
    id: number;
    idUnidad: number;
}

export interface Contrato {
    id: number;
}

export interface ContratoUnidad {
    idUnidad: number;
    idContrato: number;
}

export const unidades: Unidad[] = [
    { id: 1, },
    { id: 2, },
    { id: 3, },
    { id: 4, }
];

export const equipos: Equipo[] = [
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

export const contratos: Contrato[] = [
    { id: 1 },
    { id: 2 },
    { id: 3 }
];

export const contratoUnidad: ContratoUnidad[] = [
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