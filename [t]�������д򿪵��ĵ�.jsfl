//测试所有打开的文档
//tamt	2009.08.28	ver 0.1
var docs = fl.documents;
for(var i = 0; i<docs.length; i++){
	var doc = docs[i];
	doc.testMovie();
	if(i<docs.length-1)fl.closeAllPlayerDocuments();
}