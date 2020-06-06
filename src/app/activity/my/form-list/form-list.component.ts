import { Component, OnInit } from '@angular/core';
import { UserService, Result, PageQuery } from 'src/app/user/user.service';
import { baseConfig, urlDefine } from 'src/app/ts/base-config';
import { Router, ActivatedRoute } from '@angular/router';
import { from } from 'rxjs';
import { getAndSavePath } from 'src/app/ts/base-utils';
import { CommandService } from 'src/app/user/command.service';

interface Form {
  formId: number;
  formName: string;
  formJson: string;
  formCreate: string;
  formUpdate: string;
}

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.css']
})
export class FormListComponent implements OnInit {

  title = '活动表单';
  showProgress = false;
  toEnd = false;
  query: PageQuery = { offset: 0, limit: 10 };

  urlDefine = urlDefine;

  formsData: Form[] = [];

  constructor(
    private userService: UserService,
    private commandService: CommandService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) { 
  }

  ngOnInit() {
    // 不登录的情况下可以返回此
    getAndSavePath(this.activeRoute);
    setTimeout(() => {
      this.getForms();
      this.commandService.setMessage(3);
    }, 100);
    
  }

  getForms() {
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.formMyList, this.query).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          result.data.forEach(element => {
            this.formsData.push(element);
          });
          if (result.data.length <= 0) { // 服务侧因为返回了总数，所以超过总是返回最后一页，所以判断结束方法随之改变。
            this.toEnd = true;
          } else {
            this.query = { offset: this.query.offset + this.query.limit, limit: this.query.limit };
          }
        } else {
          this.userService.showError1(result, () => {this.getForms(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.getForms(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );
  }

  showForm(form: Form) {
    // console.log(form.xfuFormCreate);
    this.router.navigate([urlDefine.createFrom, form.formId]);
  }

  scrollBottom(e: any) {
    //console.log(e);
    const offsetH = e.target.offsetHeight;
    const scrollT = e.target.scrollTop;
    const height = e.target.scrollHeight;
    // div 距离底部 = 列表的总高度 -（滚动的距离 + 窗口可视高度）
    const bottom = height - (scrollT + offsetH);
    if (bottom < 10 && !this.showProgress && !this.toEnd) {
      // console.log('到底了');
      this.getForms();
    }
  }

}
