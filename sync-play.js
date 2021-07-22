var audio = document.getElementById('narration');
function qualitysync() {
  audio.pause()
  audio.load();
}


var medias = {
    audio: Popcorn("#narration"),
    video: Popcorn("#video")
    },
    loadCount = 0,
    events = "play pause timeupdate seeking".split(/\s+/g);
    
    // iterate both media sources
    Popcorn.forEach(medias, function(media, type) {
    
    // when each is ready... 
    media.on("canplayall", function() {
    
    // trigger a custom "sync" event
    this.emit("sync");
    
    // Listen for the custom sync event...    
    }).on("sync", function() {
    
    // Once both items are loaded, sync events
    if (++loadCount == 2) {
      // Uncomment this line to silence the video
      //medias.video.mute();
    
      // Iterate all events and trigger them on the video 
      // whenever they occur on the audio
      events.forEach(function(event) {
    
        medias.video.on(event, function() {
    
          // Avoid overkill events, trigger timeupdate manually
          if (event === "timeupdate") {
    
            if (!this.media.paused) {
              return;
            }
            medias.audio.emit("timeupdate");
    
            return;
          }
    
          if (event === "seeking") {
            medias.audio.currentTime(this.currentTime());
          }
    
          if (event === "play" || event === "pause") {
            medias.audio[event]();
          }
        });
      });
    }
    });
    });