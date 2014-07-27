// A generic onclick callback function.
function genericOnClick(info, tab) {
  alert("Adding to Meme Master");
  alert("item " + info.menuItemId + " was clicked");
  //alert("info: " + JSON.stringify(info));
  //alert("tab: " + JSON.stringify(tab));
}

function savepopup(url){
  window.open(url,"window", "width=600,height=400,status=yes,scrollbars=yes,resizable=yes");
  alert("info: " + JSON.stringify(info));
  //alert("tab: " + JSON.stringify(tab));
}

var title = "Add this image to Meme Master";
chrome.contextMenus.create({"title": title, "contexts":["image"],
                            "onclick": function(){
                            savepopup('http://cse134-135-2014.github.io/cse134_group10/main.html')}
                            }
                          );

console.log("About to try creating an invalid item - an error about " +
            "item 999 should show up");
chrome.contextMenus.create({"title": "Oops", "parentId":999}, function() {
  if (chrome.extension.lastError) {
    console.log("Got expected error: " + chrome.extension.lastError.message);
  }
});
