// String Constants
var FBURL = "https://intense-fire-8114.firebaseio.com/user/";
var IMG_REF = "r_imgs";
var IMG_DETAILS = "d_imgs";
var NO_TITLE = "no title";
var DEBUG = true;

/* Create User Wrapper Object to avoid namespace Conflict*/
var User = {};

// Add User fields
User.dbref = new Firebase(FBURL);
User.startPtr = 0;
User.endPtr = 9;
User.limit 		= 10;
User.imgRefList = [];	// List of database url references
User.curList = [];		// Current List of objects to render (JAMES: THIS IS THE LIST YOU WILL USE)

// TEST FIELD!
User.name = "thomas";

// Functions for User class
/*
	Sorts keys in database by chronological order. Then sets the current list for UI to render
 */
User.setupByNewest = function() {
	// Clear Reference List
	this.clearRefList();
	
	// Get chonoList
	this.dbref.child(this.name + "/" + IMG_REF).startAt().once('value',function (snapshot) {
		
		// Grab keys and put into list
		var retQuery = snapshot.val();
		User.pushQueryToList(retQuery,1);
		
	});
}

/*
	Sorts keys in database by chronological order. Then sets the current list for UI to render
 */
User.setupByOldest = function() {
	// Clear Reference List
	this.clearRefList();
	
	// Get chonoList
	this.dbref.child(this.name + "/" + IMG_REF).startAt().once('value',function (snapshot) {
		// Grab keys and put into list
		var retQuery = snapshot.val();
		User.pushQueryToList(retQuery,0);	
	});
}

/*	TODO
	Sorts keys in database by Rating. Then sets the current list for UI to render
 */
User.setupByRating = function() {
	// Clear Reference List
	this.clearRefList();	
}

/*
	Sorts JSON obj and if list needs to be sorted
	Should NOT be called directly
 */
User.pushQueryToList = function (obj, byNewest) {
	
	if(obj) {
		
		for(key in obj) {
			this.imgRefList.push(obj[key].URL);
		}
		if(byNewest) {
			this.imgRefList.reverse();
		}
		
		// Set Pointers
		this.startPtr = 0;
		this.endPtr = 9;
	}
	
	this.nextRenderList();	
}

/*
	Create next list of Objects for UI to render base on ordering.
	Use case: 'Next' Button
	NOTE: Bug when pass img render List
 */
User.nextRenderList = function() {
	
	var max;
	var counter = 0;
	
	this.clearRenderList();

	if(DEBUG)
	{
		if(this.imgRefList.length == 0) {
			alert("nextRenderList() may not work. No imgs");
		}
		else if(this.startPtr >= this.imgRefList.length || this.startPtr < 0) {
			alert("To Developers: Fell off List! Fix button functionality");
		}
	}
	
	for(i=this.endPtr; i > this.startPtr; i--){
		if(this.imgRefList[i]){
			max = (i-this.startPtr);
			break;
		}
	}
	for(i = this.startPtr; i < (this.startPtr + this.limit); i++){
		
		url = this.imgRefList[i];
		if(url) {
			this.dbref.child(this.name + "/" + IMG_DETAILS + "/" + url).once('value', function(snapshot) {
				
				User.curList.push(snapshot.val());
				if(counter == max) {
					// Move Pointers To Appropriate position
					User.startPtr += max + 1;
					User.endPtr = User.startPtr + 10;
					
					// Img List Ready HERE
										// JAMES: Put Drawmemes method here
					User.writeToDiv(); // TESTING
				}
				else{
					counter++;
				}
			});
		}
		else {
			break;
		}
	}
}

/*
	Create next list of Objects for UI to render base on ordering.
	Use case: 'prev' Button
	NOTE: Bug when pass img render List
	TODO: MODIFY
*/
User.prevRenderList = function() {
	
	// Move pointers back and call nextRenderList
	User.startPtr = ((User.startPtr - 20) < 0) ? 0 : (User.startPtr - 20);
	User.endPtr = User.startPtr + 9;
	
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
	Clear Reference List.
	Should NOT be called directly.
 */
User.clearRefList = function(){
	while(this.imgRefList.length > 0) {
		this.imgRefList.pop();
	}
}

/* 	For Save img URL. Sets by priorty
	INSURE DATA IS LEGIT!
 	Params: aurl: (string) url
			atitle:	(string) title
			acat:	(string) category
			acom:	(string) comment (TEST LENGTH TO DATABASE)
			arate:	(number) rating
*/
User.saveImg = function(aurl,atitle,acat,acom,arate) {
	
	// first, convert url, push reference
	var priority = (arate == 0) ? 6 : (6-arate);
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
		User.dbref.child(User.name).update({total_imgs : (total + 1)});
	});
}

// TEST function 
User.writeToDiv = function(){
	var str = "";
	for(i = 0; i < User.curList.length; i++)
	{
		str+="<img src=\"" + User.curList[i].url + "\" /> <p>Ref: " + User.curList[i].ref + "<p>Rating: " + User.curList[i].rating + 
		"<p>Title: " + User.curList[i].title + "<br/>";
	}
	document.getElementById("display").innerHTML = str;
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

// TEST FUNCTIONS
window.onload = function(){
	User.setupByNewest();	
}
