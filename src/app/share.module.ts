import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';



import { AboutDialogComponent } from './user/about-dialog/about-dialog.component';

import { LoginDialogComponent } from './define/login-dialog/login-dialog.component';

import { ReactiveFormsModule } from '@angular/forms';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
} from '@angular/material';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { QRCodeModule } from 'angularx-qrcode';
import { HttpClientModule } from '@angular/common/http';
import { ImageCropperModule } from 'ngx-image-cropper';

import { MyDatePipe } from './pipe/my-date.pipe';

import { SlideControlComponent } from './define/slide-control/slide-control.component';
import { MasterHeadComponent } from './define/master-head/master-head.component';

import { ImageCropComponent} from './define/image-crop/image-crop.component';

import { ControlComponentComponent } from './define/dynamic-form/control-component/control-component.component';
import { DynamicFormComponent } from './define/dynamic-form/dynamic-form/dynamic-form.component';
import { ColorWrapperComponent } from './define/color-wrapper/color-wrapper.component';
import { ColorPickerModule } from '@iplab/ngx-color-picker';
import { MyTimingPipe } from './pipe/my-timing.pipe';
import { NgMaterialMultilevelMenuComponent } from './define/left-menu/ng-material-multilevel-menu.component';
import { ListItemComponent } from './define/left-menu/list-item/list-item.component';




@NgModule({
  declarations: [
    SlideControlComponent,
    MasterHeadComponent,
    ControlComponentComponent,
    DynamicFormComponent,
    AboutDialogComponent,
    LoginDialogComponent,
    ColorWrapperComponent,
    MyDatePipe,
    MyTimingPipe,
    ImageCropComponent, // 自定义dialog
    NgMaterialMultilevelMenuComponent, 
    ListItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ImageCropperModule,
    // BrowserAnimationsModule,
    ReactiveFormsModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    ScrollingModule,
    FontAwesomeModule,
    QRCodeModule,
    HttpClientModule,
    ColorPickerModule,

  ],
  entryComponents: [
    AboutDialogComponent,
    LoginDialogComponent,
    ImageCropComponent, // 自定义dialog
  ],
  exports: [
    SlideControlComponent,
    MasterHeadComponent,
    ControlComponentComponent,
    DynamicFormComponent,
    AboutDialogComponent,
    LoginDialogComponent,
    ColorWrapperComponent,
    ImageCropComponent, // 自定义dialog
    NgMaterialMultilevelMenuComponent,

    ReactiveFormsModule,
    CdkTableModule,
    CdkTreeModule,
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    ScrollingModule,
    FontAwesomeModule,
    QRCodeModule,
    HttpClientModule,

    MyDatePipe,
    MyTimingPipe,

  ]
})
export class ShareModule { }
