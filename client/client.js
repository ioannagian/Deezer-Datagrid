Session.setDefault('filters', {query: '', title : '', artist: '', album: '', page : 0});

Tracker.autorun(function() {

  Meteor.subscribe('songs', Session.get('filters'));
	
});



Template.main.helpers({

	filters: function(){
    return Session.get('filters');
  },

  moreResults: function(){
  	if(Songs.find().count() >= 25)
  		return true;
  	return false;
  },

  songs: function () {
  	//sort by popularity	
    return Songs.find({}, {sort: {rank:1} });
  },
	
	toMinutes: function(duration){
		var
		minutes = Math.floor(duration / 60),
		seconds = Math.floor(duration % 60);
		if (seconds < 10)
			seconds = "0"+seconds;
		return minutes+":"+seconds;
	}

});


Template.main.events({

	"click #remove-button" : function(event){

		$('#search').val("");
		$('.filter').val('');

		var filters = Session.get('filters');

		filters.query = '';
		filters.title = '';
		filters.artist = '';
		filters.album = '';
		filters.page  = 0;

		Session.set('filters', filters);

    $('#showMoreResults').show();
	},

	"click .clear" : function(event){
		var filters = Session.get('filters');

		filters.title = '';
		filters.artist = '';
		filters.album = '';
		filters.page  = 0;

		Session.set('filters', filters);

		$('.filter').val('');

    $('#showMoreResults').show();
	},

	"keyup .filter" : function(event) {

		var 
		$table  = $('table'),
		$filter = $(event.target).attr('id'),
		value   = event.target.value;

		var filters = Session.get('filters');

		filters[$filter] = value;

		Session.set('filters', filters);
	},

	"click .player": function(event){

		var
		$this  = $(event.target),
		$audio = $this.parent('td').children('audio')[0];

		if($this.hasClass('glyphicon-play')){
			$('.glyphicon-pause').addClass('hidden');
			$('.glyphicon-play').removeClass('hidden');
			
			$('audio').each(function(){
				$(this)[0].pause();
			});

			$($audio)[0].play();
		}
		else
			$audio.pause();

		$this.parent('td').children('.player').toggleClass('hidden');
	},
	
	"submit #searchForm": function (event) {
	  // Prevent default browser form submit
    event.preventDefault();
    
    // Get value from form element
    var query = event.target.text.value;

    var filters = Session.get('filters');

    filters.query  = query;
		filters.title  = '';
		filters.artist = '';
		filters.album  = '';
		filters.page   = 0;

    Session.set('filters', filters);

		Meteor.call('search', query);

    $('#showMoreResults').show();
	},

	"click .sort": function(event){
		var
		$th       = $(event.target).parents('th'),
    index     = $($th)[0].cellIndex,
    ascending = true;

    // css classes according to sorting order
    $('th').removeClass('active');
    $($th).addClass('active');

    if( ! $($th).hasClass('asc') && ! $($th).hasClass('desc')){
    	$($th).addClass('asc');
    }
    else if( $($th).hasClass('desc') ){
    	$($th).removeClass('desc');
    	$($th).addClass('asc');
    }
    else if( $($th).hasClass('asc') ){
    	$($th).removeClass('asc');
    	$($th).addClass('desc');
    	ascending = false;
    }
    
    
    var 
    dict   = {},
    length = $('table tbody tr').length;

    // create dictionary "column content _ id(unique) : row"
    for (var i=0; i<length; i++){
    	var $id = ($('table tbody')[0].rows[i].getAttribute('id'));
    	dict[$('table tbody')[0].rows[i].cells[index].innerText + "_" + $id] = $('table tbody')[0].rows[i].outerHTML;
  	}

  	// sort only the keys of the dictionary
    var keys = Object.keys(dict); 
    
		keys.sort(); 
		if (!ascending)
			keys.reverse();	
		
		var html = [];

		// store the sorted rows in array
		for (var i=0; i<length; i++) { 
			var key = keys[i];

			html.push(dict[key]);
		} 

		// replace table contents with sorted rows
		$('table tbody').html(html.join(''));
	},

	"mousedown .resize": function(event){
		var $start = $(event.target).parents('th')[0];
		Session.set('pressed', true);
		Session.set('startX', event.pageX);
		Session.set('startWidth', $($start).width());

		$($start).addClass("resizing");
	},

	"mousemove .resize": function(event){
    var $start = $(event.target).parents('th')[0];
    if(Session.get("pressed"))
  		$($start).width(Session.get('startWidth')+event.pageX-Session.get('startX'));
	},

	"mouseup .resize": function(event){
    var $start = $(event.target).parents('th')[0];
    if(Session.get("pressed")){
    	$($start).removeClass("resizing");
    	Session.set("pressed", false);
    }
	}
});



// whenever #showMoreResults becomes visible, retrieve more results
function showMoreVisible() {
  var filters = Session.get('filters');

  filters.page++;

  Session.set('filters', filters);
}
	

// detect scrolldown
Meteor.startup(function (argument) {
    
  var lastScrollTop = 0;
  
  $(window).scroll(function() {

    var st = $(window).scrollTop();

    	// show more results when scrolling near the bottom
      if (st + $(window).height() > $(document).height() - 100) {
        if (st > lastScrollTop){
          showMoreVisible();
        }
      }

      lastScrollTop = st;
      
      if (st + $(window).height() == $(document).height()) {
        $('#showMoreResults').hide();
      }
  });

});