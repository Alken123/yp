var audio = document.getElementById('narration');
var button = document.getElementById('mute');
button.onclick = function() {

    if (audio.muted === false) {
        audio.muted = true;
    } else {
        audio.muted = false;
    }

};




var v = document.getElementById('video');
var playpause = document.getElementById('play-pause');
playpause.addEventListener(
    'play',
    function() {
        v.play();
    },
    false);

playpause.onclick = function() {
    if (v.paused) {
        v.play();
    } else {
        v.pause();
    }

    return false;
};



var vid = document.getElementById("video");
vid.ontimeupdate = function() {
    var percentage = (vid.currentTime / vid.duration) * 100;
    $("#custom-seekbar span").css("width", percentage + "%");
};

$("#custom-seekbar").on("click", function(e) {
    var offset = $(this).offset();
    var left = (e.pageX - offset.left);
    var totalWidth = $("#custom-seekbar").width();
    var percentage = (left / totalWidth);
    var vidTime = vid.duration * percentage;
    vid.currentTime = vidTime;
}); //click()




const select = document.getElementById('streams');

const player = new YouTubeToHtml5({
    selector: '.youtube-video-1',
    attribute: 'data-yt',
    autoload: false
});

player.addFilter('video.source', function(source, data, element, format, streams) {

    if (Array.isArray(streams) && streams.length > 1) {

        const options = streams;
        options.sort(function(a, b) {
            const aLabel = parseInt(a.label);
            const bLabel = parseInt(b.label);

            if (aLabel < bLabel) {
                return -1;
            }

            if (aLabel > bLabel) {
                return 1;
            }

            return 0;
        });

        for (let index = 0; index < options.length; index++) {

            const stream = options[index];

            const option = document.createElement('option');

            option.value = stream.url;

            const audioLabel = stream.hasAudio ? 'with audio' : 'without audio';

            option.text = `${stream.label} ${audioLabel}`;

            if (stream.url === source) {
                option.setAttribute('selected', 'selected');
            }

            select.appendChild(option);
        }

        select.disabled = false;

        select.addEventListener('change', function() {
            element.src = this.value;
        });
    } else {
        select.style.display = 'none';
    }

    return source;
});

player.load();