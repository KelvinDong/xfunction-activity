import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ControlBase } from '../../../define/dynamic-form/control-base';

import { DynamicFormComponent } from '../../../define/dynamic-form/dynamic-form/dynamic-form.component';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray, AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { AbstractJsEmitterVisitor } from '@angular/compiler/src/output/abstract_js_emitter';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';

import { isNumber, getAndSavePath, forbiddenRegValidator } from '../../../ts/base-utils';
import { UserService, Result } from 'src/app/user/user.service';
import { ActivatedRoute, Router, ParamMap, Params } from '@angular/router';
import { baseConfig, urlDefine, regDefine } from 'src/app/ts/base-config';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-create-form',
  templateUrl: './create-form.component.html',
  styleUrls: ['./create-form.component.css']
})
export class CreateFormComponent implements OnInit {

  @ViewChild(DynamicFormComponent, { static: false })
  df: DynamicFormComponent;

  @ViewChild('addFormDirective', { static: false })
  private addFormDirective: NgForm;

  // 初始化默认的几个表单
  questions: ControlBase<any>[] =
    [
      new ControlBase({
        controlType: 'textbox',
        value: '',
        key: 'name_1',
        label: '姓名',
        order: 1,
        required: true
      }),
      new ControlBase({
        controlType: 'select',
        value: '',
        key: 'sex_2',
        label: '性别',
        order: 2,
        options: [
          { key: 1, value: '男' },
          { key: 2, value: '女' }
        ],
        required: true
      })
    ];

  // 图标
  faArrowLeft = faArrowLeft;
  faSave = faSave;

  showProgress = false;
  title = '活动报名表编辑';


  addForm: any;
  saveForm: any;

  // 初始化
  selectType = 'textbox';
  showMultiple = false;
  showOption = false;
  isCheckBox = false;
  isRadio = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    public snackBar: MatSnackBar,
    private el: ElementRef,
  ) { }

  ngOnInit() {

    // 不登录的情况下可以返回此
    getAndSavePath(this.activeRoute);

    this.initAddForm();

    this.saveForm = new FormGroup({
      formId: new FormControl(''),
      formName: new FormControl('', [Validators.required, forbiddenRegValidator(regDefine.formName)]),
      formJson: new FormControl('', []) // 提交时程序填写进来
    });

    // 从服务器获得已经保存的模板，提供编辑
    this.activeRoute.params.subscribe((data: Params) => {
      if (data.id !== undefined) { // 编辑
        this.showProgress = true;
        this.userService.post(baseConfig.formMyGet, { formId: parseInt(data.id, 10) }).subscribe(
          (data: Result) => {
            const result = { ...data };
            if (result.success) {

              // 之前没有加这一行，导制值的变化先处理了页面，但js对象中还没有存在。所以增加强制重新初始化生成对象。  可能是因为值传递给js要慢于页面。
              // 可以用等于方式，即指针方式不再好，可以试试用push到数据中，会有什么。
              this.df.rebuild(JSON.parse(result.data.formJson));

              this.questions = JSON.parse(result.data.formJson);
              this.saveForm.patchValue({
                formId: result.data.formId,
                formName: result.data.formName
              });
            } else {
              this.userService.showError(result);
            }
            this.showProgress = false;
          },
          (error: Result) => { this.userService.showError(error); this.showProgress = false; }
        );
      }
    });

  }

  private initAddForm() {
    this.addForm = new FormGroup({
      controlType: new FormControl(this.selectType, [Validators.required]),
      value: new FormControl('', []),
      label: new FormControl('', [Validators.required]),
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
  // textbox textmorebox select radio checkbox
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

  selectBuiltIn(tp: number) {
    const options: FormArray = this.addForm.get('options');
    switch (tp) {
      case 1:
        this.showMultiple = false;
        this.showOption = false;
        this.selectType = 'textbox';
        this.addForm.patchValue({
          controlType: 'textbox',
          value: '',
          label: '姓名',
          key: 'name',
          required: true,
        });
        break;
      case 2:
        this.showMultiple = true;
        this.showOption = true;
        this.isCheckBox = false;
        this.isRadio = false;
        this.selectType = 'select';
        options.clear();
        options.insert(options.length, new FormControl('男', [Validators.required]));
        options.insert(options.length, new FormControl('女', [Validators.required]));
        this.addForm.patchValue({
          controlType: 'select',
          value: '',
          label: '性别',
          key: 'sex',
          required: true,
        });
        break;
      case 3:
        this.showMultiple = false;
        this.showOption = false;
        this.selectType = 'textbox';
        this.addForm.patchValue({
          controlType: 'textbox',
          value: '',
          label: '手机号',
          key: 'mobile',
          required: true,
        });
        break;
      case 4:
        this.showMultiple = false;
        this.showOption = false;
        this.selectType = 'textbox';
        this.addForm.patchValue({
          controlType: 'textbox',
          value: '',
          label: '邮箱',
          key: 'email',
          required: true,
        });
        break;
      case 5:
        this.showMultiple = false;
        this.showOption = false;
        this.selectType = 'textbox';
        this.addForm.patchValue({
          controlType: 'textbox',
          value: '',
          label: '公司',
          key: 'company',
          required: true,
        });
        break;
      case 6:
        this.showMultiple = false;
        this.showOption = false;
        this.selectType = 'textbox';
        this.addForm.patchValue({
          controlType: 'textbox',
          value: '',
          label: '职位',
          key: 'position',
          required: true,
        });
        break;
      case 7:
        this.showMultiple = false;
        this.showOption = false;
        this.selectType = 'textbox';
        this.addForm.patchValue({
          controlType: 'textbox',
          value: '',
          label: '出生日期',
          key: 'birth',
          required: true,
        });
        break;
      default:
        break;
    }
    this.onAddFormSubmit();
  }


  onSaveFormSubmit() {
    // console.log(JSON.stringify(this.questions));

    if (this.questions.length === 0) {
      this.snackBar.open('表单内容不能为空', '', { duration: 3000 });
      return;
    }
    this.showProgress = true;
    // 送服务器
    this.saveForm.patchValue({ formJson: JSON.stringify(this.questions) });
    this.userService.post(baseConfig.formMyAddUpdate, this.saveForm.value).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.router.navigateByUrl(urlDefine.listFrom);
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => { this.userService.showError(error); this.showProgress = false; },
    );

  }


  onAddFormSubmit() {

    const addResutl = this.addForm.value;
    addResutl.options = this.buildResultOptions();
    addResutl.order = this.questions.length + 1;

    // 获取现有表单项 序号值，因为存在删除的问题，所以最大的序号+1给新的表单项
    let targetKey = 0;
    for (let i = 0; i < this.questions.length; i++) {  // 数组
      this.questions[i].order = i + 1; // order 并没有用起来。
      const key = this.questions[i].key;
      if (isNumber(key)) {
        if (Number(key) > targetKey) {
          targetKey = Number(key);
        }
      } else {
        const tmp = key.split('_');
        if (Number(tmp[1]) > targetKey) {
          targetKey = Number(tmp[1]);
        }
      }
    }

    const key1 = addResutl.key;
    if (isNumber(key1)) {
      addResutl.key = (targetKey + 1).toString();
    } else {
      const tmp = key1.split('_');
      addResutl.key = tmp[0] + '_' + (targetKey + 1).toString();
    }

    this.questions.push(new ControlBase(addResutl));

    this.df.ngOnInit(); // 预览表单重新加载

    this.addFormDirective.resetForm(); // 校验也要重置
    this.addForm.reset();
    this.initAddForm(); // 控件表单重新加载
    

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
