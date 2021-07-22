'use strict';
function YouTubeToHtml5(options = {}) {
  this.hooks = {};
  this.options = {};
  var property;
  for (property in this.defaultOptions) {
    if (property in options) {
      this.options[property] = options[property];
    } else {
      this.options[property] = this.defaultOptions[property];
    }
  }
  if (this.options.autoload) {
    this.load();
  }
}
YouTubeToHtml5.prototype.defaultOptions = {
  selector : "video[data-yt2html5]",
  attribute : "data-yt2html5",
  formats : "*",
  autoload : true,
  withAudio : false
};
YouTubeToHtml5.prototype.globalHooks = {};
YouTubeToHtml5.prototype.getHooks = function(key, type) {
  let hooks = [];
  if (key in this.globalHooks) {
    let elem = this.globalHooks[key];
    elem = elem.filter((a) => {
      return a.name === type;
    });
    elem = elem.sort((secondListenerDetails, firstListenerDetails) => {
      return secondListenerDetails.priority - firstListenerDetails.priority;
    });
    hooks = hooks.concat(elem);
  }
  if (key in this.hooks) {
    let elem = this.hooks[key];
    elem = elem.filter((a) => {
      return a.name === type;
    });
    elem = elem.sort((secondListenerDetails, firstListenerDetails) => {
      return secondListenerDetails.priority - firstListenerDetails.priority;
    });
    hooks = hooks.concat(elem);
  }
  return hooks;
};
YouTubeToHtml5.prototype.addHook = function(key, value) {
  if (!(key in this.globalHooks)) {
    this.globalHooks[key] = [];
  }
  if (!(key in this.hooks)) {
    this.hooks[key] = [];
  }
  if ("global" in value && value.global) {
    this.globalHooks[key].push(value);
  } else {
    this.hooks[key].push(value);
  }
};
YouTubeToHtml5.prototype.addAction = function(name, handler, priority = 10, showSpinner = false) {
  this.addHook("actions", {
    name : name,
    callback : handler,
    priority : priority,
    global : showSpinner
  });
};
YouTubeToHtml5.prototype.doAction = function(type, ...args) {
  const _intervals = this.getHooks("actions", type);
  for (let i = 0; i < _intervals.length; i++) {
    _intervals[i].callback(...args);
  }
};
YouTubeToHtml5.prototype.addFilter = function(options, callback, priority = 10, showSpinner = false) {
  this.addHook("filters", {
    name : options,
    callback : callback,
    priority : priority,
    global : showSpinner
  });
};
YouTubeToHtml5.prototype.applyFilters = function(key, val, ...value) {
  const _intervals = this.getHooks("filters", key);
  for (let i = 0; i < _intervals.length; i++) {
    val = _intervals[i].callback(val, ...value);
  }
  return val;
};
YouTubeToHtml5.prototype.itagMap = {
  18 : "360p",
  22 : "720p",
  37 : "1080p",
  38 : "3072p",
  82 : "360p3d",
  83 : "480p3d",
  84 : "720p3d",
  85 : "1080p3d",
  133 : "240pna",
  134 : "360pna",
  135 : "480pna",
  136 : "720pna",
  137 : "1080pna",
  264 : "1440pna",
  298 : "720p60",
  299 : "1080p60na",
  160 : "144pna",
  139 : "48kbps",
  140 : "128kbps",
  141 : "256kbps"
};
YouTubeToHtml5.prototype.urlToId = function(colorTxt) {
  const regex = /^(?:http(?:s)?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|(?:(?:youtube-nocookie\.com\/|youtube\.com\/)(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|user)\/)))([a-zA-Z0-9\-_]*)/;
  const processNameMatches = colorTxt.match(regex);
  return Array.isArray(processNameMatches) && processNameMatches[1] ? processNameMatches[1] : colorTxt;
};
YouTubeToHtml5.prototype.fetch = function(url) {
  return new Promise((OnSuccess, notify_success) => {
    var xhr = new XMLHttpRequest;
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (this.readyState === 4) {
        if (this.status >= 200 && this.status < 400) {
          OnSuccess(this.responseText);
        } else {
          notify_success(this);
        }
      }
    };
    xhr.send();
    xhr = null;
  });
};
YouTubeToHtml5.prototype.getAllowedFormats = function() {
  let formats = [];
  if (Array.isArray(this.options.formats)) {
    formats = this.options.formats;
  } else {
    if (this.itagMap[this.options.formats]) {
      formats = [this.options.formats];
    } else {
      if (this.options.formats === "*") {
        formats = Object.values(this.itagMap).sort();
      }
    }
  }
  return formats;
};
YouTubeToHtml5.prototype.getElements = function(value) {
  var args = null;
  if (value) {
    if (NodeList.prototype.isPrototypeOf(value) || HTMLCollection.prototype.isPrototypeOf(value)) {
      args = value;
    } else {
      if (typeof value === "object" && "nodeType" in value && value.nodeType) {
        args = [value];
      } else {
        args = document.querySelectorAll(this.options.selector);
      }
    }
  }
  args = Array.from(args || "");
  return this.applyFilters("elements", args);
};
YouTubeToHtml5.prototype.youtubeDataApiEndpoint = function(value) {
  const d = `https://yt2html5.com/?id=${value}`;
  return this.applyFilters("api.endpoint", d, value, null);
};
YouTubeToHtml5.prototype.parseUriString = function(string) {
  return string.split("&").reduce(function(result, clusterShardData) {
    const arrMatch = clusterShardData.split("=").map(function(originalBaseURL) {
      return decodeURIComponent(originalBaseURL.replace("+", " "));
    });
    result[arrMatch[0]] = arrMatch[1];
    return result;
  }, {});
};
YouTubeToHtml5.prototype.canPlayType = function(type) {
  var elem = null;
  if (/^audio/i.test(type)) {
    elem = document.createElement("audio");
  } else {
    elem = document.createElement("video");
  }
  const dashicon = elem && typeof elem.canPlayType === "function" ? elem.canPlayType(type) : "unknown";
  return dashicon ? dashicon : "no";
};
YouTubeToHtml5.prototype.parseYoutubeMeta = function(value) {
  let $ = [];
  let data = [];
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch (error) {
      return null;
    }
  }
  let obj = value.data || {};
  obj = this.applyFilters("api.response", obj, value);
  if (obj.hasOwnProperty("url_encoded_fmt_stream_map")) {
    $ = $.concat(obj.url_encoded_fmt_stream_map.split(",").map((markup_start) => {
      return this.parseUriString(markup_start);
    }));
  }
  if (obj.player_response.streamingData && obj.player_response.streamingData.formats) {
    $ = $.concat(obj.player_response.streamingData.formats);
  }
  if (obj.hasOwnProperty("adaptive_fmts")) {
    $ = $.concat(obj.adaptive_fmts.split(",").map((markup_start) => {
      return this.parseUriString(markup_start);
    }));
  }
  if (obj.player_response.streamingData && obj.player_response.streamingData.adaptiveFormats) {
    $ = $.concat(obj.player_response.streamingData.adaptiveFormats);
  }
  $.forEach((data) => {
    if (data && "itag" in data && this.itagMap[data.itag]) {
      let self = {
        _raw : data,
        itag : data.itag,
        url : null,
        label : null,
        type : "unknown",
        mime : "unknown",
        hasAudio : false,
        browserSupport : "unknown"
      };
      if ("url" in data && data.url) {
        self.url = data.url;
      } else {
        if ("signatureCipher" in data) {
        }
      }
      if ("audioQuality" in data && data.audioQuality) {
        self.hasAudio = true;
      }
      if ("qualityLabel" in data && data.qualityLabel) {
        self.label = data.qualityLabel;
      } else {
        self.label = this.itagMap[data.itag];
      }
      if ("mimeType" in data) {
        const STATIC_PAIR = data.mimeType.match(/^(audio|video)(?:\/([^;]+);)?/i);
        if (STATIC_PAIR[1]) {
          self.type = STATIC_PAIR[1];
        }
        if (STATIC_PAIR[2]) {
          self.mime = STATIC_PAIR[2];
        }
        self.browserSupport = this.canPlayType(`${self.type}/${self.mime}`);
      }
      if (self.url) {
        data.push(self);
      }
    }
  });
  data = this.applyFilters("api.results", data, obj);
  return data;
};
YouTubeToHtml5.prototype.load = function() {
  const directiveAttributes = this.getElements(this.options.selector);
  if (directiveAttributes && directiveAttributes.length) {
    directiveAttributes.forEach((childCompute) => {
      this.loadSingle(childCompute);
    });
  }
};
YouTubeToHtml5.prototype.loadSingle = function(value, isScrollList = null) {
  const dateFormatTag = isScrollList || this.options.attribute;
  if (value.getAttribute(dateFormatTag)) {
    const realVal = this.urlToId(value.getAttribute(dateFormatTag));
    const url = this.youtubeDataApiEndpoint(realVal);
    this.doAction("api.before", value);
    this.fetch(url).then((childCompute) => {
      if (childCompute) {
        let rows = this.parseYoutubeMeta(childCompute);
        if (rows && Array.isArray(rows)) {
          rows = rows.filter(function(verifiedEvent) {
            return verifiedEvent.type === value.tagName.toLowerCase();
          });
          rows.sort(function(metadata, options) {
            const datum = {
              "unknown" : -1,
              "no" : -1,
              "maybe" : 0,
              "probably" : 1
            };
            return datum[metadata.browserSupport] + datum[options.browserSupport];
          });
          if (this.options.withAudio) {
            rows = rows.filter(function(mi) {
              return mi.hasAudio;
            });
          }
          const keywordResults = this.getAllowedFormats();
          var data = null;
          var height = null;
          for (let i = 0; i < keywordResults.length; i++) {
            const _expandHeight = keywordResults[i];
            const search = rows.filter((a) => {
              return this.itagMap[a.itag] === _expandHeight;
            });
            if (search && search.length) {
              data = search.shift();
              height = _expandHeight;
              break;
            }
          }
          data = this.applyFilters("video.stream", data, value, height, rows);
          let item = {
            src : "",
            type : ""
          };
          if (data && "url" in data && data.url) {
            item.src = data.url;
          }
          if (data.type && data.type !== "unknown" && data.mime && data.mime !== "unknown") {
            item.type = `${data.type}/${data.mime}`;
          }
          item.src = this.applyFilters("video.source", item.src, data, value, height, rows);
          if (item.src && typeof item.src.toString === "function" && item.src.toString().length) {
            value.src = item.src;
            if (item.type && item.type.length) {
              value.type = item.type;
            }
          } else {
            console.warn(`YouTubeToHtml5 unable to load video for ID: ${realVal}`);
          }
        }
      }
    }).finally((obj) => {
      this.doAction("api.after", value, obj);
    });
  }
};
if (typeof module === "object" && typeof module.exports === "object") {
  module.exports = YouTubeToHtml5;
}
;
