import { ALU_GenitoreAlunno }                   from './ALU_GenitoreAlunno';
import { PER_Persona }                          from './PER_Persone';

export interface ALU_Alunno {
        id:                                     number;
        personaID:                              number;

        ckDisabile:                             boolean;
        ckDSA:                                  boolean;
        // ckAuthFoto:                             boolean;
        // ckAuthUsoMateriale:                     boolean;
        // ckAuthUscite:                           boolean;
        scuolaProvenienza:                      string;
        indirizzoScuolaProvenienza:             string;

        note?:                                  string;
        dtIns?:                                 string;
        dtUpd?:                                 string;
        userIns?:                               number;
        userUpd?:                               number;

        persona:                                PER_Persona;

        //_Genitori?:                             ALU_Genitore[]; /// forse dovrebbe essere ALU_GenitoreAlunno?????? NC 30 01 2023
        _Genitori?:                             ALU_GenitoreAlunno[]; /// forse dovrebbe essere ALU_GenitoreAlunno?????? NC 30 01 2023
        

}



 