/**
 * Created by Y-Star on 2017/2/21.
 */
var data1 = {
  "hello":"good"
};
var audio = document.createElement('audio');
audio.src = 'http://ws.stream.qqmusic.qq.com/TK6046d57d9ce6cf3f8a609013e2eddbcd5d.mp3?fromtag=0';
audio.play();
chrome.runtime.onMessage.addListener(function(data,sender,sendResponse){
  sendResponse(data);
  // chrome.runtime.sendMessage(data);
  // console.log('back OK');
  // var a = {
  //     datas:'abcdefg'
  // };
  // chrome.storage.local.set({
  //     'datas':'abcdefg'
  // });
  // var b ={
  //     datas:''
  // };// chrome.storage.local.get('datas',function(result){
  //    sendResponse(JSON.stringify(result.datas));
  //})
});
