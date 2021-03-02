// Import JS libraries
import * as THREE from 'three';

// Import play button alpha image
import PlayButtonAlpha from './play_button_alpha.jpg';

// Create private member refrence to object
let _this = undefined;

// Create & initialize _state member, _states constant
let _state = 0;
const _states = {
   UNINITIALIZED: 0,
   NOSOURCE: 1,
   LOADING: 2,
   READY: 3 
}

// Create private class members 
let _videoDOMElement, _playButtonObject, _geometry, _material = undefined;

// Define constructor method
function THREEVideoPlayer(options = {}) {
   // Initialize default geometry & material 
   _geometry = new THREE.PlaneBufferGeometry(1.0, 1.0);
   _material = new THREE.MeshBasicMaterial({ color: 0xffffff });

   // Call parent constructor
   THREE.Mesh.apply(this, [_geometry, _material]);

   // Initialize video DOM element & add to document
   _videoDOMElement = document.createElement('video');
   _videoDOMElement.setAttribute('style', 'display:none;');
   _videoDOMElement.setAttribute('preload', 'auto');
   _videoDOMElement.setAttribute('playsinline', 'playsinline');
   _videoDOMElement.setAttribute('webkit-playsinline', 'webkit-playsinline');
   _videoDOMElement.muted = options.muted ? options.muted : false;
   _videoDOMElement.autoplay = options.autoplay ? options.autoplay : false;
   _videoDOMElement.loop = options.loop ? options.loop : false;
   if(options.volume){
       _setVolume(options.volume);
   }
   document.body.appendChild(_videoDOMElement);

   // Initialize play button object
   _playButtonObject = new THREE.Mesh(new THREE.PlaneBufferGeometry(0.6,0.6), new THREE.MeshBasicMaterial({
        color: options.play_btn_color ? options.play_btn_color : 0xC1C1C0,
        alphaMap: new THREE.TextureLoader().load(PlayButtonAlpha),
        alphaTest: 0.3
   }));

   // Add _playButtonObject as child of object
   this.add(_playButtonObject);
   _playButtonObject.position.z = 0.001;
   _playButtonObject.visible = false;

   // Show play button on video pause & end
   _videoDOMElement.onpause = function() {
       _playButtonObject.visible = true;
   }
   _videoDOMElement.onended = function() {
       _playButtonObject.visible = true;
   }

   // Hide play button on video play
   _videoDOMElement.onplay = function() {
       _playButtonObject.visible = false;
   }

   // Set private member refrence to object
   _this = this;

   // Set state to _states.NOSOURCE
   _setState(_states.NOSOURCE).then(function(){
        // Set source if one is provided
        if(options.source){
            try{
                _setSource(options.source);
            } catch (e) {
                console.log(e)
            }
        }
   });
}

// Define private _setSource method
function _setSource(source) {
    // Return if uninitialized
    if(_state === _states.UNINITIALIZED){
        return;
    }

    // Check for valid method call
    if(typeof source !== "string"){
        throw "New source must be a string!";
    }

    // Remove any existing sources
    while(_videoDOMElement.firstChild) {
        _videoDOMElement.removeChild(_videoDOMElement.firstChild);
    }

    // Create new source DOM element
    var nSourceDOMElement = document.createElement('source');
    nSourceDOMElement.src = source;
    nSourceDOMElement.type = 'video/mp4';
    _videoDOMElement.appendChild(nSourceDOMElement); 

    // Set state to _states.READY when oncanplay is called
    _videoDOMElement.oncanplay = function() {
        _setState(_states.READY).then(function(){return;});
    }
   
    // Set state to _states.LOADING and load new source
    _setState(_states.LOADING).then(function(){
        _videoDOMElement.load(); 
    });
}

// Define _clearSource method
function _clearSource() {
    if(_state !== _states.UNINITIALIZED && _state !== _states.NOSOURCE){
        _setState(_states.NOSOURCE).then(function(){
            while(_videoDOMElement.firstChild) {
                _videoDOMElement.removeChild(_videoDOMElement.firstChild);
            }
        });
    }
}

// Define _setVolume method
function _setVolume(volume) {
    if(_videoDOMElement !== undefined){
        _videoDOMElement.volume = volume > 1.0 ? 1.0 : volume < 0.0 ? 0.0 : volume;
    }
}

// Define private _setState method
async function _setState(nState) {
    // Return if object unititialized, or if new state provided is invalid, or if no state change
    if(_this === undefined || Object.values(_states).indexOf(nState) === -1 || nState === _state) {
        return;
    }

    _state = nState;

    switch(_state){
        case _states.NOSOURCE:
            _this.material.map = null;
            _this.material.needsUpdate = true;
            _this.visible = true;
            _playButtonObject.visible = false;
            break;
        case _states.LOADING:
            break;
        case _states.READY:
           _geometry = new THREE.PlaneBufferGeometry(_videoDOMElement.videoWidth/_videoDOMElement.videoHeight, 1.0);
           _this.geometry.dispose();
           _this.geometry = _geometry;
           _this.material.map = new THREE.VideoTexture(_videoDOMElement);
           _this.material.map.needsUpdate = true;
           _this.material.needsUpdate = true; 
           _this.visible = true; 
           _playButtonObject.visible = true;
            break;
        default:
           return;
    }

    return;
}

// Define object prototype
THREEVideoPlayer.prototype = Object.assign(Object.create(THREE.Mesh.prototype), {
    constructor: THREEVideoPlayer,
    play: function() {
        if(_state === _states.READY){
            _videoDOMElement.play();
        }
    },
    pause: function() {
        if(_state === _states.READY){
            _videoDOMElement.pause();
        }
    },
    canPlay: function() {
       return _state === _states.READY; 
    },
    isPaused: function() {
        if(_videoDOMElement !== undefined){
            return _videoDOMElement.paused;
        }
    },
    setSource: function(source) {
        var status = true;
        try{
            _setSource(source);
        } catch(e){
            console.log(e);
            status = false;
        } finally {
            return;
        }
    },
    clearSource: _clearSource,
    setMuted: function(isMuted){
        if(_videoDOMElement !== undefined){
            _videoDOMElement.muted = new Boolean(isMuted)
        }
    },
    isMuted: function() {
        if(_videoDOMElement !== undefined){
            return _videoDOMElement.muted;
        }
    },
    setAutoplay: function(isAutoplay){
       if(_videoDOMElement !== undefined){
           _videoDOMElement.autoplay = new Boolean(isAutoplay);
       } 
    },
    isAutoplay: function() {
        if(_videoDOMElement !== undefined){
            return _videoDOMElement.autoplay;
        }
    },
    setLoop: function(isLoop){
        if(_videoDOMElement !== undefined){
            _videoDOMElement.loop = new Boolean(isLoop);
        }
    },
    isLoop: function() {
        if(_videoDOMElement !== undefined){
            return _videoDOMElement.loop;
        }
    },
    setVolume: _setVolume,
    getVolume: function(){
        if(_videoDOMElement !== undefined){
            return _videoDOMElement.volume;
        }
    }
});

// Export object
export { THREEVideoPlayer }