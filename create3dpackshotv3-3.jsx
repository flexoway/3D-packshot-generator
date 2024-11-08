/****************************
* create 3D packshot 
* Created by John Yu
* Ver 0.03
* 2021-10-7
*
* tested with Illustrator CC 2019 2020 2021 *****************************/

#target Illustrator
#include "exportPanelsByArtboard.jsx"
/*
利用正交投影法，先将顶面坐标绕视觉平面的z轴旋转，再绕视觉平面的x轴旋转，投影得到旋转后的顶面各个顶点的平面坐标值；
根据新的顶面坐标计算正面和侧面的缩放和倾斜参数。
*/
/*********main************/
var Rh, Rv, theta = 15, beita = 15, B0, B1, B2, L, W, H, theta1, theta2, FDx1, FDy1, LSDx1, LSDy1, e = 0
var noColor = new NoColor();
var startColor = new GrayColor();
startColor.gray = 0;
var stopColor = new GrayColor();
stopColor.gray = 20;

try {
    if (app.documents.length > 0 && app.documents[0].placedItems.length == 6) {
        var Doc = app.activeDocument;        
        //app.executeMenuCommand("selectall");
        //app.executeMenuCommand("copy")
        //app.executeMenuCommand("Fit Artboard to artwork bounds");
        //$.writeln(Doc.visibleBounds);
        //$.writeln(Doc.views[0].bounds);
        var pArr = [];
        for (i = 5; i >= 0; i--) {
            var file = Doc.placedItems[i].file;
            pArr.push(file);
        }
        //$.writeln(pArr);
        var win = new Window("dialog");
        win.text = "3D FakeShot Generator";
        var button1 = win.add("button", undefined, "Compose a 3D Packshot");
        var checkboxShade = win.add("checkbox", undefined, "Shaded");
        var checkboxGlow = win.add("checkbox", undefined, "Glowing");
        var group1 = win.add("group");
        group1.add("statictext", undefined, "🔁:(0~360)");
        var input1 = group1.add("slider", undefined, 15, 0, 360);
        // input1.characters = 4;
        // input1.active = true;
        // input1.onChange = function () { Rh = input1.text; }
        var group2 = win.add("group");
        group2.add("statictext", undefined, "🔃:(0~180)");
        var input2 = group2.add("slider", undefined, 60, 0, 180);
        // input2.characters = 4;
        // input2.active = true;
        // input2.onChange = function () { Rv = input2.text; }

        win.add("statictext", undefined, "Export format:");
        var group4 = win.add("group");
        var checkbox1 = group4.add("checkbox", undefined, ".png");
        var checkbox2 = group4.add("checkbox", undefined, ".psd");
        var group3 = win.add("group");
        var button2 = group3.add("button", undefined, "Cancel");
        var button3 = group3.add("button", undefined, "Export...");

        win.add("statictext", undefined, "©2021 flexoway.design");
        button3.onClick = function () {
            if (checkbox2.value == true) {
                var exportOptions = new ExportOptionsPhotoshop();
                var type = ExportType.PHOTOSHOP;
                var fileSpec = new File("~/Desktop/" + Doc.name + "-3D_" + theta + "x" + beita + ".psd");
                exportOptions.resolution = 350;
                exportOptions.writelayers = true;
                Doc.exportFile(fileSpec, type, exportOptions);
                if (e == 0) { alert("done!"); }
            }
            if (checkbox1.value == true) {
                var exportOptions = new ExportOptionsPNG24();
                var type = ExportType.PNG24;
                var fileSpec = new File("~/Desktop/" + Doc.name + "-3D_" + theta + "x" + beita + ".png");
                exportOptions.artBoardClipping = true;
                Doc.exportFile(fileSpec, type, exportOptions);
                if (e == 0) { alert("done!"); }
            }
            else { alert("Please select format to export!"); }

        }
        button2.onClick = function () {
            win.close();
        }

        input1.onChange = function () {
            main();
        }

        input2.onChange = function () {
            main();
        }
        button1.onClick = function () {
            main();

        }
        checkboxGlow.onClick = function () {
            var ptln = Doc.groupItems.length;
            if (!ptln) return;
            if (checkboxGlow.value){
                applyGlow();
            }
            else {
                for(var i = 0; i < ptln; i++){
                    Doc.graphicStyles[0].applyTo(Doc.groupItems[i]);
                    if(!Doc.groupItems[i].hidden){
                        Doc.groupItems[i].selected = true;
                        Doc.defaultStrokeColor = noColor;
                        Doc.groupItems[i].selected = false;
                    }
                }
            }
            app.redraw();
        }
        checkboxShade.onClick = function () {
            var ptln = Doc.pathItems.length;
            if(!ptln) return;
            if (checkboxShade.value){
                applyShade();
            }
            else {
                for(var i = 0; i < ptln; i++){
                    Doc.pathItems[i].fillColor = noColor;
                }
            }
            app.redraw();
        }
        win.show();
        /*
        var p = [];
        var pfile = [];
        p.push("Top","Front","right side","left side","back","bottom");
        for(i=0;i<6;i++){
            var file = File.openDialog("please select file of "+ p[i]);
            pfile = pfile.push(file);
            var placeArt = Doc.placedItems.add();
            placeArt.file = pfile[i];
        }
        */
    }
    else {
        alert("please create a new document and place the 6 images !\nimage sequency: top->front->side->left->back->bottom");
    }
}
catch (e) {
    alert(e);
}

function main() {
    Doc.pageItems.removeAll();
    for (var pArt,i = 0; i < 6; i++) {
        pArt = Doc.placedItems.add();
        var rA = pArr[i].name.split(".")[0];
        rA = rA.substring(rA.search(/(\-|\+)/));
        pArt.file = pArr[i];
        pArt.blendingMode = BlendModes.MULTIPLY;
        if(rA) pArt.rotate(rA * 1);
    }

    theta = Math.round(input1.value);
    beita = Math.round(input2.value);

    var t = Doc.placedItems[5]; //top panel
    var f = Doc.placedItems[4]; //front panel
    var s = Doc.placedItems[3]; //side panel
    var ls = Doc.placedItems[2];//left panel
    var bk = Doc.placedItems[1];//back panel
    var bt = Doc.placedItems[0];//bottom panel
    H = f.height;
    var h2 = H * Math.sin(beita * Math.PI / 180);
    L = f.width;
    W = t.height;
    B1 = L * Math.sin(theta * Math.PI / 180) * Math.cos(beita * Math.PI / 180);
    B2 = W * Math.cos(theta * Math.PI / 180) * Math.cos(beita * Math.PI / 180);
    theta1 = Math.atan2(B1, L * Math.cos(theta * Math.PI / 180));
    theta2 = Math.atan2(B2, W * Math.sin(theta * Math.PI / 180));
    FDx1 = W * Math.sin(theta * Math.PI / 180);
    FDy1 = B2;
    LSDx1 = -L * Math.cos(theta * Math.PI / 180);
    LSDy1 = B1;

    var groupTop = Doc.groupItems.add();
    var groupFront = Doc.groupItems.add();
    var groupSright = Doc.groupItems.add();
    var groupLeft = Doc.groupItems.add();
    var groupBack = Doc.groupItems.add();
    var groupBottom = Doc.groupItems.add();

    // top background
    var rectTop = groupTop.pathItems.rectangle(t.top, t.left, t.width, t.height);
    rectTop.fillColor = noColor;
    rectTop.strokeColor = noColor;
    t.move(groupTop, ElementPlacement.INSIDE);
    //front background
    var rectFront = groupFront.pathItems.rectangle(f.top, f.left, f.width, f.height);
    rectFront.fillColor = noColor;
    rectFront.strokeColor = noColor;
    f.move(groupFront, ElementPlacement.INSIDE);
    //right background
    var rectSright = groupSright.pathItems.rectangle(s.top, s.left, s.width, s.height);
    rectSright.fillColor = noColor;
    rectSright.strokeColor = noColor;
    s.move(groupSright, ElementPlacement.INSIDE);
    //left background
    var rectLeft = groupLeft.pathItems.rectangle(ls.top, ls.left, ls.width, ls.height);
    rectLeft.fillColor = noColor;
    rectLeft.strokeColor = noColor;
    ls.move(groupLeft, ElementPlacement.INSIDE);
    //back background
    var rectBack = groupBack.pathItems.rectangle(bk.top, bk.left, bk.width, bk.height);
    rectBack.fillColor = noColor;
    rectBack.strokeColor = noColor;
    bk.move(groupBack, ElementPlacement.INSIDE);
    //bottom background
    var rectBottom = groupBottom.pathItems.rectangle(bt.top, bt.left, bt.width, bt.height);
    rectBottom.fillColor = noColor;
    rectBottom.strokeColor = noColor;
    bt.move(groupBottom, ElementPlacement.INSIDE);

    if (checkboxShade.value){
        applyShade();
    }
    if (checkboxGlow.value) {
        applyGlow();
    }
    fit_top(groupFront, groupTop);
    fit_bottom(groupBottom, groupTop);
    fit_side(groupFront, groupSright, groupTop);
    fit_left(groupFront, groupLeft, groupTop);
    fit_back(groupBack, groupFront);
    flip_back(groupBack);
    flip_bottom(groupBottom);
    flip_left(groupLeft);
    align_top(groupFront, groupTop);
    align_side(groupFront, groupSright);
    align_back(groupFront, groupBack);
    align_bottom(groupFront, groupBottom);
    align_left(groupFront, groupLeft);
    transform_top_bottom(groupTop, groupBottom, theta, beita);
    transform_front_back(groupFront, groupBack, theta, beita, theta1);
    transform_side_left(groupSright, groupLeft, theta, beita, theta2);
    move_back(groupBack, FDx1, FDy1);
    move_left(groupLeft, LSDx1, LSDy1);
    move_bottom(groupBottom, h2);
    if (theta >= 0 && theta < 90) {
        groupLeft.hidden = true;
        groupBack.hidden = true;
    }
    if (theta >= 90 && theta < 180) {
        groupLeft.hidden = true;
        groupFront.hidden = true;
    }
    if (theta >= 180 && theta < 270) {
        groupSright.hidden = true;
        groupFront.hidden = true;
    }
    if (theta >= 270 && theta < 360) {
        groupBack.hidden = true;
        groupSright.hidden = true;
    }
    if (beita < 90) {
        groupBottom.hidden = true;
    }
    if (beita > 90) {
        groupTop.hidden = true;
    }

    var thiszoom = Doc.views[0].zoom;
    var bound1 = Doc.visibleBounds;
    var bound2 = Doc.views[0].bounds;
    var b1H = bound1[1] - bound1[3];
    var b2H = bound2[1] - bound2[3];
    var b1W = bound1[2] - bound1[0];
    var b2W = bound2[2] - bound2[0];
    var c1 = [b1W / 2 + bound1[0], bound1[1] - b1H / 2];
    if (b1H >= b1W) {
        Doc.views[0].zoom = thiszoom * (b2H / b1H) * 0.5;
    }
    if (b1H < b1W) {
        Doc.views[0].zoom = thiszoom * (b2W / b1W) * 0.5;
    }

    Doc.views[0].centerPoint = c1;

    app.redraw();
    app.executeMenuCommand("Fit Artboard to artwork bounds");

}


/*******functions***********/


function flip_bottom(bottom) {
    var myT = new Matrix();
    myT = getTranslationMatrix();
    myT.mValueD = -1;
    bottom.transform(myT, true, true, true, true, 0);
}

function flip_back(back) {
    var myT = new Matrix();
    myT = getTranslationMatrix();
    myT.mValueA = -1;
    back.transform(myT, true, true, true, true, 0);
}

function flip_left(left) {
    var myT = new Matrix();
    myT = getTranslationMatrix();
    myT.mValueA = -1;
    left.transform(myT, true, true, true, true, 0);
}

function fit_top(front, top) {
    top_w_new = top.width - (top.width - front.width);
    var scaleX = 100 * top_w_new / top.width;
    top.resize(scaleX, 100);
}

function fit_bottom(bottom, top) {
    bottom_w_new = bottom.width - (bottom.width - top.width);
    bottom_h_new = bottom.height - (bottom.height - top.height);
    var scaleX = 100 * bottom_w_new / bottom.width;
    var scaleY = 100 * bottom_h_new / bottom.height;
    bottom.resize(scaleX, scaleY);
}

function fit_back(back, front) {
    back_w_new = back.width - (back.width - front.width);
    back_h_new = back.height - (back.height - front.height);
    var scaleX = 100 * back_w_new / back.width;
    var scaleY = 100 * back_h_new / back.height;
    back.resize(scaleX, scaleY);
}

function fit_side(front, side, top) {
    side_h_new = side.height - (side.height - front.height);
    side_w_new = side.width - (side.width - top.height);
    var scaleX = 100 * side_w_new / side.width;
    var scaleY = 100 * side_h_new / side.height;
    side.resize(scaleX, scaleY);
}

function fit_left(front, left, top) {
    left_h_new = left.height - (left.height - front.height);
    left_w_new = left.width - (left.width - top.height);
    var scaleX = 100 * left_w_new / left.width;
    var scaleY = 100 * left_h_new / left.height;
    left.resize(scaleX, scaleY);
}

function align_top(front, top) {
    var offsetX = front.position[0] - top.position[0];
    var offsetY = front.position[1] - top.position[1] + top.height;
    top.translate(offsetX, offsetY);
}

function align_bottom(front, bottom) {
    var offsetX = front.position[0] - bottom.position[0];
    var offsetY = front.position[1] - bottom.position[1] + bottom.height;
    bottom.translate(offsetX, offsetY);
}

function align_side(front, side) {
    var offsetX = front.position[0] - side.position[0] + front.width;
    var offsetY = front.position[1] - side.position[1];
    side.translate(offsetX, offsetY);
}

function align_left(front, left) {
    var offsetX = front.position[0] - left.position[0] + front.width;
    var offsetY = front.position[1] - left.position[1];
    left.translate(offsetX, offsetY);
}

function align_back(front, back) {
    var offsetX = front.position[0] - back.position[0];
    var offsetY = front.position[1] - back.position[1];
    back.translate(offsetX, offsetY);
}

function transform_top_bottom(top, bottom, a, b) {
    var myRT = app.getRotationMatrix(-a);
    var myT = app.concatenateScaleMatrix(myRT, 100, 100 * Math.cos(b * Math.PI / 180))
    top.transform(myT, true, true, true, true, 0, Transformation.BOTTOMRIGHT);
    bottom.transform(myT, true, true, true, true, 0, Transformation.BOTTOMRIGHT);
}

function transform_front_back(front, back, a, b, th1) {
    var myST = app.getScaleMatrix(100 * Math.cos(a * Math.PI / 180), 100 * Math.sin(b * Math.PI / 180));
    var mysT = new Matrix();
    mysT = getTranslationMatrix();
    mysT.mValueB = Math.tan(-th1);
    var myT = app.concatenateMatrix(myST, mysT);
    front.transform(myT, true, true, true, true, 0, Transformation.TOPRIGHT);
    back.transform(myT, true, true, true, true, 0, Transformation.TOPRIGHT);
}

function transform_side_left(side, left, a, b, th2) {
    var myST = app.getScaleMatrix(100 * Math.sin(a * Math.PI / 180), 100 * Math.sin(b * Math.PI / 180));
    var mysT = new Matrix();
    mysT = app.getTranslationMatrix();
    mysT.mValueB = Math.tan(th2);
    var myT = app.concatenateMatrix(myST, mysT);
    side.transform(myT, true, true, true, true, 0, Transformation.TOPLEFT);
    left.transform(myT, true, true, true, true, 0, Transformation.TOPLEFT);
}
function move_bottom(bottom, h) {
    bottom.translate(0, -h);
}

function move_back(back, Dx, Dy) {
    back.translate(Dx, Dy);
}

function move_left(left, Dx, Dy) {
    left.translate(Dx, Dy);
}

function createInnerglowStyle() {
    // var doc = app.activeDocument;
    var actionString = """/version 3
/name [ 21
    63726561746564726f70736861646f777374796c65
]
/isOpen 1
/actionCount 1
/action-1 {
    /name [ 11
        736861646f777374796c65
    ]
    /keyIndex 0
    /colorIndex 0
    /isOpen 1
    /eventCount 4
    /event-1 {
        /useRulersIn1stQuadrant 0
        /internalName (ai_plugin_rectTool)
        /localizedName [ 14
            52656374616e676c6520546f6f6c
        ]
        /isOpen 1
        /isOn 1
        /hasDialog 1
        /showDialog 0
        /parameterCount 6
        /parameter-1 {
            /key 1953460076
            /showInPalette -1
            /type (integer)
            /value 15
        }
        /parameter-2 {
            /key 2003072104
            /showInPalette -1
            /type (unit real)
            /value 131.9444444444
            /unit 592476268
        }
        /parameter-3 {
            /key 1751607412
            /showInPalette -1
            /type (unit real)
            /value 109.7222222222
            /unit 592476268
        }
        /parameter-4 {
            /key 1668182644
            /showInPalette -1
            /type (boolean)
            /value 0
        }
        /parameter-5 {
            /key 1668183128
            /showInPalette -1
            /type (unit real)
            /value 195.1388888889
            /unit 592476268
        }
        /parameter-6 {
            /key 1668183129
            /showInPalette -1
            /type (unit real)
            /value -337.1944444444
            /unit 592476268
        }
    }
    /event-2 {
        /useRulersIn1stQuadrant 0
        /internalName (adobe_commandManager)
        /localizedName [ 16
            416363657373204d656e75204974656d
        ]
        /isOpen 0
        /isOn 1
        /hasDialog 0
        /parameterCount 2
        /parameter-1 {
            /key 1769238125
            /showInPalette 4294967295
            /type (ustring)
            /value [ 15
                4c69766520496e6e657220476c6f77
            ]
        }
        /parameter-2 {
            /key 1818455661
            /showInPalette 4294967295
            /type (ustring)
            /value [ 27
                4566666563743a205374796c697a653a20496e6e657220476c6f77
            ]
        }
    }
    /event-3 {
        /useRulersIn1stQuadrant 0
        /internalName (ai_plugin_styles)
        /localizedName [ 14
            47726170686963205374796c6573
        ]
        /isOpen 0
        /isOn 1
        /hasDialog 1
        /showDialog 0
        /parameterCount 1
        /parameter-1 {
            /key 1835363957
            /showInPalette -1
            /type (enumerated)
            /name [ 17
                4e65772047726170686963205374796c65
            ]
            /value 1
        }
    }
    /event-4 {
        /useRulersIn1stQuadrant 0
        /internalName (adobe_clear)
        /localizedName [ 5
            436c656172
        ]
        /isOpen 0
        /isOn 1
        /hasDialog 0
        /parameterCount 0
    }
}""";

var f = File("~/Desktop/tempAction.aia");
f.open('w');
f.write(actionString);
f.close();

app.loadAction(f);
app.doScript("shadowstyle","createdropshadowstyle",false);
app.unloadAction("createdropshadowstyle","");
f.remove();

var g = app.activeDocument.graphicStyles.length;
app.activeDocument.graphicStyles[g - 1].name = "3dinnerglow";
return app.activeDocument.graphicStyles[g - 1]
}

function checkStyleGlow(){
    try {
        var styleGlow = app.activeDocument.graphicStyles.getByName("3dinnerglow");
    }
    catch (e) {
        var styleGlow = createInnerglowStyle();
    }
    return styleGlow;
}

function applyGlow(){
    var glow = checkStyleGlow();
    var ptln = app.activeDocument.groupItems.length;
    for(var i = 0; i < ptln; i++){
        glow.applyTo(app.activeDocument.groupItems[i]);
    }
}

function checkShade(){
    try {
        var theShade = app.activeDocument.gradients.getByName("3dshade");
    }
    catch (e) {
        var theShade = app.activeDocument.gradients.add();
        theShade.name = "3dshade";
        theShade.type = GradientType.LINEAR;
        theShade.gradientStops[0].color = startColor;
        theShade.gradientStops[1].color = stopColor;
    }
    var theShadeColor = new GradientColor();
    theShadeColor.gradient = theShade;
    return theShadeColor;
}

function applyShade(){
    var shading = checkShade();
    var ptln = app.activeDocument.pathItems.length;
    for(var i = 0; i < ptln; i++){
        app.activeDocument.pathItems[i].fillColor = shading;
    }
}