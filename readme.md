# FilterMatrix
Define relationships between selectors as a matrix of filter functions

## Define your filters:

Filters must be in the form `(items: TItem[], value: TValue) => TItem[]`

Where `items` is the list to be filtered and `value` is an item selected on another selector
```ts
interface Relations: {
    buildingContract: BuildingContract[];
}

//A function that get your filter functions:
const getBaseFilters = (relations: Relations)  => ({
    //A filter between buildings and machine, note that there is a Many-To-One relationship between buildings and machines
    buildingsByMachine: (buildings: Building[], machine: Machine | undefined) =>
            machine ?
            buildings.filter(x => x.idBuilding == machine.idBuilding) : 
            buildings
            ,

    //A filter between buildings and contract, there is a many-to-many relationship between buildings and contracts
    buildingsByContract: (buildings: Building[], contract: Contract | undefined) =>       
        contract ?       
        manyToManyFilter(relations.buildingContract, buildings, contract.idContract, x => x.idBuilding, x => x.idBuilding, x => x.idContract) :
        buildings
})
    
```

## Composable filters
Filters that are in function on your base filters can be derived using functions such as `invertFilter`, `joinFilter`
```ts
function getFilters(myRelations)
{
    const baseFilters = getBaseFilters(myRelations);
    const filters =  {
        ...baseFilters, 

        //Invert filters
        machinesByBuilding: invertFilter(buildingsByMachine),
        contractByBuilding: invertFilter(buildingsByContract),

        //Derive a filter from two other filters
        contractByMachine: joinFilter(buildingsByContract, buildingsByMachine),
        machinesByContract: joinFilter(buildingsByMachine, buildingsByContract)
    };

    return filters;
}
```

## Build a filter matrix
```ts
type ItemTypes = {
    building: Building;
    contract: Contract;
    machine: Machine;
}

type Data = { [K in keyof ItemTypes]: ItemTypes[K]} & Relations;

function getFilterMatrix(data: Data) {
    const { buildingByContract, buldingsByMachine, ...} = getFilters(data);

    //Idempotent function, a filter that pass the input as-is
    const idem = x => x;
    const matrix: FilterMatrix<ItemTypes> = {
        building: {
            building: idem,
            contract: buildingsByContract,
            machine: buildingsByMachine,
        },
        contract: {
            building: contractByBuilding,
            contract: idem,
            machine: (contratos, equipo) => contractByMachine(contratos, equipo, data.buildings),
        },
        machine: {
            building: machinesByBuilding,
            contract: (equipos, contrato) => machinesByContract(equipos, contrato, data.buildings),
            machine: idem
        }
    };
}
```

## Apply the filter matrix:
```ts

//Return all lists, filtered by the given selected items
const selectedValues = {
    contract: data.contracts[1],
    machine: data.machine[6]
};
const filteredLists = applyMatrix(myMatrix, myData, selectedValues);

```