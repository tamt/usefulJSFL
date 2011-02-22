//export selected bitmap item in Library.
//tamt@2011.02.22

var libItem = fl.getDocumentDOM().library.getSelectedItems()[0]; 
if(libItem.itemType=="bitmap"){
	var imageFileURL = fl.browseForFileURL("save", "save as .jpg");
	if(imageFileURL){
		if(imageFileURL.slice(-4) == ".jpg"){
			libItem.exportToFile(imageFileURL);
		}else{
			alert("please save as .jpg");
		}
	}
}else{
	alert("please select a Bitmap Library Item");
}