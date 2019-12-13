export const baseConfig = {
    getAuthImage: '/slide/get',
    vertifyAuthImage: '/slide/vertify',
    userBaseRegister: '/user/base/register',
    userBaseLogin: '/user/base/login',
    userGet: '/user/base/get',
    userChangeAuth: '/user/base/changeAuth',
    userUpdateResume: '/user/base/updateResume',

    sendBindCode: '/user/base/sendBindCode',
    activeMobile: '/user/base/activeMobile',
    sendChangeCode: '/user/base/sendChangeCode',
    sendResetCode: '/user/base/sendResetCode',
    resetUser: '/user/base/resetUser',

    getWxParam: '/user/base/getWxJsParam',
    getWx2Param: '/user/base/getWx2JsParam',

    formMyAddUpdate: '/activity/base/addUpdateMyForm',
    formMyList: '/activity/base/listMyForm',
    formMyGet: '/activity/base/getMyForm',
    ticketMyAddUpdate: '/activity/base/addUpdateMyTicket',
    ticketMyList: '/activity/base/listMyTicket',

    activityMyAddUpdate: '/activity/main/addUpdateMyActivity',
    activityUpPic: '/activity/main/uploadPic',
    activityMyList: '/activity/main/listMyActivity',
    activityMyGet: '/activity/main/getMyActivityTemp',
    activityMyApply: '/activity/main/applyMyActivity',
    activityMyEntryList: '/activity/main/listMyActivityEntries',
    activityMyEntryDl: '/activity/main/dlMyActivityEntries',
    activityMyEntryTempleDl: '/activity/main/dlMyActivityEntriesTemple',
    activityMyEntrySign: '/activity/main/sign', // 代签到
    activityMyEntryCancel: '/activity/main/cancel',  // 代取消
    activityImportEntry: '/activity/main/importEntry',

    activityMyLotterySettings: '/activity/main/saveLotterySettings',
    activityMyLotterySettingsGet: '/activity/main/getLotterySettings',
    activityMyLotteryEntries: '/activity/main/getLotteryEntries',
    activityMyLotteryResultSave: '/activity/main/saveLotteryResult',
    activityMyLotteryResultGet: '/activity/main/getLotteryResults',
    activityMyLotteryResultDl: '/activity/main/dlLotteryResults',

    activityMyLotterySettingsDemo: '/activity/demo/saveLotterySettings',
    activityMyLotterySettingsGetDemo: '/activity/demo/getLotterySettings',
    activityMyLotteryEntriesDemo: '/activity/demo/getLotteryEntries',
    activityMyLotteryResultSaveDemo: '/activity/demo/saveLotteryResult',
    activityMyLotteryResultGetDemo: '/activity/demo/getLotteryResults',
    activityMyLotteryResultDlDemo: '/activity/demo/dlLotteryResults',
    ticketMyListDemo: '/activity/demo/listMyTicket',
    activityUpPicDemo: '/activity/demo/uploadPic',

    activityComments: '/activity/main/listActivityComment',
    activityCommentDel: '/activity/main/applyComment', // 复用回答接口
    activityCommentReplay: '/activity/main/applyComment',

    delMyComment: '/activity/main/delMyComment',
    listMyComment: '/activity/main/listMyComment',
    publishComment: '/activity/main/publishComment',

    entryMyList: '/activity/main/listMyEntry',   // 我的报名
    entryMyAdd: '/activity/main/addMyEntry',
    entryMyCancel: '/activity/main/cancelMyEntry',

    signPerson: '/activity/main/signPerson',
    signActivity: '/activity/main/signActivity',

    publicActivityList: '/activity/public/getActivityList',
    publicActivity: '/activity/public/getActivity',
    getPublicComments: '/activity/public/getPublicComments',

    sponsorActivityList: '/activity/public/getSponsorActivityList',

    toggleFavi: '/activity/base/toggleFavi',
    myFaviList: '/activity/base/myFaviList',
    sponsorGet: '/activity/base/getSponsor',
    sponsorSet: '/activity/base/setSponsor',
    sponsorPic: '/activity/base/picSponsor',


    questionnaireFormGet: '/tools/main/getMyQuestionnaire',   // 限自己的
    questionnaireFormAddUpdate: '/tools/main/setQuestionnaire',
    questionnaireUpPic: '/tools/main/uploadPic',
    questionnaireFormList: '/tools/main/listMyQuestionnaire',
    questionnairePublic: '/tools/main/getPublicQuestionnaire',
    questionnaireAddEntry: '/tools/main/addQuestionnaireEntry',
    questionnaireListEntry: '/tools/main/getQuestionnaireEntries',
    questionnaireDlEntry: '/tools/main/dlQuestionnaireEntries',

    toolGet: '/user/tool/getSettings',
    toolSet: '/user/tool/setSettings',

    activityMyWallSettingsGet: '/activity/main/getWallSetting'
  };

export const urlDefine = {
    indexUrl: 'activity/public/public-list',

    // user
    loginUrl: 'user/login',
    registerUrl: 'user/register',
    myUrl: 'user/my',
    forgetPwd : 'user/forget-pwd',

    createFrom: 'activity/my/create-form',
    createActiviry: 'activity/my/create-activity',
    listFrom: 'activity/my/form-list',
    listActivity: 'activity/my/activity-list',
    activityEntries: 'activity/my/activity-entries',
    myEntries: 'activity/my/entry-list',
    signByWx: 'activity/my/sign-wx',
    myFaviList: 'activity/my/favi-sponsors',
    myComments: 'activity/my/my-comments',
    activityComments: 'activity/my/activity-comments',
    sponsor: 'activity/my/sponsor',
    lotterySettings: 'activity/my/entry-lottery',

    publicActivity: 'activity/public/activity-detail',
    publicActivityList: 'activity/public/public-list',
    sponsorActivityList: 'activity/public/sponsor-activity-list',

    myQuesttionnaires: 'tools/questionnaire-list',
    myGinfos: 'tools/ginfo-list',
    myQuesttionnaire: 'tools/questionnaire-create',
    myGinfo: 'tools/ginfo-create',
    publicQuestionnaire: 'tools/questionnaire-public',
    questionnaireEntryList: 'tools/questionnaire-entry-list',

    rotate: 'tools/rotate',

    wall: 'activity/my/checkin-demo',
  };

export const regDefine = {
  userName: /^[a-zA-Z]([-_a-zA-Z0-9]{5,19})+$/,
  password: /^.*(?=.{6,})(?=.*\d)(?=.*[A-Z]{1,})(?=.*[a-z]{1,})(?=.*[~!@#$%^&*()\\_+`\-={}:";'<>?,\[\] .\/]).*$/,
  activityName: /^.{6,50}$/,
  datetime: /^[1-9]\d{3}-(0[1-9]|1[0-2]|[1-9])-(0[1-9]|[1-2][0-9]|3[0-1]|[1-9])\s(20|21|22|23|[0-1]\d|\d):([0-5]\d|\d)$/,
  date: /^[1-9]\d{3}-(0[1-9]|1[0-2]|[1-9])-(0[1-9]|[1-2][0-9]|3[0-1]|[1-9])$/,
  time: /^(20|21|22|23|[0-1]\d|\d):([0-5]\d|\d)$/,
  address: /^.{2,125}$/,
  ticketName: /^.{1,25}$/,
  ticketRemark: /^[\s\S]{6,125}$/,
  ticketNumber: /^\d{1,3}$/,
  formName: /^.{1,25}$/,

  // 个人基本信息用于填报  可以为空
  resume: /^$|^.{2,45}$/,
  birth: /^$|^[1-9]\d{3}-(0[1-9]|1[0-2]|[1-9])-(0[1-9]|[1-2][0-9]|3[0-1]|[1-9])$/,
  mobile: /^$|^1\d{10}$/,
  email: /^$|^.+@.+$/, // 简单判断

  sponsorName: /^.{2,45}$/,
  sponsorIntro: /^[\s\S]{6,512}$/,
  mobileCode: /^$|^\d{6}$/,

  comment: /^[\s\S]{6,500}$/,

  biggerThanZero : /^[1-9]\d*/,
  zeroThanFive: /^[0|5-9]$|^[1-9]\d+$/,

  questionnaireName: /^.{6,50}$/,
  questionnaireIntro: /^[\s\S]{1,1000}$/,

  rotateSettingName: /^.{0,8}$/,
  rotateSettingWeight: /^([0-9]|[1-9][0-9][0-9]|[1-9][0-9])$/,

};

export const lsDefine = {
  userInfo: 'userInfo',
  redirectUrl: 'redirectUrl'
};

