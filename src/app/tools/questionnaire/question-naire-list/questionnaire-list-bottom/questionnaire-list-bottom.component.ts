import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';

@Component({
  selector: 'app-questionnaire-list-bottom',
  templateUrl: './questionnaire-list-bottom.component.html',
  styleUrls: ['./questionnaire-list-bottom.component.css']
})
export class QuestionnaireListBottomComponent implements OnInit {

  operType = 0;
  constructor(
    private bottomSheetRef: MatBottomSheetRef<QuestionnaireListBottomComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  openLink(type: number, event: MouseEvent): void {
    this.operType = type;
    this.bottomSheetRef.dismiss();
    event.preventDefault(); 
  }

}
