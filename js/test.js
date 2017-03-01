/**
 * Created by Y-Star on 2017/2/21.
 */
var data1 = {
    "hello":"good"
};
chrome.runtime.onMessage.addListener(function(data,sender,sendResponse){
    // chrome.runtime.sendMessage(data);
    console.log('back OK');
    var a = {
        datas:'abcdefg'
    };
    chrome.storage.local.set({
        'datas':'abcdefg'
    });
    var b ={
        datas:''
    };
    chrome.storage.local.get('datas',function(result){
        sendResponse(JSON.stringify(result.datas));
    })
});
