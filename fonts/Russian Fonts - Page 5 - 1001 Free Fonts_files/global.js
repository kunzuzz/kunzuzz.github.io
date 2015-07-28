YAHOO.namespace("fontscript"); 

function init()
{
    redrawQueueItems();
}

YAHOO.util.Event.onDOMReady(init);

if (!document.getElementsByClassName)
{

    document.getElementsByClassName = function(classname)
    {
        var elArray = [];

        var tmp = document.getElementsByTagName("*");

        var regex = new RegExp("(^|\\s)" + classname + "(\\s|$)");
        for ( var i = 0; i < tmp.length; i++ ) {

            if ( regex.test(tmp[i].className) ) {
                elArray.push(tmp[i]);
            }
        }

        return elArray;

    };
}

function $ele(eleId)
{
    return document.getElementById(eleId);
}

function bookmarksite(title, url)
{
    if (window.sidebar) // firefox
        window.sidebar.addPanel(title, url, "");
    else if(window.opera && window.print){ // opera
        var elem = document.createElement('a');
        elem.setAttribute('href',url);
        elem.setAttribute('title',title);
        elem.setAttribute('rel','sidebar');
        elem.click();
    } 
    else if(document.all)// ie
        window.external.AddFavorite(url, title);
}

function toggleSettings()
{
    if($ele("settingsBar").style.display == "block")
    {
        $ele("settingsBar").style.display = "none";
        var fadeOut = new YAHOO.util.Anim($ele("settingsBar"), {
            opacity: {
                from: 1, 
                to:0
            }
        }, 0.5);
        fadeOut.animate();
    }
    else
    {
        $ele("settingsBar").style.display = "block";
        var fadeIn = new YAHOO.util.Anim($ele("settingsBar"), {
            opacity: {
                from: 0, 
                to: 1
            }
        }, 0.5);
        fadeIn.animate();
    }
}

/* rating bars */
YAHOO.fontscript.clickedRatingElementId = null;
function moveRatingBarWrapper(e, eleId)
{
    YAHOO.fontscript.clickedRatingElementId = eleId;
    moveRatingBar(e);
}

function moveRatingBar(e)
{
    if($ele("rateFontText_"+YAHOO.fontscript.clickedRatingElementId).innerHTML == "rated")
    {
        return false;
    }
    var Dom 		= YAHOO.util.Dom;
    var ele 		= $ele("rateFontBlock_"+(YAHOO.fontscript.clickedRatingElementId));
    var starOnEle 	= $ele("startsOn_"+(YAHOO.fontscript.clickedRatingElementId));
	
    starOnEle.style.backgroundImage = "url("+site_image_path+"/stars_rate.png)";
	 
    var mousePosition 	= YAHOO.util.Event.getXY(e);
    var elementPosition	= YAHOO.util.Dom.getXY("rateFontBlock_"+YAHOO.fontscript.clickedRatingElementId);
    var elementWidth 	= parseInt(Dom.getStyle(ele, 'width'), 10);

    if((mousePosition[0] >= elementPosition[0]) && (mousePosition[0] <= (elementPosition[0]+elementWidth)))
    {
        var newWidth = elementWidth-((elementPosition[0]+elementWidth)-mousePosition[0]);
        starOnEle.style.width = newWidth+"px";
        $ele("rateFontText_"+YAHOO.fontscript.clickedRatingElementId).style.display = "block";
    }
}

function resetRatingBar(e, eleId)
{
    var originalWidth 	= $ele("originalWidth_"+(YAHOO.fontscript.clickedRatingElementId)).value;
    var starOnEle 		= $ele("startsOn_"+(YAHOO.fontscript.clickedRatingElementId));
    starOnEle.style.width = originalWidth+"px";
    $ele("rateFontText_"+YAHOO.fontscript.clickedRatingElementId).style.display = "none";
    starOnEle.style.backgroundImage = "url("+site_image_path+"/stars_on.png)";
}

function submitNewRating(e, eleId)
{
    if($ele("rateFontText_"+YAHOO.fontscript.clickedRatingElementId).innerHTML == "rated")
    {
        return false;
    }
    var Dom 			= YAHOO.util.Dom;
    var starOnEle 		= $ele("startsOn_"+(YAHOO.fontscript.clickedRatingElementId));
    var clickWidth		= starOnEle.style.width;
    clickWidth = clickWidth.replace("px", "");
    var ele 			= $ele("rateFontBlock_"+(YAHOO.fontscript.clickedRatingElementId));
    var elementWidth 	= parseInt(Dom.getStyle(ele, 'width'), 10);
	
    var percentWidth	= parseInt((parseInt(clickWidth)/elementWidth) * 100, 0);
    var request 		= YAHOO.util.Connect.asyncRequest('GET', web_root+"/ajax/newRating.ajax.php?f="+YAHOO.fontscript.clickedRatingElementId+"&r="+percentWidth, callback);
}

var div = document.getElementById('container');
var handleSuccess = function(o)
{
    if(o.responseText !== undefined)
    {
        var Dom 			= YAHOO.util.Dom;
        var newRating 		= o.responseText;
        var ele 			= $ele("rateFontBlock_"+(YAHOO.fontscript.clickedRatingElementId));
        var elementWidth 	= parseInt(Dom.getStyle(ele, 'width'), 10);
        var newWidth		= parseInt((newRating/100) * elementWidth, 0);
        var starOnEle 		= $ele("startsOn_"+(YAHOO.fontscript.clickedRatingElementId));
        starOnEle.style.width = newWidth+"px";
		
        /* update original width hidden */
        $ele("originalWidth_"+(YAHOO.fontscript.clickedRatingElementId)).value = newWidth;
		
        $ele("rateFontText_"+YAHOO.fontscript.clickedRatingElementId).innerHTML = "rated";
        starOnEle.style.backgroundImage = "url("+site_image_path+"/stars_on.png)";
    }
}

var handleFailure = function(o)
{
    if(o.responseText !== undefined)
    {
		
    }
}

var callback =
{
    success:handleSuccess,
    failure: handleFailure
};

function showLabel(e, eleId)
{
    $ele("rateFontText_"+eleId).style.display = "block";
}

function hideLabel(e, eleId)
{
    $ele("rateFontText_"+eleId).style.display = "none";
}

function loadFontDetails(e, params)
{
    if((e.srcElement || e.target).id != "fontPreviewImageWrapper_"+params['eleId'])
    {
        return false;
    }
    window.location = params['newPath'];
}

/* update custom preview */
function updateCustomPreview()
{
    if(typeof($ele("customPreviewText")) == "undefined")
    {
        return false;
    }
    else if(typeof($ele("customPreviewTextColour")) == "undefined")
    {
        return false;
    }
	
    var previewText 	= $ele("customPreviewText").value;
    var previewColour 	= $ele("customPreviewTextColour").value;
    var previewSize 	= $ele("customPreviewSize").value;
    $ele("submitPreviewSettings").value = t("wait");
    $ele("submitPreviewSettings").disabled = true;

    var request 		= YAHOO.util.Connect.asyncRequest('GET', web_root+"/ajax/updateCustomPreview.ajax.php?previewText="+escape(previewText)+"&previewSize="+escape(previewSize)+"&previewColour="+escape(previewColour), previewTextCallback);
}

var handlePreviewTextSuccess = function(o)
{
    if(o.responseText !== undefined)
    {
        window.location.reload();
    }
}

var handlePreviewTextFailure = function(o)
{
    if(o.responseText !== undefined)
    {
    /* do something...(or nothing!) */
    }
}

var previewTextCallback =
{
    success:handlePreviewTextSuccess,
    failure: handlePreviewTextFailure
};

var updateFontQueueCallback =
{
    success:redrawQueueItems,
    failure:redrawQueueItems
}

function toggleDownloadQueue(fontId)
{
    if(isValueInArray(existingIds, fontId) == false)
    {
        // add
        existingIds.push(fontId);
    }
    else
    {
        // remove
        existingIds = removeItem(existingIds, fontId);
    }
    
    // send via ajax to update session variable
    var request = YAHOO.util.Connect.asyncRequest('GET', web_root+"/ajax/updateFontQueue.ajax.php?queueItems="+escape(existingIds), updateFontQueueCallback);
}

function getDownloadQueueIds()
{
    return existingIds;
}

function clearAllDownloadQueueIds()
{
    existingIds=new Array();
}

function redrawQueueItems()
{
    clearSelectedClasses();
    counter=0;
    for(i in existingIds)
    {
        counter = counter+1;
        if($ele("queueButton"+existingIds[i]) != null)
        {
            YAHOO.util.Dom.addClass("queueButton"+existingIds[i], 'downloadButtonQueueSelected');
            YAHOO.util.Dom.removeClass("queueButton"+existingIds[i], 'downloadButtonElement');
        }
    }
    document.getElementById('totalQueueCount').innerHTML = counter;
}

function clearSelectedClasses()
{
    var elems = document.getElementsByTagName('*'), i;
    for (i in elems)
    {
        if((' ' + elems[i].className + ' ').indexOf('downloadButtonQueueSelected')
            > -1) {
            elems[i].className = 'downloadButtonElement';
        }
    }
}

function isValueInArray(arr, val)
{
    inArray = false;
    for (i = 0; i < arr.length; i++)
    {
        if (val == arr[i])
        {
            inArray = true;
        }
    }
    
    return inArray;
}

function removeItem(arr, val)
{
    for (i = 0; i < arr.length; i++)
    {
        if (val == arr[i])
        {
            arr.splice(i, 1);
        }
    }
    
    return arr;
}