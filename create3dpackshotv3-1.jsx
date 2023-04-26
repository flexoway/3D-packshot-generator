/****************************
* create 3D packshot 
* Created by John Yu
* Ver 0.03
* 2021-10-7
*
* tested with Illustrator CC 2019 2020 2021 *****************************/

#target Illustrator

/*
利用正交投影法，先将顶面坐标绕视觉平面的z轴旋转，再绕视觉平面的x轴旋转，投影得到旋转后的顶面各个顶点的平面坐标值；
根据新的顶面坐标计算正面和侧面的缩放和倾斜参数。
*/
/*********main************/
var Rh,Rv,theta, beita, B0, B1, B2, L, W, theta1, theta2, FDx1, FDy1, LSDx1, LSDy1, e=0



try{
    if (app.documents.length >0 && app.documents[0].placedItems.length == 6){
        var Doc = app.activeDocument;
        //app.executeMenuCommand("selectall");
        //app.executeMenuCommand("copy")
        //app.executeMenuCommand("Fit Artboard to artwork bounds");
        //$.writeln(Doc.visibleBounds);
        //$.writeln(Doc.views[0].bounds);
        var pArr = [];
        for (i=5;i>=0;i--){
            var file = Doc.placedItems[i].file;
            pArr.push(file);
        } 
        //$.writeln(pArr);
        var win = new Window("dialog"); 
            win.text = "Create 3D PackShot";
        var group1 = win.add("group");
        group1.add("statictext", undefined, "H Rotation:(0~360)");
        var input1 = group1.add("editText", undefined, "15");
            input1.characters = 4;
            input1.active = true;
            input1.onChange = function () {Rh = input1.text;}
        var group2 = win.add("group");
        group2.add("statictext", undefined, "V Rotation:(0~180)");
        var input2 = group2.add("editText", undefined, "80");
            input2.characters = 4;
            input2.active = true;
            input2.onChange = function () {Rv = input2.text;}
        win.add("statictext",undefined,"Export format:");
        var group4 = win.add("group");
            group4.add("statictext",undefined,".png");
        var checkbox1 = group4.add("checkbox");
            group4.add("statictext",undefined,".psd");
        var checkbox2 = group4.add("checkbox");
        var group3 = win.add("group");
        var button1 = group3.add("button", undefined, "OK");
        var button2 = group3.add("button", undefined, "Cancel");
        var button3 = group3.add("button", undefined, "Export...");

            win.add("statictext", undefined, "©2021 flexoway.design");
            button3.onClick = function (){
                if(checkbox2.value == true){
                    var exportOptions = new ExportOptionsPhotoshop();
                    var type = ExportType.PHOTOSHOP;
                    var fileSpec = new File("~/Desktop/"+ Doc.name + "-3D_" + theta + "x" + beita + ".psd");
                    exportOptions.resolution = 350;
                    exportOptions.writelayers = true;
                    Doc.exportFile(fileSpec, type, exportOptions);
                    if(e==0){alert("done!");}
                }
                if(checkbox1.value == true){
                    var exportOptions = new ExportOptionsPNG24();
                    var type = ExportType.PNG24;
                    var fileSpec = new File("~/Desktop/"+ Doc.name + "-3D_" + theta + "x" + beita + ".png");
                    exportOptions.artBoardClipping = true;
                    Doc.exportFile(fileSpec, type, exportOptions);
                    if(e==0){alert("done!");}
                }
                else{alert("Please select format to export!");}

            }
            button2.onClick = function (){
                win.close();
            }
            
            button1.onClick = function (){
                Doc.placedItems.removeAll();
                for(i=0;i<6;i++){
                    pArt = Doc.placedItems.add();
                    pArt.file = pArr[i];
                }
                
                theta = input1.text;
                beita = input2.text;
                var t = Doc.placedItems[5]; //top panel
                var f = Doc.placedItems[4]; //front panel
                var s = Doc.placedItems[3]; //side panel
                var ls = Doc.placedItems[2];//left panel
                var bk = Doc.placedItems[1];//back panel
                var bt = Doc.placedItems[0];//bottom panel
                var h = f.height;
                var h2 = h * Math.sin(beita*Math.PI/180);
                L = f.width;
                W = t.height;
                B1 = L * Math.sin(theta*Math.PI/180) * Math.cos(beita*Math.PI/180);
                B2 = W * Math.cos(theta*Math.PI/180) * Math.cos(beita*Math.PI/180);
                theta1 = Math.atan2(B1,L*Math.cos(theta*Math.PI/180));
                theta2 = Math.atan2(B2,W*Math.sin(theta*Math.PI/180));
                FDx1 = W * Math.sin(theta*Math.PI/180);
                FDy1 = B2;
                LSDx1 = -L * Math.cos(theta*Math.PI/180);
                LSDy1 = B1;
                
                fit_top(f, t);
                fit_bottom(bt, t);
                fit_side(f, s, t);
                fit_left(f, ls, t);
                fit_back(bk, f);
                flip_back(bk);
                flip_bottom(bt);
                flip_left(ls);
                align_top (f, t);
                align_side (f, s);
                align_back(f, bk);
                align_bottom(f, bt);
                align_left(f, ls);
                transform_top_bottom(t,bt,theta,beita);
                transform_front_back(f,bk,theta,beita,theta1);
                transform_side_left(s,ls,theta,beita,theta2);
                move_back(bk,FDx1,FDy1);
                move_left(ls,LSDx1,LSDy1);
                move_bottom (bt,h2);
                if(theta>=0 && theta<90){
                    ls.hidden = true;
                    bk.hidden = true;
                }
                if(theta>=90 && theta<180){
                    ls.hidden = true;
                    f.hidden = true;
                }
                if(theta>=180 && theta<270){
                    s.hidden = true;
                    f.hidden = true;
                }
                if(theta>=270 && theta<360){
                    bk.hidden = true;
                    s.hidden = true;
                }
                if(beita<90){
                    bt.hidden = true;
                }
                if(beita>90){
                    t.hidden = true;
                }
                //create_Shadow_Style ();
                //var g=Doc.graphicStyles.length;
                //Doc.graphicStyles[1].applyTo(bt);
                
                var thiszoom = Doc.views[0].zoom;
                var bound1 = Doc.visibleBounds;
                var bound2 = Doc.views[0].bounds;
                var b1H = bound1[1]-bound1[3];
                var b2H = bound2[1]-bound2[3];
                var b1W = bound1[2]-bound1[0];
                var b2W = bound2[2]-bound2[0];
                var c1 = [b1W/2+bound1[0],bound1[1]-b1H/2];
                if(b1H>=b1W){
                    Doc.views[0].zoom = thiszoom * (b2H/b1H);    
                }
                if(b1H<b1W){
                    Doc.views[0].zoom = thiszoom * (b2W/b1W);
                }
                
                Doc.views[0].centerPoint = c1;
                
                app.redraw();
                app.executeMenuCommand("Fit Artboard to artwork bounds");

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
catch(e){
    alert(e);
    }



/*******functions***********/


function flip_bottom(bottom){
    var myT = new Matrix();
    myT = getTranslationMatrix();
    myT.mValueD = -1;
    bottom.transform(myT,true,true,true,true,0);
}

function flip_back(back){
    var myT = new Matrix();
    myT = getTranslationMatrix();
    myT.mValueA = -1;
    back.transform(myT,true,true,true,true,0);
}

function flip_left(left){
    var myT = new Matrix();
    myT = getTranslationMatrix();
    myT.mValueA = -1;
    left.transform(myT,true,true,true,true,0);
}

function fit_top(front, top){
    top_w_new = top.width - (top.width - front.width);
    var scaleX = 100 * top_w_new / top.width;
    top.resize(scaleX,100);
}

function fit_bottom(bottom, top){
    bottom_w_new = bottom.width - (bottom.width - top.width);
    bottom_h_new = bottom.height - (bottom.height - top.height);
    var scaleX = 100 * bottom_w_new / bottom.width;
    var scaleY = 100 * bottom_h_new / bottom.height;
    bottom.resize(scaleX,scaleY);
}

function fit_back(back, front){
    back_w_new = back.width - (back.width - front.width);
    back_h_new = back.height - (back.height - front.height);
    var scaleX = 100 * back_w_new / back.width;
    var scaleY = 100 * back_h_new / back.height;
    back.resize(scaleX,scaleY);
}

function fit_side(front, side, top){
    side_h_new = side.height - (side.height - front.height);
    side_w_new = side.width - (side.width - top.height);
    var scaleX = 100 * side_w_new / side.width;
    var scaleY = 100 * side_h_new / side.height;
    side.resize(scaleX,scaleY);
}

function fit_left(front,left,top){
    left_h_new = left.height - (left.height - front.height);
    left_w_new = left.width - (left.width - top.height);
    var scaleX = 100 * left_w_new / left.width;
    var scaleY = 100 * left_h_new / left.height;
    left.resize(scaleX,scaleY);
}

function align_top(front, top){
    var offsetX = front.position[0] - top.position[0];
    var offsetY = front.position[1] - top.position[1] + top.height;
    top.translate(offsetX,offsetY);
}

function align_bottom(front, bottom){
    var offsetX = front.position[0] - bottom.position[0];
    var offsetY = front.position[1] - bottom.position[1] + bottom.height;
    bottom.translate(offsetX,offsetY);
}

function align_side(front, side){
    var offsetX = front.position[0] - side.position[0] + front.width;
    var offsetY = front.position[1] - side.position[1];
    side.translate(offsetX,offsetY);
}

function align_left(front, left){
    var offsetX = front.position[0] - left.position[0] + front.width;
    var offsetY = front.position[1] - left.position[1];
    left.translate(offsetX,offsetY);
}

function align_back(front,back){
    var offsetX = front.position[0] - back.position[0];
    var offsetY = front.position[1] - back.position[1];
    back.translate(offsetX,offsetY);
}

function transform_top_bottom(top,bottom,a,b){
    var myRT = app.getRotationMatrix(-a);
    var myT = app.concatenateScaleMatrix(myRT,100,100*Math.cos(b*Math.PI/180))
    top.transform(myT,true,true,true,true,0,Transformation.BOTTOMRIGHT);
    bottom.transform(myT,true,true,true,true,0,Transformation.BOTTOMRIGHT);
}

function transform_front_back(front,back,a,b,th1){
    var myST = app.getScaleMatrix(100*Math.cos(a*Math.PI/180),100*Math.sin(b*Math.PI/180));
    var mysT = new Matrix();
    mysT = getTranslationMatrix();
    mysT.mValueB = Math.tan(-th1);
    var myT = app.concatenateMatrix(myST,mysT);
    front.transform(myT,true,true,true,true,0,Transformation.TOPRIGHT);
    back.transform(myT,true,true,true,true,0,Transformation.TOPRIGHT);
}

function transform_side_left(side,left,a,b,th2){
    var myST = app.getScaleMatrix(100*Math.sin(a*Math.PI/180),100*Math.sin(b*Math.PI/180));
    var mysT = new Matrix();
    mysT = app.getTranslationMatrix();
    mysT.mValueB = Math.tan(th2);
    var myT = app.concatenateMatrix(myST,mysT);
    side.transform(myT,true,true,true,true,0,Transformation.TOPLEFT);
    left.transform(myT,true,true,true,true,0,Transformation.TOPLEFT);
}
function move_bottom(bottom,h){
    bottom.translate(0,-h);
}

function move_back(back,Dx,Dy){
    back.translate(Dx,Dy);
}

function move_left(left,Dx,Dy){
    left.translate(Dx,Dy);
}