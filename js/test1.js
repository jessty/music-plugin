/**
 * Created by Y-Star on 2017/2/21.
 */
var i=0;
var data={i:'i'};
document.body.onclick = function(){

  if(i==0){
    chrome.runtime.sendMessage({a:'a'},function aa(response) {
      console.log(response);
      console.log(data);
      data = response;
      i++;
    });
    console.log(aa);
  }else{
    chrome.runtime.sendMessage({a:'a'},function (response) {
      console.log(response);
      console.log(data);
    });
  }

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
};
