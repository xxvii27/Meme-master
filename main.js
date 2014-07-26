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


    var DBmeme = new Firebase('https://intense-fire-8114.firebaseio.com/memes');

    $('#saveSubmit').click(function(){   
        //alert('Submit Clicked');
        
        var nurl = $('#urlInput').val();
        

        var ntitle = $('#titleInput').val();

        var newMeme = DBmeme.child(ntitle);
        var ncomment = $('#commentInput').val();
        var ntag = $('#tagInput').val();         
        newMeme.set({url: nurl, title: ntitle, note: ncomment, tag: ntag},
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

    var memeArray = new Array(9);
  
  // TEST data: Will change the vars depending on how we retrieve meme info
    memeArray[0] = {
    memeTitle : "First Meme",
    memeComments : "Random Comment",
    memeSRC : "http://i2.kym-cdn.com/photos/images/original/000/795/461/c87.jpg",
    memeHREF : "#",
    memeRating : '3',
    memeDimensions: '644'
  }
  memeArray[1] = {
    memeTitle : "Second Meme",
    memeComments : "Random Comment",
    memeSRC : "memes/9.gif",
    memeHREF : "#",
    memeRating : '0',
    memeDimensions: '644'
  }
  memeArray[2] = {
    memeTitle : "Third Meme",
    memeComments : "Random Comment",
    memeSRC : "memes/8.jpg",
    memeHREF : "#",
    memeRating : '0',
    memeDimensions: '644'
  }
  memeArray[3] = {
    memeTitle : "Fourth Meme",
    memeComments : "Random Comment",
    memeSRC : "memes/10.jpg",
    memeHREF : "#",
    memeRating : '3',
    memeDimensions: '643'
  }
  memeArray[4] = {
    memeTitle : "Fifth Meme",
    memeComments : "Random Comment",
    memeSRC : "memes/11.jpg",
    memeHREF : "#",
    memeRating : '3',
    memeDimensions: '643'
  }
  memeArray[5] = {
    memeTitle : "Sixth Meme",
    memeComments : "Random Comment",
    memeSRC : "memes/12.jpg",
    memeHREF : "#",
    memeRating : '3',
    memeDimensions: '643'
  }
  memeArray[6] = {
    memeTitle : "Seventh Meme",
    memeComments : "Random Comment",
    memeSRC : "memes/13.gif",
    memeHREF : "#",
    memeRating : '3',
    memeDimensions: '643'
  }
  memeArray[7] = {
    memeTitle : "Eighth Meme",
    memeComments : "Random Comment",
    memeSRC : "memes/14.jpg",
    memeHREF : "#",
    memeRating : '3',
    memeDimensions: '644'
  }
  memeArray[8] = {
    memeTitle : "Ninth Meme",
    memeComments : "Random Comment",
    memeSRC : "memes/17_resize.jpg",
    memeHREF : "#",
    memeRating : '3',
    memeDimensions: '644'
  }        
  memeArray[9] = {
    memeTitle : "Tenth Meme",
    memeComments : "Random Comment",
    memeSRC : "memes/15.jpg",
    memeHREF : "#",
    memeRating : '3',
    memeDimensions: '644'
  }
          
  var memeBlock =""; // Holds what would be written in div.row
  
  for (var i= 0; i < 10; i++) {
    memeBlock +="<div class='col-sm-"+memeArray[i].memeDimensions.charAt(0)+" col-md-"+memeArray[i].memeDimensions.charAt(1)+
    " col-lg-"+memeArray[i].memeDimensions.charAt(2)+"'>"+
    "  <div class='thumbnail'>"+
    "    <div class='t_c mb'>"+
    "      <div class='mask'>"+
    "        <a href='#'><img src='icons/download32w.png' alt=''/></a>"+
    "        <a href='#'><img src='icons/pencil32w.png' alt=''/></a>"+
    "        <a onclick='confirm_delete('><img src='icons/trash.png' alt=''></a>"+
    "      </div>"+
    "      <a href='#' data-toggle='modal' data-target='#viewModal'>"+
    "      <img class ='img-thumb-nail' src='"+memeArray[i].memeSRC+"' alt=''></a>"+
    "    </div>"+
    "    <div class='caption big'>"+
    "      <h5><a href='"+memeArray[i].memeHREF+"'>"+memeArray[i].memeTitle+"</a></h5>";
    // If no rating, show rate button (needs some flag)
    if( +memeArray[i].memeRating == 0) {
      memeBlock +="<p class ='text-right ratings'>"+
      "<button class='btn btn-default btn-xs rate'>Rate It !!</button>"+
      "</p>";      
    }
    else {
      // Print stars (for now, just doing while loops)
      memeBlock +="      <p class ='text-right ratings'>";
      for( var j = 0; j < +memeArray[i].memeRating; j++ ) {        
        memeBlock +="        <span class='glyphicon glyphicon-star'></span>";
      }
      memeBlock +="      </p>";
    }
    memeBlock +="      <div class='comments'>"+memeArray[i].memeComments+"</div>"+
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
}
 
// Retrieve meme info and insert into memeModal
function modMemeModal(e){
  var currNode = e.currentTarget;
  currNode=currNode.parentNode.parentNode.parentNode;
  
  var currMeme = {title: currNode.querySelector("h5>a").innerHTML,
  picture: currNode.querySelector(".img-thumb-nail").src,
  comments: currNode.querySelector(".comments").innerHTML};
  
  document.getElementById("viewModalTitle").innerHTML = currMeme.title;
  document.getElementById("viewModalImage").src = currMeme.picture;
  document.getElementById("viewModalComments").innerHTML = currMeme.comments;
}