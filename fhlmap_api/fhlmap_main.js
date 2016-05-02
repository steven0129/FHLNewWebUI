var rfhlmap = null;
var fhlmap_engs_prev = "";//防止同一章一直載入
var fhlmap_chap_prev = -1;//防止同一章一直載入
var fhlmap_titleId_prev = "";//當切換成地圖以外功能,又切換回來的時候.要切換章才會顯示

function fhlmap_render(ps,dom)
{
  /// <summary> 整合到 index 的 code 放在這裡, 可以集中上面的全域變數. 比較好理解 </summary>
  var dom2 = document.getElementById("fhlInfoContent");
  if (dom2 != null && rfhlmap == null || fhlmap_titleId_prev != "fhlInfoMap") {
    rfhlmap = React.render(React.createElement(fhlmap.R.frame), dom2);
    fhlmap_chap_prev = -1 ;// 為了trigger 下面的 set 函式, 當「rfhlmap_titleId_prev != "fhlInfoMap"」時必須用到, 因為它重新create了
  }
  if (fhlmap_chap_prev != ps.chap || fhlmap_engs_prev != ps.engs) {
    fhl.json_api_text_post("sobj.php?engs=" + ps.engs + "&chap=" + ps.chap + "", null, function (jstr) {
      var jr1 = JSON.parse(jstr);
      rfhlmap.set_data(jr1.record);
    }, function (er) { });
    fhlmap_engs_prev = ps.engs;
    fhlmap_chap_prev = ps.chap;
  }
}