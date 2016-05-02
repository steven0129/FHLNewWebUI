// sc.php book 8 9 10
var scphp = scphp || {};
scphp.c_preach_frame = function () { };//declare class
scphp.c_preach_frame.prototype.m_id = "preach"; // preach8 preach9 preach10
scphp.c_preach_frame.prototype.bookid = -1;
scphp.c_preach_frame.prototype.pdiv = null;
scphp.c_preach_frame.prototype.m_views = [];//放 c_preach_view obj
scphp.c_preach_frame.prototype.next = {};//供 onclick 用的參數
scphp.c_preach_frame.prototype.prev = {};//供 onclick 用的參數
scphp.c_preach_frame.prototype.divbooknames = [];// 用這個來設定 class (css) 用的 (有幾筆record就會有幾個陣列)
scphp.c_preach_frame.prototype.divtitles = [];// 用這個來設定 class (css) 用的
scphp.c_preach_frame.prototype.divnexts = [];// 用這個來設定 class (css) 用的 
scphp.c_preach_frame.prototype.divprevs = [];// 用這個來設定 class (css) 用的 

scphp.c_preach_view = function () { };//declare class 
scphp.c_preach_view.prototype.pParent = null;
scphp.c_preach_view.prototype.pdiv = null;
scphp.c_preach_view.prototype.m_div_book_name = null;
scphp.c_preach_view.prototype.m_div_title = null;
scphp.c_preach_view.prototype.m_div_com_text = null;
scphp.c_preach_view.prototype.m_audios = [];

scphp.c_preach_audio = function () { };//declare class
scphp.c_preach_audio.prototype.pParent = null;
scphp.c_preach_audio.prototype.pdiv = null;
scphp.c_preach_audio.prototype.filename = "";//N01_001_001_001_001_t.mp3
scphp.c_preach_audio.prototype.src = "";//http://media.fhl.net/cbolcom/8/N01_001_001_001_001_t.mp3

// 全域變數
scphp.g_preach_frames = [
  new scphp.c_preach_frame(),
  new scphp.c_preach_frame(),
  new scphp.c_preach_frame()
];
scphp.g_preach_frames[0].m_id += '8'; //preach8
scphp.g_preach_frames[1].m_id += '9'; //preach9
scphp.g_preach_frames[2].m_id += '10'; //preach10
scphp.g_preach_frames[0].bookid = 8;
scphp.g_preach_frames[1].bookid = 9;
scphp.g_preach_frames[2].bookid = 10;

// 呼叫 set後會呼叫的指標
// var aaa = function pfn_set_after(div) { };
scphp.pfn_set_after = null;
// onclick的時候，需要「跳至」指定章節
// var aaa = function pfn_goto_sec(engs,chap,sec) { };
scphp.pfn_goto_sec = null;
// 程式進入點 set (外部呼叫,或是內部按next)
scphp.set = function set(engBook, chap, sec) {
  // 清空
  scphp.divbooknames = [];// 用這個來設定 class (css) 用的 (有幾筆record就會有幾個陣列)
  scphp.divtitles = [];// 用這個來設定 class (css) 用的
  scphp.divnexts = [];// 用這個來設定 class (css) 用的 
  scphp.divprevs = [];// 用這個來設定 class (css) 用的 

  // 存放結果的div
  var rediv = document.createElement("div");

  // 存放結果的div
  //var rediv = document.getElementById("re1");
  //rediv.innerText = "";
  
  for (var idx in scphp.g_preach_frames) {
    scphp.g_preach_frames[idx].set(engBook, chap, sec);
    if (scphp.g_preach_frames[idx].pdiv != null)//若本章本節有資料
    {
      rediv.appendChild(scphp.g_preach_frames[idx].pdiv);

      for (var idx2 in scphp.g_preach_frames[idx].divbooknames)
        scphp.divbooknames.push(scphp.g_preach_frames[idx].divbooknames[idx2]);
      for (var idx2 in scphp.g_preach_frames[idx].divtitles)
        scphp.divtitles.push(scphp.g_preach_frames[idx].divtitles[idx2]);
      for (var idx2 in scphp.g_preach_frames[idx].divnexts)
        scphp.divnexts.push(scphp.g_preach_frames[idx].divnexts[idx2]);
      for (var idx2 in scphp.g_preach_frames[idx].divprevs)
        scphp.divprevs.push(scphp.g_preach_frames[idx].divprevs[idx2]);
    }
  }//for each 8 9 10

  if (scphp.pfn_set_after != null)
    scphp.pfn_set_after(rediv);
};// 程式進入點 set
// 用來設定.css的 (在setaftercall後可以設)
scphp.divbooknames = [];// 用這個來設定 class (css) 用的 (有幾筆record就會有幾個陣列)
scphp.divtitles = [];// 用這個來設定 class (css) 用的
scphp.divnexts = [];// 用這個來設定 class (css) 用的 
scphp.divprevs = [];// 用這個來設定 class (css) 用的 
// scphp.set 會呼叫
scphp.c_preach_frame.prototype.set = function (engbook, chap, sec) {
  //var url = 'sc.php?book=8&engs=Gen&chap=1&sec=1';
  var url = 'sc.php?book=' + this.bookid + '&engs=' + engbook + '&chap=' + chap + '&sec=' + sec;

  var api_obj = {};
  fhl.json_api_text(url,
    function success(jstr, obj_param) {
      try {
        var jscphp = JSON.parse(jstr);
        obj_param["jret"] = jscphp;
      }
      catch (ex) { } // json api 會有bug
    },
    function error(jstr, obj_param) {
    },
    api_obj, false);// json_api_text

  if (api_obj["jret"] == undefined) {
    this.pdiv = null;
    return;
  }

  // 清除div (設定css用的)
  this.divbooknames = [];
  this.divtitles = [];
  this.divnexts = [];
  this.divprevs = [];

  // 開始處理
  this.pdiv = document.createElement("div");
  this.pdiv.id = this.m_id;

  // 上一篇 與 下一篇
  //console.debug("jret");
  //console.log(api_obj.jret);
  if (api_obj.jret["prev"] != undefined) {
    this.prev["engs"] = api_obj.jret.prev.engs;
    this.prev["chap"] = api_obj.jret.prev.chap;
    this.prev["sec"] = api_obj.jret.prev.sec;
  }
  else
    this.prev = {};
  if (api_obj.jret["next"] != undefined) {
    this.next["engs"] = api_obj.jret.next.engs;
    this.next["chap"] = api_obj.jret.next.chap;
    this.next["sec"] = api_obj.jret.next.sec;
  }
  else
    this.next = {};
  //console.debug("prev next");
  //console.log(this);


  // 處理每一份 record
  for (var idx in api_obj.jret.record) {
    var jrecord = api_obj.jret.record[idx];

    var viewobj = new scphp.c_preach_view();
    this.m_views.push(viewobj);

    viewobj.pParent = this;
    viewobj.pdiv = document.createElement("div");
    this.pdiv.appendChild(viewobj.pdiv);

    var divbookname = document.createElement("div"); //jrecord.book_name;
    divbookname.innerText = jrecord.book_name;
    viewobj.pdiv.appendChild(divbookname);

    //css處理
    this.divbooknames.push(divbookname);

    // 下一篇 上一篇 (只在第1份record才加)
    if (idx == 0) {
      if (this.prev.engs != undefined) {
        var divobj = document.createElement("span");
        //$(divobj).css('cursor', 'pointer');
        divobj.innerText = "上一篇";
        $(divobj).click(this, function (pdata) {
          //console.debug('onclick pdata');
          //console.log(pdata);

          var pframe = pdata.data;

          if (scphp.pfn_goto_sec != null)
            scphp.pfn_goto_sec(pframe.prev.engs, pframe.prev.chap, pframe.prev.sec);
          else
            scphp.set(pframe.prev.engs, pframe.prev.chap, pframe.prev.sec);
          //scphp.set(pframe.prev.engs, pframe.prev.chap, pframe.prev.sec);
        });
        viewobj.pdiv.appendChild(divobj);

        //css處理
        this.divnexts.push(divobj);
      }

      if (this.next.engs != undefined) {
        var divobj = document.createElement("span");
        divobj.innerText = "下一篇";
        //$(divobj).css('cursor', 'pointer');
        $(divobj).click(this, function (pdata) {
          //console.debug('onclick pdata');
          //console.log(pdata);

          var pframe = pdata.data;
          if (scphp.pfn_goto_sec != null)
            scphp.pfn_goto_sec(pframe.next.engs, pframe.next.chap, pframe.next.sec);
          else
            scphp.set(pframe.next.engs, pframe.next.chap, pframe.next.sec);
        });
        viewobj.pdiv.appendChild(divobj);

        //css處理
        this.divnexts.push(divobj);
      }
    } // 下一篇 上一篇 (只在第1份record才加)

    var divtitle = document.createElement("div"); //jrecord.title;
    divtitle.innerText = jrecord.title;
    viewobj.pdiv.appendChild(divtitle);

    //css處理
    this.divtitles.push(divtitle);


    var divcomtext = document.createElement("div");
    viewobj.m_div_com_text = divcomtext;
    viewobj.pdiv.appendChild(divcomtext);
    {
      // 目前有3種case
      // [media$N01_001_001_001_001_t.m3u]
      // [media$N01_001_001_001_001_m.m3u]
      // [media$1N01_001_001_001_001.m3u] ... /bookid/1/N01_001_001_001_001.mp3

      var r1 = jrecord.com_text;
      r1 = r1.replace(/\n/g, "<br />");
      var reg = new RegExp('\[media$[0-9/]*[N0-9_tm]+.m[3p][u3]\]', 'g'); //.m3u or .mp3
      //var reg = new RegExp('\[media$[0-9/]*[N0-9_tm]+.m3u\]', 'g');//bug2
      //var reg = new RegExp('\[media$[N0-9_tm]+.m3u\]', 'g');//bug1
      var r2 = r1.match(reg);
      for (var i2 in r2) {

        var str_ori = r2[i2];

        var reg1 = new RegExp('[0-9/]*N[0-9_mt]+', 'g');
        var str_na = reg1.exec(str_ori)[0]; // 'N01_001_001_001_001_t'
        //console.debug("str_na");
        //console.log(str_na);

        // 產生mp3_url
        var mp3_url = "http://media.fhl.net/cbolcom/" + this.bookid + "/" + str_na + ".mp3";

        var html5_audio = "<audio src=\"" + mp3_url + "\" controls preload=\"none\" playbackRate=\"1\" >HTML5 audio not supported</audio>";
        var html_download = "<a href=\"" + mp3_url + "\">下載</a>";

        var html_audio_obj = html5_audio + html_download;

        var html_out = "<span>" + html_audio_obj + "</span>";
        r1 = r1.replace(str_ori, html_out);
      }//for i2 in r2

      divcomtext.innerHTML = r1;
    }
    //console.log(this);


  }
}; // scphp.c_preach_frame.prototype.set = function (engbook, chap, sec)