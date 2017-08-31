import { pipe, intersectKeys, deepEquals } from "keautils";
import * as expect from "expect";
import { invertFilter, manyToManyFilter, FilterMatrix, intersectArrayByFilter, joinFilter, MatrixInput, applyFilterMatrix, onUndefinedAll } from "./index";
interface Unidad {
    idUnidad: number;
}

interface Equipo {
    idEquipo: number;
    idUnidad: number;
}

interface Contrato {
    idContrato: number;
}

interface ContratoUnidad {
    idUnidad: number;
    idContrato: number;
}

const data = (() => {
    const unidades: Unidad[] = [
        { idUnidad: 1, },
        { idUnidad: 2, },
        { idUnidad: 3, },
        { idUnidad: 4, }
    ];

    const equipos: Equipo[] = [
        //3 equipos en la unidad 1
        { idEquipo: 1, idUnidad: 1 },
        { idEquipo: 2, idUnidad: 1 },
        { idEquipo: 3, idUnidad: 1 },
        //1 en la unidad 2
        { idEquipo: 4, idUnidad: 2 },
        //2 en la unidad 4
        { idEquipo: 5, idUnidad: 4, },
        { idEquipo: 6, idUnidad: 4 },

        //Otro en la 2:
        { idEquipo: 7, idUnidad: 2 },

        //1 en la 3:
        { idEquipo: 8, idUnidad: 3 },
    ];

    const contratos: Contrato[] = [
        { idContrato: 1 },
        { idContrato: 2 },
        { idContrato: 3 }
    ];

    const contratoUnidad: ContratoUnidad[] = [
        //La unidad 1 tiene los contratos 1 y 2
        { idUnidad: 1, idContrato: 1 },
        { idUnidad: 1, idContrato: 2 },

        //La unidad 2 tiene los contratos 2 y 3
        { idUnidad: 2, idContrato: 2 },
        { idUnidad: 2, idContrato: 3 },

        //La unidad 3 tiene los contratos 3 y 1
        { idUnidad: 3, idContrato: 3 },
        { idUnidad: 3, idContrato: 1 },
    ];

    return { unidades, equipos, contratos, contratoUnidad };
})();

interface Relaciones {
    contratoUnidad: ContratoUnidad[];
}


const relaciones = { contratoUnidad: data.contratoUnidad };

function filterFunctions(relaciones: Relaciones) {
    const unidadesPorContrato = (unidades: Unidad[], contrato: Contrato) =>
        manyToManyFilter(relaciones.contratoUnidad, unidades, contrato.idContrato, x => x.idUnidad, x => x.idUnidad, x => x.idContrato);

    const unidadesPorEquipo = (unidades: Unidad[], equipo: Equipo) =>
        unidades.filter(x => x.idUnidad == equipo.idUnidad);

    return { unidadesPorContrato: onUndefinedAll(unidadesPorContrato), unidadesPorEquipo: onUndefinedAll(unidadesPorEquipo) };
}

const { unidadesPorContrato, unidadesPorEquipo } = filterFunctions(relaciones);


console.log("unidades por contrato");
{
    const unidades = unidadesPorContrato(data.unidades, data.contratos[0]);
    //Se espera la unidad 1 y 3
    expect(unidades).toEqual([data.unidades[0], data.unidades[2]]);

};

console.log("invertCellFilter");
{
    const obtenerContratosPorUnididad = invertFilter(unidadesPorContrato);
    {
        //La unidad 2 tiene los contratos 2 y 3
        const contratos = obtenerContratosPorUnididad(data.contratos, data.unidades[1]);
        expect(contratos).toEqual([data.contratos[1], data.contratos[2]]);
    }
    //Probar los contratos por unidad y la función invertCellFilter
    {
        //La unidad 1 tiene los contratos 1 y 2
        const contratos = obtenerContratosPorUnididad(data.contratos, data.unidades[0]);
        expect(contratos).toEqual([data.contratos[0], data.contratos[1]]);
    }

    {
        //La unidad 3 tiene los contratos 1 y 3
        const contratos = obtenerContratosPorUnididad(data.contratos, data.unidades[2]);
        expect(contratos).toEqual([data.contratos[0], data.contratos[2]]);
    }
}

console.log("invertCellFilter equipos unidad")
{
    const obtenerEquiposPorUnidad = invertFilter(unidadesPorEquipo);
    //La unidad 4
    const uni4 = data.unidades[3];

    //Tiene los equipos 5 y 6
    const expected = [data.equipos[4], data.equipos[5]];

    const actual = obtenerEquiposPorUnidad(data.equipos, uni4);

    expect(actual).toEqual(expected);
}

console.log("invertCellFilter contratos por unidad")
{
    const obtenerContratosPorUnidad = invertFilter(unidadesPorContrato);
    //Unidad 3 tiene los contratos 1 y 3
    const actual = obtenerContratosPorUnidad(data.contratos, data.unidades[2]);
    const expected = [data.contratos[0], data.contratos[2]];

    expect(actual).toEqual(expected);
}

console.log("intersectar obtener una lista de equipos dada una lista de unidades");
{
    //Los equipos 1,2, 4 y 7 deben de devolver las unidades 1 y 2
    const equipos = [data.equipos[0], data.equipos[1], data.equipos[3], data.equipos[6]];
    const expected = [data.unidades[0], data.unidades[1]];

    const obtenerEquiposPorUnidad = invertFilter(unidadesPorEquipo);
    const actual = intersectArrayByFilter(data.unidades, equipos, obtenerEquiposPorUnidad);

    expect(actual).toEqual(expected);
}

type ItemTypes = {
    unidad: Unidad,
    contrato: Contrato,
    equipo: Equipo
};


console.log("Join obtener equipos por contrato");
{
    const obtenerEquiposPorContrato = joinFilter(unidadesPorEquipo, unidadesPorContrato);

    //El contrato 1 tiene las unidades 1 y 3.
    const cont1 = data.contratos[0];
    //La unidad 1 tiene los equipos: 1, 2,  y 3
    const equiUni1 = [data.equipos[0], data.equipos[1], data.equipos[2]];

    //La unidad 3 tiene el equipo 8 
    const equiUni3 = [data.equipos[7]];
    const expected = [...equiUni1, ...equiUni3];

    const actual = obtenerEquiposPorContrato(data.unidades)(data.equipos, cont1);

    expect(actual).toEqual(expected);
}

console.log("Join obtener contratos por equipos");
{
    const obtenerContratosPorEquipo = joinFilter(unidadesPorContrato, unidadesPorEquipo);

    //El equipo 4 tiene la unidad 2
    const equi4 = data.equipos[3];
    const uni2 = data.unidades[1];

    //La unidad 2 tiene los contratos 2 y 3
    const expected = [data.contratos[1], data.contratos[2]];
    const actual = obtenerContratosPorEquipo(data.unidades)(data.contratos, equi4);

    expect(actual).toEqual(expected);

    //Invertimos el join al reves, y la función debe de ser equivalente:
    const obtenerEquiposPorContrato = joinFilter(unidadesPorEquipo, unidadesPorContrato);
    const obtenerContratosPorEquipoInv = (unidades: Unidad[]) => invertFilter(obtenerEquiposPorContrato(unidades));
    const actualInv = obtenerContratosPorEquipoInv(data.unidades)(data.contratos, equi4);

    expect(actualInv).toEqual(expected);
}

console.log("Probar filtros con datos vacios");
{
    const ret = unidadesPorEquipo(data.unidades, undefined);
    expect(ret).toEqual(data.unidades);

    const equiposPorUnidad = invertFilter(unidadesPorEquipo);
    expect(equiposPorUnidad(data.equipos, undefined)).toEqual(data.equipos);
}

console.log("armar matrix de filtros");
{
    const equiposPorUnidad = invertFilter(unidadesPorEquipo);
    const contratoPorUnidad = invertFilter(unidadesPorContrato);
    const contratoPorEquipo = joinFilter(unidadesPorContrato, unidadesPorEquipo);
    const equiposPorContrato = joinFilter(unidadesPorEquipo, unidadesPorContrato);
    const idem = x => x;
    const matrix: FilterMatrix<ItemTypes> = {
        unidad: {
            unidad: idem,
            contrato: unidadesPorContrato,
            equipo: unidadesPorEquipo,
        },
        contrato: {
            unidad: contratoPorUnidad,
            contrato: idem,
            equipo:  contratoPorEquipo(data.unidades),
        },
        equipo: {
            unidad: equiposPorUnidad,
            contrato: equiposPorContrato(data.unidades),
            equipo: idem
        }
    };

    const applyMatrix = (values: Partial<ItemTypes>) => applyFilterMatrix(matrix, {
        contrato: data.contratos,
        unidad: data.unidades,
        equipo: data.equipos,
    }, values);

    //Sin filtros debe de devolver todos los elementos:
    {
        const actual = applyMatrix({});
        const expeted: MatrixInput<ItemTypes> = {
            contrato: data.contratos,
            equipo: data.equipos,
            unidad: data.unidades
        };

        expect(actual).toEqual(expeted);
    }

    //Seleccionado el equipo 1
    {
        const actual = applyMatrix({ equipo: data.equipos[0] });
        //Tiene la unidad 1, y los contratos 1 y 2
        const expected: MatrixInput<ItemTypes> = {
            contrato: [data.contratos[0], data.contratos[1]],
            equipo: data.equipos,
            unidad: [data.unidades[0]]
        };

        expect(actual).toEqual(expected);
    }

    //Seleccionado el equipo 5
    {
        const actual = applyMatrix({ equipo: data.equipos[4] });
        //Tiene la unidad 4, no tiene contratos:
        const expected: MatrixInput<ItemTypes> = {
            contrato: [],
            equipo: data.equipos,
            unidad: [data.unidades[3]]
        };

        expect(actual).toEqual(expected);
    }

    //Seleccionado el contrato 2
    {
        const actual = applyMatrix({ contrato: data.contratos[1] });
        //Tiene las unidades [1, 2] 
        //Estas unidades tienen los equipos [1,2,3,4,7]
        const expected: MatrixInput<ItemTypes> = {
            contrato: data.contratos,
            equipo: [1, 2, 3, 4, 7].map(id => data.equipos[id - 1]),
            unidad: [1, 2].map(id => data.unidades[id - 1])
        };

        expect(actual).toEqual(expected);
    }

    //Seleccionada la unidad 2
    {
        const actual = applyMatrix({ unidad: data.unidades[1] });
        //Tiene los equipos: [4, 7]
        //Tiene los contratos: [2, 3]

        const expected: MatrixInput<ItemTypes> = {
            contrato: [2, 3].map(id => data.contratos[id - 1]),
            equipo: [4, 7].map(id => data.equipos[id - 1]),
            unidad: data.unidades
        };

        expect(actual).toEqual(expected);
    }

    //Seleccionamos el contrato 2 y el equipo 7
    {
        const actual = applyMatrix({
            contrato: data.contratos[1],
            equipo: data.equipos[6]
        });

        //El contrato 2 tiene las unidades 2 y 3
        //Las unidades 2 y 3 tienen los equipos [1,2,3,4,7]
        //El equipo 7 tiene la unidad 2

        //La unidad 2 tiene los contratos 2 y 3
        const expected: MatrixInput<ItemTypes> = {
            contrato: [2, 3].map(id => data.contratos[id - 1]),
            equipo: [1, 2, 3, 4, 7].map(id => data.equipos[id - 1]),
            unidad: [2].map(id => data.unidades[id - 1])
        };

        expect(actual).toEqual(expected);
    }
}