//批量命名所选元件
//tamt 2010.12.30
//-------------界面文件的生成----------------------
var tmpXmlFile = fl.configURI + "/tmp.xml";
var xmlGui = buildXulGui();
FLfile.write(tmpXmlFile, xmlGui);
function buildXulGui()
{
 	return '<dialog id="dialog" title="批量命名所选元件" buttons="accept, cancel"> \
     <vbox> \
      <label width="200" value="前缀:"/> \
      <textbox width="200" value="mc" id="str"/> \
      <label width="200" value="命名排序依据:"/> \
	  <radiogroup id="sortBy"> \
	  <radio id="x" label="x"/> \
	  <radio id="y" label="y"/> \
	  <radio id="z-index" label="z-index"/> \
	  </radiogroup> \
    </vbox> \
    \
  </dialog>';
}
//-------------------------------------------------

var setting = fl.getDocumentDOM().xmlPanel(tmpXmlFile);
if(setting.dismiss=='accept'){
	var theSelectionArray = fl.getDocumentDOM().selection.slice(0);
	switch(setting.sortBy){
		case "x":
			theSelectionArray.sort(sortByX);
			break;
		case "y":
			theSelectionArray.sort(sortByY);
			break;
		case "z-index":
			break;
	}
	var prefix = setting.str;
	for(var i=0;i<theSelectionArray.length;i++){
		var element = theSelectionArray[i]
		if(element.elementType == 'instance'){
			var instance = element;
			instance.name = prefix + i;
		}
	}
}

function sortByX(a, b){
	return a.x - b.x;
}

function sortByY(a, b){
	return a.y - b.y;
}