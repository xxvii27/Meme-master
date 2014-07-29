/**
 * Created by xxvii27 on 7/24/14.
 */
var hovID;
var hovS;
var x;
var y;

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

var star_rating = "";
star_rating += "<div class='rating pull-right' id='app'> "
star_rating += "<input type='radio' id='starx5' name='rating' value='5' /><label for='starx5' title='Rocks!'>5 stars</label>"
star_rating += "<input type='radio' id='starx4' name='rating' value='4' /><label for='starx4' title='Pretty good'>4 stars</label>"
star_rating += "<input type='radio' id='starx3' name='rating' value='3' /><label for='starx3' title='Meh'>3 stars</label>"
star_rating += "<input type='radio' id='starx2' name='rating' value='2' /><label for='starx2' title='Kinda bad'>2 stars</label>"
star_rating += "<input type='radio' id='starx1' name='rating' value='1' /><label for='starx1' title='Sucks big time'>1 star</label>"
star_rating += "</div>"


$(document).ready(function(){
    $(".rate").click(function(){
        $(this).parent().append(star_rating);
        $(this).remove();
        $('.rating').on('click', 'input', function(){
            alert( $(this).val() );
            // For rateit button
        });
    });

    $('.rating input').click(function(){
        alert( $(this).val() );
        //For rate in modals
        //use above onclick if rate it button already clicked at least once by the user
    });



    /** Data base setup **/
    var DBmeme = new Firebase('https://intense-fire-8114.firebaseio.com/memes');

    $('#saveSubmit').click(function(){   
        //alert('Submit Clicked');
        
        var nurl = $('#urlInput').val();
        var ntitle = $('#titleInput').val();
        var newMeme = DBmeme.child(ntitle);
        var ncomment = $('#saveComments').val();
        var ntag = $('#tagInput').val();    


        newMeme.set({
                meme1: {'url': nurl, 'title': ntitle, 'comment': ncomment, 'tag': ntag} },
            function(error) {
            if(error){
                alert('There was an error with DB.\n' + error);
            } else {
                alert('Save successful');
            }
        });
    });    
});

function draw_memes(){
    var memeArray = new Array(10);
    var title = ["First Meme", "Second Meme", "Third Meme", "Fourth Meme", "Fifth Meme", "Sixth Meme", "Seventh Meme",
                 "Eighth Meme", "Nineth Meme", "Tenth Meme"];
    var gifs = [1, 6];
    var dimens = [3, 4, 5, 6];
    var str = "memes/";
    var toStr;
    var memeSRCStr;
    var memeDimens;
    
    for (var i = 0; i < memeArray.length; i++)
    {
        toStr = i.toString();
        memeSRCStr = str + toStr + (gifs.indexOf(i) != -1 ? ".gif" : ".jpg");
        memeDimens = dimens.indexOf(i) != -1 ? '643' : '644';
        memeArray[i] = {
            memeTitle : title[i],
            memeComments : "Random Comment",
            memeSRC : memeSRCStr,
            memeHREF : "#",
            memeRating : ""+Math.floor((Math.random() * 5)),
            /*memeRating : '0', */
            memeDimensions : memeDimens
        }
    }
          
  var memeBlock =""; // Holds what would be written in div.row
  
  for (var i= 0; i < 10; i++) {
    memeBlock +="<div class='col-sm-"+memeArray[i].memeDimensions.charAt(0)+" col-md-"+memeArray[i].memeDimensions.charAt(1)+
    " col-lg-"+memeArray[i].memeDimensions.charAt(2)+"'>"+
    "  <div class='thumbnail'>"+
    "    <div class='t_c mb'>"+
    "      <div class='mask'>"+
    "        <a href='#'><img src='icons/download32w.png' alt=''/></a>"+
    "        <a href='#' class='hoverEditBtn' data-toggle='modal' data-target='#viewModal'>"+
    "          <img src='icons/pencil32w.png' alt=''/></a>"+
    "        <a onclick='confirm_delete()'><img src='icons/trash.png' alt=''></a>"+
    "      </div>"+
    "      <a href='#' data-toggle='modal' data-target='#viewModal'>"+
    "        <img class ='img-thumb-nail' src='"+memeArray[i].memeSRC+"' alt=''></a>"+
    "    </div>"+
    "    <div class='caption big'>"+
    "      <h5><a href='"+memeArray[i].memeHREF+"'>"+memeArray[i].memeTitle+"</a></h5>"+
    "      <p class ='text-right ratings rating'>";
    // If no rating, show rate button (needs some flag)
    if( +memeArray[i].memeRating == 0) {
      memeBlock += "    <button class='btn btn-default btn-xs rate'>Rate It !!</button>";   
    }
    else {
      // Print stars (for now, just doing while loops)      
      for( var j = 0; j < +memeArray[i].memeRating; j++ ) {        
        memeBlock +="<label class='yellow-star'></label>";
      }
    }
    memeBlock += "      </p>"+
    "      <div class='comments pull-left'>"+memeArray[i].memeComments+"</div>"+
    "    </div>"+
    "  </div>"+
    "</div>";
  }

  document.getElementById('memeContent').innerHTML = memeBlock;
}

// Assign onclick listener for each meme
window.onload = function () {   
  draw_memes();
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
 
// Retrieve meme info and insert into memeModal
function modMemeModal(e){
  // grandparent container of triggered image
  var currThumbnail = e.target.parentNode.parentNode.parentNode;
  var currRating;  // Holds the rating container of triggered modal
  var pencilTriggered = false;

  if( ""+e.target.parentNode.className == "hoverEditBtn" ){
    // This event was triggered with the hover button
    pencilTriggered = true;
  }
  
  // If not rated yet, print out "Not Yet Rated" for modal view
  currRating = currThumbnail.querySelector(".text-right");
  if( ""+currRating.firstChild.tagName === "button" ) {
    currRating = "Not Yet Rated";
  } else {
    currRating = ""+currRating.outerHTML;
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
