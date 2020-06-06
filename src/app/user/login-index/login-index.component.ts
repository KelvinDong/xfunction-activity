import { Component, OnInit , Directive, ViewChild} from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute} from '@angular/router';

// 自定义
import {baseConfig, urlDefine, regDefine, lsDefine} from '../../ts/base-config';
import { UserService, Result } from '../user.service';
import {forbiddenRegValidator, isEmpty, getAndSavePath} from '../../ts/base-utils';

// 组件导入
import { MatSnackBar } from '@angular/material';
import { SlideControlComponent } from '../../define/slide-control/slide-control.component';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-login-index',
  templateUrl: './login-index.component.html',
  styleUrls: ['./login-index.component.css']
})
export class LoginIndexComponent implements OnInit {

  @ViewChild(SlideControlComponent, {static: false})
  slide: SlideControlComponent;

  move: number;
  private action: number[];
  hide = true;

  urlDefine = urlDefine;

  loginForm = new FormGroup({
    userName: new FormControl('', [
      Validators.required,
      forbiddenRegValidator(regDefine.userName)
    ]),
    userAuth: new FormControl('', [
      Validators.required,
      forbiddenRegValidator(regDefine.password)
    ])
  });

  constructor(
    private userService: UserService,
    public snackBar: MatSnackBar,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
   

  }

  login() {
    const formValue: any = this.loginForm.value;
    formValue.move = this.move;
    formValue.action = this.action;
    this.userService.post(baseConfig.userBaseLogin, formValue).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.snackBar.open('登录成功，返回原页面', '', { duration: 3000 });
          window.localStorage.setItem(lsDefine.userInfo, JSON.stringify(result.data));
          let redUrl = window.localStorage.getItem(lsDefine.redirectUrl);
          if ( redUrl === null) {
            redUrl = environment.web + '/' + urlDefine.indexUrl;
          }
          // console.log('返回原页面：' + redUrl);
          setTimeout(() => {
            window.location.href = redUrl;
          }, 1000);
        } else {
          // this.userService.showError(result);
          this.reset();
        }
      },
      // (error: Result) => this.userService.showError(error)
    );
  }

  register() {
    this.router.navigateByUrl(urlDefine.registerUrl);
  }
  private reset() {
    this.move = undefined;
    this.action = [];
    this.slide.reset();
  }

  get nameFormControl() { return this.loginForm.get('userName'); }
  get authFormControl() { return this.loginForm.get('userAuth'); }


  successMatch({ move, action }) {
    this.move = move;
    this.action = action;
  }

}
