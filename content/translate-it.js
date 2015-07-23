Components.utils.import("resource://gre/modules/Services.jsm");

// API key for Yandex translation service
var yandexApiKey = "trnsl.1.1.20150601T163408Z.5843b56fda934aea.39867fe6354d1aea513b8e3f05daddef8bebfda9";
// format-string for Yandex JSON translation service
var yandexUrl = "https://translate.yandex.net/api/v1.5/tr.json/translate?key={0}&lang={1}&text={2}";

(function() {
  var $S2K = window.$S2K = {btnToolbar:null, mnuPopUp:null, 
  bootstrap:function() {
    window.removeEventListener("load", $S2K.bootstrap, false);
    $S2K.loadUI();
  },
  loadUI:function() {
    $S2K.mnuPopUp = document.getElementById("s2k-popup");
    $S2K.btnToolbar = document.getElementById("s2k-button");
    $S2K.txtSearchFld = document.getElementById("s2k-popup-search-input");
    $S2K.txtResultFld = document.getElementById("s2k-popup-result-text");
  }, 
  onToolbar:function() {
    $S2K.mnuPopUp.openPopup($S2K.btnToolbar, "after_end", 0, 2, false, false)
  },
  onShowPopUp:function() {
    if(hasCurrentDocumentSelection() === true) {
	// get current selection & update textbox
	var selection = window.fetchMostRecentDocument().getSelection();
	$S2K.txtSearchFld.value = selection;
	// perform search
	$S2K.performSearch(selection);
    } else {
    	$S2K.txtSearchFld.value = "";
    }
  },
  onHidePopUp:function() {
    $S2K.txtSearchFld.value = "";
    $S2K.txtResultFld.textContent="";
  },
  onSearchBar: function(){
    var searchterm = $S2K.txtSearchFld.value;
    $S2K.performSearch(searchterm);
  },
  performSearch: function(search){
    // make http-call in order to translate
    var reqUrl = String.format(yandexUrl,yandexApiKey,"en-de",search);
    // prepare request
    let request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest); // ?????????
    request.onload = function(event) {
      var resp = event.target.responseText;
      var trans = JSON.parse(resp)["text"]; // error handling missing
      $S2K.txtResultFld.textContent = trans;
    };
    request.onerror = function(aEvent) {
      // missing
    };
    // perform search
    request.open("GET", reqUrl, true);
    request.send(null);
  }};
  window.addEventListener("load", function() {
    setTimeout($S2K.bootstrap, 0) // WTF???
  }, false)
})();

function hasCurrentDocumentSelection() {
  // Fetch the most recent document
  var document = window.fetchMostRecentDocument();
       
  // Test the document for a selection.
  return (document.getSelection && document.getSelection().toString() !== "");
}

function fetchMostRecentDocument() {
  var window = Services.wm.getMostRecentWindow("navigator:browser");
  return window ? window.content.document : null;
};

// add String formatting capability
if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined' ? args[number] : match
      ;
    });
  };
}
