Meteor.methods({ 
  search: search
});

function search( query ) {
  var response = HTTP.get('http://api.deezer.com/search/track', 
                          { params: { q: query,
                                      index: 0,
                                      limit: 1000
                                    }
                          }
  );  

  if ( ! response || ! response.data || ! response.data.data) {
    console.error('no response');
    return;
  }

  // console.log('response.data.data.length');
  // console.log(response.data.data.length);
  // console.log('response.data.total');
  // console.log(response.data.total);

  // var count = 0; // just for debugging


  // we store the response in mongo so that we won't
  // have to call the API all the time

  _.each(response.data.data, function(item, i) {
    var song = {
      title: item.title,
      link: item.link,
      duration: item.duration,
      preview: item.preview,
      artist: item.artist.name,
      artist_link: item.artist.link,
      album: item.album.title,
      cover: item.album.cover_small,
      rank: item.rank,
      query: query
    };

    try {
      // item.id is the unique id from deezer
      Songs.upsert({ _id: item.id.toString() },
                   song
      );
      // count++;
    } 
    catch (e) {
      console.log('catch e');
      console.log(e);
    }
  });


  // console.log('upserted records count: ' + count);
}
