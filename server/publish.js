getRegex = function( value ) {
  // Replace any regex special characters
  value = value.replace( /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&" );
        
  return new RegExp('.*' + value + '.*', 'i');
};

Meteor.publish('songs', function( filters ) {

  filters = filters || {};

  var page = filters.page;

  delete filters.page;

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

  var options = {};

  options.limit = 25 + page * 25;

  // console.log('options');
  // console.log(options);

  // console.log('where');
  // console.log(where);

  return Songs.find( where, options );
});