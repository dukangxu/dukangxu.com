var fuse;var fuseIndex;var searchVisible=false;var firstRun=true;var list=document.getElementById('searchResults');var first=list.firstChild;var last=list.lastChild;var maininput=document.getElementById('searchInput');var resultsAvailable=false;document.addEventListener('keydown',function(event){if(event.altKey&&event.which===191){doSearch(event)}
if(event.keyCode==27){if(searchVisible){document.getElementById("fastSearch").style.visibility="hidden";document.activeElement.blur();searchVisible=false;}}
if(event.keyCode==40){if(searchVisible&&resultsAvailable){console.log("down");event.preventDefault();if(document.activeElement==maininput){first.focus();}
else if(document.activeElement==last){last.focus();}
else{document.activeElement.parentElement.nextSibling.firstElementChild.focus();}}}
if(event.keyCode==38){if(searchVisible&&resultsAvailable){event.preventDefault();if(document.activeElement==maininput){maininput.focus();}
else if(document.activeElement==first){maininput.focus();}
else{document.activeElement.parentElement.previousSibling.firstElementChild.focus();}}}});document.getElementById("searchInput").onkeyup=function(e){executeSearch(this.value);}
document.querySelector("body").onclick=function(e){if(e.target.tagName==='BODY'||e.target.tagName==='DIV'){hideSearch()}}
document.querySelector("#search-btn").onclick=function(e){doSearch(e)}
function doSearch(e){e.stopPropagation();if(firstRun){loadSearch()
firstRun=false}
if(!searchVisible){showSearch()}
else{hideSearch()}}
function hideSearch(){document.getElementById("fastSearch").style.visibility="hidden"
document.activeElement.blur()
searchVisible=false}
function showSearch(){document.getElementById("fastSearch").style.visibility="visible"
document.getElementById("searchInput").focus()
searchVisible=true}
function fetchJSONFile(path,callback){var httpRequest=new XMLHttpRequest();httpRequest.onreadystatechange=function(){if(httpRequest.readyState===4){if(httpRequest.status===200){var data=JSON.parse(httpRequest.responseText);if(callback)callback(data);}}};httpRequest.open('GET',path);httpRequest.send();}
function loadSearch(){console.log('loadSearch()')
fetchJSONFile('/index.json',function(data){var options={shouldSort:true,location:0,distance:100,threshold:0.4,minMatchCharLength:2,keys:['permalink','title','tags','contents']};fuseIndex=Fuse.createIndex(options.keys,data)
fuse=new Fuse(data,options,fuseIndex);});}
function executeSearch(term){let results=fuse.search(term);let searchitems='';if(results.length===0){resultsAvailable=false;searchitems='';}else{permalinks=[];numLimit=5;for(let item in results){if(item>numLimit){break;}
if(permalinks.includes(results[item].item.permalink)){continue;}
searchitems=searchitems+'<li><a href="'+results[item].item.permalink+'" tabindex="0">'+'<span class="title">'+results[item].item.title+'</span></a></li>';permalinks.push(results[item].item.permalink);}
resultsAvailable=true;}
document.getElementById("searchResults").innerHTML=searchitems;if(results.length>0){first=list.firstChild.firstElementChild;last=list.lastChild.firstElementChild;}}
