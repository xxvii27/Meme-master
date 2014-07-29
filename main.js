//Database Functions
// String Constants
var FBURL = "https://intense-fire-8114.firebaseio.com/user/";
var IMG_REF = "r_imgs";
var IMG_DETAILS = "d_imgs";
var NO_TITLE = "no title";
var DEBUG = true;			// FOR DEBUGING PURPOSES

/* Create User Wrapper Object to avoid namespace Conflict*/
var User = {};

// Add User fields
User.dbref = new Firebase(FBURL);
User.startPtr = 0;
User.endPtr = 9;
User.totalImgs = 0;
User.limit 		= 10;
User.imgRefList = [];	// List of database url references
User.curList = [];		// Current List of objects to render (JAMES: THIS IS THE LIST YOU WILL USE)

// TEST FIELD!
User.name = "thomas";

// Functions for User class
User.setupData = function() {
    // Change Count of Total Imgs
    this.dbref.child(this.name).once('value', function(snap) {
        this.totalImgs = snap.val()['total_imgs'];
        this.setupByNewest();
    },this);

    // Setup delete on delete child (delete meme)
    this.dbref.child(this.name + "/" + IMG_DETAILS).on('child_removed', function(oldData) {
        alert("REMOVED" + JSON.stringify(oldData.val()));
    });
}

/*
 Sorts keys in database by chronological order. Then sets the current list for UI to render
 use case: dropdown option to sory by 'newest'
 */
User.setupByNewest = function() {
    // Clear Reference List
    this.clearRefList();

    // Get chonoList
    this.dbref.child(this.name + "/" + IMG_REF).startAt().once('value',function (snapshot) {

        // Grab keys and put into list
        var retQuery = snapshot.val();
        this.pushQueryToList(retQuery,1);
        this.nextRenderList();

    },this);
}

/*
 Sorts keys in database by chronological order. Then sets the current list for UI to render
 use case: dropdown option to sory by 'oldest'
 */
User.setupByOldest = function() {
    // Clear Reference List
    this.clearRefList();

    // Get chonoList
    this.dbref.child(this.name + "/" + IMG_REF).startAt().once('value',function (snapshot) {
        // Grab keys and put into list
        var retQuery = snapshot.val();
        this.pushQueryToList(retQuery,0);
        this.nextRenderList();
    },this);
}

/*
 Sorts keys in database by Rating. Then sets the current list for UI to render
 use case: dropdown option to sory by 'rating'
 */
User.setupByRating = function() {

    var counter = 0;

    // Clear Reference List
    this.clearRefList();

    // Generate references by priority
    for(priority = 1; priority <= 6; priority++){
        this.dbref.child(this.name + "/" + IMG_DETAILS).startAt(priority).endAt(priority).once('value',function (snapshot) {

            counter++;
            var query = snapshot.val();
            for(key in query){
                this.imgRefList.push(key);
            }

            if(counter == 6) {
                this.nextRenderList();
            }

        },this);
    }
}

/*
 Sorts JSON obj and if list needs to be sorted
 use case: Should NOT be called directly
 */
User.pushQueryToList = function (obj, byNewest) {

    if(obj) {

        for(key in obj) {
            this.imgRefList.push(obj[key].URL);
        }
        if(byNewest) {
            this.imgRefList.reverse();
        }
    }
}

/*
 Create next list of Objects for UI to render base on ordering.
 Use case: 'Next' Button
 */
User.nextRenderList = function() {

    var max;
    var counter = 0;
    var capStartPtr = this.startPtr;

    this.clearRenderList();

    // If in DEBUG mode
    if(DEBUG)
    {
        if(this.imgRefList.length == 0) {
            alert("nextRenderList() may not work. No imgs");
        }
        else if(this.startPtr >= this.imgRefList.length || this.startPtr < 0) {
            alert("To Developers: Fell off List! Fix button functionality");
        }
    }

    // Find maximum number of images left on the list
    for(i=this.endPtr; i > this.startPtr; i--){
        if(this.imgRefList[i]){
            max = (i-this.startPtr);
            break;
        }
    }

    // Query each image
    for(i = capStartPtr; i < (capStartPtr + this.limit); i++){
        url = this.imgRefList[i];
        if(url) {
            this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + url).once('value', function(snapshot) {

                this.curList.push(snapshot.val());
                if(counter == max) {
                    // Move Pointers NEXT Appropriate position
                    this.startPtr += max + 1;
                    this.endPtr = this.startPtr + 10;

                    // Img List Ready HERE
                    // JAMES: Put Drawmemes method here
					draw_memes();
                    //this.writeToDiv(); // FOR TESTING on test.html

                }
                counter++;
            },this);
        }
        else {
            break;
        }
    }
}

/*
 Create next list of Objects for UI to render base on ordering.
 Use case: 'prev' Button
 */
User.prevRenderList = function() {

    // Move pointers back and call nextRenderList
    this.startPtr = ((this.startPtr - (this.limit*2)) < 0) ? 0 : (this.startPtr - (this.limit*2));
    this.endPtr = this.startPtr + 9;

    this.nextRenderList();
}

/*
 Refreshes the Rendering List
 Use case: AFTER 'delete' meme or user page Refreshes
 */
User.refreshRenderList = function() {

    // Move pointers back and call nextRenderList
    this.startPtr -= this.limit;
    this.endPtr = this.startPtr + 9;

    this.nextRenderList();
}


/*
 Clears Render List.
 Should NOT be called directly.
 */
User.clearRenderList = function(){
    while(this.curList.length > 0) {
        this.curList.pop();
    }

}

/*
 Clear Reference List AND resets Pointers
 Should NOT be called directly.
 */
User.clearRefList = function(){
    while(this.imgRefList.length > 0) {
        this.imgRefList.pop();
    }
    this.startPtr = 0;
    this.endPtr = 9;
}

/* 	For Save img URL. Sets by priorty
 INSURE DATA IS LEGIT!
 use case: Save img details to database
 Params: aurl: (string) url
 atitle:	(string) title
 acat:	(string) category
 acom:	(string) comment (TEST LENGTH TO DATABASE)
 arate:	(number) rating
 */
User.saveImg = function(aurl,atitle,acat,acom,arate) {

    // first, convert url, push reference
    var priority = (arate && (arate == 0)) ? 6 : (6-arate);
    var changeurl = replaceBadChars(aurl);
    var refID = this.dbref.child(this.name + "/" + IMG_REF).push({URL:changeurl}).name();

    atitle = (atitle) ? atitle : NO_TITLE;

    // Push other information into detail on images
    this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + changeurl).update(
        {
            url: aurl
            ,title: atitle
            ,category: acat
            ,comment: acom
            ,rating: arate
        });

    // set priority
    this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + changeurl).setPriority(priority);

    // add 1 to total imgs
    this.dbref.child(this.name).once('value', function(snap) {
        var total = snap.val()['total_imgs'];
        this.dbref.child(this.name).update({total_imgs : (total + 1)});
    },this);

}

/*
 Deletes an image from the database. Automatically refreshes the page
 use case: delete image button
 Params:	(string) url

 */
User.delImg = function(url) {

    // encode the URL
    var encodedURL = replaceBadChars(url);

    // Access the Database
    this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + encodedURL).once('value',function(snap) {



        // Remove the value from USER reference array
        if(snap.val()) {

            // Get reference value from snapshot
            var ref = snap.val()['ref'];

            var tempStartPtr = ((this.startPtr - (this.limit*2)) < 0) ? 0 : (this.startPtr - (this.limit*2));
            var tempEndPtr = tempStartPtr + 9;

            for(i = tempStartPtr; i < tempEndPtr; i++) {
                if(this.imgRefList[i] == encodedURL) {
                    this.imgRefList.splice(i,1);
                    break;
                }
            }

            // change total img count and from database
            this.totalImgs -= 1;
            this.dbref.child(this.name).update({total_imgs : this.totalImgs});

            // remove reference from Database
            this.dbref.child(this.name + "/" + IMG_REF + "/" + ref).remove();

            // remove image data from Database
            this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + encodedURL).remove();

            // Re-render image
            this.refreshRenderList();
        }
        else {
            alert("TO DEVELOPERS: URL DOES NOT EXIST");
        }
    },this);
}


// Other Functions
function replaceBadChars(str){
    var temp = str.replace(/\./g,',');
    return temp.replace(/\//g,'|');
}

function restoreBadChars(str){
    var temp = str.replace(/,/g,'.');
    return temp.replace(/\|/g,'/');
}

function each(obj,cb){

    if(obj){
        for (k in obj){
            if(obj.hasOwnProperty(k)){
                var res = cb(obj[k],k);
                if(res === true){
                    break;
                }
            }
        }
    }
}

function size(obj) {
    var i = 0;
    each(obj, function () {
        i++;
    });
    return i;
}

// TEST FUNCTIONS for test.html
User.writeToDiv = function(){
    var str = "";
    for(i = 0; i < this.curList.length; i++)
    {
        str+="<img src=\"" + this.curList[i].url + "\" /> <p>Ref: " + this.curList[i].ref + "<p>Rating: " + this.curList[i].rating +
            "<p>Title: " + this.curList[i].title + "<br/>";
    }
    document.getElementById("display").innerHTML = str;
}

/** Variable section **/
var hovID;
var hovS;
var x;
var y;

/* Save a meme on local computer */
function download_meme(URL) {
    var a = $("<a>").attr("href", URL).attr("download", URL).appendTo("body");
    a[0].click();
    a.remove();
}

var star_rating = "";
star_rating += "<div class='rating pull-right' id='app'> "
star_rating += "<input type='radio' id='starx5' name='rating' value='5' /><label for='starx5' title='Rocks!'>5 stars</label>"
star_rating += "<input type='radio' id='starx4' name='rating' value='4' /><label for='starx4' title='Pretty good'>4 stars</label>"
star_rating += "<input type='radio' id='starx3' name='rating' value='3' /><label for='starx3' title='Meh'>3 stars</label>"
star_rating += "<input type='radio' id='starx2' name='rating' value='2' /><label for='starx2' title='Kinda bad'>2 stars</label>"
star_rating += "<input type='radio' id='starx1' name='rating' value='1' /><label for='starx1' title='Sucks big time'>1 star</label>"
star_rating += "</div>";


// when document is loading.
$(document).ready(function(){
    var saveRate = 0;
    $(".rate").click(function(){
        $(this).parent().append(star_rating);
        $(this).remove();
        $('.rating').on('click', 'input', function(){
            alert( $(this).val() );
            // For rateit button
        });
    });

    $('.rating input').click(function(){
        //alert( $(this).val() );
        saveRate = $(this.val());
        //For rate in modals
        //use above onclick if rate it button already clicked at least once by the user
    });

    /** Data base setup **/
    //var DBmeme = new Firebase('https://intense-fire-8114.firebaseio.com/memes');

    $('#saveSubmit').click(function(){   
        //alert('Submit Clicked');
        
        var nurl = $('#urlInput').val();
        var ntitle = $('#titleInput').val();
        var ncomment = $('#saveComments').val();
        var ntag = $('#tagInput').val();    
        var nrate = saveRate;
        alert(nrate);
        User.saveImg(nurl,ntitle,ntag,ncomment,nrate);
        /**newMeme.set({
                meme1: {'url': nurl, 'title': ntitle, 'comment': ncomment, 'tag': ntag} },
            function(error) {
            if(error){
                alert('There was an error with DB.\n' + error);
            } else {
                alert('Save successful');
            }
        });
        **/
    });    
});

// functions loaded when all elements has been loaded
window.onload = function () {
  User.setupData();
  //draw_memes();
  var clickableMemes = document.getElementsByClassName('img-thumb-nail');
  for( var i = 0; i < clickableMemes.length; i++ ) {    
    clickableMemes[i].onclick = modMemeModal;
  }
  
  // Handle thumbnail and normal viewing mode
  var dispList = document.getElementsByClassName("disp_icon");
  var captionList = document.getElementsByClassName("caption");  
  dispList[0].onclick = function(e) {
    for( var i = 0; i < captionList.length; i++ ) {
      if( captionList[i].hasAttribute("style") ) {
        captionList[i].removeAttribute("style");
      }
    }
  };
  dispList[1].onclick = function(e) {
    for( var i = 0; i < captionList.length; i++ ) {
      captionList[i].style.display = "none";
    }
  };
  
  // Add onclick listener for all 'Rate it' buttons
  var rateItBtns = $("#memeContent .rate").click(function (evt) {
    // After click, show stars
    var currClick = evt.target;
    evt.target.parentNode.innerHTML = star_rating;
    clickStarRating(currClick);
  });
  
  // Add onclick listener for stars
  function clickStarRating(currClicked) {
    var rateEvent = document.getElementsByName("rating");
    for( var i = 0; i < rateEvent.length; i++ ) {
      rateEvent[i].onclick = function (e) {                
        var strStars = e.target.value;  // Number of stars clicked        
        
        var currNode = e.target.parentNode.parentNode; // p node for ratings
        var strStarsHTML = "";
        for( j = 0; j < +strStars; j++ ) {
          strStarsHTML += "<label class='yellow-star'></label>";
        }
        currNode.innerHTML = strStarsHTML;
      };
    }
  }
  
  // Add event for hover edit button
  var editList = document.querySelectorAll(".hoverEditBtn>img");
  for( var i = 0; i < editList.length; i++ ) {
    editList[i].onclick = modMemeModal;
  }
}

/** Basic Functions **/
function m_d_tooltip(evt,id) {
    hovS = id;
    x = evt.pageX;
    y = evt.pageY;
    hovID = setTimeout(function () {
            var ele = document.getElementById(hovS);
            ele.style.top = (y+25) + "px";
            ele.style.left = (x-65)+ "px";
            ele.style.display = "block"
        }
        ,750);
}

function hide() {
    var ele = document.getElementById(hovS);
    ele.style.display = "none"
    clearTimeout(hovID)
}

function confirm_delete() {
    if(confirm("Are you sure you want to delete?")){
        alert("Deleted");
    }
    return false;
}

function rateItEvt(evt) {
  evt.stopPropagation();
  // After click, show stars
  var currClick = evt.target;
  var currRateButton = currClick.parentNode.innerHTML;

  currClick.parentNode.innerHTML = star_rating;

  $("body").click( function (e) {
    // unbind body
    $("body").unbind("click");
    
    if(e.target.tagName == "LABEL") {
      // User clicked on number of stars
      var strStars = e.target.innerHTML.charAt(0);  // Number of stars clicked
      var currNode = e.target.parentNode.parentNode; // p node for ratings
      currNode.setAttribute("data-rating", ""+strStars );
      // ************ Send rating to server HERE **************************************
      
      var strStarsHTML = "";
      for( j = 0; j < +strStars; j++ ) {
        strStarsHTML += "<label class='yellow-star'></label>";
      }
      currNode.innerHTML = strStarsHTML;    
    } else {
      // Find the stars and traverse up to find p.rating
      var currNode = $("p.ratings>div.rating");
      // Show rate it button
      currRateBtn = currNode[0].parentNode;
      currRateBtn.innerHTML = currRateButton;
      // rebind onclick
      $("#memeContent .rate").unbind("click");
      $("#memeContent .rate").click( rateItEvt );
      
    }
  })
}

function draw_memes(){
	var memeArray = User.curList;
    //var memeArray = new Array(10);
   // var title = ["First Meme", "Second Meme", "Third Meme", "Fourth Meme", "Fifth Meme", "Sixth Meme", "Seventh Meme",
   //              "Eighth Meme", "Nineth Meme", "Tenth Meme"];
    //var gifs = [1, 6];
    var dimens = [3, 4, 5, 6];
    //var str = "memes/";
    var toStr;
    var memeSRCStr;
    var memeDimens = [];
    
	
    for (var i = 0; i < memeArray.length; i++)
    {
		memeDimens.push(dimens.indexOf(i) != -1 ? '643' : '644');
       /* toStr = i.toString();
        memeSRCStr = str + toStr + (gifs.indexOf(i) != -1 ? ".gif" : ".jpg");
        memeDimens = dimens.indexOf(i) != -1 ? '643' : '644';
        memeArray[i] = {
            memeTitle : title[i],
            memeComments : "Random Comment",
            memeSRC : memeSRCStr,
            memeHREF : "#",
            memeRating : ""+Math.floor((Math.random() * 5)),
            //memeRating : '0', 
            memeDimensions : memeDimens
        }*/
    }
	
          
  var memeBlock =""; // Holds what would be written in div.row
  
  for (var i= 0; i < memeArray.length; i++) {
    memeBlock += "<div class='col-sm-" + memeDimens[i].charAt(0)+" col-md-" + memeDimens[i].charAt(1)+
    " col-lg-" + memeDimens[i].charAt(2)+"'>"+
    "  <div class='thumbnail'>"+
    "    <div class='t_c mb'>"+
    "      <div class='mask'>"+
    "        <a onclick='download_meme(" + '"' +memeArray[i].url+'"'+")'><img src='icons/download32w.png' alt=''/></a>"+
    "        <a href='#' class='hoverEditBtn' data-toggle='modal' data-target='#viewModal'>"+
    "          <img src='icons/pencil32w.png' alt=''/></a>"+
    "        <a onclick='confirm_delete()'><img src='icons/trash.png' alt=''></a>"+
    "      </div>"+
    "      <a href='#' data-toggle='modal' data-target='#viewModal'>"+
    "        <img class ='img-thumb-nail' src='"+memeArray[i].url+"' alt=''></a>"+
    "    </div>"+
    "    <div class='caption big'>"+
    "      <h5><a href='#'>"+memeArray[i].title+"</a></h5>"+
    "       <div class='rating pull-right' data-rating= "+'"'+memeArray[i].rating+'"'+">";
    // If no rating, show rate button (needs some flag)
    if( + memeArray[i].rating == 0) {
      memeBlock += "    <button class='btn btn-default btn-xs rate'>Rate It !!</button>";   
    }
    else {
      // Print stars (for now, just doing while loops)      
      for( var j = 0; j < +memeArray[i].rating; j++ ) {        
        memeBlock +="<label class='yellow-star'></label>";
      }
    }
    memeBlock += "      </div>"+
    "      <div class='comments pull-left'>"+memeArray[i].comment+"</div>"+
    "    </div>"+
    "  </div>"+
    "</div>";
  }

  document.getElementById('memeContent').innerHTML = memeBlock;
}

// Retrieve meme info and insert into memeModal
function modMemeModal(e){
  // grandparent container of triggered image
  var currThumbnail = e.target.parentNode.parentNode.parentNode;
  var currRating;  // Holds the rating container of triggered modal
  var pencilTriggered = false;
  
  // Set rateItEvt in memeModal (if there is one)
  $("#viewModal .rate").click( rateItEvt );

  if( ""+e.target.parentNode.className == "hoverEditBtn" ){
    // This event was triggered with the hover button
    pencilTriggered = true;
    currThumbnail = currThumbnail.parentNode;
  }
  
  // Get the current meme's rating display
  currRating = currThumbnail.querySelector(".rating");
  
  if( ""+currRating.getAttribute("data-rating") == "0" ) {
    currRating = "Not yet rated";
  } else {
    currRating = currRating.innerHTML;
  }
  
  // Info of meme that was clicked
  var currMeme = {
  title: currThumbnail.querySelector("h5>a").innerHTML,
  picture: currThumbnail.querySelector(".img-thumb-nail").src,
  comments: currThumbnail.querySelector(".comments").innerHTML,
  rating: currRating};
  
  document.getElementById("viewModalRating").innerHTML = currMeme.rating;
  document.getElementById("viewModalTitle").innerHTML = currMeme.title;
  document.getElementById("viewModalImage").src = currMeme.picture;
  document.getElementById("viewModalComments").innerHTML = currMeme.comments;
  
  var modalFooterList = document.querySelectorAll("#viewModalFooter>.vmf");

  // In footer, show edit button only
  modalFooterList[0].removeAttribute("style");
  modalFooterList[1].style.display = "none";
  modalFooterList[2].style.display = "none";

  // Keep copy of current modal body
  var currModalBody = ""+document.getElementById("viewModalBody").innerHTML;
  
  // Once edit button has been clicked
  modalFooterList[0].onclick = function() {

    // Add eventListener for edit modal
    $("#viewModal").click( function (e) {
      e.stopPropagation();
      var currClick = e.target;
         
      // Only show cancel and submit buttons
      modalFooterList[0].style.display = "none";
      modalFooterList[1].removeAttribute("style");
      modalFooterList[2].removeAttribute("style");    
      
      // keep current img, build form format and place into modal body
      var viewModalForm = document.querySelector("#myModal .modal-body").innerHTML;
      viewModalForm = document.getElementById("viewModalImage").outerHTML + viewModalForm;
      document.querySelector("#viewModalBody").innerHTML = viewModalForm;    
      
      // Reuse viewModalForm to traverse the actual form nodes in modal-body
      viewModalForm = document.querySelectorAll("#viewModalBody .form-control");
      // Insert placeholders
      viewModalForm[0].setAttribute("placeholder", currMeme.picture);
      viewModalForm[1].setAttribute("placeholder", currMeme.title);
      viewModalForm[2].setAttribute("placeholder", currMeme.comments);
      viewModalForm[3].setAttribute("placeholder", "need tag info");      
alert(currModalBody);
      if( ($(currClick+"").hasClass("cancel") ||
          $(currClick+"").hasClass("submit")) ||
          $(currClick+"").hasClass("close") ) {
alert("line 295");
        // Either cancel, submit or close was clicked. Unbind click for modal
        $("#viewModal").unbind("click");
        
        // Put original modal body back in
        document.querySelector("#viewModalBody").innerHTML = ""+currModalBody;
      }         
    });
  };
  
  function resetModalBody(evt) {
    // Remove event listener from cancel button
    evt.target.onclick = null;
    document.getElementById("viewModalBody").innerHTML = currModalBody;
    
    // Hide edit button, show submit and cancel buttons in view Modal
    modalFooterList[0].removeAttribute("style");
    modalFooterList[1].style.display = "none";
    modalFooterList[2].style.display = "none";
  }
   
  // Force click, if event was triggered by pencil
  if( pencilTriggered ) { modalFooterList[0].click(); }
} // view Modal event







