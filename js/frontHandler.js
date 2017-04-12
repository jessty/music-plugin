/**
 * Created by Y-Star on 2017/4/7.
 */
var FrontHandlerClass = (function(){
  function FrontHandler() {
    return {
      request:function (msg,callback) {
        chrome.runtime.sendMessage(msg,callback);
      },
      listen:function (callback) {
        chrome.runtime.onMessage.addListener(function (msg, sender, sendMessage) {
          callback(msg);
          return true;
        });
      },
      //控制上下曲与暂停播放
      lastNextOrPause:function (choice,bool) {
        this.request({handler:'player',do:choice,value:bool},console.log);
      },
      modifyBar:function (choice,value) {
        this.request({handler:'player',do:choice,value:value},console.log);
      }

    };
  }
  var $instance = undefined;
  return {
    getInstance:function(){
      if(!$instance)
        $instance = new FrontHandler();
      return $instance;
    }
  }
})();