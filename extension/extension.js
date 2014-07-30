// A generic onclick callback function.
function genericOnClick(info, tab) {
  window.open('http://cse134-135-2014.github.io/cse134_group10/main.html', '_blank');
}


function savePopup(info, tab){
  var url = 'http://cse134-135-2014.github.io/cse134_group10/extension/savepopup.html#urlInput=';
  //alert("info: " + info.srcUrl);
  //alert("url: " + url);
  window.open(url + info.srcUrl,"window", "width=600,height=800,status=yes,scrollbars=yes,resizable=yes");

  //alert("tab: " + JSON.stringify(tab));
}

// Create one test item for each context type.
var contexts = ["page","selection","editable","video","audio"];
for (var i = 0; i < contexts.length; i++) {
  var context = contexts[i];
  var title = "Go to Meme Master page";
  var id = chrome.contextMenus.create({"title": title, "contexts":[context],
                                       "onclick": genericOnClick});
  //console.log("'" + context + "' item:" + id);
}


var title = "Add this image to Meme Master";
chrome.contextMenus.create({"title": title, "contexts":["image"],
                            "onclick": savePopup});

console.log("About to try creating an invalid item - an error about " +
            "item 999 should show up");
chrome.contextMenus.create({"title": "Oops", "parentId":999}, function() {
  if (chrome.extension.lastError) {
    console.log("Got expected error: " + chrome.extension.lastError.message);
  }
});
