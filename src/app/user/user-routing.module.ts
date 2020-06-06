import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterIndexComponent } from './register-index/register-index.component';
import { LoginIndexComponent } from './login-index/login-index.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { MyInfoComponent } from './my-info/my-info.component';
import { urlDefine } from '../ts/base-config';

const routes: Routes = [ // 似乎并不能使用 变量形式 开发模式下OK，但切入生产模式就会报split的错误
  // { path: 'register', component: RegisterIndexComponent},
  // { path: 'login' , component: LoginIndexComponent},
  { path: 'my', component: MyInfoComponent},
  // { path: 'forget-pwd', component: ForgetPasswordComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
