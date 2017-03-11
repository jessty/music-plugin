/**
 * Created by Y-Star on 2017/2/21.
 */
function sendA(sendMessage) {
  console.log('send to a:'+(new Date()).getTime());
  sendMessage('return back to a');
}
function sendB(sendMessage) {
  console.log('send to b:'+(new Date()).getTime());
  sendMessage('return back to b');
}
function sendC(sendMessage) {
  console.log('send to c:'+(new Date()).getTime());
  sendMessage('return back to c');
}
var datas=[{j:1},{k:2}],datas2 = [{l:3},{m:4}];
chrome.runtime.onMessage.addListener(function (message,sender,sendMessage) {
  var copy = [];
  copy[0] = datas[0];
  copy[1] = datas2[0];
  copy[2] = datas[1];
  copy[3] = datas2[1];
  datas2[1] = null;
  sendMessage(copy,datas2);
  // if('a' in message){
  //   var callbackA = sendA.bind(null,sendMessage);
  //   setTimeout(callbackA,10000);
  // }else if('b' in message){
  //   var callbackB = sendB.bind(null,sendMessage);
  //   setTimeout(callbackB,5000);
  // }else if('c' in message) {
  //   console.log('send to c:'+(new Date()).getTime());
  //   sendMessage('return back to c');
  // }
  return true;
})
// chrome.runtime.onConnect.addListener(message);
//
//
// function message(port) {
//   chrome.storage.local.set({a:'abc',b:'aa',d:123},function () {
//     console.log('set Ok');
//   });
//   chrome.storage.local.clear();
//   chrome.storage.local.get(null,function (result){
//     if(port.name!=='1123')
//       return;
//     var a = [];
//     for(var item in result){
//       a.push(result[item]);
//     }
//     port.postMessage(a);
//   });
//   // return true;
// }