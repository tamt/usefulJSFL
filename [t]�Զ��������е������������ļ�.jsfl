// JSFL
// 
// Bumpslide AppComponent Class File Generator
//
// Find all library items with class definitions that don't have class files 
// and create the class files complete with imports and references for
// clips on the timeline.
//
// by David Knape
// tamt 2009/08/21	修改
// http://bumpslide.com/

// Author name to display in code
var author = "author";  



//-----------------------------
// GLOBALS
//-----------------------------


// output buffer
var output = ""; 

// classes to import
var imports = [];
                    
var processedElements = [];

// shortcut to trace
trace = fl.outputPanel.trace;



//-----------------------------
// FUNCTIONS
//-----------------------------


// trace to output buffer
function dtrace( s ) {
	output+="\n"+s;
}

// add class name to imports list if it isn't already there
function addToImports( className ) {
    for (var i=0; i<imports.length; i++) if(imports[i] == className) return;
    imports.push( className );
}            

function getPackage(item) {
	var s = item.linkageClassName;
	if(s==null) return "";
	var splat = s.split('.');
	if(splat.length) { splat.pop(); return splat.join('.'); }
	// split splat sputter
	return "";
}       

function getTimelineClass(item) {
	var s = item.linkageClassName;
	if(s==null) return null;
	var splat = s.split('.');
	if(splat.length) return splat.pop();
	else return s;
}

// Returns a "var" entry for a given timeline element
// example: "var instance_name : ClassName;"
function getVarForElement(el) {

    // check if we have already processed this element
    for(var i in processedElements) if(processedElements[i] == el.name) return "";
	processedElements.push( el.name );
    
	// local vars
	var propType=null;
	var classname = '';
	var output = "";
	
    switch( el.elementType ) 
    {
        case "instance": 
			// If class attached, import it and use the
			// base name, otherwise use the MovieClip class
            var classname = el.libraryItem.linkageClassName;  
            var baseclassName = el.libraryItem.linkageBaseClass;
            if(baseclassName!="") classname = baseclassName;
            if(classname!=null) {
                addToImports( classname );
                propType = ":" + classname.split('.').pop();
            } else {       
                addToImports( 'flash.display.MovieClip' );
                propType = ":MovieClip";
            }
            break;
			
		// TextFields are easy
        case "text":
               if(el.textType=='static') { return ""; }
			   addToImports( 'flash.text.TextField' );  
			   propType = ":TextField"; 
			   break;
			
		// Shapes don't apply, but grouped elements show up as shapes.
		// So, we should put out a warning when groups are found
        case "shape":
            if(el.isGroup) {
                // found a group of items, not supported
                return "\t\t// Warning: Grouped items found \n\t// (clips must be ungrouped to be identified by this JSFL script)";
            }
            break;
    }
    if(propType) {    
        if(el.name=="") {
            return "\n\t\t//public var UNNAMED_INSTANCE" + propType+";"
        } else  {
            return "\n\t\tpublic var "+el.name + propType+";";
        }       
	}
	return "";
}




// main subroutine
function main() {

	var l,f,e;        // iterators
	var elements;

    fl.outputPanel.clear();
    trace( '---\n Bumpslide Class File Generator\n---\n');
    
    var docPath = document.path; 
    var profile=new XML(  fl.getDocumentDOM().exportPublishProfileString() );
    var classPaths = profile.PublishFlashProperties.AS3PackagePaths.split(';');

    // use first class path in the list
    
    // try first as absolute path
    //var path = FLfile.platformPathToURI(classPaths[0]);
	var path = setting.folder;
    
    if( !FLfile.exists(path) ) {
                 
        // that doesn't work try as relative path
        path = FLfile.platformPathToURI( docPath.substr( 0, document.path.lastIndexOf( "/" )+1 ) + classPaths[0]);
        
        if( !FLfile.exists(path)) {
            
            // finally, just use default path
            path = FLfile.platformPathToURI( document.path.lastIndexOf( "/" )+1);         
        }
    }             
    
    if(path.substr( -1, 1)!='/') path+='/';
    trace( " Classpath: " + FLfile.uriToPlatformPath( path ) + "\n" ); 
    
    var didAnything=false;   
    var items = fl.getDocumentDOM().library.items;
    for (var n=0; n<items.length; n++) { 
        var linkageClassName=items[n].linkageClassName;  
        if(linkageClassName==null) continue;                                                   
        if(items[n].linkageBaseClass!="" && items[n].linkageBaseClass!="flash.display.MovieClip" ) continue;
        
        var folders=linkageClassName.split('.'); 
        var className = folders.pop();
                  
        
        // check for folder  
        var folderPath = "";
        for( var i=0; i<folders.length; i++) {     
            folderPath += folders[i] + "/";
            if(!FLfile.exists( path + folderPath)) { 
                didAnything = true;
                FLfile.createFolder(folderPath);
                trace( ' - created folder  ' + folderPath );
            } else {
                //trace( 'Found existing folder: ' +folderPath );
            }
        }
        // check for file    
        var classFile = path + folderPath + className +'.as';
        if(!FLfile.exists( classFile )) {
            didAnything = true;
            // write file
            
            FLfile.write(classFile, getClassFileContents( items[n] ) );
            //trace( ' - created class   '+classFile.substr( path.length, classFile.length - path.length));
			trace( ' - created class   '+classFile);
            //trace( getClassFileContents( items[n] ) );
        }   
        
               
        
    }       
    if(!didAnything) {
        trace('\n Nothing to do here.\n---');
        
    } else {
        trace('\n All done.\n\n---')
        
    }
}

function getClassFileContents( item ) {
    
       
    var timelineClass = getTimelineClass(item);
    
    document.library.selectItem( item.name );
    document.library.editItem( item.name );
	
	var timeline = fl.getDocumentDOM().getTimeline();
	
	// print class header
	// dtrace sends to output buffer (var output)
    dtrace( "\n\t/**");
    dtrace( "\t * "+timelineClass + ' Component');
    dtrace( "\t * ");
    dtrace( "\t * @author "+author);
    dtrace( "\t */");
    dtrace( "\tpublic class "+timelineClass+" extends MovieClip \n\t{");
    
    // print vars
    //dtrace("\t\t// children on stage\n\t\t//--------------------");
	
    // process all layers
    for(l=0; l<timeline.layers.length; l++) 
    {     
        // print layer name as comment to pretty up our vars
                       
        var varlines = "";
        // process all frames
        for(f=0; f<timeline.layers[l].frames.length; f++) 
        {        
            elements=timeline.layers[l].frames[f].elements;
            for(e=0; e<elements.length; e++) {
			    varlines+=getVarForElement( elements[e] );
            }
        }
		
		// if layer had elements, output the var text with a
		// comment matching the layer name
		if(varlines!="") {
			dtrace( "\n\t\t// "+ timeline.layers[l].name + varlines );
		}
    }        
	
    //dtrace( "\n\n\t\t/**\n\t\t * Initialize children, bindings, and event listeners \n\t\t */");
	//dtrace( "\t\toverride protected function addChildren() : void {"); 
    //dtrace( "\t\t\tsuper.addChildren();");
    //dtrace( "\t\t}" ); 
    
    //dtrace( "\n\n\t\t/**\n\t\t * Update the display \n\t\t */");   
    //dtrace( "\t\toverride protected function draw() : void {"); 
    //dtrace( "\t\t\tsuper.draw();" );
    //dtrace( "\t\t}" );

    // end class
    dtrace( "\t}" );
    // end package
    dtrace( "}" );       
	
	
	// OUTPUT...
                                               
	var retVal = "package " + getPackage(item) + " {\n" ; 
    
    // print imports using regular trace
    for(var n=0; n<imports.length; n++) {
        retVal += "\n\timport "+imports[n] + ";";
    }
	// trace buffered output
    retVal += output;
    
    output = ""; 
    imports = [];
    processedElements = [];
    
    return retVal;    
}




// run...

//-------------界面文件的生成----------------------
var tmpXmlFile = fl.configURI + "/tmp.xml";
var xmlGui = buildXulGui();
FLfile.write(tmpXmlFile, xmlGui);
function buildXulGui()
{
	var t = fl.getDocumentDOM().pathURI;
	var folderPath = t.substr(0, t.lastIndexOf('/'));
  return '<dialog id="dialog" title="在源代码文件夹下自动创建链接类文件" buttons="accept, cancel"> \
      \
      <script> \
      function browseFolder() \
      { \
        var folderURL = fl.browseForFolderURL(); \
        if(folderURL != null) \
        { \
          fl.xmlui.set("folder", folderURL); \
        } \
      } \
      </script> \
      \
     <vbox> \
      <label value="文件夹:" /> \
      <textbox value="' + folderPath +'" width="300" id="folder"/> \
      <button id="openFolder" label="选择..." oncommand="browseFolder()" disabled="true"/>	\
    </vbox> \
    \
  </dialog>';
}
//-------------------------------------------------
var setting = fl.getDocumentDOM().xmlPanel(tmpXmlFile);
if(setting.dismiss=='accept'){
	main();
}