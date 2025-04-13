import { MAT_MacroMateria }                     from "./MAT_MacroMateria";

export interface MAT_Materia {
        id:                                     number;
        macroMateriaID:                         number;
        descrizione:                            string;

        macroMateria:                           MAT_MacroMateria
        seq?:                                   number;
        color?:                                 string;
}
