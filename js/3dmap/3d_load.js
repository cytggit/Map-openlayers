/*	var cesiumAmap = new Cesium.UrlTemplateImageryProvider({
        url: 'http://webst{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
        credit: new Cesium.Credit('高德地图服务-瓦片地图'),
        subdomains: ['01', '02', '03', '04'],
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        maximumLevel: 18,
        show: false
    });*/
	
	// WMTS
/*	viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({  
	    url: "http://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles",  
		layer: "tdtAnnoLayer",  
	    style: "default",  
	    format: "image/jpeg",  
	    tileMatrixSetID: "GoogleMapsCompatible",  
	    show: false  
	}));*/
	
	// 高德地图服务-路网和区划
/*	viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
        url: 'http://wprd{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7&ltype=11',
        credit: new Cesium.Credit('高德地图服务-路网和区划'),
        subdomains: ['01', '02', '03', '04'],
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        maximumLevel: 18,
        show: false
    }));*/
	// 高德地图服务-瓦片地图
/*	viewer.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider({
        url: 'http://webst{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}',
        credit: new Cesium.Credit('高德地图服务-瓦片地图'),
        subdomains: ['01', '02', '03', '04'],
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        maximumLevel: 18,
        show: false
    }));*/
	// 矢量main
	function load3dData(){
		getEntitiesBackground();
		getEntitiesPolygon();
		getEntitiesPOI();
    }	
	// model main
	function loadModel(){
		getModel();
		getBuildingPOI();
    }	
	
	/*获取background数据*/
	function getEntitiesBackground(){
		var floorLength = featuresBackground.length;
		if(floorLength > 0){
			makeEntitiesBackgrounds();
		}	
	}
	function makeEntitiesBackgrounds(){
		var features = featuresBackground;
		shapeBackgrounds = new Object();
		for(var i=0;i<features.length;i++){
			// background所在建筑
			var featuresBuild = features[i].get('building_id');
			// background所在楼层
			var featuresFloor = features[i].get('floor_id');
			// background的name
			var featuresName = features[i].get('name');
			// background所在高度
			var featuresExtrudedHeight = (featuresFloor-1) * 3;
			var featuresHeight = featuresExtrudedHeight + shapeHeight['999999'];
			// background所在形状
			var geom = features[i].getGeometry().getCoordinates()[0];
			var featuresGeom = [];
			for (var j=0;j<geom.length;j++){
				featuresGeom[2*j] = geom[j][0];
				featuresGeom[2*j+1] = geom[j][1];
			}
			if(!shapeBackgrounds[featuresBuild]){
				shapeBackgrounds[featuresBuild] = new Object();
			}
			if(!shapeBackgrounds[featuresBuild][featuresFloor]){
				shapeBackgrounds[featuresBuild][featuresFloor] = new Array();
			}
			shapeBackgrounds[featuresBuild][featuresFloor].push([featuresExtrudedHeight,featuresHeight,featuresGeom,featuresName]);
		}	
		setEntitiesBackground(shapeBackgrounds[buildingid][floorid]);
	}
	/*获取polygon数据*/
	function getEntitiesPolygon(){
		var featuresLength = featuresPolygon.length;
		if(featuresLength > 0){
			makeEntitiesPolygons();
		}
	}
	function makeEntitiesPolygons(){
		var features = featuresPolygon;
		shapePolygons ={};
		shapePenups = {};
		var FloorNum = 0,PenupFloorNum = {},PenupNum = 0;
		for(var i=0;i<features.length;i++){
			// polygon所在建筑
			var featuresBuild = features[i].get('building_id');
			// polygon所在楼层
			var featuresFloor = features[i].get('floor_id');
			// polygon的featureid
			var featuresFeatureId = features[i].get('feature_id');
			// polygon的name
			var featuresName = features[i].get('name');
			// penup
			if(shapePenups[featuresBuild] == undefined){
				shapePenups[featuresBuild] = {};
				shapePenups[featuresBuild][featuresFloor] = [];
				PenupFloorNum[featuresBuild] = {};
				PenupFloorNum[featuresBuild][featuresFloor] = 0;
			}else if(shapePenups[featuresBuild][featuresFloor] == undefined){
				shapePenups[featuresBuild][featuresFloor] = [];
				PenupFloorNum[featuresBuild][featuresFloor] = 0;
			}
			var featuresPenupDummy = features[i].get('penup');
			var featuresPenup = featuresPenupDummy != null ? featuresPenupDummy.split(",").map(function(item) {
			    var temp = parseInt(item);
			    if (temp === temp) {
			        return temp;
			    } else return item;
			}):'',PenupGeom = {};// 已排序
			// polygon所在高度
			var featuresExtrudedHeight = [];
			//var featuresHeight = [];
			var featuresExtrudedHeightBase = (featuresFloor-1) * 3 + shapeHeight['999999'];
			var featuresHeightBase = featuresExtrudedHeightBase + shapeHeight[featuresFeatureId];
			// polygon所在形状
			var geom = features[i].getGeometry().getCoordinates()[0];
			var featuresGeom = [];
			for (var j=0;j<geom.length;j++){
				featuresGeom[3*j] = geom[j][0];
				featuresGeom[3*j+1] = geom[j][1];
				//featuresGeom[3*j+2] = featuresHeightBase;
				featuresGeom[3*j+2] = featuresExtrudedHeightBase;
				featuresExtrudedHeight[j] = featuresExtrudedHeightBase;
				
				// 根据penup取值
				if(featuresPenup.length > 1){
					if(featuresPenup.indexOf(j) != -1){
						if(featuresPenup.indexOf(j+1) != -1 ){
							if(featuresPenup.indexOf(j-1) == -1 )/*front*/{
								PenupGeom = geom[j];
								PenupGeom.push(featuresExtrudedHeightBase);
							}else{/*middle*/
								PenupGeom.push(geom[j][0]);
								PenupGeom.push(geom[j][1]);
								PenupGeom.push(featuresExtrudedHeightBase);
							}
						}else {
							if(featuresPenup.indexOf(j-1) != -1 )/*later*/{
								PenupGeom.push(geom[j][0]);
								PenupGeom.push(geom[j][1]);
								PenupGeom.push(featuresExtrudedHeightBase);
								shapePenups[featuresBuild][featuresFloor][PenupFloorNum[featuresBuild][featuresFloor]++] = [PenupGeom,featuresName];
							}
						}
					}
				}
			}
			if(shapePolygons[featuresBuild] == undefined){
				shapePolygons[featuresBuild] = {};
				shapePolygons[featuresBuild][featuresFloor] = {};
				shapePolygons[featuresBuild][featuresFloor][featuresFeatureId] = [];
			}else if(shapePolygons[featuresBuild][featuresFloor] == undefined){
				shapePolygons[featuresBuild][featuresFloor] = {};
				shapePolygons[featuresBuild][featuresFloor][featuresFeatureId] = [];
			}else if(shapePolygons[featuresBuild][featuresFloor][featuresFeatureId] == undefined ){
				shapePolygons[featuresBuild][featuresFloor][featuresFeatureId] = [];
			}
			shapePolygons[featuresBuild][featuresFloor][featuresFeatureId].push([featuresExtrudedHeightBase,featuresHeightBase,featuresGeom,featuresName]);
		}	
		setEntitiesPolygon(shapePolygons[buildingid][floorid],shapePenups[buildingid][floorid]);
	}
	/*获取POI数据*/
	function getEntitiesPOI(){
		var floorLength = featuresPoint.length;
		if(floorLength > 0){
			makeEntitiesPOIs();
		}
	}
	function makeEntitiesPOIs(){
		var features = featuresPoint;
		shapePOIs ={};
		var FloorNum = 0,FeatureIdNum = 0;
		for(var i=0;i<features.length;i++){
			// POI所在建筑
			var featuresBuild = features[i].get('building_id');
			// POI所在楼层
			var featuresFloor = features[i].get('floor_id');
			// POI的featureid
			var featuresFeatureId = features[i].get('feature_id');
			// POI的name
			var featuresName = features[i].get('name');
			// POI所在高度
			var featuresExtrudedHeightBase = (featuresFloor-1) * 3 + shapeHeight['999999'];
			var featuresHeightBase = featuresExtrudedHeightBase + shapeHeight[featuresFeatureId];
			// POI所在形状
			var geom = features[i].getGeometry().getCoordinates();
			var featuresGeom = [geom[0],geom[1],featuresHeightBase];
			
			if(shapePOIs[featuresBuild] == undefined){
				shapePOIs[featuresBuild] = {};
				shapePOIs[featuresBuild][featuresFloor] = {};
				shapePOIs[featuresBuild][featuresFloor][featuresFeatureId] = [];
			}else if(shapePOIs[featuresBuild][featuresFloor] == undefined){
				shapePOIs[featuresBuild][featuresFloor] = {};
				shapePOIs[featuresBuild][featuresFloor][featuresFeatureId] = [];
			}else if(shapePOIs[featuresBuild][featuresFloor][featuresFeatureId] == undefined ){
				shapePOIs[featuresBuild][featuresFloor][featuresFeatureId] = [];
			}
			
			shapePOIs[featuresBuild][featuresFloor][featuresFeatureId].push([featuresGeom,featuresName]);
		}	
		// console.log(shapePolygons);
		setEntitiesPOI(shapePOIs[buildingid][floorid]);
	}
	/*作成Locate数据*/
	function makeEntitiesLocate(features){
		shapeLocates = {};
		if(!features.length){
			setEntitiesLocate(undefined);
		}else{
			var FloorNum = 0,FeatureIdNum = 0;
			for(var i=0;i<features.length;i++){
				// Locate所在建筑
				var featuresBuild = features[i].get('building_id');
				// Locate所在楼层
				var featuresFloor = features[i].get('floor_id');
				// Locate属性
				// var featuresName = features[i].get('name');
				var featuresLid = features[i].get('l_id');
				// var featuresHeartRate = features[i].get('heart_rate');
				// var featuresSpb = features[i].get('spb');
				// var featuresDpb = features[i].get('dpb');
				// var featuresSteps = features[i].get('steps');
				// var featuresCategory = features[i].get('category');
				// Locate所在高度
				var featuresExtrudedHeightBase = (featuresFloor-1) * 3 + shapeHeight['999999'];
				var featuresHeightBase = featuresExtrudedHeightBase + shapeHeight['locate'];
				// Locate所在形状
				var geom = features[i].getGeometry().getCoordinates();
				var featuresObjArr = [geom[0],geom[1],featuresHeightBase,featuresLid];
				
				if (modelParent.show){
					if(!shapeLocates[0]){
						shapeLocates[0] = [];
					}
					shapeLocates[0].push(featuresObjArr);
				}else{
					if(shapeLocates[featuresBuild] == undefined){
						shapeLocates[featuresBuild] = {};
						shapeLocates[featuresBuild][featuresFloor] = [];
					}else if(!shapeLocates[featuresBuild][featuresFloor]){
						shapeLocates[featuresBuild][featuresFloor] = [];
					}
					shapeLocates[featuresBuild][featuresFloor].push(featuresObjArr);
				}
				
			}	
			if (modelParent.show){
				setEntitiesLocate(shapeLocates[0]);
			}else{
				setEntitiesLocate(shapeLocates[buildingid][floorid]);
			}
		}
	}