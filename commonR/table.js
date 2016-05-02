/// <reference path="../libs/jquery-1.11.3.js" />
/// <reference path="../libs/react/react-0.13.1.min.js" />
/// <reference path="../libs/react/react-with-addons-0.13.1.min.js" />
/*
<script src="../libs/jquery-1.11.3.js"></script>
<script src="../libs/react/react-0.13.1.min.js"></script>
<script src="../libs/react/react-with-addons-0.13.1.min.js"></script>
http://localhost:9125/../ob_api/ob_table.css
*/
// template
var commonR = commonR || {};
commonR.R = commonR.R || {
  table: React.createClass({
    _cell_click: function (param1) {
      if (this.props.cell_click != null)
        this.props.cell_click(param1);
      else
        console.log(param1);
    },
    getDefaultProps: function () {
      return {
        "_columnheader": {}, // "img":"縮圖", "cname": "和合本","mname": "現代名字","ename": "英文名字","other": "別名"
        "_data": [],
        "cell_click": null,//function (param1)
      };
    },
    render: function () {
      var _columnheader = this.props._columnheader;
      var _data = this.props._data;
      // 測試資料
      //var _columnheader = {
      //  "img": "縮圖",
      //  "cname": "和合本",
      //  "mname": "現代名字",
      //  "ename": "英文名字",
      //  "other": "別名"
      //};
      //var _data = [
      //  { "cname": "巴比倫", "mname": "Babylon", "ename": "Babylon" },
      //  { "cname": "猶大", "mname": "Judah", "ename": "Judah" },
      //  { "cname": "以色列", "mname": "Israel", "ename": "Israel" },
      //];
      var pthis = this;
      var columnheaderkey = $.Enumerable.From(_columnheader).Select(function (a1) { return a1.Key; });
      var rheader = React.createElement("tr", {},
        $.Enumerable.From(_columnheader).Select(function (a1, a2) {
          return React.createElement("td", {
            "style": { "cursor": (pthis.props.cell_click == null) ? "text" : "pointer" },
            "onClick": pthis._cell_click.bind(null, { "irow": -1, "icol": a2, "key": a1.Key, "val": a1.Value })
          }, a1.Value);
        }).ToArray());
      var rdata = $.Enumerable.From(_data).Select(
        function (a1, a2) {
          return React.createElement("tr", {}, columnheaderkey.Select(
            function (aa1, aa2) {
              var obj = a1[aa1];
              return React.createElement("td", {
                "style": { "cursor": (pthis.props.cell_click == null) ? "text" : "pointer" },
                "onClick": pthis._cell_click.bind(null, { "irow": a2, "icol": aa2, "key": aa1, "val": obj })
              }, obj == undefined ? null : obj);
            }).ToArray());
        }).ToArray();
      var rtbody = React.createElement("tbody", {}, rheader, rdata);
      var rtable = React.createElement("table", { "className": (this.props.className==null)? "obtable": this.props.className }, rtbody);
      return React.createElement("div", {}, rtable);
    }
  }),
};;

// test 
//var rr1a = React.createElement(R.table, {});
//var rr1b = React.render(rr1a, document.getElementById("re1"));