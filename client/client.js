Session.setDefault('filters', {query: '', title : '', artist: '', album: '', page : 0});

Tracker.autorun(function() {

  Meteor.subscribe('songs', Session.get('filters'));
	
});



Template.main.helpers({

	filters: function(){
    return Session.get('filters');
  },

  moreResults: function(){
  	console.log(Songs.find().count());
  	if(Songs.find().count() >= 25)
  		return true;
  },

  songs: function () {
      return Songs.find({}, {sort: {rank:1} });
  },
	
	toMinutes: function(duration){
		var minutes = Math.floor(duration / 60);
		var seconds = Math.floor(duration % 60);
		if (seconds < 10)
			seconds = "0"+seconds;
		return minutes+":"+seconds;


	}

});


Template.main.events({

	
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
		$this = $(event.target);
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
    var index = $(event.target).parents('th')[0].cellIndex;
    $('th').removeClass('active');
    $(event.target).parents('th').addClass('active');
    var dict = {};

    var length = $('table tbody tr').length;
    for (var i=0; i<length; i++){
    	var $id = ($('table tbody')[0].rows[i].getAttribute('id'));
    	dict[$('table tbody')[0].rows[i].cells[index].innerText + "_" + $id] = $('table tbody')[0].rows[i].outerHTML;
  	}

    var keys = Object.keys(dict); 
		keys.sort(); 
		
		var html = [];

		for (var i=0; i<length; i++) { 
			var key = keys[i];

			html.push(dict[key]);
		} 

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
	

Meteor.startup(function (argument) {
    
  var lastScrollTop = 0;
  
  $(window).scroll(function() {

    var st = $(window).scrollTop();

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