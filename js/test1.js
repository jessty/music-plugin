/**
 * Created by Y-Star on 2017/2/21.
 */
    document.body.onclick = function(){
        // chrome.runtime.sendMessage("abc",function (data, sender, sendResponse) {
        //     console.log(data);
        // });
        var a = {
            datas:'abcdefg'
        };
        chrome.storage.local.set({
            'datas':a
        },function(){
            console.log("success!");
            chrome.storage.local.get(null,function(result){
                console.log(result.datas);
            });
        });


    };
