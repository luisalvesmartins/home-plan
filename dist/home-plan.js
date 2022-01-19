const LitElement = Object.getPrototypeOf(
        customElements.get("ha-panel-lovelace")
    );
const html = LitElement.prototype.html;

var Colors={
    Room:"#cccccc",
    RoomText: "#000000",
    RoomPresence: "#fdf99b",
    Door: "#338833",
    DoorWithBlinder: "#338833",
    DoorText: "#226622",
    DoorOpen:"#ff3333",
    DoorWithBlinderOpen: "#ff0000",
    Levels:[
    "#000055",
    "#444400",
    "#880088",
    "#222222",
    "#666666"
    ]
}
    
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
        if (width===null)
            context.lineWidth=10;
        else
            context.lineWidth=width;
        context.moveTo(x,y);
        context.lineTo(x1,y1);
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
    Sensor:function(context,name,sensorType,sensor,size,color,state){
        if (1==0){
            context.font = 'normal bold ' + Limits.ScaleText(size) + "px sans-serif";
            context.textAlign = 'center';
            context.fillStyle=color;
            context.textBaseline="middle";
            context.fillText(name, sensor.x, sensor.y+24);
        }
        if (state===true)
            var iState=1;
        else
            var iState=0;
        var w=Limits.scale*46;
        var w2=w/2;
        var vp=0;
        switch (sensorType) {
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
        context.drawImage(imageIcons, iState*46,vp*46,46,46, sensor.x-w2, sensor.y-w2,w,w);
    },
    Scene:function(context,scene){
        var scaled=Limits.Scale(scene)
        const size=10;
        const color="#000000";
        context.font = 'normal bold ' + Limits.ScaleText(size) + "px sans-serif";
        context.textAlign = 'center';
        context.fillStyle=color;
        context.textBaseline="middle";
        context.fillText(scene.name, scaled.x, scaled.y+Limits.scale*31);
        var vp=5;
        var iState=scene.icon;
        var w=Limits.scale*46;
        var w2=w/2;
        context.drawImage(imageIcons, iState*46,vp*46,46,46, scaled.x-w2, scaled.y-w2,w,w);
    }

}
var Limits={
    xmin:999999,
    ymin:999999,
    xmax:0,
    ymax:0,
    scale:1,

    calc:function(pointList){
        this.xmin=999999;
        this.ymin=999999;
        this.xmax=0;
        this.ymax=0;
        for(var f=0;f<pointList.length;f++){
            this.xmin=Math.min(this.xmin,pointList[f].x);
            this.xmax=Math.max(this.xmax,pointList[f].x);
            this.ymin=Math.min(this.ymin,pointList[f].y);
            this.ymax=Math.max(this.ymax,pointList[f].y);
        }
        const margin=0.05;
        var dx=this.xmax-this.xmin;
        this.xmin=this.xmin-dx*margin;
        this.xmax=this.xmax+dx*margin;
        var dy=this.ymax-this.ymin;
        this.ymin=this.ymin-dy*margin;
        this.ymax=this.ymax+dy*margin;
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
    },
    ScaleRev:function(p){
        return {x: (p.x-20)/Limits.scale+Limits.xmin, y: (p.y-20)/Limits.scale+Limits.ymin};
    },

}

var zoom=0;
var pointList=[];
var lineList=[];
var roomList=[];
var doorList=[];
var sensorList=[];
var sceneList=[];
var imageIcons=new Image();
imageIcons.src="/local/community/home-plan/images.png";

class LamPlan extends LitElement  {
    constructor() {
        super();
        this._ready=false;
        this.AutoZoom=true;
    }
    
    set hass( hass ) {
        this._hass = hass;
        //console.log("HASS changed")
        if ( this._ready ) {
            this.Refresh()
        }
    }

    render(){
        console.info("render()")
    
        this._ready=true;
        return html`
            <div style="background-color: white;padding:2px;">
                <button @click="${() => { this._zoomin(); }}">+</button>
                <button @click="${() => { this._zoomout(); }}">-</button>
                <button @click="${() => { this.AutoZoom=true;this.Refresh(); }}">A</button>
                <button @click="${() => { this.AutoZoom=false;this._Scale('V'); }}">V</button>
                <button @click="${() => { this.AutoZoom=false;this._Scale('H'); }}">H</button>
            </div>
            <div id="hp_outside" style="width:100%;height:100%;overflow: auto;">
                <canvas id="hp_canvas" width="200px" height="200px" @mouseup="${(e) => { this._mup(e); }}"></canvas>
            </div>`;
    }
    
    _zoomin(){
        Limits.scale=Limits.scale+.25;
        this.AutoZoom=false;
        this.Refresh();
    }
    _zoomout(){
        Limits.scale=Limits.scale-.25;
        this.AutoZoom=false;
        this.Refresh();
    }
    _Scale(mode){
        var outside = this.shadowRoot.getElementById("hp_outside");
        if (mode=='V'){
            var sy=(Limits.ymax-Limits.ymin)/(document.documentElement.clientHeight-100);
            var sx=sy*1.1;
            Limits.scale=1/sx;
        }else
        {
            var sx=(Limits.xmax-Limits.xmin)/(outside.offsetWidth);
            var sx=sx*1.1;
            Limits.scale=1/sx;
        }
        this.Refresh();
    }

    Refresh(){
        //console.info("Refreshing")
        Limits.calc(pointList);

        var canvas = this.shadowRoot.getElementById("hp_canvas");
        var outside = this.shadowRoot.getElementById("hp_outside");
        var context = canvas.getContext("2d");
        
        if (zoom!=0 && this.AutoZoom)
        {
            Limits.scale=zoom;
            console.log("Force Zoom:", zoom)
        }
        else
            if (this.AutoZoom){
                canvas.width  = "100px";
                canvas.height = "100px"; 
                
                var sx=(Limits.xmax-Limits.xmin)/(outside.offsetWidth);
                var sy=(Limits.ymax-Limits.ymin)/(document.documentElement.clientHeight-100);
                var sx=Math.max(sx,sy)*1.1;
                Limits.scale=1/sx;
            }
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
            roomList[g].presence=false;
            if (roomList[g].entities){
                for (var f=0;f<roomList[g].entities.length;f++){
                    if (this._hass.states[roomList[g].entities[f]].state=="on")
                        roomList[g].presence=true;
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
        
        //SENSORS
        for (var f=0;f<sensorList.length;f++){
            var w=Limits.Scale(sensorList[f]);
            if (sensorList[f].entityId)
            {
                var state=this._hass.states[sensorList[f].entityId];
                switch (sensorList[f].type)
                {
                    case "Light":
                        if (state.state=="on")
                            sensorList[f].state=true;
                        else
                            sensorList[f].state=false;
                        
                        break;
                    case "Motion":
                        if (state.state=="on")
                            sensorList[f].state=true;
                        else
                            sensorList[f].state=false;
                        
                        break;
                    case "Door":
                        if (state.state=="on")
                            sensorList[f].state=true;
                        else
                            sensorList[f].state=false;
                        break;
                    case "Flood":
                        if (state.state=="on")
                            sensorList[f].state=true;
                        else
                            sensorList[f].state=false;
                        break;
                    case "Blinder":
                        if (state.state=="on")
                            sensorList[f].state=true;
                        else
                            sensorList[f].state=false;
                        break;
    
//OUTROS AQUI: Lux
                }
                //console.log(sensorList[f].entityId +"|" + sensorList[f].state + "   >" + JSON.stringify(state))
            }
            Draw.Sensor(context,sensorList[f].name, sensorList[f].type, w, 10,"#000000",sensorList[f].state);
        }
        //Scene
        for (var f=0;f<sceneList.length;f++){
            Draw.Scene(context,sceneList[f]);
        }

    }


    static get properties() {
        return {
            // All handle internally
        }
    }
    
    updated(_changedProperties) {
      this.Refresh();
    }
    
    getCardSize() {
        return 10
    }    

  // The user supplied configuration. Throw an exception and Lovelace will
  // render an error card.
  setConfig(config) {
    if (config.zoom)
    {
        zoom=config.zoom;
    }
    else
        zoom=0;
    var home=JSON.parse(JSON.stringify(config.plan));
    pointList=home.pointlist;
    lineList=home.lineList;
    roomList=home.roomList;
    doorList=home.doorList;
    sensorList=home.sensorList;
    sceneList=home.sceneList;
    if (!pointList)
    pointList=[];
    if (!lineList)
        lineList=[];
    if (!roomList)
        roomList=[];
    if (!doorList)
        doorList=[];
    if (!sensorList)
        sensorList=[];
    if (!sceneList)
        sceneList=[];

    Limits.scale=.5;

    if (!config.entities) {
      throw new Error('You need to define entities');
    }
    this.config = config;
    
    console.log("ENTITIES")
    for(var f=0;f<this.config.entities.length;f++)
    {
        var entityId = this.config.entities[f].id;
        var entityLocation = this.config.entities[f].location;
        var entitySensor = this.config.entities[f].sensor;
        var scene = this.config.entities[f].scene;

        if (scene!=null){
            //scene+sceneButton
            var sceneButton = this.config.entities[f].sceneButton;
            var sc=sceneList.findIndex(s=>s.name==sceneButton);
            //console.log("scene:" + sceneButton + ">" + sc)
            if (sc>=0){
                sceneList[sc].scene=scene;
            }
        }
        else
        {
            if (entityLocation!=null){
                var ri=roomList.findIndex(r=>r.room==entityLocation);
                if (ri>=0){
                    if (roomList[ri].entities)
                        roomList[ri].entities.push(entityId);
                    else
                        roomList[ri].entities=[entityId];
                }
            }
            else
            {
                if (entitySensor!=null){
                    var ri=sensorList.findIndex(r=>r.name==entitySensor);
                    if (ri>=0){
                        if (sensorList[ri].entityId){
                            console.log("WARNING: entity assigned to sensor already assigned -" + sensorList[ri].entityId + " to " + entitySensor)
                        }
                        else
                            sensorList[ri].entityId=entityId;
                    }
                }
            }
        }
    }
    
    
    
  }


    static getConfigElement() {
        return document.createElement("home-plan");
    }

    static getStubConfig() {
        return { entities: [{ id:"sun.sun", sensor:"SensorName"}], 
                title: "myPlan", 
                Plan:[] }
    }

    _blinder(entityId,direction){
        var service="stop_cover";
        switch (direction) {
            case "up":
                service="open_cover"
                break;
            case "down":
                service="close_cover"
                break;
            case "stop":
                service="stop_cover"
            default:
                break;
        }
        //console.log("blinder", entityId,direction)
        if (entityId){
            this._hass.callService('cover', service, {
                entity_id: entityId
              });        
        }
    }

    _toggle(entityId) {
        this._hass.callService("homeassistant", "toggle", {
             entity_id: entityId
        });
        // MANUAL MODE
        // if (this._hass.states[entityId].state=="off"){
        //     this._hass.callService('light', 'turn_on', {
        //       entity_id: entityId
        //     });        
        //     this._hass.states[entityId].state="on";
        // }
        // else
        // {
        //     this._hass.callService('light', 'turn_off', {
        //       entity_id: entityId
        //     });        
        //     this._hass.states[entityId].state="off";
        // }
        this.Refresh();

        return;
      }
    _mup(e) {
        var bcr = this.shadowRoot.getElementById("hp_canvas").getBoundingClientRect();
        var P=Limits.ScaleRev({x:e.clientX-bcr.x,y:e.clientY-bcr.y})
        var p=-1;
        var dxmin=9999999;
        for(var f=0;f<sensorList.length;f++)
        {
            var dx=(P.x-sensorList[f].x)*(P.x-sensorList[f].x)+(P.y-sensorList[f].y)*(P.y-sensorList[f].y);
            if (dx<dxmin){
                dxmin=dx;
                p=f;
            }
        }
        var scene=false;
        for(f=0;f<sceneList.length;f++){
            var dx=(P.x-sceneList[f].x)*(P.x-sceneList[f].x)+(P.y-sceneList[f].y)*(P.y-sceneList[f].y);
            if (dx<dxmin){
                dxmin=dx;
                p=f;
                scene=true;
            }
        }
        if (scene){
            console.log("activate:" + sceneList[p].scene)
            this._hass.callService('scene', 'turn_on', {entity_id: sceneList[p].scene});        
        }
        else
            if (p!=-1){
                if (sensorList[p].type=="Blinder"){
                    //check if cursor above or below midpoint
                    if (P.y<sensorList[p].y)
                        this._blinder(sensorList[p].entityId,"up")
                    else
                        if (Math.abs(P.y-sensorList[p].y)<15)
                            this._blinder(sensorList[p].entityId,"stop")
                        else
                            this._blinder(sensorList[p].entityId,"down")
                }
                else{
                    console.log("TOGGLE:" + sensorList[p].entityId);
                    this._toggle(sensorList[p].entityId);
                }
            }
    };

 
 }
console.info("%c   HOME-PLAN  \n%c Version 1.0.0 ", "color: orange; font-weight: bold; background: black", "color: white; font-weight: bold; background: dimgray");

customElements.define('home-plan', LamPlan);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "home-plan",
  name: "Home Plan",
  description: "Make your own visual home plan" 
});
