import { NgModule }                             from '@angular/core';
import { MatButtonModule }                      from '@angular/material/button';
import { MatButtonToggleModule}                 from '@angular/material/button-toggle';
import { MatIconModule}                         from '@angular/material/icon';
import { MatProgressSpinnerModule}              from '@angular/material/progress-spinner';
import { MatToolbarModule}                      from '@angular/material/toolbar';
import { MatSidenavModule}                      from '@angular/material/sidenav';
import { MatMenuModule }                        from '@angular/material/menu';
import { MatListModule }                        from '@angular/material/list';
import { MatDividerModule }                     from '@angular/material/divider';
import { MatGridListModule }                    from '@angular/material/grid-list';
import { MatExpansionModule }                   from '@angular/material/expansion';
import { MatCardModule }                        from '@angular/material/card';
import { MatTabsModule }                        from '@angular/material/tabs';
import { MatStepperModule }                     from '@angular/material/stepper';
import { MatFormFieldModule }                   from '@angular/material/form-field';
import { MatInputModule }                       from '@angular/material/input';
import { MatSelectModule }                      from '@angular/material/select';
import { MatAutocompleteModule }                from '@angular/material/autocomplete';
import { MatCheckboxModule }                    from '@angular/material/checkbox';
import { MatRadioModule }                       from '@angular/material/radio';
import { MatDatepickerModule}                   from '@angular/material/datepicker';
import { MatNativeDateModule }                  from '@angular/material/core'
import { MatTooltipModule }                     from '@angular/material/tooltip';
import { MatSnackBarModule }                    from '@angular/material/snack-bar';
import { MatDialogModule }                      from '@angular/material/dialog';
import { MatTableModule }                       from '@angular/material/table';
import { MatSortModule }                        from '@angular/material/sort';
import { MatPaginatorModule }                   from '@angular/material/paginator';
import { MatBadgeModule }                       from '@angular/material/badge';
import { MatProgressBarModule }                 from '@angular/material/progress-bar';
import { MatChipsModule}                        from '@angular/material/chips';
import { MatSlideToggleModule }                 from '@angular/material/slide-toggle';

import { MatSliderModule}                       from '@angular/material/slider';


const material = [
  MatButtonModule,
  MatButtonToggleModule,
  MatIconModule,
  MatBadgeModule,
  MatProgressSpinnerModule,
  MatProgressBarModule,
  MatToolbarModule,
  MatSidenavModule,
  MatMenuModule,
  MatListModule,
  MatDividerModule,
  MatGridListModule,
  MatExpansionModule,
  MatCardModule,
  MatTabsModule,
  MatStepperModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatAutocompleteModule,
  MatCheckboxModule,
  MatRadioModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatDialogModule,
  MatTableModule,
  MatSortModule,
  MatPaginatorModule,
  MatChipsModule,
  MatSlideToggleModule,
  MatSliderModule

];

@NgModule({
  imports: [material],
  exports: [material]
})
export class MaterialModule { }
