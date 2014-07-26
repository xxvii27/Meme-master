// A generic onclick callback function.
function genericOnClick(info, tab) {
  alert("Adding to Meme Master");
  alert("item " + info.menuItemId + " was clicked");
  //alert("info: " + JSON.stringify(info));
  //alert("tab: " + JSON.stringify(tab));
}


var contexts = ["image"];
for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i];
  var title = "Add this image to Meme Master";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
  //alert("'" + context + "' item:" + id);
}


console.log("About to try creating an invalid item - an error about " +
            "item 999 should show up");
chrome.contextMenus.create({"title": "Oops", "parentId":999}, function() {
  if (chrome.extension.lastError) {
    console.log("Got expected error: " + chrome.extension.lastError.message);
  }
});
