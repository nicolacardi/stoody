import { ASC_AnnoScolastico }                   from "./ASC_AnnoScolastico";
import { CLS_Classe }                           from "./CLS_Classe";
import { MAT_Materia }                          from "./MAT_Materia";

export interface MAT_Obiettivo {
        id:                                     number;
        classeID:                               number;
        annoID:                                 number;
        materiaID:                              number;
        titolo:                                 string;
        descrizione:                            string;

        materia?:                               MAT_Materia;
        classe?:                                CLS_Classe;
        anno?:                                  ASC_AnnoScolastico;        
}
