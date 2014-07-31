/**
 * Created by xxvii27 on 7/24/14.
 */
var hovID;
var hovS;
var x;
var y;


var star_rating = "";
star_rating += "<div class='rating pull-right' id='app'> "
star_rating += "<input type='radio' id='starx5' name='rating' value='5' /><label for='starx5' title='Rocks!'>5 stars</label>"
star_rating += "<input type='radio' id='starx4' name='rating' value='4' /><label for='starx4' title='Pretty good'>4 stars</label>"
star_rating += "<input type='radio' id='starx3' name='rating' value='3' /><label for='starx3' title='Meh'>3 stars</label>"
star_rating += "<input type='radio' id='starx2' name='rating' value='2' /><label for='starx2' title='Kinda bad'>2 stars</label>"
star_rating += "<input type='radio' id='starx1' name='rating' value='1' /><label for='starx1' title='Sucks big time'>1 star</label>"
star_rating += "</div>"

//Database Functions
// String Constants
var FBURL = "https://intense-fire-8114.firebaseio.com/user/";
var IMG_REF = "r_imgs";
var IMG_DETAILS = "d_imgs";
var NO_TITLE = "no title";
var DEBUG = true;     // FOR DEBUGING PURPOSES

/* Create User Wrapper Object to avoid namespace Conflict*/
var User = {};

// Add User fields
User.dbref    = new Firebase(FBURL);

// TEST FIELD!
User.name = "thomas";

/*  For Save img URL. Sets by priorty
 INSURE DATA IS LEGIT!
 use case: Save img details to database
 Params: aurl: (string) url
 atitle:  (string) title
 acat:  (string) category
 acom:  (string) comment (TEST LENGTH TO DATABASE)
 arate: (number) rating
 */
User.saveImg = function(aurl,atitle,acat,acom,arate) {

    // first, convert url, push reference
    var priority = (arate && (arate == 0)) ? 6 : (6-arate);
    var changeurl = replaceBadChars(aurl);
  atitle = (atitle) ? atitle : NO_TITLE;
  
  // First check if url is already in database
  this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + changeurl).once('value',function (snap) {
    
    if(!snap.val()) {
      var refID = this.dbref.child(this.name + "/" + IMG_REF).push({URL:changeurl}).name();
      
      // Push other information into detail on images
      this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + changeurl).update(
      {
        url: aurl
        ,title: atitle
        ,category: acat
        ,comment: acom
        ,rating: arate
        ,ref: refID
      }
      ,function(error) {
        if(error){
          alert('There was an error with DB.\n' + error);
          return;
        } else {
          alert('Save successful');
          window.close();
        }
      });
    
      // set priority
      this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + changeurl).setPriority(priority);

      // add 1 to total imgs
      this.dbref.child(this.name).once('value', function(snap2) {
        var total = snap2.val()['total_imgs'];
        this.dbref.child(this.name).update({total_imgs : (total + 1)});
      },this);
      
    }
    else{
      alert("This content already exists in MemeMaster");
    }
    /*if(!snap) {
      
      var refID = this.dbref.child(this.name + "/" + IMG_REF).push({URL:changeurl}).name();
      
      // Push other information into detail on images
      this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + changeurl).update(
      {
        url: aurl
        ,title: atitle
        ,category: acat
        ,comment: acom
        ,rating: arate
        ,ref: refID
      }
      ,function(error) {
        if(error){
          alert('There was an error with DB.\n' + error);
        } else {
          alert('Save successful');
        }
      });
    
      // set priority
      this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + changeurl).setPriority(priority);

      // add 1 to total imgs
      this.dbref.child(this.name).once('value', function(snap2) {
        var total = snap2.val()['total_imgs'];
        this.dbref.child(this.name).update({total_imgs : (total + 1)});
      },this);
    }
    else {
      alert("This content already exists in MemeMaster");
    }*/
  },this);
}


function replaceBadChars(str){
    var temp = str.replace(/\./g,',');
    return temp.replace(/\//g,'|');
}


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
        saveRate = $(this).val();
        //For rate in modals
        //use above onclick if rate it button already clicked at least once by the user
    });

    /** Data base setup **/
    $('#saveSubmit').click(function(){   
        //alert('Submit Clicked');
      
      var nurl = $('#urlInput').val();
      var ntitle = $('#titleInput').val();
      var ncomment = $('#saveComments').val();
      var ntag = $('#tagInput').val();    
      var nrate = saveRate;
      //alert(nrate);
      User.saveImg(nurl,ntitle,ntag,ncomment,nrate);
    });
    $('.cancel').click(function(){   
      window.close();
    });     
});



// Assign onclick listener for each meme
window.onload = function () {   
  // parsing image url
  var hashParams = window.location.hash.substr(1); // substr(1) to remove the `#`
  var imgUrl = hashParams.substr(hashParams.indexOf('=') + 1);
  //alert(window.location.hash.substr(1).substr(hashParams.indexOf('=')+1));
  document.getElementById("imgPreview").src=imgUrl;
  document.getElementById('urlInput').value = decodeURIComponent(imgUrl);;

}
 
// Retrieve meme info and insert into memeModal
function modMemeModal(e){
  var currNode = e.target; 
  var currRating;  // Holds the rating of the triggered modal
  var ratingCheck; // Determines if the rating has stars or not
  var pencilTriggered = false;

  if( ""+currNode.parentNode.className == "hoverEditBtn" ){
    currNode=currNode.parentNode;
    pencilTriggered = true;
  }
  currNode=currNode.parentNode.parentNode.parentNode; // node class: thumbnail
  // If not rated yet, print out "Not Yet Rated" for modal view
  currRating = currNode.querySelector(".text-right").innerHTML;
  ratingCheck = currRating.split(" ");  

  for( var i = 0; i < ratingCheck.length; i++ ) {
    if( ""+ratingCheck[i] == "<button" ) { currRating = "Not Yet Rated"; break; }
    if( ""+ratingCheck[i] == "<span" ) { break; }
  }
  
  // Info of meme that was clicked
  var currMeme = {
  title: currNode.querySelector("h5>a").innerHTML,
  picture: currNode.querySelector(".img-thumb-nail").src,
  comments: currNode.querySelector(".comments").innerHTML,
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
    // Only show cancel and submit buttons
    modalFooterList[0].style.display = "none";
    modalFooterList[1].removeAttribute("style");
    modalFooterList[2].removeAttribute("style");    
    
    // keep current img, append form format, place into modal body
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
    // Force click on stars based off rating

    // Reset modal to display info (for submit- info is updated before reset)
    document.querySelector("#viewModal .close").onclick = resetModalBody;
    modalFooterList[1].onclick = resetModalBody;
    modalFooterList[2].onclick = function (e) {
    
      resetModalBody(e);
    };
    
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
