import { Component, OnInit } from '@angular/core';
import { urlDefine, baseConfig } from 'src/app/ts/base-config';
import { environment } from 'src/environments/environment';
import { PageQuery, UserService, Result } from 'src/app/user/user.service';
import {
  faHeart, faSquare, faCalendarAlt, faBookmark, faMapMarkerAlt, faCircle, faIdCard
} from '@fortawesome/free-solid-svg-icons';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Region } from 'src/app/ts/region';
import { MatSnackBar, MatDialog, MatBottomSheet } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { getAndSavePath, convertDateFromString, getUserMobile } from 'src/app/ts/base-utils';
import { QuestionnaireListBottomComponent } from './questionnaire-list-bottom/questionnaire-list-bottom.component';

@Component({
  selector: 'app-question-naire-list',
  templateUrl: './question-naire-list.component.html',
  styleUrls: ['./question-naire-list.component.css']
})
export class QuestionNaireListComponent implements OnInit {

  title = '调查问卷列表';
  baseUrl = environment.media + '/activity/images';
  urlDefine = urlDefine;

  windowWidth;
  headWidth: any;

  queryForm: FormGroup;
  
  // http相关
  showProgress = false;
  toEnd = false;
  query: PageQuery = { offset: 0, limit: 10 };

  faBookmark = faBookmark;
  faIdCard = faIdCard;

  questionnaires: any[] = [];
  questionnaireType = 1;

  total: number;

  constructor(
    private userService: UserService,
    private router: Router,
    private region: Region,
    public snackBar: MatSnackBar,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private activeRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet
  ) { }
 
  ngOnInit() {
    // 不登录的情况下可以返回此
    this.queryForm = this.fb.group({
      showExpired: [true]
    });

    getAndSavePath(this.activeRoute);

    if (window.location.href.includes('ginfo-list')) {
      this.questionnaireType = 2;
      this.title = '信息表单列表';
    }

    this.getQuestionnaires();
    this.resetWindow();
    window.onresize = () => {
      this.resetWindow();
    };
  }

  resetWindow() {
    this.windowWidth = window.innerWidth;
    if (this.windowWidth > 800) {
      this.headWidth = (800) * 4 / 16 + 'px';
    } else {
      this.headWidth = (this.windowWidth) * 4 / 16 + 'px';
    }
  }

  queryChange() {
    this.query = { offset: 0, limit: 10 };
    this.questionnaires = [];
    this.toEnd = false;
    this.getQuestionnaires();
  }

  getQuestionnaires(){
    this.showProgress = true;
    const temp = this.queryForm.value;
    temp.offset = this.query.offset;
    temp.limit = this.query.limit;
    temp.questionnaireType = this.questionnaireType;
    this.userService.post(baseConfig.questionnaireFormList, temp).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          this.total = result.data.total;
          result.data.rows.forEach(element => {
            if (convertDateFromString(element.questionnaireExpired) < new Date()) {  // 实际时间，而不是临时表中的结束时间
              element.expired = true;
            } else {
              element.expired = false;
            }
            this.questionnaires.push(element);
          });

          if (result.data.total === this.questionnaires.length) {
            this.toEnd = true;
          } else {
            this.query = { offset: this.query.offset + this.query.limit, limit: this.query.limit };
          }
        } else {
          this.userService.showError(result);
        }
        this.showProgress = false;
      },
      (error: Result) => { this.userService.showError(error); this.showProgress = false; }
    );
  }

  addQuestionnaire(){
    const userMobile = getUserMobile();
    if (userMobile === null || userMobile === undefined) {
      this.snackBar.open('请前往“我的”绑定手机号', '', { duration: 5000 });
    } else {
      if (this.questionnaireType === 1 ){
        this.router.navigate([urlDefine.myQuesttionnaire]);
      } else {
        this.router.navigate([urlDefine.myGinfo]);
      }
    }
  }

  scrollBottom(e: any) {
    //console.log(e);
    let offsetH = e.target.offsetHeight;
    let scrollT = e.target.scrollTop;
    let height = e.target.scrollHeight;
    // div 距离底部 = 列表的总高度 -（滚动的距离 + 窗口可视高度）
    let bottom = height - (scrollT + offsetH);
    if (bottom < 10 && !this.showProgress && !this.toEnd) {
      // console.log('到底了');
      this.getQuestionnaires();
    }
  }

  showBottom(questionnaire: any) {
    // console.log(activity);
    const bottomSheetRef = this.bottomSheet.open(QuestionnaireListBottomComponent, { data: { para: questionnaire } });
    bottomSheetRef.afterDismissed().subscribe(() => {
      switch (bottomSheetRef.instance.operType) {
        case 1: // 编辑
          if(this.questionnaireType === 1 ){
            this.router.navigate([urlDefine.myQuesttionnaire, questionnaire.questionnaireId]);
          } else {
            this.router.navigate([urlDefine.myGinfo, questionnaire.questionnaireId]);
          }
          break;
        case 2:  // 查看
          this.router.navigate([urlDefine.publicQuestionnaire, questionnaire.questionnaireId]);
          break;
        case 3:   // 清单
          this.router.navigate([urlDefine.questionnaireEntryList, questionnaire.questionnaireId]);
          break;
        default:
          break;
      }
    });
  }

}
