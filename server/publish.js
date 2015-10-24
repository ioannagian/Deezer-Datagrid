getRegex = function( value ) {
  // Replace any regex special characters
  value = value.replace( /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&" );
        
  return new RegExp('.*' + value + '.*', 'i');
};



Meteor.publish('songs', function( filters ) {

  filters = filters || {};

  var 
  page    = filters.page,
  options = {};
  
  // get another results package (page)
  delete filters.page;
  options.limit = 25 + page * 25;


  // add all the filters (query, title, artist, album) in the where clause
  var where = [];

  _.each(filters, function(value, name) {
    if ( ! value) {
      return;
    }

    var param = {};
    param[name] = getRegex(value);
    where.push(param);
  });

  if (where.length) {
    where = { $and : where };
  } else {
    where = {};
  }

  
  // pass "where" and "options" parameters to the mongo query
  return Songs.find( where, options );
});