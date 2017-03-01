/**
 * Created by Y-Star on 2017/2/21.
 */
document.body.onclick = function(){
  var data = {
    type:'storage',
    content:'save',
    fun:fun
  }
  var fun = function () {
    console.log('function');
  }
  chrome.runtime.sendMessage(data,function (response, sender, sendResponse) {
    console.log('send OK');
    console.log(response);
  });
  // var a = {
  //     datas:'abcdefg'
  // };
  // chrome.storage.local.set({
  //     'datas':a
  // },function(){
  //     console.log("success!");
  //     chrome.storage.local.get(null,function(result){
  //         console.log(result.datas);
  //     });
  // });
};
