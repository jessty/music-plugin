/**
 * Created by Y-Star on 2017/2/21.
 */
// var i=0;
// var data={i:'i'};
// document.body.onclick = function(){
//
//   if(i==0){
//     chrome.runtime.sendMessage({a:'a'},function aa(response) {
//       console.log(response);
//       // console.log(data);
//       // data = response;
//       // i++;
//     });
//     // console.log(aa);
//   }else{
//     chrome.runtime.sendMessage({a:'a'},function (response) {
//       console.log(response);
//       console.log(data);
//     });
//   }

  // chrome.runtime.sendMessage({a:'a'},function (response) {
  //   console.log(response);
  // });
  // chrome.runtime.sendMessage({b:'b'},function (response) {
  //   console.log(response);
  // });
  // chrome.runtime.sendMessage({c:'c'},function (response) {
  //   console.log(response);
  // });
  // var port = chrome.runtime.connect({name:'1123'});
  // port.onMessage.addListener(function(msg,port){
  //   console.log(msg);
  // });
  // for(var i=0;i<1;i++) {
  //   console.log((new Date()).getTime());
  //   port.postMessage({a: 'a', b: 123});
  // }
// };
var lis = document.getElementsByTagName('li');
var sign = 0;
document.body.onclick = function () {
  if (sign == 0) {
    for (var i = 0, length = lis.length; i < length; i++) {
      lis[i].style.transitionDelay = i * 0.2 + 's';
      lis[i].style.transform = 'perspective(300px) rotateX(0deg)';
    }
    sign = 1;
  }
  else{
    for (var j = lis.length-1; j >= 0 ; j--) {
      lis[j].style.transitionDelay = (lis.length - 1 - j) * 0.2 + 's';
      lis[j].style.transform = 'perspective(300px) rotateX(-180deg)';
    }
    sign = 0;
  }
}