import { NgModule, Component } from '@angular/core';
// import { CommonModule } from '@angular/common';  通常不会在路由模块中声明组件 固删除
import { RouterModule, Routes } from '@angular/router';
import { urlDefine, baseConfig, lsDefine} from './ts/base-config';



const routes: Routes = [

  { path: '' , redirectTo: urlDefine.indexUrl, pathMatch: `full`},
  
  {path: 'user', loadChildren: './user/user.module#UserModule'},
  {path: 'activity/public', loadChildren: './activity/public/public.module#PublicModule'},
  {path: 'activity/my', loadChildren: './activity/my/my.module#MyModule'},

  {path: 'tools', loadChildren: './tools/tools.module#ToolsModule'},

];

@NgModule({
  // declarations: [],通常不会在路由模块中声明组件 固删除
  imports: [
    // CommonModule 通常不会在路由模块中声明组件 固删除
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
