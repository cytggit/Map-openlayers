
// 确认网址的参数 返回参数值
function checkUrlParam(checkName){
	var checkUrlParams = window.location.search.substr(1)
	
	var reg = new RegExp("(^|&)"+ checkName +"=([^&]*)(&|$)");

	var checkValues = checkUrlParams.match(reg);
	
	if(checkValues!=null){
		var checkValue = unescape(checkValues[2]);  
		if (checkValue != ''){
			checkFlag = true;
			view.setZoom(21);
		}else{
			alert('未设置参数“' + checkName + '”的值');
			checkFlag = false;
		}
	}else {
		alert('未设置参数：' + checkName);
		checkFlag = false;
	} 
	return checkValue;	
}

// 获取定位信息
function getlocation(){	
	// 当deviceId为all的时候，显示所有当前楼层的位置
	var WFSUrl,DATAParam;
	if(deviceId == 'all'){
		WFSUrl = locateCertainUrl;
		DATAParam = {'floor_id':floorid,'place_id':placeid};
	}else{
		WFSUrl = locateUrl;
		DATAParam = {'deviceId':deviceId};
	}
	// 从位置服务器获取定位信息
	$.ajax({
		url: WFSUrl,
		data: DATAParam, 
		type: 'GET',
		dataType: 'jsonp',
		jsonp: 'callback',
		jsonpCallback: 'successCallBack',
		success: function(response){

			var features ;
			if(JSON.stringify(response)!="{}"){
				features = new ol.format.GeoJSON().readFeatures(response);
				
			}else{
				//alert('未获取到定位信息，请检查定位标签状态！');
				var gpsfeature = new ol.Feature();
				
				var gpsCoordinates = [] ;
				// var gpsCoordinates = [121.402541820159,31.2284797284321] ;
				var gpsCoordinates = [121.42308,31.16801] ;

				// navigator.geolocation.getCurrentPosition(function(position) {
					// gpsCoordinates[0] = position.coords.longitude;
					// gpsCoordinates[1]  = position.coords.latitude;
					var newgpsCoordinates = coordtransform.wgs84togcj02(gpsCoordinates[0] ,gpsCoordinates[1] );

					gpsfeature.setGeometry(newgpsCoordinates ?new ol.geom.Point(newgpsCoordinates) : null);
					gpsfeature.set('floor_id','01');
					gpsfeature.set('l_id',deviceId);
					features = [gpsfeature];
					
				// });
			}
			
			//if(features.length){
				doWithLocate(features);
			//}	

		}		
	});
}

function doWithLocate(features){
	var LocateInfo = features;
	var LocateLength = features.length;
	
	if(deviceId != 'all'){
		// 判断是否正在路径规划，做路网吸附
		if(!pathPlanningOFF && RouteLayer != null && RouteLayer.getSource().getFeatures().length > 0){
			var newcenterFearure = pointToLinestring(LocateInfo,RouteLayer.getSource().getFeatures());
			LocateInfo = newcenterFearure;
		}		
		//var beforeLocate = locate;
		locate = LocateInfo[0].getGeometry().getCoordinates(); // 取得位置信息		
		locateFloor = LocateInfo[0].get('floor_id');
		// 切换到定位点所在的区域
		getPlace(locate);
		// 电子围栏预警
		electronicFenceWarn();	
	}else{
		locateFloor = checkUrlParam('floor_id');
		if(LocateLength > 0){
			var sumX = 0 ,sumY = 0;
			for (var i = 0;i<LocateLength; i++){
				sumX += LocateInfo[0].getGeometry().getCoordinates()[0];
				sumY += LocateInfo[0].getGeometry().getCoordinates()[1];
			}
			locate = [sumX/LocateLength,sumY/LocateLength];
			backcenter();
		}
	}

	for(var i = 0;i < LocateLength; i++){
		var locate_ID = LocateInfo[i].get('l_id');
		var locateGeom = LocateInfo[i].getGeometry().getCoordinates();
		if(!LocatesForShow[locate_ID]){
			LocatesForShow[locate_ID] = locateGeom;
			beforeLocatesForShow[locate_ID] = locateGeom;
			checkWallInFlag[locate_ID] = [];
			checkWallInFlag[locate_ID][0] = WallInFlag(locateGeom);
			checkWallInFlag[locate_ID][1] = checkWallInFlag[locate_ID][0];
			checkWallInFlag[locate_ID][2] = [];
		}else{
			var beforeLocateForShow = LocatesForShow[locate_ID];
			beforeLocatesForShow[locate_ID] = beforeLocateForShow;
			
			var locateDis = distanceFromAToB(beforeLocateForShow,locateGeom);
			
			if( pathPlanningOFF && locateDis < 1){// 1米内不跳动
				LocateInfo[i].setGeometry(new ol.geom.Point(beforeLocateForShow));	
			}else{
				LocatesForShow[locate_ID] = locateGeom;
			}
			checkLocateIn(locate_ID,beforeLocateForShow,locateGeom);
		}
	}
		
	// 设置定位点style
	if(locateFloor == floorid){
		if (locateStyleWarn){LocationLayer.setStyle(locationWarnStyle);
		}else{LocationLayer.setStyle(locationStyle);}
	}else{
		// 楼层不同时，隐藏定位点
		LocationLayer.setStyle(locationStyleUnshow);
	}	
	// 定位点顺滑平移-伪实现
	moveAnimation(beforeLocatesForShow,LocateInfo);
	makeEntitiesLocate(LocateInfo);
	
	// 判断是否正在路径规划，做实时规划
	if(!pathPlanningOFF && RouteLayer != null && RouteLayer.getSource().getFeatures().length > 0){
		// 实时路径规划
		if(LocatesForShow && distanceFromAToB([sourceLabelX,sourceLabelY],locate) > 1){
			if(document.getElementById('label-start').value == '我的位置'){
				RouteLayer.getSource().clear();
				sourceLabelX = locate[0];
				sourceLabelY = locate[1];
				StartPathPlanning();
			}else if (document.getElementById('label-end').value == '我的位置'){
				RouteLayer.getSource().clear();
				targetLabelX = locate[0];
				targetLabelY = locate[1];
				StartPathPlanning();
			}	
		}
	}
}

// 获取实时定位信息
function startlocation(){  
	setTimeout(startlocation,1000);  
	getlocation();
}

// 加载定位信息
function loadlocation(){	
	deviceId = checkUrlParam('deviceId');
	
	if(deviceId == 'all'){
		placeid = checkUrlParam('place_id');
		if (checkFlag){
			floorid = checkUrlParam('floor_id');
		}
		if (checkFlag){
			getGeomData();
			getFloorList();
			changeFloor(floorid);
			load3dData();
			startlocation();
			LocationLayer.setSource(center_wfs);
			view.setCenter(mapCenter(placeid));
		}
	}
	if (deviceId != 'all' && checkFlag) {
		// 获取定位信息
		startlocation();
		LocationLayer.setSource(center_wfs);
	}	
}
// 加载楼层条
function getFloorList(){
	var FloorTag = [];
	var FloorId = geomBackgrounds != undefined ? Object.keys(geomBackgrounds): [];
	var floorLength = FloorId.length;
	
	for (var Floori =0;Floori < floorLength;Floori++){
		for (var Floorj =Floori+1;Floorj < floorLength;Floorj++){
			if (FloorId[Floori] >= FloorId[Floorj]){
				var floorDummy = FloorId[Floori];
				FloorId[Floori] = FloorId[Floorj];
				FloorId[Floorj] = floorDummy;
			}					
		}
	}
	for (var FloorNum =0;FloorNum < floorLength;FloorNum++){
		FloorTag[FloorNum] = '<li role="presentation" class="floorS ' + FloorId[FloorNum] + '" onClick="floorSelect(this);"><a>F' + FloorId[FloorNum] + '</a></li>';
	}		
	$("#floorlist").html(FloorTag);
	$(".floor-select").show();
	if(deviceId != 'all'){
		backcenter();
	}		
}

// 回到定位点
function moveToCenter(){
	backcenterFlag = true;
	backcenter();
}
function backcenter(){
	// if (self.fetch){
		// alert('fetch is ok!');
	// }else {
		// alert('fetch can not use!');
	// }
	// 2d
	map.on('pointerdrag', function() {
		backcenterFlag = false;
	});
	// 3d
	viewer.screenSpaceEventHandler.setInputAction(function(movement) {           
		backcenterFlag = false;
     }, Cesium.ScreenSpaceEventType.WHEEL);  
	 viewer.screenSpaceEventHandler.setInputAction(function(movement) {           
		backcenterFlag = false;
     }, Cesium.ScreenSpaceEventType.LEFT_DOWN);  
	// 平移动画
	if (backcenterFlag){
		// 2d
		view.animate({
			duration: 1000,
			center: locate
		});		
		// 3d
		changeCamera([locate[0] - 0.00016,locate[1] - 0.0002],(floorid-1) * 3 +60,2);
		
		// 当所在楼层不是定位点所在楼层时，切换到定位点的楼层
		if (locateFloor != floorid){
			// 定位点楼层的图标高亮
			changeFloor(locateFloor);
		}	
	}
	
}

// 电子围栏预警
function electronicFenceWarn(){
	WarnParam = 'locatex:' + locate[0] + ';locatey:' + locate[1] + ';locatefloor:' + locateFloor;			
	WarnRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':electronicWarn', // 电子围栏预警图层
		outputFormat: 'application/json',
		viewparams: WarnParam
	};	
	$.ajax({  
		url: wfsUrl,
		data: $.param(WarnRequestParam), 
		type: 'GET',
		dataType: 'json',
		success: function(response){
			var WarnFeatures = response.features;
			var WarnLength = WarnFeatures.length;
			// 获取预警等级和当前电子围栏的name
			if (WarnLength != 0){
				var WarnName,WarnType;
				WarnName = WarnFeatures[0].properties.name;
				WarnType = WarnFeatures[0].properties.type_id;
				if(WarnLength > 1){
					for (var i=1;i<WarnLength;i++){
						if (WarnType < WarnFeatures[i].properties.type_id){
							WarnType = WarnFeatures[i].properties.type_id;
							WarnName = WarnFeatures[i].properties.name;
						}
					}
				}
				// 预警时定位点的style为特殊式样
				locateStyleWarn = true;
				// 预警提醒
				if(WarnType != OldWarnType){
					switch (WarnType){
						case '1':
							alert('危险系数低[' + WarnName + ']!');
							break;
						case '2':
							alert('危险系数中等[' + WarnName + ']!');
							break;
						case '3':
							alert('危险系数高[' + WarnName + ']!');
							break;
						case '4':
							alert('禁止入内，请立即退出[' + WarnName + ']!');
							// 需要报警给后台
							break;
					}
					OldWarnType = WarnType;
				}				
			}else {
				locateStyleWarn = false;
				OldWarnType = null;
			}

		}
	}); 	
}

// 点选-高亮+属性
function loadselectSingleClick(){
	var selectInfo;   //点击poi 的详细信息
	var selectName;   //点击poi 的详细信息
	var coordinate;	//点击poi 的坐标
	var selectId;   //点击poi 的形状id
	selectSingleClick = new ol.interaction.Select({
		layers: [selectSingleClickLayter,RouteStartLayer,RouteDestLayer],
		style: selectSingleClickStyle,
	});
	var selectedFeatures = selectSingleClick.getFeatures();	
	selectSingleClick.on('change:active', function() {
		selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
	});
	map.addInteraction(selectSingleClick);
	selectSingleClick.on('select', function(e) {
		if(e.selected[0]){
			selectInfo = e.selected[0].values_;
	
			if (selectInfo.sfloor != undefined){
				// alert('选中起点');
				setFloorAndCenter(selectInfo.sfloor,sourceLabelX,sourceLabelY);
				selectSingleClick.setActive(false);
				selectSingleClick.setActive(true);
			}else if(selectInfo.efloor != undefined){
				// alert('选中终点');
				setFloorAndCenter(selectInfo.efloor,targetLabelX,targetLabelY);
				selectSingleClick.setActive(false);
				selectSingleClick.setActive(true);
			}else{
				// alert('选中poi');
				selectName = selectInfo.name;
				selectId = e.selected[0].id_.split(".")[1];
				var geom = selectInfo.geometry;
				var geomtype = geom.getType();
				if (geomtype == 'Polygon'){
					coordinate = geom.getInteriorPoint().getCoordinates();
				}else if (geomtype == 'Point'){
					coordinate = geom.getCoordinates();
				}
				HighlightElementContent.innerHTML = selectName;
				HighlightOverlay.setPosition(coordinate);		
				// 清除路径规划
				clearPath();				
			}
		}else{
			HighlightOverlay.setPosition(undefined);
			HighlightElementCloser.blur();
			//return false;
			// 清除路径规划
			clearPath();
		}

	});		
	HighlightElementCloser.onclick = function (){
		HighlightOverlay.setPosition(undefined);
		HighlightElementCloser.blur();
		return false;
	}	
	// 收藏
	HighlightElementCollection.onclick = function (){
		checkCollection(selectId,coordinate);
	}
	// 搜周边
	HighlightElementSearch.onclick = function (){
		// 周边检索
	}
	// 从这走
	HighlightElementFrom.onclick = function (){
		// 打开路径规划功能
		pathPlanningMain();
		// 设置起点为选中的点
		clearStartLabel();
		LabelAction = 'startLabel';
		document.getElementById('label-start').value = selectName;
		setlabelOnClick(LabelAction,coordinate,selectInfo.floor_id);
		// 地图点选终点
		getEndLabelOnMap();
	}
	// 去这里
	HighlightElementTo.onclick = function (){
		removeSelectSingleClick();
		// 打开路径规划功能
		pathPlanningMain();
		// 设置终点为选中的点，自动规划完路线
		LabelAction = 'endLabel';
		document.getElementById('label-end').value = selectName;
		setlabelOnClick(LabelAction,coordinate,selectInfo.floor_id);
	}
}
	
// 关闭 selectSingleClick 点选
function removeSelectSingleClick(){
	HighlightOverlay.setPosition(null);
	map.removeInteraction(selectSingleClick);	
}

// 3d定位点详情
function get3DPopup(){
	$(".cesium-selection-wrapper").hide();
	$(".cesium-infoBox").hide();
	var infoDiv = '<div id="trackPopUp" style="display:none;">'+
	    '<div id="trackPopUpContent" class="leaflet-popup" style="top:5px;left:0;">'+
	      '<a id="leaflet-popup-close-button" class="leaflet-popup-close-button" href="#">×</a>'+
	      '<div class="leaflet-popup-content-wrapper" >'+
	      	'<div  id="leaflet-popup-pucture" class="col-md-4 col-sm-4 col-sm-6">'+
	      		'<img style="width: 100px; heigth: 220px;"/>'+
			'</div>'+
	        '<div id="trackPopUpLink" class="leaflet-popup-content col-md-8 col-sm-8 col-sm-6"></div>'+
	      '</div>'+
	      '<div class="leaflet-popup-tip-container">'+
	        '<div class="leaflet-popup-tip"></div>'+
	      '</div>'+
	    '</div>'+
	'</div>';
	$("#cesiumContainer").append(infoDiv);	
	var removeHandler,content;
	var handler3D = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler3D.setInputAction(function(movement) {						
		var pick = scene.pick(movement.position);
		if(removeHandler){removeHandler.call();}
		if(pick && pick.id && pick.id._position && pick.id._properties){
		    content = '编号：  ' + pick.id._properties._l_id + '<br>';
					   // '姓名：  ' + pick.id._properties._name + '<br>'
					// + '编号：  ' + pick.id._properties._l_id + '<br>'
					// + '心率：  ' + pick.id._properties._heart_rate + '<br>'
					// + '血压：  ' + pick.id._properties._spb + "/" + pick.id._properties._dpb + '<br>'
					// + '步数：  ' + pick.id._properties._steps;
		    //var personImgUrl = getImg(pick.id._properties._l_id);// 取人员照片URL
		    //var obj = {position:movement.position,content:content,personImgUrl:personImgUrl};
		    var obj = {position:movement.position,content:content};
		    infoWindow(obj);
		   
		    function infoWindow(obj) {
        		        var picked = scene.pick(obj.position);
        		        if (Cesium.defined(picked)) {
        		            var id = Cesium.defaultValue(picked.id, picked.primitive.id);
        		            if (id instanceof Cesium.Entity) {
        		            	$('#trackPopUpLink').empty();
        		            	$('#trackPopUpLink').append(obj.content);
        		            	//$('#leaflet-popup-pucture img').attr("src",obj.personImgUrl);
        		        		function positionPopUp (c) {
        		        			var x = c.x - ($('#trackPopUpContent').width()) / 2;
        		        			var y = c.y - ($('#trackPopUpContent').height());
        		        			$('#trackPopUpContent').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, 0)');
        		        		}
        		        		var c = new Cesium.Cartesian2(obj.position.x, obj.position.y);
        		        		positionPopUp(c); 
        		        		$('#trackPopUp').show();
        		        		removeHandler = viewer.scene.postRender.addEventListener(function () {
        		        			var changedC = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, id._position._value);
        		        			if ((c.x !== changedC.x) || (c.y !== changedC.y)) {
        		        				positionPopUp(changedC);
        		        				c = changedC;
        		        			}
        		        		});
        		        		// PopUp close button event handler
        		        		$('.leaflet-popup-close-button').click(function() {
        		        			$('#trackPopUp').hide();
        		        			$('#trackPopUpLink').empty();
        		        			removeHandler.call();
        		        			return false;
        		        		});	            				
        		                return id;
        		            }
        		        }	    	
             }  
		}else{
			$('#trackPopUp').hide();
			$('#trackPopUpLink').empty();
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);	
}


// 楼层选择
function floorSelect(e){
	// 切换楼层
	var floorSelectId = e.innerText.substr(1,2);

	if ( floorSelectId != floorid){
		changeFloor(floorSelectId);
	}
}
function changeFloor(newFloor){
	var floorLength = document.getElementsByClassName('floorS').length;
	for (var i =0; i< floorLength; i++){
		document.getElementsByClassName('floorS')[i].classList.remove('active');
		// console.log(document.getElementsByClassName('floorS')[i]);
	}
	document.getElementsByClassName(newFloor)[0].classList.add('active');
	// 切换楼层
	floorUpdate(newFloor);
}
// 切换楼层
function floorUpdate(newfloorId){
	// 取点击的楼层 赋值给floor_id   第二个字符后两位
	floorid = newfloorId;	
	$(".floorshow a").text('F' + newfloorId);
	// 刷新图层（背景，道路，poi 其他清空）
	loadBasemap();	

	// 刷新电子围栏
	if(!electronicLayerOff){
		electronicLayerOff = true;
		electronicFence();
		// 增删改都关闭
		
	}	
	// 刷新收藏
	if(!collectionoff){
		collectionoff = true;
		collectionPoi();
	}
	// 清除 检索
	removeselect();
	// 刷新 热力图
	if(!heatmapoff){
		removeHeatmap();
		guideHeatmap();
	}	
	// 清除 测距
	stopAndRemoveLength();
	// 清除 路径规划  & 刷新 点选
	if (!pathPlanningOFF){
		// clearPath();  // 只清除 路径规划
		// backPathPlan();  // 清除 路径规划  & 刷新 点选
		if(RouteLayer != null && RouteLayer != undefined){
			if(RouteSourceFloor == RouteTargetFloor/* 非跨楼层*/ ){
				if(RouteSourceFloor == floorid){/* 切换到路线所在楼层 */
					routeFeature[0].setStyle(routeStyle[1]);
					RouteStartLayer.setOpacity(1);
					RouteDestLayer.setOpacity(1);
				}else{/* 切换到路线之外楼层 */
					routeFeature[0].setStyle(routeStyle[0]);
					RouteStartLayer.setOpacity(0.4);
					RouteDestLayer.setOpacity(0.4);
				}
			}else{/* 跨楼层*/
				setRouteStyleWithFloor();
				//RouteLayer.setStyle();
			}
		}
		
	}
	// 清除点选 再增加点选（刷新）
	// removeSelectSingleClick();
	// loadselectSingleClick();		
}


// 刷新图层 背景，道路，poi
function loadBasemap(){
	// 默认楼层
	// WFS
	backgroundLayer.getSource().clear();
	backgroundLayer.getSource().addFeatures(geomBackgrounds[floorid] != null ? geomBackgrounds[floorid]:[]);
	polygonLayer.getSource().clear();
	polygonLayer.getSource().addFeatures(geomPolygons[floorid] != null ? geomPolygons[floorid]:[]);
	pointLayer.getSource().clear();
	pointLayer.getSource().addFeatures(geomPOIs[floorid] != null ? geomPOIs[floorid]:[]);
	selectSingleClickLayter.getSource().clear();
	selectSingleClickLayter.getSource().addFeatures(geomPOIs[floorid] != null ? geomPOIs[floorid]:[]);	

	// 3Dmap
	viewer.entities.removeAll();
	viewAddBottomMap(); 
	setEntitiesBackground(shapeBackgrounds[floorid]);
	setEntitiesPolygon(shapePolygons[floorid],shapePenups[floorid]);
	setEntitiesPOI(shapePOIs[floorid]);

}

