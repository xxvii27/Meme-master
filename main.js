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
    });

    $('.rating').on('click', 'input', function(){
        alert( $(this).val() );
    });



    var DBmeme = new Firebase('https://intense-fire-8114.firebaseio.com/memes');

    $('#saveSubmit').click(function(){
        //alert('Submit Clicked');

        var nurl = $('#urlInput').val();


        var ntitle = $('#titleInput').val();

        var newMeme = DBmeme.child(ntitle);
        var ncomment = $('#commentInput').val();
        var ntag = $('#tagInput').val();
        //newMeme.set({url: nurl, title: ntitle, comment: ncomment, tag: ntag});
        newMeme.child('url').set(nurl);
        newMeme.child('title').set(ntitle);
        newMeme.child('usercomment').set(ncomment);
        newMeme.child('tag').set(ntag);

        //alert(url + title + comment + tag);
    });

});