import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSelectChange } from '@angular/material';
import { NgForm, FormGroup, Validators, FormControl, FormBuilder, FormArray } from '@angular/forms';

@Component({
  selector: 'app-questionnaire-add-element',
  templateUrl: './questionnaire-add-element.component.html',
  styleUrls: ['./questionnaire-add-element.component.css']
})
export class QuestionnaireAddElementComponent implements OnInit {

  @ViewChild('addFormDirective', { static: false })
  private addFormDirective: NgForm;

  addForm: any;

  // 初始化
  selectType = 'textbox';
  showMultiple = false;
  showOption = false;
  isCheckBox = false;
  isRadio = false;

  constructor(
    public dialogRef: MatDialogRef<QuestionnaireAddElementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.initAddForm();
  }

  private initAddForm() {
    this.addForm = new FormGroup({
      controlType: new FormControl(this.selectType, [Validators.required]),
      value: new FormControl('', []),
      label: new FormControl('', [Validators.required]),
      intro: new FormControl('', []),
      key: new FormControl(0, [Validators.required]),
      required: new FormControl(false, [Validators.required]),
      multiple: this.showMultiple ? new FormControl(false, [Validators.required]) : new FormControl(false),
      options: this.fb.array([
        this.showOption ? this.fb.control('', [Validators.required]) : this.fb.control('')
      ])
    });
  }

  get options() {
    return this.addForm.get('options').controls;
  }

  addOption(event: any) {
    const options: FormArray = this.addForm.get('options');
    event.stopPropagation();
    options.insert(options.length, new FormControl('', [Validators.required]));
  }

  removeOption(index: number, event: any) {
    event.stopPropagation();
    const options: FormArray = this.addForm.get('options');
    options.removeAt(index);

  }

  selectChange(change: MatSelectChange) {
    const options: FormArray = this.addForm.get('options');
    this.addForm.patchValue({
      key: '0'
    });
    switch (change.value) {
      case 'select':
        this.showMultiple = true;
        this.showOption = true;
        this.isCheckBox = false;
        this.isRadio = false;
        break;
      case 'radio':
        this.showMultiple = false;
        this.showOption = true;
        this.isCheckBox = false;
        this.isRadio = true;
        break;
      case 'checkbox':
        this.showMultiple = false;
        this.showOption = true;
        this.isCheckBox = true;
        this.isRadio = false;
        break;
      case 'textmorebox':
        this.showMultiple = false;
        this.showOption = false;
        break;
      default: // 'textbox':
        this.showMultiple = false;
        this.showOption = false;
        break;
    }
    this.selectType = change.value;
  }

  onAddFormSubmit() {

    const addResutl = this.addForm.value;
    addResutl.options = this.buildResultOptions();

    this.addFormDirective.resetForm(); // 校验也要重置
    this.addForm.reset();
    this.initAddForm(); // 控件表单重新加载

    this.dialogRef.close(addResutl);
  }


  buildResultOptions() {
    const resultOption = [];
    const obj: string[] = this.addForm.value.options;
    for (let i = 0; i < obj.length; i++) {
      resultOption.push({ key: (i + 1), value: obj[i] });
    }

    /* 根据属性来遍历
    Object.keys(obj).forEach((item) => {
      console.log(item, obj[item]);
      resultOption.push({ key: item, value: obj[item] });
    });
    */
    return resultOption;
  }


}
