import { ALU_Alunno }                           from "./ALU_Alunno";
import { PAG_CausalePagamento }                 from "./PAG_CausalePagamento";
import { PAG_Retta }                            from "./PAG_Retta";
import { PAG_TipoPagamento }                    from "./PAG_TipoPagamento";

export interface PAG_Pagamento {

        id:                                     number;

        importo:                                number;
        dtPagamento:                            Date;

        tipoPagamentoID:                        number;
        tipoPagamento:                          PAG_TipoPagamento;

        causaleID:                              number;                 //Sostituire con oggetto PAG_Causali?
        Causale:                                PAG_CausalePagamento;
        rettaID:                                number;
        retta:                                  PAG_Retta;            //Serve SOLO per poter ordinare i pagamenti per mese o per importo della retta

        alunnoID:                               number;
        alunno:                                 ALU_Alunno;
        
        genitoreID:                             number;                //Sostituire con oggetto ALU_Genitore 
        soggetto:                               string;

        note:                                   string;
        dtIns:                                  string;
        dtUpd:                                  string;
        userIns:                                number;
        userUpd:                                number;
}



/*
        public virtual PAG_TipoPagamento _TipoPagamento { get; set; }
        public virtual PAG_CausalePagamento _CausalePagamento{ get; set; }
        public virtual PAG_Retta _Retta { get; set; }
        public virtual ALU_Alunno _Alunno { get; set; }
        public virtual ALU_Genitore _Genitore{ get; set; }
*/
