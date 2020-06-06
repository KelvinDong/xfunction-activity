import { Component, OnInit , Directive, ViewChild} from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';

// 自定义
import { UserService, Result } from '../user.service';
import {baseConfig, urlDefine, regDefine } from '../../ts/base-config';
import {forbiddenRegValidator, getAndSavePath} from '../../ts/base-utils';

// 组件导入
import { SlideControlComponent } from '../../define/slide-control/slide-control.component';
import { MatSnackBar } from '@angular/material';

/*  练习代码
let hello: string = "Hello!";  可以省略 string，推荐也是省略

function add(x: number, y: number): number {
  return x + y;
}
let myAdd: (x: number, y: number) => number =
    function(x: number, y: number): number { return x + y; };
*/
/*
export const auth2Validator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const auth = control.get('xfuUserAuth');
  const auth2 = control.get('xfuUserAuth2');
  return auth && auth2 && auth.value === auth2.value ? null : { authNotEqual: true } ;
};
*/
@Component({
  selector: 'app-register-index',
  templateUrl: './register-index.component.html',
  styleUrls: ['./register-index.component.css']
})
export class RegisterIndexComponent implements OnInit {

  @ViewChild(SlideControlComponent, {static: false})
  slide: SlideControlComponent;

  move: number;
  private action: number[];
  hide = true;

  urlDefine = urlDefine;

  registerForm = new FormGroup({
    userName: new FormControl('', [
      Validators.required,
      forbiddenRegValidator(regDefine.userName)
    ]),
    userAuth: new FormControl('', [
      Validators.required,
      forbiddenRegValidator(regDefine.password)
    ])// ,
    // xfuUserAuth2: new FormControl('', [
    //   Validators.required
    // ])
  });
  // }, { validators: auth2Validator });

  constructor(
    private userService: UserService,
    public snackBar: MatSnackBar,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    
  }

  register() {
    const formValue: any = this.registerForm.value;
    formValue.move = this.move;
    formValue.action = this.action;
    this.userService.post(baseConfig.userBaseRegister, formValue).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('注册成功，请登录', '', { duration: 3000 });
          setTimeout(() => {
            this.router.navigateByUrl(urlDefine.loginUrl);
          }, 1000);
        } else {
          // this.userService.showError(result);
          this.reset();
        }
      },
      // (error: Result) => this.userService.showError(error)
    );
  }
  login() {
    this.router.navigateByUrl(urlDefine.loginUrl);
  }

  private reset() {
    this.move = undefined;
    this.action = [];
    this.slide.reset();
  }

  // 为了模板中表述中使用调用
  get nameFormControl() { return this.registerForm.get('userName'); }   // 等同于以下
  // get emailFormControl() {return this.registerForm.controls['emailFormControl']; } //此写法已经不推荐了
  get authFormControl() { return this.registerForm.get('userAuth'); }
  // get authFormControl2() { return this.registerForm.get('xfuUserAuth2'); }

  successMatch({ move, action }) {   // successMatch(myOb: {move: any, action: any}) {  ##解构## 对象,直接作为参数使用。
    this.move = move;
    this.action = action;
  }

}
