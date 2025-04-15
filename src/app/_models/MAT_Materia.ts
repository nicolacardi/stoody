import { MAT_TipoVoto } from "./MAT_TipoVoto";
import { MAT_MacroMateria }                     from "./MAT_MacroMateria";

export interface MAT_Materia {
        id:                                     number;
        macroMateriaID:                         number;
        tipoVotoID:                             number;
        descrizione:                            string;

        macroMateria:                           MAT_MacroMateria
        seq?:                                   number;
        color?:                                 string;

        tipoVoto:                               MAT_TipoVoto;

}
