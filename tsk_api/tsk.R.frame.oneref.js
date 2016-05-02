/// <reference path="../qsb_api/qsb.qsbapi.js" />
/// <reference path="tsk.tskapi.js" />
var tsk = tsk || {};
tsk.R = tsk.R || {
  /// <summary> 當其中一行是 "# 2Ki 1:8; Zec 13:4; Mt 3:4|" 的類型，就會使用此型 </summary>
  oneref: React.createClass({
    pfn_click_oneref: function (reftxt) {
      // reftxt: "2Ki 1:8-10
      var jret = qsb.qsbapi(reftxt, this.props.default_book, this.props.default_version, this.props.isSN, this.props.isGB);
      var pthis = this;

      var rs = jret.record.map(function (a1) {
        var reftxt = "(" + a1.chineses + " " + a1.chap + ":" + a1.sec + ")";
        var r2 = React.createElement(sephp.R.txt, {
          pfn_search_sn: pthis.props.pfn_search_sn,
          txt: a1.bible_text + reftxt,
          sn: []
        });
        return r2;
      });
      var r = React.createElement("div", {}, rs);
      //var r = React.createElement(sephp.R.txt, { pfn_search_sn: this.props.pfn_search_sn, txt: txt, sn: [] });// r:react Ob:(Old Bible) Frame
      this.setState({ rDetail: r });
    },
    handleClick: function () {
      if (this.state.rDetail == null) {
        var txt = this.props.txt_ori.trim();
        var keyword2 = txt.substr(1, txt.length - 2);// 去頭去尾 # |
        this.pfn_click_oneref(keyword2);
      }
      else {
        this.setState({ rDetail: null });
      }
    },
    getInitialState: function () {
      return {
        rDetail: null //使用者 click oneref 時, 查詢後的結果, 
      };
    },
    getDefaultProps: function () {
      return {
        txt_ori: "# 2Ki 1:8; Zec 13:4; Mt 3:4|",
        default_book: "Matt",
        default_version: "unv",
        isSN: true,
        isGB: false,
        pfn_search_sn: null
      };
    },
    render: function () {

      // 開始處理
      var pthis = this;
      var txt_ori = this.props.txt_ori;

      var keyword2 = txt_ori;
      {// 去頭去尾 # |
        keyword2 = keyword2.trim();
        keyword2 = keyword2.substr(1, keyword2.length - 2);
      }

      var r1 = React.createElement("div", {
        className: "seKey sebutton",
        onClick: this.handleClick
      }, keyword2);
      return React.createElement("div", {}, r1, this.state.rDetail);
    }
  }),
  /// <summary> 使用 tsk.tskapi 查詢後, 可使用此 frame 來將結果表示出來 .</summary>
  frame: React.createClass({
    // 總查詢後的結果
    getDefaultProps: function () {
      return {
        txt_ori: ' * clothed.\r\n # 2Ki 1:8; Zec 13:4; Mt 3:4-7|\r\n* in.\r\n   Several MSS. have, "by Isaiah the prophet."  See the parallel texts.\r\n* clothed.\r\n # 2Ki 1:8; Zec 13:4; Mt 3:4-7|\r\n ',
        default_book: "Matt",
        default_version: "unv",
        isSN: true,
        isGB: false,
        cy:640,
        pfn_search_sn: null
      };
    },
    render: function () {
      var pthis = this;
      var aaa = this.props.txt_ori.trim().split("\n");
      var rs = [];
      $.each(aaa, function (idx, a1) {
        // 其實有可能存在沒有 # 的
        var a2 = a1.trim();
        var idx = a2.indexOf("#");
        if (idx == -1) {
          rs.push(React.createElement("div", {}, a2));
        }
        else {
          var body = a2.substr(idx, a2.length - idx).trim();
          //console.log(body);
          // "# 2Ki 1:8; Zec 13:4; Mt 3:4|"
          var r2 = React.createElement(tsk.R.oneref, {
            txt_ori: body,
            default_book: pthis.props.default_book,
            default_version: pthis.props.default_version,
            isSN: pthis.props.isSN,
            isGB: pthis.props.isGB,
            pfn_search_sn: pthis.props.pfn_search_sn
          });
          rs.push(r2);
        }
      });
      return React.createElement("div", { style: { height: this.props.cy, "overflow-y": "auto", "margin":"7px", "margin-top":"7px","margin-right":"7px" } }, rs);
    }
  })
};

/// example
//{
//  var jret = tsk.tskapi("Mark", 1, 1, false);
//  var r = React.createElement(tsk.R.frame, {
//    txt_ori: jret.record[0].com_text,
//    default_book: "Matt",
//    default_version: "unv",
//    isSN: false,
//    isGB: false,
//    pfn_search_sn: null //指定按下sn的結果
//  });
//  React.render(r, document.getElementById("re1"));
//}
