import { Component, OnInit } from '@angular/core';
import { UserService, PageQuery, Result } from 'src/app/user/user.service';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';
import { getAndSavePath, getUserToken, convertDateFromString, isExplorer } from 'src/app/ts/base-utils';
import { baseConfig } from 'src/app/ts/base-config';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';
import {
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { EntryImportComponent } from '../entry-import/entry-import.component';
import { CommandService } from 'src/app/user/command.service';

export interface Static {
  color: string;
  cols: number;
  rows: number;
  text: string;
  action: number;
}

@Component({
  selector: 'app-activity-entries',
  templateUrl: './activity-entries.component.html',
  styleUrls: ['./activity-entries.component.css']
})
export class ActivityEntriesComponent implements OnInit {

  query: PageQuery = { offset: 0, limit: 15 };
  queryForm: FormGroup;

  title = '报名清单';
  showProgress = false;
  toEnd = false;

  // 图标
  faSearch = faSearch;

  activityId: number;
  // activity: any;
  defaultTicketId: number;
  form: any;  // 报名表单，用于还原数据
  tickets: any[];
  entries: any[] = [];
  statics: Static[] = [];
  // 票种销售和
  soldSum = 0;

  constructor(
    private userService: UserService,
    private commandService: CommandService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    this.queryForm = this.fb.group({
      queryStr: [],
      ticketId: [],
      checkin: [],
      cancel: []
    });
    // 不登录的情况下可以返回此
    getAndSavePath(this.activeRoute);

    this.activeRoute.params.subscribe((data: Params) => {
      if (data.id !== undefined) { // 编辑
        this.activityId = parseInt(data.id, 10);
        setTimeout(() => {
          this.commandService.setMessage(3);
          this.getEntries();
        }, 100);
      }
    });
  }

  getEntries() {
    this.showProgress = true;
    this.commandService.setMessage(1);
    const temp = this.queryForm.value;
    temp.offset = this.query.offset;
    temp.limit = this.query.limit;
    temp.activityId = this.activityId;
    this.userService.post(baseConfig.activityMyEntryList, temp).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {

          if (this.query.offset === 0) {  // 第一页加载
            this.form = JSON.parse(result.data.dataDictMap.activity.form.formJson);
            this.tickets = result.data.dataDictMap.activity.tickets;
            // this.activity = result.data.dataDictMap.activity;

            this.soldSum = this.tickets[0].ticketSold;
            for (let index = 1; index < this.tickets.length; index++) {
              this.soldSum = this.soldSum + this.tickets[index].ticketSold;
            }
            // 第一行第一列数据
            this.statics.push({ text: '总报名：' + this.soldSum, cols: 1, rows: 1, color: 'lightblue', action: 0 });
            // 第2，3列数据
            this.statics.push({ text: '下载', cols: 1, rows: 1, color: 'lightgreen', action: 1 });
            this.statics.push({ text: '导入', cols: 1, rows: 1, color: 'lightgreen', action: 2 });
            // 第二行开始的数据
            for (let index = 0; index < this.tickets.length; index++) {
              if (index === 0) {
                this.defaultTicketId = this.tickets[index].ticketId;
              }
              this.statics.push({
                text: this.tickets[index].ticketName + '：' + this.tickets[index].ticketSold
                  + '/' + this.tickets[index].ticketSum,
                cols: (index === this.tickets.length - 1 ) ? (3 - this.tickets.length % 3) % 3 + 1  : 1, rows: 1, // 填满行
                color: this.tickets[index].ticketStatus ? 'lightblue' : 'gray', action: 0
              });
            }
          }
          result.data.rows.forEach(element => {

            // 还原 票种名称
            this.tickets.forEach(ticket => {
              if (ticket.ticketId === element.ticketId) {
                element.ticketName = ticket.ticketName;
              }
            });

            element.entryCreate = convertDateFromString(element.entryCreate);
            // 还原报名数据
            element.entryContentJson = JSON.parse(element.entryContent);  // 单个答案集
            element.entryContentTrans = [];
            element.entryShowName = ''; // 用于显示使用，第一题目的答案
            this.form.forEach(question => {  /// 从问题出发
              let ansow = '';
              switch (question.controlType) {
                case 'textbox':
                case 'textmorebox':
                  ansow = element.entryContentJson[question.key];
                  element.entryContentTrans.push({ q: question.label, a: ansow });
                  break;
                default:
                  // console.log(element.xfuEntryContentJson[question.key].toString().split(','));
                  // 中途更改表单，可能导致数据问题
                  if (element.entryContentJson[question.key] !== undefined && element.entryContentJson[question.key] !== null) {
                    element.entryContentJson[question.key].toString().split(',').forEach(part => {
                      let find = false;
                      question.options.forEach(option => {
                        if (option.key + '' === part) {
                          ansow = ansow + option.value + ',';
                          find = true;
                        }
                      });
                      if ( !find ) { // 如果匹配不上，就保留原始答案
                        ansow = ansow + part + ',';
                      }
                    });
                  }
                  if (ansow.length > 0) {
                    ansow = ansow.substr(0, ansow.length - 1);
                  }
                  element.entryContentTrans.push({ q: question.label, a: ansow });
                  break;
              }
              if (element.entryShowName === '') {
                element.entryShowName = ansow;
              }

            });

            this.entries.push(element);
          });

          if (result.data.rows.length <= 0) {   // 服务侧因为返回了总数，所以超过总是返回最后一页，所以判断结束方法随之改变。
            this.toEnd = true;
          } else {
            this.query = { offset: this.query.offset + this.query.limit, limit: this.query.limit };
          }
          // console.log(result);
        } else {
          this.userService.showError1(result, () => { this.getEntries(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.getEntries(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },

    );
  }

  queryChange() {
    this.query = { offset: 0, limit: 10 };
    this.entries = [];
    this.statics = [];
    this.toEnd = false;

    this.getEntries();
  }

  scrollBottom(e: any) {
    // console.log(e);
    const offsetH = e.target.offsetHeight;
    const scrollT = e.target.scrollTop;
    const height = e.target.scrollHeight;
    // div 距离底部 = 列表的总高度 -（滚动的距离 + 窗口可视高度）
    const bottom = height - (scrollT + offsetH);
    if (bottom < 10 && !this.showProgress && !this.toEnd) {
      // console.log('到底了');
      this.getEntries();
    }
  }

  staticAction(action: number) {
    if (action === 1 ) {   // { xfuActivityId: this.activityId }  baseConfig.activityMyEntryDl
      if (isExplorer('micromessenger')) {
        this.snackBar.open('微信生态要求，请点击右上角选择在浏览器中打开。', '', { duration: 3000 });
        return;
      }
      this.showProgress = true;
      this.commandService.setMessage(1);
      const userToken = getUserToken();
      const params = { activityId: this.activityId }; // body的参数
      this.http.post(environment.api + baseConfig.activityMyEntryDl, params, {
        responseType: 'blob',
        headers: new HttpHeaders().append('Content-Type', 'application/json').append('token', userToken === undefined ? '' : userToken)
      }).subscribe(resp => {
        // resp: 文件流
        const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

        const blob = new Blob([resp], { type: contentType });
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download =  Date.now() + '.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.showProgress = false;
        this.commandService.setMessage(0);
      });
    } else if (action === 2 ) { // 显示导入 和 下载 模板
      const dialogRef = this.dialog.open(EntryImportComponent, {
        data: { activityId: this.activityId, ticketId: this.defaultTicketId}
      });
      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          this.tickets = [];
          this.entries = [];
          this.statics = [];
          this.query = { offset: 0, limit: 15 };
          this.ngOnInit();
        }
      });
    }
  }

  toggleCancel(entry: any, e: any){
    e.stopPropagation();
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.activityMyEntryCancel, {entryId: entry.entryId}).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          entry.cancel = entry.cancel ? null : new Date() ;
        } else {
          this.userService.showError1(result, () => { this.toggleCancel(entry, e); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.toggleCancel(entry, e); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );
  }

  sign(entry: any, e: any) {
    e.stopPropagation();
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.activityMyEntrySign, {entryId: entry.entryId}).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          entry.checkin = new Date();
        } else {
          this.userService.showError1(result, () => { this.sign(entry, e); } );
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => { this.sign(entry, e); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
    );
  }

}
