import { Component, OnInit } from '@angular/core';
import { PageQuery, UserService, Result } from 'src/app/user/user.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import {
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute, Router, Params } from '@angular/router';

import { MatDialog, MatSnackBar } from '@angular/material';
import { getAndSavePath, convertDateFromString, getUserToken, isExplorer } from 'src/app/ts/base-utils';
import { baseConfig } from 'src/app/ts/base-config';
import { environment } from 'src/environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-questionnaire-entry-list',
  templateUrl: './questionnaire-entry-list.component.html',
  styleUrls: ['./questionnaire-entry-list.component.css']
})
export class QuestionnaireEntryListComponent implements OnInit {

  query: PageQuery = { offset: 0, limit: 15 };
  queryForm: FormGroup;

  title = '报名清单';
  showProgress = false;
  toEnd = false;

  // 图标
  faSearch = faSearch;

  form: any;  // 报名表单，用于还原数据
  questionnaireId;
  total;

  entries: any[] = [];

  constructor(
    private userService: UserService,
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
    });
    // 不登录的情况下可以返回此
    getAndSavePath(this.activeRoute);

    this.activeRoute.params.subscribe((data: Params) => {
      if (data.id !== undefined) { // 编辑
        this.questionnaireId = parseInt(data.id, 10);
        this.getEntries();
      }
    });
  }

  getEntries() {
    this.showProgress = true;
    const temp = this.queryForm.value;
    temp.offset = this.query.offset;
    temp.limit = this.query.limit;
    temp.questionnaireId = this.questionnaireId;
    this.userService.post(baseConfig.questionnaireListEntry, temp).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          if (this.query.offset === 0) {  // 第一页加载
            this.form = JSON.parse(result.data.dataDictMap.questionnaire.questionnaireJson);
          }
          this.total = result.data.total;
          result.data.rows.forEach(element => {
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
                      if (!find) { // 如果匹配不上，就保留原始答案
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
          if (result.data.total === this.entries.length) {
            this.toEnd = true;
          } else {
            this.query = { offset: this.query.offset + this.query.limit, limit: this.query.limit };
          }
          // console.log(result);
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => { this.userService.showError(error); this.showProgress = false; },

    );
  }

  queryChange() {
    this.query = { offset: 0, limit: 10 };
    this.entries = [];
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

  dl() {

    if (isExplorer('micromessenger')) {
      this.snackBar.open('微信生态要求，请点击右上角选择在浏览器中打开。', '', { duration: 3000 });
      return;
    }
    const userToken = getUserToken();
    const params = { questionnaireId: this.questionnaireId }; // body的参数
    this.http.post(environment.api + baseConfig.questionnaireDlEntry, params, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json').append('token', userToken === undefined ? '' : userToken)
    }).subscribe(resp => {
      // resp: 文件流
      const contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      const blob = new Blob([resp], { type: contentType });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = Date.now() + '.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);

    });
  }
}
