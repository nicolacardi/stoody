import { CLS_Classe }                           from './CLS_Classe';

export interface CLS_ClasseSezione {
        id?:                                     number;
        classeID:                               number;
        sezione:                                string;

        classe?:                                 CLS_Classe;
}
