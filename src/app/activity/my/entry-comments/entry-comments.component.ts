import { Component, OnInit } from '@angular/core';
import { PageQuery, UserService, Result } from 'src/app/user/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Region } from 'src/app/ts/region';
import { MatSnackBar, MatDialog, MatBottomSheet } from '@angular/material';
import { FormBuilder } from '@angular/forms';
import { getAndSavePath, convertDateFromString } from 'src/app/ts/base-utils';
import { baseConfig, urlDefine } from 'src/app/ts/base-config';
import { EntryCommentsBottomComponent } from './entry-comments-bottom/entry-comments-bottom.component';
import {
  faQuoteLeft, faQuoteRight, faClock, faCommentSlash
} from '@fortawesome/free-solid-svg-icons';
import { CommandService } from 'src/app/user/command.service';

@Component({
  selector: 'app-entry-comments',
  templateUrl: './entry-comments.component.html',
  styleUrls: ['./entry-comments.component.css']
})
export class EntryCommentsComponent implements OnInit {

  title = '评论过往';

  // http相关
  showProgress = false;
  toEnd = false;
  query: PageQuery = { offset: 0, limit: 10 };

  comments: any[] = [];

  faQuoteLeft = faQuoteLeft;
  faQuoteRight = faQuoteRight;
  faClock = faClock;
  faCommentSlash = faCommentSlash;


  constructor(
    private userService: UserService,
    private router: Router,
    private commandService: CommandService,
    public snackBar: MatSnackBar,

    public dialog: MatDialog,
    private activeRoute: ActivatedRoute,
    private bottomSheet: MatBottomSheet
  ) { }

  ngOnInit() {
    getAndSavePath(this.activeRoute);
    setTimeout(() => {
      this.getComments();
      this.commandService.setMessage(3);
    }, 100);
    
  }

  getComments() {
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.listMyComment, this.query).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {

          result.data.rows.forEach(element => {
            element.commentCreate = convertDateFromString(element.commentCreate);
            this.comments.push(element);
          });

          if (result.data.rows.length <= 0) {
            this.toEnd = true;
          } else {
            this.query = { offset: this.query.offset + this.query.limit, limit: this.query.limit };
          }
        } else {
          this.userService.showError1(result, () => {this.getComments(); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.getComments(); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );
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
      this.getComments();
    }
  }

  showBottom(comment: any) {
    // console.log(activity);
    const bottomSheetRef = this.bottomSheet.open(EntryCommentsBottomComponent, { data: { para: comment } });
    bottomSheetRef.afterDismissed().subscribe(() => {
      switch (bottomSheetRef.instance.operType) {
        case 1:
          this.del(comment);
          break;
        case 2:
          this.router.navigate([urlDefine.publicActivity, comment.activity.activityId]);
          break;
        default:
          break;
      }
    });
  }

  del(comment){
    this.showProgress = true;
    this.commandService.setMessage(1);
    this.userService.post(baseConfig.delMyComment, {commentId: comment.commentId}).subscribe(
      (data: Result) => {
        const result = { ...data };
        if (result.success) {
          comment.commentDel = true;
        } else {
          this.userService.showError1(result, () => {this.del(comment); });
        }
        this.showProgress = false;
        this.commandService.setMessage(0);
      },
      (error: Result) => {
        this.userService.showError1(error, () => {this.del(comment); });
        this.showProgress = false;
        this.commandService.setMessage(0);
      }
    );
  }

}
