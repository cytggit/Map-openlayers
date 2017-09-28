
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
			var features = new ol.format.GeoJSON().readFeatures(response);
			
			var featureOBJ = response.features;
			// console.log(featureOBJ[0].properties.floor_id);
			center_wfs.clear();
			if(deviceId != 'all'){
				if(locate == null){
					locate = featureOBJ[0].geometry.coordinates; // 取得位置信息		
					locateFloor = featureOBJ[0].properties.floor_id;
					// 切换到定位点所在的区域
					placeid = featureOBJ[0].properties.place_id;
					// 加载楼层条
					getFloorList();
				}else{
					// 得到定位点的坐标，用于返回定位点&路径规划
					locate = featureOBJ[0].geometry.coordinates; // 取得位置信息		
					locateFloor = featureOBJ[0].properties.floor_id;					
				}
				
				// 电子围栏预警
				electronicFenceWarn();	
				// 设置定位点style
				if (locateStyleWarn){
					LocationLayer.setStyle(locationWarnStyle);
				}else{
					LocationLayer.setStyle(locationStyle);
				}

				// 当定位点所在楼层和室内图选择的楼层相同时，显示定位点
				if (locateFloor == floorid){
					
					// 判断是否正在路径规划，做路网吸附
					// if(!pathPlanningOFF &&  ){
					if(!pathPlanningOFF && RouteLayer != null && RouteLayer.getSource().getFeatures().length > 0){
						var newcenterFearure = pointToLinestring(features,RouteLayer.getSource().getFeatures());
						center_wfs.addFeatures(newcenterFearure);
					}else{
						center_wfs.addFeatures(features);
					}
				}
			}else{
				LocationLayer.setStyle(locationStyle);
				center_wfs.addFeatures(features);
			}
		}		
	});
}

// 获取实时定位信息
function startlocation(){  
	setTimeout(startlocation,5000);  
	getlocation();
}

// 加载定位信息
function loadlocation(){	
	checkName = 'deviceId';
	deviceId = checkUrlParam(checkName);

	if(deviceId == 'all'){
		checkName = 'place_id';
		placeid = checkUrlParam(checkName);
		if (checkFlag){
			getFloorList();
			startlocation();
			LocationLayer.setSource(center_wfs);			
			switch(placeid){
				case '2':
					view.setCenter(motecenter);
					break;
				case '3':
					view.setCenter(zhongbeicenter);
					break;
				case '4':
					view.setCenter(minhangcenter);
					break;
				case '5':
					view.setCenter(zhanlancenter);
					break;
			}
		}
	}
	if (deviceId != 'all' && checkFlag) {
		// 获取定位信息
		startlocation();
		LocationLayer.setSource(center_wfs);
		backcenterFlag = true;
	}	
}
// 加载楼层条
function getFloorList(){
	var FloorTag = [];
	var FloorId = [];
	var GetFloorParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':polygon_background ', // 电子围栏图层
		outputFormat: 'application/json',
		cql_filter: 'place_id=' + placeid
	};	
	$.ajax({  
		url: wfsUrl,
		data: $.param(GetFloorParam), 
		type: 'GET',
		dataType: 'json',
		success: function(response){
			var features = new ol.format.GeoJSON().readFeatures(response);
			var floorLength = features.length
			for (var FloorNum =0;FloorNum < floorLength;FloorNum++){
				FloorId[FloorNum] = features[FloorNum].values_.floor_id;
			}
			var floorDummy;
			for (var Floori =0;Floori < floorLength;Floori++){
				for (var Floorj =Floori+1;Floorj < floorLength;Floorj++){
					if (FloorId[Floori] >= FloorId[Floorj]){
						floorDummy = FloorId[Floori];
						FloorId[Floori] = FloorId[Floorj];
						FloorId[Floorj] = floorDummy;
					}					
				}
			}
			for (var FloorNum =0;FloorNum < floorLength;FloorNum++){
				FloorTag[FloorNum] = '<li role="presentation" class="floorS ' + FloorId[FloorNum] + '" onClick="floorSelect(this);"><a>F' + FloorId[FloorNum] + '</a></li>';
			}
			$("#floorlist").html(FloorTag);
			if(deviceId != 'all'){
				backcenter();
			}
		}
	}); 	
}

// 回到定位点
function backcenter(){
	// if (self.fetch){
		// alert('fetch is ok!');
	// }else {
		// alert('fetch can not use!');
	// }

	// 平移动画
	if (backcenterFlag){
		view.animate({
			duration: 1000,
			center: locate
		});		
	}
	// 当所在楼层不是定位点所在楼层时，切换到定位点的楼层
	if (locateFloor != floorid){
		// 定位点楼层的图标高亮
		var floorLength = document.getElementsByClassName('floorS').length;
		for (var i =0; i< floorLength; i++){
			document.getElementsByClassName('floorS')[i].classList.remove('active');
			// console.log(document.getElementsByClassName('floorS')[i]);
		}
		document.getElementsByClassName(locateFloor)[0].classList.add('active');
		// 切换楼层
		floorUpdate(locateFloor);
	}	
}


// 电子围栏MAIN
function UpdateElectronicFence(drawinfo){
	drawElectronicFlag = true;
	// 确认影响电子围栏的模块
	checkElectronicReady();
	
	var newDrawtype = drawinfo.id;
	//本次编辑和上次不同
	if (drawtype != newDrawtype ){
		// 关闭上一次的编辑并判断之前的编辑操作（draw or modify）是否需要保存
		checkSaveElectronicFence();
		// 显示电子围栏
		electronicFence();
		
		switch (newDrawtype) {  
			case 'AddElectronicFence': 
				console.log(drawinfo.innerText);
				ADDelectronicFence();
				break;
			case 'UpdateElectronicFence': 
				console.log(drawinfo.innerText);
				UpdElectronicFence();
				break;
			case 'RemoveElectronicFence': 
				console.log(drawinfo.innerText);
				RmElectronicFence();
				break;
		}		
		drawtype = newDrawtype;
	}
}
// 判断之前的编辑操作（draw or modify）是否需要保存
function checkSaveElectronicFence(){	
	// 关闭上一次的编辑
	switch (drawtype) {  
		case 'AddElectronicFence': 
			DrawElectronicFence.setActive(false);
			break;
		case 'UpdateElectronicFence': 
			ModifyElectronicFence.setActive(false);
			break;
		case 'RemoveElectronicFence': 
			DeleteElectronicFence.setActive(false);
			break;
	}			

	// 保存上一次的编辑
	if(electronicFeatureDummy.length != 0){
		// 弹出是否保存
		if(confirm("有未保存的编辑，是否需要保存？")){
			SaveElectronicFence();
		}else{
			electronicFeatureDummy = [];
			electronicFence();
			alert('已清除未保存的编辑！');
		}
	}	
}
// 新增电子围栏
function ADDelectronicFence(){
	if(!addElectronicFlag){
		// draw polygon
		DrawElectronicFence = {
			init: function() {
				map.addInteraction(this.Polygon);
				this.Polygon.setActive(true);
			},
			Polygon: new ol.interaction.Draw({
				source: electronicLayer.getSource(),
				type: /** @type {ol.geom.GeometryType} */ ('Polygon'),
				geometryName: 'geom'
			}),
			setActive: function(active) {
				this.Polygon.setActive(active);
			}			
		};
		DrawElectronicFence.init();
		var j=0;
		DrawElectronicFence.Polygon.on('drawend',
			function(evt) {
				var Coordinates = evt.feature.values_.geom.getCoordinates()[0];
				var CoordinatesLength = Coordinates.length;

				var newCoordinates = [];
				var oldCoordinates;
				for (var i=0;i<CoordinatesLength;i++){
					oldCoordinates = Coordinates[i];
					newCoordinates[i] = [oldCoordinates[1],oldCoordinates[0]];
				}
				var newFeature = new ol.Feature();
				newFeature.setId('electronic_fence.'  + deviceId);
				newFeature.setGeometryName('geom');	
				newFeature.set('geom', null);
				newFeature.set('place_id', placeid);
				newFeature.set('floor_id', floorid);
				newFeature.set('type_id', '1');
				newFeature.set('name', 'test');		
				newFeature.setGeometry(new ol.geom.Polygon([newCoordinates]));
				electronicFeatureDummy[j] = newFeature;
				j++
			}, this);			

		addElectronicFlag = true;
	} else {
		DrawElectronicFence.setActive(true);
	}	
}
// 修改电子围栏
function UpdElectronicFence(){
	if(!updateElectronicFlag){
		ModifyElectronicFence = {
			init: function() {
				this.select = new ol.interaction.Select({
					layers: [electronicLayer]
				}); 
				this.modify = new ol.interaction.Modify({
					features: this.select.getFeatures()
				});
				map.addInteraction(this.select);
				map.addInteraction(this.modify);
			
				this.setEvents();
			},
			setEvents: function() {
				var selectedFeatures = this.select.getFeatures();
			
				this.select.on('change:active', function() {
					selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
				});
			},
			setActive: function(active) {
				this.select.setActive(active);
				this.modify.setActive(active);
			}
		};
		ModifyElectronicFence.init();
		var j=0;
		var modifyIdInfo = [];
		ModifyElectronicFence.modify.on('modifyend',
			function(evt) {
				var modifyInfo = evt.features.getArray()[0].values_;
				var modifyId = evt.features.getArray()[0].id_;
				
				var Coordinates = modifyInfo.geometry.getCoordinates()[0];
				var CoordinatesLength = Coordinates.length;
				
				var newCoordinates = [];
				var oldCoordinates;
				for (var i=0;i<CoordinatesLength;i++){
					oldCoordinates = Coordinates[i];
					newCoordinates[i] = [oldCoordinates[1],oldCoordinates[0]];
				}
				
				var modifyPlaceid = modifyInfo.place_id;
				var modifyFloorid = modifyInfo.floor_id;
				var modifyTypeid = modifyInfo.type_id;
				var modifyName = modifyInfo.name;		
				
				var newFeature = new ol.Feature();
				newFeature.setId(modifyId);
				newFeature.setGeometryName('geom');	
				newFeature.set('geom', null);
				newFeature.set('place_id', modifyPlaceid);
				newFeature.set('floor_id', modifyFloorid);
				newFeature.set('type_id', modifyTypeid);
				newFeature.set('name', modifyName);		
				newFeature.setGeometry(new ol.geom.Polygon([newCoordinates]));							

				if (j !=0){
					for (var num = 0;num<j;num++){
						if(modifyIdInfo[num] == modifyId){
							electronicFeatureDummy[num] = newFeature;
						}
					}
				}else{
					modifyIdInfo[j] = modifyId;
					electronicFeatureDummy[j] = newFeature;
					j++;
				}			
			}, this);			
		updateElectronicFlag = true;
	} else {
		ModifyElectronicFence.setActive(true);
	}
}
// 删除电子围栏
function RmElectronicFence(){
	if(!rmElectronicFlag){
		DeleteElectronicFence = {
			init: function() {
				this.select = new ol.interaction.Select({
					layers: [electronicLayer]
				}); 
				map.addInteraction(this.select);
			
				this.setEvents();
			},
			setEvents: function() {
				var selectedFeatures = this.select.getFeatures();
			
				this.select.on('change:active', function() {
					selectedFeatures.forEach(selectedFeatures.remove, selectedFeatures);
				});
			},
			setActive: function(active) {
				this.select.setActive(active);
			}
		};
		DeleteElectronicFence.init();
		DeleteElectronicFence.select.on('select',
			function(evt) {
				if(evt.target.getFeatures().getArray().length != 0) {  
					// 弹出是否删除
					if(confirm("确认删除？")){
						var selectInfo = evt.target.getFeatures().getArray()[0].values_;
						var selectId = evt.target.getFeatures().getArray()[0].id_;
						
						var Coordinates = selectInfo.geometry.getCoordinates()[0];
						var CoordinatesLength = Coordinates.length;
						
						var newCoordinates = [];
						var oldCoordinates;
						for (var i=0;i<CoordinatesLength;i++){
							oldCoordinates = Coordinates[i];
							newCoordinates[i] = [oldCoordinates[1],oldCoordinates[0]];
						}
		
						var newFeature = new ol.Feature();
						newFeature.setId(selectId);
						newFeature.setGeometryName('geom');	
						newFeature.set('geom', null);		
						newFeature.setGeometry(new ol.geom.Polygon([newCoordinates]));							
						
						updateNewFeature([newFeature],'electronic_fence','remove');
						alert('删除电子围栏成功！');	
						electronicFence();
					}else{
						alert('取消电子围栏删除！');
					}		
				}			
			}, this);			
		rmElectronicFlag = true;
	} else {
		DeleteElectronicFence.setActive(true);
	}
}
// 保存电子围栏编辑
function SaveElectronicFence(){
	// request
	var featureType = 'electronic_fence';
	switch (drawtype) {  
		case 'AddElectronicFence': 
			updateNewFeature(electronicFeatureDummy,featureType,'insert');
			alert('新增电子围栏成功！');	
			break;
		case 'UpdateElectronicFence': 
			updateNewFeature(electronicFeatureDummy,featureType,'update');
			alert('修改电子围栏成功！');	
			break;
	}	
	electronicFeatureDummy = [];
	electronicFence();
}
// 关闭电子围栏编辑
function electronicFenceDrawOFF(){
	// 判断是否已保存
	if(drawElectronicFlag){
		checkSaveElectronicFence();	
		// 编辑的Flag初始化
		drawtype = null;
		drawElectronicFlag = false;
		loadselectSingleClick();
	}

}
// 确认影响电子围栏的模块
function checkElectronicReady(){
	// 关闭高亮
	removeSelectSingleClick();		
	// 关闭并清除测距
	stopAndRemoveLength();	
	// 关闭路径规划
	if (!pathPlanningOFF){
		clearPath();
	}
	
}

// 显示电子围栏
function electronicFence(){
	electronicLayer.getSource().clear();
	if (electronicLayerOff) {
		var electronicParam = {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typeName: DBs + ':electronic_fence', // 电子围栏图层
			outputFormat: 'application/json',
			cql_filter: 'place_id=' + placeid + ' and floor_id=' + floorid
		};	
		$.ajax({  
			url: wfsUrl,
			data: $.param(electronicParam), 
			type: 'GET',
			dataType: 'json',
			success: function(response){
				var features = new ol.format.GeoJSON().readFeatures(response);
				electronicLayer.getSource().addFeatures(features);
			}
		}); 	
		electronicLayerOff = false;
	}else {

		electronicLayerOff = true;
		if (drawElectronicFlag){
			electronicFence();
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
			selectId = selectInfo.fid;
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

// 判断是否已收藏
function checkCollection(selectId,coordinate){
	var CollectionRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':poi_collection', // 定位点图层
		outputFormat: 'application/json',
		cql_filter: 'user_id=' + userId + ' and poi_id=' + selectId
	};	
	$.ajax({  
		url: wfsUrl,
		data: $.param(CollectionRequestParam), 
		type: 'GET',
		dataType: 'json',
		success: function(response){
			var featuresNum = response.features.length;
			if (featuresNum == 0) {
				var featureType = 'poi_collection';
				var newFeature = new ol.Feature();
				newFeature.setId('poi_collection.'  + deviceId + '.' + selectId );
				newFeature.setGeometryName('geom');	
				newFeature.set('geom', null);
				newFeature.set('poi_id', selectId);
				newFeature.set('l_id', deviceId);
				newFeature.set('user_id', userId);
				newFeature.set('place_id', placeid);
				newFeature.set('floor_id', floorid);
				newFeature.setGeometry(new ol.geom.Point([coordinate[1],coordinate[0]]));
				updateNewFeature([newFeature],featureType,'insert');
				collectionoff = true;
				alert('收藏成功！');
			}else {
				alert('已收藏过！');
			}
		}
	}); 	
}

// 显示收藏
function collectionPoi(){
	collectionLayer.getSource().clear();
	if (collectionoff) {
		var CollectionParam = {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typeName: DBs + ':poi_collection', // 定位点图层
			outputFormat: 'application/json',
			cql_filter: 'user_id=' + userId + ' and place_id=' + placeid + ' and floor_id=' + floorid
		};	
		$.ajax({  
			url: wfsUrl,
			data: $.param(CollectionParam), 
			type: 'GET',
			dataType: 'json',
			success: function(response){
				var features = new ol.format.GeoJSON().readFeatures(response);
				collectionLayer.getSource().addFeatures(features);
			}
		}); 	
		collectionoff = false;
	}else {
		collectionoff = true;
	}
}

// 楼层选择
function floorSelect(e){
	// console.log(e);
	var floorLength = document.getElementsByClassName('floorS').length;
	for (var i =0; i< floorLength; i++){
		document.getElementsByClassName('floorS')[i].classList.remove('active');
		// console.log(document.getElementsByClassName('floorS')[i]);
	}
	e.classList.add('active');
	// 切换楼层
	var floorSelectId = e.innerText.substr(1,2);
	// console.log(floorSelectId);
	if ( floorSelectId != floorid){
		floorUpdate(floorSelectId);
	}

}
// 切换楼层
function floorUpdate(newfloorId){
	// 取点击的楼层 赋值给floor_id   第二个字符后两位
	floorid = newfloorId;	
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
	// console.log(backgroundLayer.getSource().getParams());
	viewParam = 'place_id:' + placeid + ';floor_id:' + floorid;
	// WMS
	backgroundLayer.getSource().updateParams({viewparams:viewParam});
	// polygonLayer.getSource().updateParams({viewparams:viewParam}); //3d
	
	// WFS
	polygonLayer.getSource().clear();
	polygonLayer.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,polygonTypename)));
	pointLayer.getSource().clear();
	pointLayer.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,pointTypename)));
	selectSingleClickLayter.getSource().clear();
	selectSingleClickLayter.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(geojsonObject(viewParam,pointTypename)));	
}

// 查找-WC
function selectToilet(){
	if (selectinfo == 'selectToilet') {
		removeselect();
	}else {
		removeselect();
		selectinfo = 'selectToilet';
		featureid = '30050100';	
		selectLayer.setStyle(selectStyle[featureid]);
		getselectLayerSource();			
	}
}
// 查找-大门
function selectDoor(){
	if (selectinfo == 'selectDoor'){
		removeselect();		
	}else {
		removeselect();
		selectinfo = 'selectDoor';
		featureid = '30050800';
		selectLayer.setStyle(selectStyle[featureid]);
		getselectLayerSource();	
	}
}
// 增加检索图层
function getselectLayerSource(){
	var selectRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':select', // 定位点图层
		outputFormat: 'application/json',
		cql_filter: 'place_id=' + placeid + 'and floor_id=' + floorid + 'and feature_id=' + featureid
	};		
	$.ajax({  
		url: wfsUrl,
		data: $.param(selectRequestParam), 
		type: 'GET',
		dataType: 'json',
		success: function(response){
			var selects = new ol.format.GeoJSON().readFeatures(response);
			select_wfs.addFeatures(selects);
		}
	}); 
	selectLayer.setSource(select_wfs);		
}
// 删除检索图层
function removeselect(){
	if (selectinfo!=null) {
		selectLayer.getSource().clear();
		selectinfo = null;
	}
}	

// 增加热力图
function startHeatmap(){
	guideHeatmapTimeoutId = setTimeout(startHeatmap,5000);  
	heatmapLayer.getSource().clear();
	// 从位置服务器获取所有定位信息
	$.ajax({
		url: locateAllUrl,
		data: {'floor':floorid}, 
		type: 'GET',
		dataType: 'jsonp',
		jsonp: 'callback',
		jsonpCallback: 'successCallBack',
		success: function(data){
			heatmapLayer.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(data));
		}		
	});	
}

// 实时热力图
function guideHeatmap(){  
	if (heatmapoff) {
		startHeatmap();
		overmap.getLayers().extend([heatmapLayer]);	
		heatmapoff = false;
	}	else {
		removeHeatmap();
	}	
}

//清除热力图
function removeHeatmap(){
	clearTimeout(guideHeatmapTimeoutId);
	heatmapLayer.getSource().clear();
	overmap.getLayers().remove(heatmapLayer);
	heatmapoff = true;	
}

// 测距
// 开始测距
function startLength(){
	// 关闭高亮
	removeSelectSingleClick();
	// 关闭路径规划
	if (!pathPlanningOFF){
		clearPath();
	}	
	// 关闭电子围栏编辑
	electronicFenceDrawOFF();
	
	if (lengthoff ){
		lengthoff = false;
		overmap.getLayers().extend([drawlayer,drawpointlayer]);	
	}	

	if (lengthstop){
		lengthstop = false;
		// pointermove 事件的处理
		var dopointermove = function(evt) {
			if (evt.dragging) {return;}
			var helpMsg = '单击确定起点'; // 帮助信息的内容
			if (sketch) {// 绘制的形状
				helpMsg = '单击继续 双击结束';
			}
			helpTooltipElement.innerHTML = helpMsg;
			helpTooltip.setPosition(evt.coordinate);
		};
		map.on('pointermove',dopointermove);
		
		// 获取长度
		formatLength = function(line) {
			var coordinates = line.getCoordinates();
			var length = 0;
			var sourceProj = map.getView().getProjection();
			for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
				var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
				var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
				length += wgs84Sphere.haversineDistance(c1, c2);
			}
			var output;
			if (length > 100) {
				output = (Math.round(length / 1000 * 100) / 100) +
					' ' + 'km';
			} else {
				output = (Math.round(length * 100) / 100) +
					' ' + 'm';
			}
			return output;
		};
		
		// 绘制线的形状
		drawfeature();			
	}
}

// 停止测距
function stopLength(){
	// 绘制未完成直接停止时，未完成的绘制设为已完成
	if (!drawend){
		drawlinestring.finishDrawing();
	}	
	map.removeInteraction(drawlinestring);
	map.removeInteraction(drawpoint);		
	map.removeOverlay(helpTooltip);
	lengthstop = true;
	loadselectSingleClick();
}

// 清除测距
function removeLength(){
	if (drawpointlayer.getSource().getFeatures().length > 0){
		// 绘制未完成直接清除时，未完成的绘制设为已完成
		if (!drawend){
			drawlinestring.finishDrawing();
		}
		drawlayer.getSource().clear();
		drawpointlayer.getSource().clear();
		if (measureTooltips.length > 0){
			for ( var j=0 ; j < measureTooltips.length;j++){
				map.removeOverlay(measureTooltips[j]);
			}
		}

	}	
}

// 关闭并清除测距
function stopAndRemoveLength(){
	if (!lengthoff){
		if(!lengthstop){
			stopLength();
		}
		if (drawpoint != null){
			removeLength();
		}
	}	
}

// 绘制需要测距的形状
function drawfeature(){
  drawlinestring = new ol.interaction.Draw({
    source: drawlayer.getSource(),
    type: 'LineString',
    style: drawlinestringStyle
  }); 
  drawpoint = new ol.interaction.Draw({
    source: drawpointlayer.getSource(),
    type: 'Point',
  });
  map.addInteraction(drawlinestring);
  map.addInteraction(drawpoint);

  createHelpTooltip();

  var listener;
  drawlinestring.on('drawstart',
      function(evt) {
		drawend = false;
		measureTooltipElement = null;
        createMeasureTooltip();
        // set sketch
        sketch = evt.feature;
		tooltipCoord = evt.coordinate;
		listener = sketch.getGeometry().on('change', function(evt) {
			var geom = evt.target;
			var output = formatLength(geom);
			var tooltipCoord = geom.getLastCoordinate();
			measureTooltipElement.innerHTML = output;
			measureTooltips[measureNum].setPosition(tooltipCoord);
		});
      }, this);

  drawlinestring.on('drawend',
      function() {
		drawend = true;
        measureTooltipElement.className = 'tooltiptip tooltip-static';
        measureTooltips[measureNum].setOffset([0, -7]);
        // unset sketch
        sketch = null;
		ol.Observable.unByKey(listener);
		measureNum++;
      }, this);	
}

 //显示长度的overlay  
function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement('div');
  measureTooltipElement.className = 'tooltiptip tooltip-measure';
  measureTooltips[measureNum] = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: 'bottom-center'
  });
  map.addOverlay(measureTooltips[measureNum]);
}

 // 帮助的overlay
function createHelpTooltip() {
  if (helpTooltipElement) {
    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
  }
  helpTooltipElement = document.createElement('div');
  helpTooltipElement.className = 'tooltiptip';
  helpTooltip = new ol.Overlay({
    element: helpTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  map.addOverlay(helpTooltip);
}

// 路径规划
// Main
function pathPlanningMain(){
	if (pathPlanningOFF){
		pathPlanningOFF = false;
		// 确认影响路径规划的模块
		checkPathReady();
		// 开始路径规划
		pathPlanning();		
	}
}

// 确认影响路径规划的模块
function checkPathReady(){	
	// 关闭并清除测距
	stopAndRemoveLength();
	// 关闭电子围栏编辑
	electronicFenceDrawOFF();
}

// 初始化路线规划图层
function pathPlanning(){
	// 取起点- 默认：我的位置
	CreateRouteStartLayer();
	// 取终点- 默认：不设置
	CreateRouteDestLayer();
	// // 开始路径规划
	// StartPathPlanning();	
}

// 起点layer初始化
function CreateRouteStartLayer(){	
	var startRouteStyle = function(resolution){
		return [new ol.style.Style({
			image: new ol.style.Icon({
				img: mysvgroutestart,
				imgSize: [30, 30],   // 图标大小
				anchor: [0.5,1],     // 摆放位置
				scale: map.getView().getZoom() / 20  // 根据层级缩放SVG图标
			}),
			zIndex: 700
		})]
	};
	RouteStartLayer = new ol.layer.Vector({  
		title: 'start point',
		visibility: true,
		source: new ol.source.Vector(),
		style: startRouteStyle,
		zIndex: 90
	}); 
	getStartLabelFromLocate();	
}
// 从location取起点
function getStartLabelFromLocate(){
	RouteStartLayer.getSource().clear();	
	labelOnMapClear();
	LabelAction = 'startLabel';
	document.getElementById('label-start').value = '我的位置';
	setMyLocation();
}
// 从地图取点取起点
function getStartLabelOnMap(){	
	// 关闭高亮
	removeSelectSingleClick();	
	RouteStartLayer.getSource().clear();	
	labelOnMapClear();
	LabelAction = 'startLabel';
	document.getElementById('label-start').value = '地图选点';
	setlabelOnMap();
}

// 终点layer初始化
function CreateRouteDestLayer(){
	var destRouteStyle = function(resolution){
		return [new ol.style.Style({
			image: new ol.style.Icon({
				img: mysvgrouteend,
				imgSize: [30, 30],   // 图标大小
				anchor: [0.5,1],     // 摆放位置
				scale: map.getView().getZoom() / 20  // 根据层级缩放SVG图标
			}),
			zIndex: 700
		})]
	};
	RouteDestLayer = new ol.layer.Vector({  
		title: 'end point',
		visibility: true,
		source: new ol.source.Vector(),
		style: destRouteStyle,
		zIndex: 90
	}); 			
}
// 从location取终点
function getEndLabelFromLocate(){
	// 关闭高亮
	removeSelectSingleClick();	
	if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
	labelOnMapClear();
	LabelAction = 'endLabel';
	document.getElementById('label-end').value = '我的位置';
	setMyLocation();
}
// 从地图取点取终点
function getEndLabelOnMap(){	
	// 关闭高亮
	removeSelectSingleClick();	
	if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
	labelOnMapClear();
	LabelAction = 'endLabel';
	document.getElementById('label-end').value = '地图选点';
	setlabelOnMap();
}

// 删除地图选点 interaction
function labelOnMapClear(){
	if (LabelOnMapFlag){
		map.removeInteraction(labelOnMap);
		LabelOnMapFlag = false;		
	}	
}

// 开始路径规划
function StartPathPlanning(){
	if (document.getElementById('label-start').value != '' && document.getElementById('label-end').value != '' ){
		console.log('起点和终点不为空！');
		if((RouteSourceFloor == RouteTargetFloor) && (sourceLabelX == targetLabelX) && (sourceLabelY == targetLabelY)){
			alert('起点和终点不能相同！');
		}else{
			console.log('开始路径规划！');
			RouteLayer = new ol.layer.Vector({
				title: 'route map',
				visible: true,
				source: new ol.source.Vector(),
				zIndex: 20		
			});		
			
			if (RouteSourceFloor == RouteTargetFloor){
				RouteParam = 'x1:' + sourceLabelX + ';y1:' + sourceLabelY + ';x2:' + targetLabelX + ';y2:' + targetLabelY;			
				var RouteRequestParam = {
					service: 'WFS',
					version: '1.1.0',
					request: 'GetFeature',
					typeName: DBs + ':route_new', // 路径规划图层
					outputFormat: 'application/json',
					viewparams: RouteParam
				};	
				$.ajax({  
					url: wfsUrl,
					data: $.param(RouteRequestParam), 
					type: 'GET',
					dataType: 'json',
					success: function(response){
						var routeCoordinates = response.features[0].geometry.coordinates;

						routeFeature[0] = new ol.Feature({
							geometry: new ol.geom.LineString(routeCoordinates),
						});
						
						routeFeature[0].setStyle(routeStyle[1]);
						RouteLayer.getSource().addFeatures(routeFeature);
					}
				});				
			}else{
				RouteParam = 'startfloor:' + RouteSourceFloor + ';endfloor:' + RouteTargetFloor + ';x1:' + sourceLabelX + ';y1:' + sourceLabelY + ';x2:' + targetLabelX + ';y2:' + targetLabelY;			
				var RouteRequestParam = {
					service: 'WFS',
					version: '1.1.0',
					request: 'GetFeature',
					typeName: DBs + ':route_withfloor', // 路径规划图层
					outputFormat: 'application/json',
					viewparams: RouteParam
				};	
				$.ajax({  
					url: wfsUrl,
					data: $.param(RouteRequestParam), 
					type: 'GET',
					dataType: 'json',
					success: function(response){
						if(response.features.length > 0){
							var routeCoordinatesa = response.features[0].geometry.coordinates;
							var routeCoordinatesb = response.features[0].properties.line2.coordinates;
	
							routeFeature[0] = new ol.Feature({
								geometry: new ol.geom.LineString(routeCoordinatesa),
							});		
							routeFeature[1] = new ol.Feature({
								geometry: new ol.geom.LineString(routeCoordinatesb),
							});		
						
							// 规划完了之后默认显示在起点处
							setFloorAndCenter(RouteSourceFloor,sourceLabelX,sourceLabelY);
							setRouteStyleWithFloor();
							// RouteLayer.getSource().addFeatures(new ol.format.GeoJSON().readFeatures(response));
							RouteLayer.getSource().addFeatures(routeFeature);							
						}else{
							alert('未找到合适的路线！');
						}

					}
				});				
			}

			overmap.getLayers().extend([RouteLayer]);	
			labelOnMapClear();	
			loadselectSingleClick();
		}
	}
}
// 跨楼层路径规划设置默认显示在起点位置和所在楼层
function setFloorAndCenter(floor,geomx,geomy){
	view.setCenter([geomx,geomy]);
	// 当所在楼层不是起点所在楼层时，切换到起点的楼层
	if (floor != floorid){
		//起点楼层的图标高亮
		var floorLength = document.getElementsByClassName('floorS').length;
		for (var i =0; i< floorLength; i++){
			document.getElementsByClassName('floorS')[i].classList.remove('active');
		}
		document.getElementsByClassName(floor)[0].classList.add('active');
		// 切换楼层
		floorUpdate(floor);
	}	
}

// 跨楼层路径规划设style
function setRouteStyleWithFloor(){
	if(RouteSourceFloor == floorid){
		routeFeature[0].setStyle(routeStyle[1]);
		routeFeature[1].setStyle(routeStyle[0]);
		RouteStartLayer.setOpacity(1);
		RouteDestLayer.setOpacity(0.4);		
	}else if (RouteTargetFloor == floorid){
		routeFeature[0].setStyle(routeStyle[0]);
		routeFeature[1].setStyle(routeStyle[1]);
		RouteStartLayer.setOpacity(0.4);
		RouteDestLayer.setOpacity(1);		
	}else{
		routeFeature[0].setStyle(routeStyle[0]);
		routeFeature[1].setStyle(routeStyle[0]);
		RouteStartLayer.setOpacity(0.4);
		RouteDestLayer.setOpacity(0.4);		
	}
}

// 清空路径规划
function clearPath(){
	// 初始化输入框
	clearPathDoc();
	// 初始化路径规划layers
	clearPathLayers();
	// 删除地图选点 interaction
	labelOnMapClear();		
	// 初始化取点Flag
	LabelAction = null;
	// 初始化路径规划功能Flag
	pathPlanningOFF = true;
}
// 清空路径规划结果
function clearPathDoc(){
	document.getElementById('label-start').value = '';
	document.getElementById('label-end').value = '';
}
// 清空layer的source
function clearPathLayers(){
	if (RouteStartLayer != null ){overmap.getLayers().remove(RouteStartLayer);RouteStartLayer=null;}
	if (RouteDestLayer != null ){overmap.getLayers().remove(RouteDestLayer);RouteDestLayer=null;}
	if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);RouteLayer=null;}
}

// 关闭路径规划
function backPathPlan(){
	// 清除路径规划
	clearPath();
	// 打开点选功能
	loadselectSingleClick(); 
}

function setMyLocation(){	
	if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
	LabelX = locate[0];
	LabelY = locate[1];
	myLocate = new ol.Feature({
		geometry: new ol.geom.Point(locate)
	});
	if (LabelAction == 'startLabel'){
		sourceLabelX = LabelX;
		sourceLabelY = LabelY;
		myLocate.set('sfloor',locateFloor);
		RouteStartLayer.getSource().addFeature(myLocate);	
		overmap.getLayers().extend([RouteStartLayer]);	
		RouteSourceFloor = locateFloor;
	}else if (LabelAction == 'endLabel'){
		targetLabelX = LabelX;
		targetLabelY = LabelY;
		myLocate.set('efloor',locateFloor);
		RouteDestLayer.getSource().addFeature(myLocate);	
		overmap.getLayers().extend([RouteDestLayer]);	
		RouteTargetFloor = locateFloor;
	}
	StartPathPlanning();	
	LabelX = null;
	LabelY = null;
}

function setlabelOnMap(){	
	if (!LabelOnMapFlag){
		labelOnMap = new ol.interaction.Select({
			layers: [selectSingleClickLayter],
			style: selectSingleClickStyle,
		});
		map.addInteraction(labelOnMap);
		if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
		labelOnMap.on('select', function(e) {
			if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
			if (LabelAction == 'startLabel'){
				if (RouteStartLayer != null ){RouteStartLayer.getSource().clear();}
			}else if(LabelAction == 'endLabel'){
				if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
			}
			var coordinate;
			var geom = e.selected[0].values_.geometry;
			// var geomtype = geom.getType();
			// if (geomtype == 'Polygon'){
				// coordinate = geom.getInteriorPoint().getCoordinates();
			// }else if (geomtype == 'Point'){
				coordinate = geom.getCoordinates();
			// }	
			myPoint = new ol.Feature({
				geometry: new ol.geom.Point(coordinate)
			});
			LabelX = coordinate[0];
			LabelY = coordinate[1];
			if (LabelAction == 'startLabel'){
				sourceLabelX = LabelX;
				sourceLabelY = LabelY;
				myPoint.set('sfloor',e.selected[0].values_.floor_id);
				RouteStartLayer.getSource().addFeature(myPoint);		
				overmap.getLayers().extend([RouteStartLayer]);	
				RouteSourceFloor = e.selected[0].values_.floor_id;
			}else if (LabelAction == 'endLabel'){
				targetLabelX = LabelX;
				targetLabelY = LabelY;
				myPoint.set('efloor',e.selected[0].values_.floor_id);
				RouteDestLayer.getSource().addFeature(myPoint);	
				overmap.getLayers().extend([RouteDestLayer]);	
				RouteTargetFloor = e.selected[0].values_.floor_id;
			}
			StartPathPlanning();	
			LabelX = null;
			LabelY = null;				
		});
		LabelOnMapFlag = true;
	}else{
		map.removeInteraction(labelOnMap);
		LabelOnMapFlag = false;
	}
}

function setlabelOnClick(LabelAction,coordinate,ClickFloor){
	if (LabelAction == 'startLabel'){
		if (RouteStartLayer != null ){RouteStartLayer.getSource().clear();}
	}else if(LabelAction == 'endLabel'){
		if (RouteDestLayer != null ){RouteDestLayer.getSource().clear();}
	}
	myPoint = new ol.Feature({
		geometry: new ol.geom.Point(coordinate)
	});
	LabelX = coordinate[0];
	LabelY = coordinate[1];
	if (LabelAction == 'startLabel'){
		sourceLabelX = LabelX;
		sourceLabelY = LabelY;
		myPoint.set('sfloor',ClickFloor);
		RouteStartLayer.getSource().addFeature(myPoint);		
		overmap.getLayers().extend([RouteStartLayer]);	
		RouteSourceFloor = ClickFloor;
	}else if (LabelAction == 'endLabel'){
		targetLabelX = LabelX;
		targetLabelY = LabelY;
		myPoint.set('efloor',ClickFloor);
		RouteDestLayer.getSource().addFeature(myPoint);	
		overmap.getLayers().extend([RouteDestLayer]);	
		RouteTargetFloor = ClickFloor;
	}
	StartPathPlanning();	
	LabelX = null;
	LabelY = null;				
}

function clearStartLabel(){
	if (LabelOnMapFlag && LabelAction == 'startLabel'){
		map.removeInteraction(labelOnMap);
		LabelOnMapFlag = false;		
	}	
	if (RouteStartLayer != null ){overmap.getLayers().remove(RouteStartLayer);}
	if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
	document.getElementById('label-start').value = '';	
}

function clearEndLabel(){
	if (LabelOnMapFlag && LabelAction == 'endLabel'){
		map.removeInteraction(labelOnMap);
		LabelOnMapFlag = false;		
	}
	if (RouteDestLayer != null ){overmap.getLayers().remove(RouteDestLayer);}
	if (RouteLayer != null ){overmap.getLayers().remove(RouteLayer);}
	document.getElementById('label-end').value = '';	
}














