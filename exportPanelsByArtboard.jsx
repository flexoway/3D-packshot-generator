//export 6 panels by artboard
var doc = app.activeDocument;
var docName = doc.name;
var docPrest = new DocumentPreset();
docPrest.title = docName.split(".")[0];
var theArtboards = doc.artboards;
var namelst = ["top","front","right","left","back","bottom"];
var expFolder = Folder("~/Desktop/3dpackshotPanels");
!expFolder.exists && expFolder.create();
var expFolderFiles = expFolder.getFiles();
while(expFolderFiles.length){
    expFolderFiles[0].remove();
    expFolderFiles = expFolder.getFiles();
}
var panel2Exp = null , artRect = null, expFile = null, newDoc = null;
var imgCapOpts = new ImageCaptureOptions();
imgCapOpts.resolution = 72;
imgCapOpts.antiAliasing = true;
imgCapOpts.transparency = true;
try {
    for(var i = 0; i < namelst.length; i++){
        panel2Exp = getArtboardwName(theArtboards,namelst[i]);
        // panel2Exp = theArtboards.getByName(namelst[i]);
        artRect = panel2Exp.artboardRect;
        expFile = File(expFolder.fullName + "/" + panel2Exp.name + ".png");
        doc.imageCapture(expFile,artRect,imgCapOpts);        
    }
    newDoc = app.documents.addDocument("A4",docPrest);
    app.activeDocument = newDoc;
    for(var i = 0; i < namelst.length; i++){
        var placeArt = newDoc.placedItems.add();
        var theFiles = expFolder.getFiles("*.png");
        var theFile = getFilewName(theFiles, namelst[i]);
        var rA = theFile.name.split(".")[0];
        rA = rA.substring(rA.search(/(\-|\+)/));
        placeArt.file = theFile;
        if(rA) placeArt.rotate(rA * 1);
    }
}
catch(e){
    alert(e);
}

function getArtboardwName (artboards, name){
    var ln = artboards.length;
    var re = RegExp(name,"i");
    while(ln--){
        if(re.test(artboards[ln].name)){
            return artboards[ln];
        }
    }
}

function getFilewName (files, name){
    var ln = files.length;
    var re = RegExp(name,"i");
    while(ln--){
        if(re.test(files[ln].name)){
            return files[ln];
        }
    }
}