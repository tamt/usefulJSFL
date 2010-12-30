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
      <label width="300" value="前缀"/> \
      <textbox width="300" value="mc" id="str"/> \
    </vbox> \
    \
  </dialog>';
}
//-------------------------------------------------

var setting = fl.getDocumentDOM().xmlPanel(tmpXmlFile);
if(setting.dismiss=='accept'){
	var theSelectionArray = fl.getDocumentDOM().selection;
	var prefix = setting.str;
	for(var i=0;i<theSelectionArray.length;i++){
		var element = theSelectionArray[i]
		if(element.elementType == 'instance'){
			var instance = element;
			instance.name = prefix + i;
		}
	}
}
