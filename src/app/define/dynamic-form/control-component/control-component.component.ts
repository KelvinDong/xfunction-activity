import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { ControlBase } from '../control-base';




@Component({
  selector: 'app-control-component',
  templateUrl: './control-component.component.html',
  styleUrls: ['./control-component.component.css'],
})
export class ControlComponentComponent  {

  @Input() question: ControlBase<any>;
  @Input() form: FormGroup;
  @Input() editTag = true;

  @Output() delMe: EventEmitter<any> = new EventEmitter();
  @Output() moveControlUp: EventEmitter<any> = new EventEmitter();
  @Output() moveControlDown: EventEmitter<any> = new EventEmitter();

  get isValid() { return this.form.controls[this.question.key] && this.form.controls[this.question.key].valid; }

  // only for checkbox  处理选择和不选择的值
  selectCheckbox(obj: MatCheckboxChange) {
    // console.log( obj );
    let selectContent: string[] = this.form.controls[this.question.key].value || [];
    const index: number = selectContent.indexOf(obj.source.value);
    if (obj.checked) {
      if (index < 0) {
        selectContent.push(obj.source.value);
      }
    } else {
      if (index > -1) {
        selectContent = selectContent.filter((ele) => {
          return ele !== obj.source.value;
        });
      }
    }
    this.form.controls[this.question.key].setValue(selectContent);
  }

  removeSelf(event: any) {
    event.stopPropagation();
    this.delMe.emit(this.question);
  }
  moveUp(event: any) {
    event.stopPropagation();
    this.moveControlUp.emit(this.question);
  }
  moveDown(event: any) {
    event.stopPropagation();
    this.moveControlDown.emit(this.question);
  }
}
