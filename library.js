this.fillText = function (txt, txtReplace, txtLen, lr = 0) { // lr: 0 left, 1 right
  var result = '';
  var len = txt.length;
  if (len < txtLen) {
    var addCount = txtLen - len;
    if (lr == 0)
      result += txt;

    for (i = 0; i < addCount; i++) {
      result += txtReplace;
    }

    if (lr == 1)
      result += txt;

  } else if (len > txtLen) {
    result = txt.substring(0, txtLen - 1);

  } else {
    result = txt;
  }

  return result;
}


this.parseDatePOSFormat = function (uzave_date) {
  // 2018-08-07 16:24:00
  var result = uzave_date.substring(0, 0 + 10);
  result = result.replace(/-/g, '');
  return result;
}
