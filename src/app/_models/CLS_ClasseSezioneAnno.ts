import { ASC_AnnoScolastico }                   from './ASC_AnnoScolastico';
import { CLS_ClasseSezione }                    from './CLS_ClasseSezione';

export interface CLS_ClasseSezioneAnno {
        id:                                     number;
        sezione:                                string;
        annoID:                                 number;
        classeSezione:                          CLS_ClasseSezione;    //TODO Maiuscolo
        
        classeSezioneAnnoSuccID:                number;
        ClasseSezioneAnnoSucc:                  CLS_ClasseSezioneAnno;
        anno:                                   ASC_AnnoScolastico;   //TODO Maiuscolo
        numAlunni:                              number;
}

export interface CLS_ClasseSezioneAnno_Sum {
        id:                                     number;
        classe:                                 string;
        sezione:                                string;
        anno:                                   string; 
        numAlunni:                              number;
        numMaschi:                              number;
        numFemmine:                             number;
}

export interface CLS_ClasseSezioneAnnoGroup {
        id:                                     number;
        classeSezioneID:                        number;

        descrizioneBreve:                       string;
        descrizione2:                           string; 
        sezione:                                string;
        importo:                                number;
        importo2:                               number;

        annoID:                                 number;
        anno1:                                  number;
        anno2:                                  number;
        annoScolastico:                         string;
        seq:                                    number;
        sezioneAnnoSucc:                        string;
        descrizione2AnnoSucc:                   string;

        numAlunni:                              number;
        numMaschi:                              number;
        numFemmine:                             number;

        numStato10:                             number;
        numStato20:                             number;
        numStato30:                             number;
        numStato40:                             number;
        numStato50:                             number;
        numStato60:                             number;
        numStato70:                             number;
        numStato80:                             number;


}
