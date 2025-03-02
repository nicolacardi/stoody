import { ALU_Genitore } from "./ALU_Genitore";

export interface ALU_GenitoreAlunno {
        id:                                     number;
        genitoreID:                             number;
        alunnoID:                               number;

        genitore?:                              ALU_Genitore;
}