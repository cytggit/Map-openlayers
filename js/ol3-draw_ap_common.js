var placeid = '0';
var floorid = '01';// 楼层编号    选择楼层

var mode;
var placeType = 'null';// 区域名称
var locateTimeout;

var DBs = 'mote'; //数据源
var locateIp = 'http://114.215.83.3:8090';
var locateCertainUrl = locateIp + '/LocateServer/getCertainLocation.action';
var comIp = 'http://114.215.83.3:8090';
var APUrl = 'http://114.215.83.3:8091/ConfigServer/getBeacons.action';
var UpdAPUrl = 'http://114.215.83.3:8091/ConfigServer/updateBeacon.action';
var DltAPUrl = 'http://114.215.83.3:8091/ConfigServer/delBeacon.action';

var wfsUrl = comIp + '/geoserver/wfs';
var wmsUrl = comIp + '/geoserver/' + DBs + '/wms';
// 设置中心点
var motecenter = [121.4287933,31.1664993]; 
var zhongbeicenter = [121.407121820159,31.2265797284321]; 
var minhangcenter = [121.457171250547,31.0275850273072]; 
var zhanlancenter = [121.452368605797,31.2253976215524]; 
// 设置视图
var view = new ol.View({
	center: motecenter,
	projection: 'EPSG:4326',
	zoom: 19
});

// 室内图数据获取 	
var geojsonObject = function(viewParams,Typename){
	var geojson;
	$.ajax({
		url: wfsUrl,
		data: {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typename: Typename,
			outputFormat: 'application/json',
			viewparams: viewParams
		},
		type: 'GET',
		dataType: 'json',	
		async: false,
		success: function(response){
			geojson = response;
		}
	});
	// 返回经过条件筛选后的数据
	return geojson; 
};
// 室内图样式设置
var geojsonstylefunction = function(feature){
	// var featureiiiid = feature.I.feature_id;
	var featureiiiid = feature.values_.feature_id;
	var featureangle = feature.values_.angle = null ? 0: feature.values_.angle;
	if (feature.getGeometry().getType() == 'Point'  && (featureiiiid == '30060300' || featureiiiid == '30060000' || featureiiiid == '30040100')){
		// geojsonstyle[featureiiiid].getText().setText(feature.I.name);
		geojsonstyle[featureiiiid].getText().setText(feature.values_.name);
	}
	if (featureiiiid == '30060100' || featureiiiid == '30060200' ){
		if (map.getView().getZoom() > 19){
			geojsonstyle[featureiiiid].getImage().setScale((map.getView().getZoom()-19)*0.1);
		}else {
			geojsonstyle[featureiiiid].getImage().setScale(0.1);
		}
		geojsonstyle[featureiiiid].getImage().setRotation(featureangle);
	}
	if (featureiiiid == '30050100' || featureiiiid == '30050800' || featureiiiid == '30050200' || featureiiiid == '30050300' ){
		if (map.getView().getZoom() > 18){
			geojsonstyle[featureiiiid].getImage().setScale((map.getView().getZoom()-18)*0.06);
		}else {
			geojsonstyle[featureiiiid].getImage().setScale(0.1);
		}
	}
	
	if (featureiiiid == undefined)  {
		var geomType = feature.getGeometry().getType();
		switch(geomType){
			case 'Point':
				return geojsonstyle[30999999];	
				break;
			case 'Polyline':
				console.log(feature);
				return geojsonstyle[20020900];	
				break;
			case 'Polygon':
				return geojsonstyle[10030602];	
				break;			
		}
	}else {
		// 返回数据的style
		return geojsonstyle[featureiiiid];		
	}
};

// ap样式设置
var APStyleFun = function(feature){
	var featureMode = feature.values_.mode ==  undefined ? 11 + mode :  feature.values_.mode + mode;

	// 返回数据的style
	return APStyle[featureMode];
};

// 编辑
var newFeature = null;
var newdrawNum;
var electronicLayerOff = true; // 显示电子围栏的FLAG 当为true时显示电子围栏图层
var drawFlag = false;
var drawtype = null;   // add or upd or rm
var FeatureColumnFlag = false; // 绘制的形状的属性flag
var DrawFeature; // 绘制的interaction  draw
var ModifyFeature; // 修改的interaction  select and modify
var DeleteFeature; // 删除的interaction  select
var FeatureDummy =[]; // 电子围栏的feature 临时存储

// 修改记录
function updateNewFeature(features,featureType,updType){
	var WFSTSerializer = new ol.format.WFS();
    var formatGML = new ol.format.GML({  
		featureNS: 'http://www.' + DBs + '.com',
		featurePrefix: DBs,
        featureType: featureType,
        srsName: 'EPSG:4326',
    }); 	
	var featObject;
	switch (updType) {  
		case 'insert': 
			featObject = WFSTSerializer.writeTransaction(features,null,null,formatGML);
			break;
		case 'update': 
			featObject = WFSTSerializer.writeTransaction(null,features,null,formatGML);
			break;
		case 'remove': 
			featObject = WFSTSerializer.writeTransaction(null,null,features,formatGML);
			break;
	}
	var serializer = new XMLSerializer();
	var featString = serializer.serializeToString(featObject);
	featObjectSend(featString);
	console.log(featString);
}

// 发送操作数据库请求
function featObjectSend(featString){
	var request = new XMLHttpRequest();
	request.open('POST', wfsUrl + '?service=wfs');
	request.setRequestHeader('Content-Type', 'text/xml');
	request.send(featString);		
}

// Draw END
var drawstyle = new ol.style.Style({
    fill: new ol.style.Fill({
		color: 'rgba(255,0, 0, 1)'
    }),
    stroke: new ol.style.Stroke({
		color: '#ffcc33',
		width: 2
    }),
    image: new ol.style.Circle({
		radius: 7,
		fill: new ol.style.Fill({
			color: '#ffcc33'
		})
	}),
	zIndex: 500
});
var drawpointstyle = new ol.style.Style({
    image: new ol.style.Circle({
		radius: 4,
		stroke: new ol.style.Stroke({
			color: '#ffcc33',
			width: 1.5
		}),
		fill: new ol.style.Fill({
			color: '#ffffff'
		})
	}),
	zIndex: 500
});
	
// AP style
var APStyle = {
	'00': new ol.style.Style({
		image: new ol.style.Circle({
			radius: 7,  // 外圈
			fill: new ol.style.Fill({
				color: [255,140,0,1]
			}),
			stroke: new ol.style.Stroke({
				color: [255,140,0,.2]
				width: 1.5
			}),
		}),

		//text: 
		zIndex: 450
	}),
	'01': new ol.style.Style({
		image: new ol.style.Circle({
			radius: 7,  // 外圈
			fill: new ol.style.Fill({
				color: [255,140,0,.3]
			}),
		}),
		//text: 
		zIndex: 450
	}),
	'11': new ol.style.Style({
		image: new ol.style.Circle({
			radius: 7,  // 外圈
			fill: new ol.style.Fill({
				color: '#008CFF'
			}),
		}),
		//text: 
		zIndex: 450
	}),
	'10': new ol.style.Style({
		image: new ol.style.Circle({
			radius: 7,  // 外圈
			fill: new ol.style.Fill({
				color: [0,140,255,.3]
			}),
		}),
		//text: 
		zIndex: 450
	}),
	'110': new ol.style.Style({
		image: new ol.style.Circle({
			radius: 4,
			stroke: new ol.style.Stroke({
				color: '#FF8C00',
				width: 1.5
			}),
			fill: new ol.style.Fill({
				color: '#ffffff'
			})
		}),
		zIndex: 500
	}),
	'111': new ol.style.Style({
		image: new ol.style.Circle({
			radius: 4,
			stroke: new ol.style.Stroke({
				color: '#008CFF',
				width: 1.5
			}),
			fill: new ol.style.Fill({
				color: '#ffffff'
			})
		}),
		zIndex: 500
	})
}

// 定位 style 
var locationStyle = new ol.style.Style({
	image: new ol.style.Icon({
		src: 'http://map.intmote.com/map/icon/location.png',
		scale: 0.3,
		anchor: [0.5,0.5],
	}),
	zIndex: 600
});

// 基础图层style
var geojsonstyle = {
	'999999' : new ol.style.Style({
		fill: new ol.style.Fill({
			color: [200,200,200,1]
		}),
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width:1
		}),
		zIndex: 100
	}),
	/************
	*
	*polygon
	*
	************/
	'10020511'/*公司范围*/: new ol.style.Style({ 
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width:1
		}),
		fill: new ol.style.Fill({
			color: [255,255,255,1]
		}),
		zIndex:101
	}),
	'10020401'/*教室*/: new ol.style.Style({ 
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width:1
		}),
		fill: new ol.style.Fill({
			color: [255,255,255,1]
		}),
		zIndex:101
	}),
	'10030501'/*总经理室*/: new ol.style.Style({ 
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 0.8
		}),
		fill: new ol.style.Fill({
			color: [204,153,255,0.5]
		}),
		zIndex:102
	}),
	'10030502' /*财务室*/: new ol.style.Style({  
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 0.8
		}),
		fill: new ol.style.Fill({
			color: [255,255,204,0.5]
		}),
		zIndex:102
	}),
	'10030504' /*会议室*/: new ol.style.Style({  
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 0.8
		}),
		fill: new ol.style.Fill({
			color: [255,255,204,0.5]
		}),
		zIndex:102
	}),
	'10030505' /*办公桌*/: new ol.style.Style({  
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 1
		}),
		fill: new ol.style.Fill({
			color: [108,94,80,0.8]
		}),
		zIndex: 103
	}),
	'10030101' /*看板*/: new ol.style.Style({  
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 1
		}),
		fill: new ol.style.Fill({
			color: [255,153,204,0.8]
		}),
		zIndex: 103
	}),
	'10030603' /*沙发*/: new ol.style.Style({  
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 1
		}),
		fill: new ol.style.Fill({
			color: [204,204,104,0.8]
		}),
		zIndex: 103
	}),
	'10030606' /*书架*/: new ol.style.Style({  
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 1
		}),
		fill: new ol.style.Fill({
			color: [224,224,224,0.8]
		}),
		zIndex: 103
	}),
	'10030607' /*机柜*/: new ol.style.Style({  
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 1
		}),
		fill: new ol.style.Fill({
			color: [104,104,104,0.8]
		}),
		zIndex: 103
	}),
	'10030608' /*资料架*/: new ol.style.Style({  
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 1
		}),
		fill: new ol.style.Fill({
			color: [204,204,254,0.8]
		}),
		zIndex: 103
	}),
	'10030602' /*卫生间*/: new ol.style.Style({  
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 0.8
		}),
		fill: new ol.style.Fill({
			color: [255,153,204,0.5]
		}),
		zIndex:102
	}),
	'10030604' /*电梯间*/: new ol.style.Style({  
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 0.8
		}),
		fill: new ol.style.Fill({
			color: [180,180,180,0.5]
		}),
		zIndex:102
	}),
	'10030605' /*楼梯间*/: new ol.style.Style({  
		stroke: new ol.style.Stroke({
			color: [128,128,128,0.6],
			width: 0.8
		}),
		fill: new ol.style.Fill({
			color: [204,153,255,0.5]
		}),
		zIndex:102
	}),
	/************
	*
	*polyline
	*
	************/
	'20020900'/*道路*/: new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: [208,128,128,0.6],
			width: 0.8
		}),
		zIndex:200	
	}),
	/************
	*
	*point
	*
	************/
	'30060000' /*公司名*/: new ol.style.Style({  
		text: new ol.style.Text({
			font: '1em sans-serif',
			// scale: 100,
			textAlign: 'center',
			textBaseline: 'bottom',
			offsetY: -5,
			fill: new ol.style.Fill({
				color: [40,40,40,1]
			}),
			stroke: new ol.style.Stroke({
				color: [255,255,255,1],
				width: 3
			})
		}),
		zIndex:350
	}),	
	'30060100' /*工位*/: new ol.style.Style({  
		image: new ol.style.Icon({
			src: './icon/chair_right.png',
			anchor: [0.5,0.5],
			rotateWithView: true
		}),
		zIndex:300
	}),
	'30060200' /*工位*/: new ol.style.Style({  
		image: new ol.style.Icon({
			src: './icon/chair_left.png',
			anchor: [0.5,0.5],
			rotateWithView: true
		}),
		zIndex:300
	}),	
	'30060300' /*会议室&财务室&公共办公区&总经理室*/: new ol.style.Style({  
		text: new ol.style.Text({
			font: '0.61em sans-serif',
			// scale: 100,
			textAlign: 'center',
			textBaseline: 'bottom',
			offsetY: -5,
			fill: new ol.style.Fill({
				color: [40,40,40,1]
			}),
			stroke: new ol.style.Stroke({
				color: [255,255,255,1],
				width: 1
			})
		}),
		zIndex:340
	}),
	'30040100' /*教室*/: new ol.style.Style({  
		text: new ol.style.Text({
			font: '0.61em sans-serif',
			// scale: 100,
			textAlign: 'center',
			textBaseline: 'middle',
			offsetY: -5,
			fill: new ol.style.Fill({
				color: [40,40,40,1]
			}),
			stroke: new ol.style.Stroke({
				color: [255,255,255,1],
				width: 1
			})
		}),
		zIndex:340
	}),
	'30050100' /*卫生间*/: new ol.style.Style({  
		image: new ol.style.Icon({
			src: './icon/wc.png',
		}),
		zIndex:330
	}),	
	'30050200' /*楼梯*/: new ol.style.Style({  
		image: new ol.style.Icon({
			src: './icon/stair.png',
		}),
		zIndex:330
	}),	
	'30050300' /*电梯*/: new ol.style.Style({  
		image: new ol.style.Icon({
			src: './icon/elevator.png',
		}),
		zIndex:330
	}),	
	'30050800' /*大门*/: new ol.style.Style({  
		image: new ol.style.Icon({
			src: './icon/door.png',
		}),
		zIndex:330
	}),	
	
	'30999999' /*绘制 临时*/: new ol.style.Style({  
		image: new ol.style.Circle({
			radius: 4,
			stroke: new ol.style.Stroke({
				color: '#ffcc33',
				width: 1.5
			}),
			fill: new ol.style.Fill({
				color: '#ffffff'
			})
		}),
		zIndex:330
	}),	
	
};


var amapLayer = new ol.layer.Tile({
	title: '高德地图',
	visible: true,
	source: new ol.source.XYZ({
		url: 'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
	}),
	zIndex: 0
});

var viewParam = 'place_id:' + placeid + ';floor_id:' + floorid;
var backgroundTypename = DBs + ':mote_background';
var backgroundLayer = new ol.layer.Vector({
	title: 'background map',
	visible: true,
	// source: new ol.source.Vector({
		// features:  new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,backgroundTypename))
	// }),
	source: new ol.source.Vector(),
	style: geojsonstylefunction,
	maxResolution: 0.00001,
	zIndex: 1
});
// 2D
var polygonTypename = DBs + ':mote_polygon';
var polygonLayer = new ol.layer.Vector({
	title: 'polygon map',
	visible: true,
	// source: new ol.source.Vector({
		// features:  new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,polygonTypename))
	// }),
	source: new ol.source.Vector(),
	style: geojsonstylefunction,
	maxResolution: 0.00001,
	zIndex: 10
});
// 2D
var polylineTypename = DBs + ':mote_polyline';
var roadLayer = new ol.layer.Vector({
	title: 'polyline map',
	visible: true,
	// source: new ol.source.Vector({
		// features:  new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,polylineTypename))
	// }),
	source: new ol.source.Vector(),
	style: geojsonstylefunction,
	maxResolution: 0.00001,
	zIndex: 20
});

var pointTypename = DBs + ':mote_point';
var pointLayer = new ol.layer.Vector({
	title: 'point map',
	visible: true,
	// source: new ol.source.Vector({
		// features:  new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,pointTypename))
	// }),
	source:new ol.source.Vector(),
	style: geojsonstylefunction,
	maxResolution: 0.000003,
	zIndex: 30
});

// 电子围栏图层 	
var electronicLayer = new ol.layer.Vector({
	title: 'electronicFence map',
	visible: true,
	style: APStyleFun,
	source: new ol.source.Vector(),
	zIndex: 80
});		

	// 定位图层 			
var center_wfs = new ol.source.Vector();
var LocationLayer = new ol.layer.Vector({
	title: 'center point',
	visible: true,
	source: center_wfs,
	style: locationStyle,
	zIndex: 60
});	