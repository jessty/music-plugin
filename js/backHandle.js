/**
 * Created by Y-Star on 2017/2/10.
 */
var player = new Player();
var storage = new Storage();
var network = new Network();
chrome.runtime.onMessage.addListener(receiveHandler);

function receiveHandler(message,sender,sendResponse){

}
function sendHandler(){

}
chrome.runtime.sendMessage()
