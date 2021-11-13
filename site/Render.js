var Draw={
    Point:function(context,x,y,r,color,fillColor){
        if (!color)
            color="black"
        context.beginPath();
        context.strokeStyle=color;
        context.arc(x,y,r,0,2*Math.PI);
        if (fillColor){
            context.fillStyle=fillColor;
            context.fill();
        }
        else
            context.stroke();
    },
    Line:function(context,x,y,x1,y1,color,width){
        if (!color)
            color="black"
        context.beginPath();
        context.strokeStyle=color;
        if (width==null)
            context.lineWidth=10;
        else
            context.lineWidth=width;
        context.moveTo(x,y);
        context.lineTo(x1,y1);
        context.stroke();
        context.lineWidth=1;
    },
    convert:function(x,y){
        //x=(x-xmin)/(xmax-xmin)*ConvertParams.size*proportion;
        //y=(y-ymin)/(ymax-ymin)*ConvertParams.size;
        //x=(x-xmin)*ConvertParams.size;
        //y=(y-ymin)*ConvertParams.size;
        var a=ConvertParams.angle;
        var cos=Math.cos(a);
        var sin=Math.sin(a);
        var x1=(x-xmin)*cos+(y-ymin)*sin+xmin;
        var y1=(y-ymin)*cos-(x-xmin)*sin+ymin;
        var x1=x1*ConvertParams.size;
        var y1=y1*ConvertParams.size;
        y1=y1/2;
        x1=x1+ConvertParams.dx;
        y1=y1+ConvertParams.dy;
        return {x:x1,y:y1}
    },
    Point3D:function(x,y,r,color,fillColor){
        var p=Draw.convert(x,y);
        x=p.x;
        y=p.y;
        if (!color)
            color="black"
        context.beginPath();
        context.strokeStyle=color;
        context.arc(x,y,r,0,2*Math.PI);
        if (fillColor){
            context.fillStyle=fillColor;
            context.fill();
        }
        else
            context.stroke();
    },
    Line3D:function(x,y,x1,y1,color){
        var p=Draw.convert(x,y);
        x=p.x;
        y=p.y;
        var p=Draw.convert(x1,y1);
        x1=p.x;
        y1=p.y;

        var wallHeight=ConvertParams.wallHeight*ConvertParams.size;


        if (!color)
            color="black"
        context.beginPath();
        context.globalAlpha=0.5
        context.strokeStyle=color;
        //context.lineWidth=10;
        context.moveTo(x,y);
        context.lineTo(x1,y1);

        context.lineTo(x1,y1-wallHeight);
        context.lineTo(x,y-wallHeight);
        context.lineTo(x,y);
        context.fillStyle="#ffffff"
        context.fill();
        context.stroke();
        context.lineWidth=1;
    },
    Text:function(context,text,center,size,color){
        context.font = 'normal bold ' + Limits.ScaleText(size) + "px sans-serif";
        context.textAlign = 'center';
        context.fillStyle=color;
        context.textBaseline="middle";
        context.fillText(text, center.x, center.y);
    },
    Sensor:function(context,sensor,size,color,state){
        context.font = 'normal bold ' + Limits.ScaleText(size) + "px sans-serif";
        context.textAlign = 'center';
        context.fillStyle=color;
        context.textBaseline="middle";
        context.fillText(sensor.name, sensor.x, sensor.y+31);
        if (state==true)
            var iState=1;
        else
            var iState=0;
        var vp=0;
        switch (sensor.type) {
            case "Light":
                vp=0;
                break;
            case "Motion":
                vp=2;
                break;
            case "Lux":
                vp=4;
                break;
            case "Flood":
                vp=3;
                break;
            case "Door":
                vp=1;
                break;
            case "Blinder":
                vp=6;
                break;
            default:
                break;
        }
        context.drawImage(imageIcons, iState*46,vp*46,46,46, sensor.x-22, sensor.y-22,46,46);
    },
    Scene:function(context,scene){
        const size=10;
        const color="#000000";
        context.font = 'normal bold ' + Limits.ScaleText(size) + "px sans-serif";
        context.textAlign = 'center';
        context.fillStyle=color;
        context.textBaseline="middle";
        context.fillText(scene.name, scene.x, scene.y+31);
        var vp=5;
        var iState=scene.icon;
        context.drawImage(imageIcons, iState*46,vp*46,46,46, scene.x-22, scene.y-22,46,46);
    }

}

var GeometryMath={
    sqr:function(x) {
        return x * x;
    },
    
    p2p_2:function(p, q) {
        return this.sqr(p.x - q.x) + this.sqr(p.y - q.y);
    },
    
    closest:function(p, u, v) {
        var len_2 = this.p2p_2(u, v);
        if (len_2 === 0) {
            return u; // u === v so it does not matter which is returned
        }
        var t = (
            (p.x - u.x) * (v.x - u.x) +
            (p.y - u.y) * (v.y - u.y)
        ) / len_2;
        // first endpoint is the closest
        if (t < 0) {
            return {x:u.x,y:u.y};
        }
        // last endpoint is the closest
        if (t > 1) {
            return {x:v.x,y:v.y};
        }
        // calculate the closest point
        return {x: u.x + t * (v.x - u.x),
            y:u.y + t * (v.y - u.y)
        };
    }
    
}

var Limits={
    xmin:999999,
    ymin:999999,
    xmax:0,
    ymax:0,
    scale:1,

    calc:function(pointList){
        for(var f=0;f<pointList.length;f++){
            this.xmin=Math.min(this.xmin,pointList[f].x);
            this.xmax=Math.max(this.xmax,pointList[f].x);
            this.ymin=Math.min(this.ymin,pointList[f].y);
            this.ymax=Math.max(this.ymax,pointList[f].y);
        }
    },
    Scale:function(p){
        var x=(p.x-Limits.xmin)*Limits.scale+20;
        var y=(p.y-Limits.ymin)*Limits.scale+20;
        return {x:x,y:y}
    },
    Scale2:function(p){
        var p0=Limits.Scale({x:p.x,y:p.y});
        var p1=Limits.Scale({x:p.x1,y:p.y1});
        return {x:p0.x,y:p0.y,x1:p1.x,y1:p1.y};
    },
    ScaleText:function(v){
        var t=v*Limits.scale;
        if (t<7)
            t=7;
        return t;
    }
}

function Refresh2(canvasId){
    console.info("Refreshing")

    roomList[2].presence=true;
    doorList[3].open=true;
    doorList[20].open=true;
    
    Limits.calc(pointList);

    //var canvas = this.shadowRoot.getElementById(canvasId);
    var canvas = document.getElementById(canvasId);
    var context = canvas.getContext("2d");
    canvas.width  = Limits.xmax;
    canvas.height = Limits.ymax; 


    context.clearRect(0,0,canvas.width,canvas.height);

    var show={
        textArea:true,
        textDoor:true
    }

    //AREAS
    for(var g=0;g<roomList.length;g++){
        var w0=Limits.Scale(roomList[g].points[0]);
        var x0=w0.x;
        var y0=w0.y;
        context.beginPath();
        context.fillStyle=Colors.Room;
        if (roomList[g].entities){
            if (roomList[g].entities.length>0){
                roomList[g].presence=true;
                console.log(roomList[g].entities[0])
                console.log(this._hass.states[roomList[g].entities[0]].state)
            }
        }

        if (roomList[g].presence){
            context.fillStyle=Colors.RoomPresence;
        }
        context.moveTo(x0,y0);
        for(var f=0;f<roomList[g].walls.length;f++){
            var w=Limits.Scale(roomList[g].points[f]);
            var x=w.x;
            var y=w.y;
            context.lineTo(x,y);
        }
        context.lineTo(x0,y0);
        context.fill();
        context.stroke();

        if (show.textArea){
            Draw.Text(context, roomList[g].room, Limits.Scale({x:roomList[g].xc, y:roomList[g].yc}), 20, Colors.RoomText)
        }
        
        
        
    }

    //WALLS
    for(var f=0;f<lineList.length;f++){
        var p0=Limits.Scale(pointList[lineList[f].from])
        var p1=Limits.Scale(pointList[lineList[f].to])
        var l=lineList[f].lvl;
        if (!l)
            l=0;
        else
            l--;
        Draw.Line(context,p0.x,p0.y,p1.x,p1.y,Colors.Levels[l],1)
    }

    //DOORS
    for(var f=0;f<doorList.length;f++){
        var door=Limits.Scale2(doorList[f].points);
        if (doorList[f].blinder){
            var color=Colors.DoorWithBlinder
            if (doorList[f].open)
                color=Colors.DoorWithBlinderOpen;
            if (door.x==door.x1)
            {
                Draw.Line(context,door.x+6,door.y,door.x1+6,door.y1, "#666666",4);
                Draw.Line(context,door.x-6,door.y,door.x1-6,door.y1, "#666666",4);
            }
            else{
                Draw.Line(context,door.x,door.y+6,door.x1,door.y1+6, "#666666",4);
                Draw.Line(context,door.x,door.y-6,door.x1,door.y1-6, "#666666",4);
            }
        }
        else{
            var color=Colors.Door;
            if (doorList[f].open)
                color=Colors.DoorOpen;
        }
        Draw.Line(context,door.x,door.y,door.x1,door.y1, color,5);
        
        if (show.textDoor){
            if (door.x==door.x1)
            {
                var dx=door.x1+Limits.scale*12;
                var dy=(door.y+door.y1)/2;
                var ang=Math.PI/2;
                context.translate(dx,dy);
                context.rotate(ang)
                Draw.Text(context, doorList[f].name, {x:0, y:0}, 10, Colors.DoorText)
                context.setTransform(1,0,0,1,0,0);
            }
            else
            {
                var dx=(door.x+door.x1)/2;
                var dy=(door.y+door.y1)/2-Limits.scale*12;
                Draw.Text(context, doorList[f].name, {x:dx, y:dy}, 10, Colors.DoorText)
            }
        }
    }

}

function Refresh(canvasId){
    context.drawImage(image, 0, 0);

    //AREAS
    for(var g=0;g<roomList.length;g++){
        var w0=roomList[g].points[0];
        roomList[g].presence=false;
        context.beginPath();
        context.fillStyle="#aaaaaaaa";
        context.moveTo(w0.x,w0.y);
        for(var f=0;f<roomList[g].walls.length;f++){
            var w=roomList[g].points[f];
            context.lineTo(w.x,w.y);
        }
        context.lineTo(w0.x,w0.y);
        context.fill();
        context.stroke();

        context.font = 'normal bold 20px sans-serif';
        context.textAlign = 'center';
        context.fillStyle="#000000";
        context.textBaseline="middle";
        context.fillText(roomList[g].room, roomList[g].xc, roomList[g].yc);
    }

    //POINTS
    for(var f=0;f<pointList.length;f++){
        Draw.Point(context,pointList[f].x,pointList[f].y,gridSize);
        if (pointList[f].ref)
        {
            Draw.Point(context,pointList[f].x,pointList[f].y,gridSize*1.5,"#FF0000");
        }
        context.font = 'normal bold 20px sans-serif';
        context.textAlign = 'center';
        context.fillStyle="#000000";
        context.textBaseline="middle";
        //context.fillText(f, pointList[f].x+20, pointList[f].y+20);

        if (!pointList[f].l)
            pointList[f].l=0;
    }

    //WALLS
    for(var f=0;f<lineList.length;f++){
        var x0=pointList[lineList[f].from].x;
        var y0=pointList[lineList[f].from].y;
        var x1=pointList[lineList[f].to].x;
        var y1=pointList[lineList[f].to].y;
        var l=lineList[f].lvl;
        pointList[lineList[f].to].l=l;
        pointList[lineList[f].from].l=l;
        if (!l)
            l=0;
        else
            l--;
        Draw.Line(context,x0,y0,x1,y1,Colors.Levels[l])

        Draw.Point(context,(x0+x1)/2, (y0+y1)/2,gridSize,"#00FF00",Colors.Levels[l]);
    }

    //DOORS
    for(var f=0;f<doorList.length;f++){
        var door=doorList[f].points;
        doorList[f].open=false;
        if (doorList[f].blinder)
            var color="#ff0000"
        else
            var color="#ff6666";
        Draw.Line(context,door.x,door.y,door.x1,door.y1, color);
        
        context.fillStyle="#ff0000";
        context.font = 'normal bold 10px sans-serif';
        context.textAlign = 'center';
        context.textBaseline="middle";
        if (door.x==door.x1)
        {
            var dx=door.x1+12;
            var dy=(door.y+door.y1)/2;
            var ang=Math.PI/2;
        }
        else
        {
            var dx=(door.x+door.x1)/2;
            var dy=(door.y+door.y1)/2-12;
            var ang=0;
        }
        context.translate(dx,dy);
        context.rotate(ang)
        //console.log(doorList[f].name, f, door.x, door.x1,doorList[f])
        context.fillText(doorList[f].name, 0,0);
        context.setTransform(1,0,0,1,0,0);
    }

    //SENSORS
    for (var f=0;f<sensorList.length;f++){
        Draw.Sensor(context,sensorList[f],10,"#000000",sensorList[f].state);
    }
    for (var f=0;f<sceneList.length;f++){
        Draw.Scene(context,sceneList[f]);
    }
    document.getElementById("points").innerHTML=JSON.stringify({pointlist:pointList,lineList:lineList,roomList:roomList,doorList:doorList,sensorList:sensorList, sceneList:sceneList, image:imagem});
}
