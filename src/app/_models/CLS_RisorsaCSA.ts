
import { CLS_ClasseSezioneAnno }                from "./CLS_ClasseSezioneAnno";
import { DOC_TipoDocumento }                    from "./DOC_TipoDocumento";
import { _UT_Risorsa }                          from "./_UT_Risorsa";

export interface CLS_RisorsaCSA {
  id?:                                           number;
  risorsaID:                                    number;
  classeSezioneAnnoID:                          number;
  tipoDocumentoID:                              number;

  dtIns?:                                       string;
  dtUpd?:                                       string;
  userIns?:                                     number;
  userUpd?:                                     number;

  risorsa?:                                     _UT_Risorsa;
  classeSezioneAnno?:                            CLS_ClasseSezioneAnno;
  tipoDocumento?:                               DOC_TipoDocumento;

}