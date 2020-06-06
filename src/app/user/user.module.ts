import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { UserRoutingModule } from './user-routing.module';

import { ShareModule } from '../share.module';

import { RegisterIndexComponent } from './register-index/register-index.component';
import { LoginIndexComponent } from './login-index/login-index.component';
import { MyInfoComponent } from './my-info/my-info.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';

@NgModule({
  declarations: [
    RegisterIndexComponent,
    LoginIndexComponent,
    MyInfoComponent,
    ForgetPasswordComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    ShareModule
  ]
})
export class UserModule { }
