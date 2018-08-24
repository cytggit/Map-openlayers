function loadTable(){
	placecheck.onchange = function(){
		placeType = placecheck.value;
		if(placeType == 'null'){
			placeid = '0';
			tablecheck.value = 'null';
			$("#tabel-key").html("");
		}else if(placeType == 'newplace'){
			tablecheck.value = 'polygon_background';
			$("#tabel-key").html(place + feature + floor + Fname);
		}else{
			if(placeid != placeType){
				placeid = placeType;
				view.setCenter(mapCenter(placeid));
				getGeomData();
				// 刷新图层
				Refreshlayer();
				getFloorList();
			}

		}
		
		// 当编辑打开时，判断之前的编辑操作是否需要保存
		if(drawFlag){
			checkDrawData();
			drawtype = null;
		}
		// 根据background的floor动态生成楼层选择框
		// changeFloor();
	}
	
	tablecheck.onchange = function(){
		// 当编辑打开时，判断之前的编辑操作是否需要保存
		if(drawFlag){
			checkDrawData();
			drawtype = null;
		}
		tableType = tablecheck.value;
		switch (tableType){
			case 'null':
				$("#tabel-key").html("");
				break;
			case 'polygon_background':
				$("#tabel-key").html(place + floor + Fname);
				break;
			case 'point':
				$("#tabel-key").html(feature + Fname + node + cnodeu + cnoded + angle + lonlat);
				break;
			case 'polygon':
				$("#tabel-key").html(feature + Fname +penup);
				break;
			case 'polyline':
				$("#tabel-key").html(feature + Fname);
				break;
			case 'electronic_fence':
				// 显示电子围栏
				electronicFence();
				$("#tabel-key").html(electronic_type + Fname);
				break;
		}
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
}

function initdraw(){
	DrawFeature = {
		init: function() {
			map.addInteraction(this.point);
			map.addInteraction(this.polyline);
			map.addInteraction(this.polygon_background);
			map.addInteraction(this.polygon);
			map.addInteraction(this.electronic_fence);
			this.point.setActive(false);
			this.polyline.setActive(false);
			this.polygon_background.setActive(false);
			this.polygon.setActive(false);
			this.electronic_fence.setActive(false);
		},
		point: new ol.interaction.Draw({
			source: pointLayer.getSource(),
			type: /** @type {ol.geom.GeometryType} */ ('Point'),
			geometryName: 'geom',
		}),
		polyline: new ol.interaction.Draw({
			source: roadLayer.getSource(),
			type: /** @type {ol.geom.GeometryType} */ ('LineString'),
			geometryName: 'geom',
		}),
		polygon_background: new ol.interaction.Draw({
			source: backgroundLayer.getSource(),
			type: /** @type {ol.geom.GeometryType} */ ('Polygon'),
			geometryName: 'geom',
		}),
		polygon: new ol.interaction.Draw({
			source: polygonLayer.getSource(),
			type: /** @type {ol.geom.GeometryType} */ ('Polygon'),
			geometryName: 'geom',
		}),
		electronic_fence: new ol.interaction.Draw({
			source: electronicLayer.getSource(),
			type: /** @type {ol.geom.GeometryType} */ ('Polygon'),
			geometryName: 'geom'
		}),
		setActive: function(active) {
			this[tableType].setActive(active);
		}			
	};
	DrawFeature.init(); 
	
	ModifyFeature = {
		init: function() {
			this.point = new ol.interaction.Select({
				layers: [pointLayer]
			}); 
			this.polyline = new ol.interaction.Select({
				layers: [roadLayer]
			}); 
			this.polygon_background = new ol.interaction.Select({
				layers: [backgroundLayer]
			}); 
			this.polygon = new ol.interaction.Select({
				layers: [polygonLayer]
			}); 
			this.electronic_fence = new ol.interaction.Select({
				layers: [electronicLayer]
			}); 
			this.pointmodify = new ol.interaction.Modify({
				features: this.point.getFeatures()
			});
			this.polylinemodify = new ol.interaction.Modify({
				features: this.polyline.getFeatures()
			});
			this.polygon_backgroundmodify = new ol.interaction.Modify({
				features: this.polygon_background.getFeatures()
			});
			this.polygonmodify = new ol.interaction.Modify({
				features: this.polygon.getFeatures()
			});
			this.electronic_fencemodify = new ol.interaction.Modify({
				features: this.electronic_fence.getFeatures()
			});
			map.addInteraction(this.point);
			map.addInteraction(this.polyline);
			map.addInteraction(this.polygon_background);
			map.addInteraction(this.polygon);
			map.addInteraction(this.electronic_fence);	
			map.addInteraction(this.pointmodify);
			map.addInteraction(this.polylinemodify);
			map.addInteraction(this.polygon_backgroundmodify);
			map.addInteraction(this.polygonmodify);
			map.addInteraction(this.electronic_fencemodify);
			this.point.setActive(false);
			this.polyline.setActive(false);
			this.polygon_background.setActive(false);
			this.polygon.setActive(false);
			this.electronic_fence.setActive(false);	
			this.pointmodify.setActive(false);
			this.polylinemodify.setActive(false);
			this.polygon_backgroundmodify.setActive(false);
			this.polygonmodify.setActive(false);
			this.electronic_fencemodify.setActive(false);		
		},
		setActive: function(active) {
			this[tableType].setActive(active);
			this[tableType + 'modify'].setActive(active);
		}
	};
	ModifyFeature.init();	
	
	DeleteFeature = {
		init: function() {
			this.point = new ol.interaction.Select({
				layers: [pointLayer]
			}); 
			this.polyline = new ol.interaction.Select({
				layers: [roadLayer]
			}); 
			this.polygon_background = new ol.interaction.Select({
				layers: [backgroundLayer]
			}); 
			this.polygon = new ol.interaction.Select({
				layers: [polygonLayer]
			}); 
			this.electronic_fence = new ol.interaction.Select({
				layers: [electronicLayer]
			}); 
			map.addInteraction(this.point);
			map.addInteraction(this.polyline);
			map.addInteraction(this.polygon_background);
			map.addInteraction(this.polygon);
			map.addInteraction(this.electronic_fence);
			this.point.setActive(false);
			this.polyline.setActive(false);
			this.polygon_background.setActive(false);
			this.polygon.setActive(false);
			this.electronic_fence.setActive(false);		
		},
		setActive: function(active) {
			this[tableType].setActive(active);
		}
	};
	DeleteFeature.init();	
}


// 绘制MAIN
function Updatedraw(drawinfo){
	if(placeType == 'null'){
		alert('请选择待编辑的区域');
	}else if(tableType =='null'){
		alert('请选择待编辑的表');
	}else{
		drawFlag = true;
		var newDrawtype = drawinfo.id;
		//本次编辑和上次不同
		if (drawtype != newDrawtype ){
			// 关闭上一次的编辑并判断之前的编辑操作（draw or modify）是否需要保存
			checkDrawData();
	
			switch (newDrawtype) {  
				case 'addData': 
					console.log(drawinfo.innerText);
					addData();
					break;
				case 'updata': 
					console.log(drawinfo.innerText);
					updata();
					break;
				case 'deletedata': 
					console.log(drawinfo.innerText);
					deletedata();
					break;
			}		
			drawtype = newDrawtype;
		}		
	}
}	
// 判断之前的编辑操作（draw or modify）是否需要保存
function checkDrawData(){	
	// 关闭上一次的编辑
	switch (drawtype) {  
		case 'addData': 
			DrawFeature.setActive(false);
			break;
		case 'updata': 
			ModifyFeature.setActive(false);
			break;
		case 'deletedata': 
			DeleteFeature.setActive(false);
			break;
	}			
	// 保存上一次的编辑
	if(FeatureDummy.length != 0){
		// 弹出是否保存
		if(confirm("有未保存的编辑，是否需要保存？")){
			SaveData();
		}else{
			FeatureDummy = [];
			Refreshlayer();
			alert('已清除未保存的编辑！');
		}
	}	
}

// 新增
function addData(){
	DrawFeature.setActive(true);
	
	// 测算长度
	if(tableType == 'polyline' || tableType == 'polygon'){
		var listener;
		DrawFeature[tableType].on('drawstart',
			function(evt) {
				measureTooltipElement = null;
				createMeasureTooltip();
				// set sketch
				sketch = evt.feature;
				tooltipCoord = evt.coordinate;
				listener = sketch.getGeometry().on('change', function(evt) {
					var target = evt.target;
					var geom = tableType == 'polyline' ? evt.target.getCoordinates(): evt.target.getCoordinates()[0];
					var output = formatLength(geom);
					var tooltipCoord = target.getLastCoordinate();
					measureTooltipElement.innerHTML = output;
					measureTooltips[measureNum].setPosition(tooltipCoord);
				});
			}, this);
	}

	// 判断编辑的表
	newdrawNum=0;
	DrawFeature[tableType].on('drawend',
		function(evt) {
			var newCoordinates = [];
			var oldCoordinates;
			
			newFeature = new ol.Feature();
			newFeature.setId(placeType + tableType + newdrawNum);
			newFeature.setGeometryName('geom');	
			newFeature.set('geom', null);
			
			if (tableType == 'point'){
				oldCoordinates = evt.feature.values_.geom.getCoordinates();
				document.getElementById('lonlat_value').value = oldCoordinates[0].toFixed(8) +","+ oldCoordinates[1].toFixed(8);
				var Coordinates = [oldCoordinates[1],oldCoordinates[0]];
				newFeature.setGeometry(new ol.geom.Point(Coordinates));
			}else if (tableType == 'polyline'){
				removeLength();
				var Coordinates = evt.feature.values_.geom.getCoordinates();
				var CoordinatesLength = Coordinates.length;
				for (var i=0;i<CoordinatesLength;i++){
					oldCoordinates = Coordinates[i];
					newCoordinates[i] = [oldCoordinates[1],oldCoordinates[0]];
				}
				newFeature.setGeometry(new ol.geom.LineString(newCoordinates));							
			}else{
				removeLength();
				var Coordinates = evt.feature.values_.geom.getCoordinates()[0];
				var CoordinatesLength = Coordinates.length;
				for (var i=0;i<CoordinatesLength;i++){
					oldCoordinates = Coordinates[i];
					newCoordinates[i] = [oldCoordinates[1],oldCoordinates[0]];
				}
				newFeature.setGeometry(new ol.geom.Polygon([newCoordinates]));				
			}
		}, this);			
}
function getcolumn(){
	if ( newFeature != null ){
		switch (tableType){
			case 'polygon_background':
				if (document.getElementById('place_value').value == ''){
					alert('请输入place id');
				}else if (document.getElementById('floor_value').value == ''){
					alert('请输入floor');
				}else if (document.getElementById('name_value').value == ''){
					alert('请输入feature名称');
				}else {
					newFeature.set('place_id', document.getElementById('place_value').value);
					newFeature.set('floor_id', document.getElementById('floor_value').value);
					newFeature.set('feature_id', '999999');
					newFeature.set('name', document.getElementById('name_value').value);
					FeatureDummy[newdrawNum] = newFeature;	
					newdrawNum++;
					newFeature =  null;
					clearAllcolumn();
				}	
				break;
			case 'point':
				if (document.getElementById('feature_value').value == ''){
					alert('请输入feature_id');
				}else if (document.getElementById('name_value').value == ''){
					alert('请输入feature名称');
				}else {
					newFeature.set('place_id', placeid);
					newFeature.set('floor_id', floorid);
					newFeature.set('feature_id', document.getElementById('feature_value').value);
					newFeature.set('name', document.getElementById('name_value').value);
					newFeature.set('node', document.getElementById('node_value').value);
					newFeature.set('cnodeu', document.getElementById('cnodeu_value').value);
					newFeature.set('cnoded', document.getElementById('cnoded_value').value);
					newFeature.set('angle', document.getElementById('angle_value').value);
					FeatureDummy[newdrawNum] = newFeature;	
					newdrawNum++;
					newFeature =  null;
					clearAllcolumn();
				}	
				break;
			case 'polygon':
				if (document.getElementById('feature_value').value == ''){
					alert('请输入feature_id');
				}else if (document.getElementById('name_value').value == ''){
					alert('请输入feature名称');
				}else {
					newFeature.set('place_id', placeid);
					newFeature.set('floor_id', floorid);
					newFeature.set('feature_id', document.getElementById('feature_value').value);
					newFeature.set('name', document.getElementById('name_value').value);
					newFeature.set('penup', document.getElementById('penup_value').value);
					FeatureDummy[newdrawNum] = newFeature;	
					newdrawNum++;
					newFeature =  null;
					clearAllcolumn();
				}	
				break;
			case 'polyline':
				if (document.getElementById('feature_value').value == ''){
					alert('请输入feature_id');
				}else if (document.getElementById('name_value').value == ''){
					alert('请输入feature名称');
				}else {
					newFeature.set('place_id', placeid);
					newFeature.set('floor_id', floorid);
					newFeature.set('feature_id', document.getElementById('feature_value').value);
					newFeature.set('name', document.getElementById('name_value').value);
					FeatureDummy[newdrawNum] = newFeature;	
					newdrawNum++;
					newFeature =  null;
					clearAllcolumn();
				}	
				break;
			case 'electronic_fence':
				if (document.getElementById('electronic_type_value').value == ''){
					alert('请输入电子围栏的等级');
				}else if (document.getElementById('name_value').value == ''){
					alert('请输入feature名称');
				}else {
					newFeature.set('place_id', placeid);
					newFeature.set('floor_id', floorid);
					newFeature.set('type_id', document.getElementById('electronic_type_value').value);
					newFeature.set('name', document.getElementById('name_value').value);
					FeatureDummy[newdrawNum] = newFeature;	
					newdrawNum++;
					newFeature =  null;
					clearAllcolumn();
				}	
				break;				
		}
	}else {
		alert('请先编辑形状');
	}
}

// 修改
function updata(){
	ModifyFeature.setActive(true);
	// 选中时获取要素信息，加载到输入框中
	ModifyFeature[tableType].on('select',
		function(evt){
			var selectInfo = evt.target.getFeatures().getArray()[0].values_;
			setcolumn(selectInfo);
		},this);
	
	newdrawNum =0;
	var modifyIdInfo = [];
	ModifyFeature[tableType + 'modify'].on('modifyend',
		function(evt) {
			var modifyId = evt.features.getArray()[0].id_;
			var modifyInfo = evt.features.getArray()[0].values_;
			
			var newCoordinates = [];
			var oldCoordinates;
			
			newFeature = new ol.Feature();
			newFeature.setId(modifyId);
			newFeature.setGeometryName('geom');	
			newFeature.set('geom', null);	

			if (tableType == 'point'){
				oldCoordinates = modifyInfo.geometry.getCoordinates();
				var Coordinates = [oldCoordinates[1],oldCoordinates[0]];
				newFeature.setGeometry(new ol.geom.Point(Coordinates));
			}else if (tableType == 'polyline'){
				var Coordinates = modifyInfo.geometry.getCoordinates();
				var CoordinatesLength = Coordinates.length;
				for (var i=0;i<CoordinatesLength;i++){
					oldCoordinates = Coordinates[i];
					newCoordinates[i] = [oldCoordinates[1],oldCoordinates[0]];
				}
				newFeature.setGeometry(new ol.geom.LineString(newCoordinates));							
			}else{
				var Coordinates = modifyInfo.geometry.getCoordinates()[0];
				var CoordinatesLength = Coordinates.length;
				for (var i=0;i<CoordinatesLength;i++){
					oldCoordinates = Coordinates[i];
					newCoordinates[i] = [oldCoordinates[1],oldCoordinates[0]];
				}
				newFeature.setGeometry(new ol.geom.Polygon([newCoordinates]));				
			}					
		}, this);			
}
function setcolumn(selectInfo){
		switch (tableType){
			case 'polygon_background':
				document.getElementById('place_value').value = selectInfo.place_id;
				document.getElementById('floor_value').value = selectInfo.floor_id;
				document.getElementById('name_value').value = selectInfo.name;
				break;
			case 'point':
				document.getElementById('feature_value').value = selectInfo.feature_id;
				document.getElementById('name_value').value = selectInfo.name;
				document.getElementById('node_value').value = selectInfo.node;
				document.getElementById('cnodeu_value').value = selectInfo.cnodeu;
				document.getElementById('cnoded_value').value = selectInfo.cnoded;
				document.getElementById('angle_value').value = selectInfo.angle;
				break;
			case 'polygon':
				document.getElementById('feature_value').value = selectInfo.feature_id;
				document.getElementById('name_value').value = selectInfo.name;
				document.getElementById('penup_value').value = selectInfo.penup;
				break;
			case 'polyline':
				document.getElementById('feature_value').value = selectInfo.feature_id;
				document.getElementById('name_value').value = selectInfo.name;
				break;
			case 'electronic_fence':
				document.getElementById('electronic_type_value').value =selectInfo.type_id;
				document.getElementById('name_value').value = selectInfo.name;
				break;				
		}	
}

// 删除
function deletedata(){
	DeleteFeature.setActive(true);
	DeleteFeature[tableType].on('select',
		function(evt) {
			if(evt.target.getFeatures().getArray().length != 0) {  
				var selectInfo = evt.target.getFeatures().getArray()[0].values_;
				setcolumn(selectInfo);
				// 弹出是否删除
				if(confirm("确认删除？")){
					var selectId = evt.target.getFeatures().getArray()[0].id_;
					
					var Coordinates = selectInfo.geometry.getCoordinates()[0];
					var CoordinatesLength = Coordinates.length;
					
					var newCoordinates = [];
					var oldCoordinates;
					for (var i=0;i<CoordinatesLength;i++){
						oldCoordinates = Coordinates[i];
						newCoordinates[i] = [oldCoordinates[1],oldCoordinates[0]];
					}
	
					newFeature = new ol.Feature();
					newFeature.setId(selectId);
					newFeature.setGeometryName('geom');	
					newFeature.set('geom', null);		
					newFeature.setGeometry(new ol.geom.Polygon([newCoordinates]));							
					
					updateNewFeature([newFeature],tableType,'remove');
					alert('删除要素成功！');	
					newFeature =  null;

					Refreshlayer();
					
				}else{
					alert('取消要素删除！');
					clearAllcolumn();
				}		
			}			
		}, this);			
}

// 保存编辑
function SaveData(){
	// request修改为获取下拉框的表名
	switch (drawtype) {  
		case 'addData': 
			updateNewFeature(FeatureDummy,tableType,'insert');
			alert('新增数据成功！');	
			break;
		case 'updata': 
			updateNewFeature(FeatureDummy,tableType,'update');
			alert('修改数据成功！');	
			break;
	}	
	FeatureDummy = [];
	
	Refreshlayer();
}
// 关闭编辑
function stopdraw(){
	// 判断是否已保存
	if(drawFlag){
		checkDrawData();	
		// 编辑的Flag初始化
		drawtype = null;
		drawFlag = false;
	}
}

// 显示电子围栏
function electronicFence(){
	electronicLayer.getSource().clear();
	if (electronicLayerOff) {
		getdrawLayer(':electronic_fence');
		electronicLayerOff = false;
	}else {
		electronicLayerOff = true;
	}	
}
function getdrawLayer(dbtype){
		var drawParam = {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typeName: DBs + dbtype, // 电子围栏图层
			outputFormat: 'application/json',
			cql_filter: 'place_id=' + placeid + ' and floor_id=\'' + floorid + '\''
		};	
		$.ajax({  
			url: wfsUrl,
			data: $.param(drawParam), 
			type: 'GET',
			dataType: 'json',
			success: function(response){
				var features = new ol.format.GeoJSON().readFeatures(response);
				switch(dbtype){
					case ':electronic_fence':
						electronicLayer.getSource().addFeatures(features);
						break;
				}
			}
		}); 		
}
// 清空所有输入框的值
function clearAllcolumn(){
	switch (tableType){
		case 'polygon_background':
			document.getElementById('place_value').value = '';
			document.getElementById('floor_value').value = '';
			document.getElementById('name_value').value = '';
			break;
		case 'point':
			document.getElementById('feature_value').value = '';
			document.getElementById('name_value').value = '';
			document.getElementById('node_value').value = '';
			document.getElementById('cnodeu_value').value = '';
			document.getElementById('cnoded_value').value = '';
			document.getElementById('angle_value').value = '';
			break;
		case 'polygon':
			document.getElementById('feature_value').value = '';
			document.getElementById('name_value').value = '';
			document.getElementById('penup_value').value = '';
			break;
		case 'polyline':
			document.getElementById('feature_value').value = '';
			document.getElementById('name_value').value = '';
			break;
		case 'electronic_fence':
			document.getElementById('electronic_type_value').value = '';
			document.getElementById('name_value').value = '';
			break;				
	}	
}

// 清空输入框的值
function clear_column(e){
	var columnName = e.id;
	switch (columnName){
		case 'clear_place':
			document.getElementById('place_value').value = '';	
			break;
		case 'clear_feature':
			document.getElementById('feature_value').value = '';	
			break;
		case 'clear_floor':
			document.getElementById('floor_value').value = '';	
			break;
		case 'clear_name':
			document.getElementById('name_value').value = '';	
			break;
		case 'clear_stime':
			document.getElementById('stime_value').value = '';	
			break;
		case 'clear_etime':
			document.getElementById('etime_value').value = '';	
			break;
		case 'clear_electronic_type':
			document.getElementById('electronic_type_value').value = '';	
			break;
		case 'clear_node':
			document.getElementById('node_value').value = '';	
			break;
		case 'clear_cnodeu':
			document.getElementById('cnodeu_value').value = '';	
			break;
		case 'clear_cnoded':
			document.getElementById('cnoded_value').value = '';	
			break;
		case 'clear_angle':
			document.getElementById('angle_value').value = '';	
			break;
		case 'clear_penup':
			document.getElementById('penup_value').value = '';	
			break;
	}		
}

// 刷新图层 背景，道路，poi
function Refreshlayer(){
	switch (tableType){
		case 'polygon_background':
			geomBackgrounds = geojsonObject('place_id='+placeid,':polygon_background');
			break;
		case 'point':
			geomPOIs = geojsonObject('place_id='+placeid,':point');
			break;
		case 'polygon':
			geomPolygons = geojsonObject('place_id='+placeid,':polygon');
			break;
		case 'polyline':
			geomPolylines = geojsonObject('place_id='+placeid,':polyline');
			break;
	}	
	// WFS
	backgroundLayer.getSource().clear();
	backgroundLayer.getSource().addFeatures(geomBackgrounds[floorid] != null ? geomBackgrounds[floorid]:[]);
	polygonLayer.getSource().clear();
	polygonLayer.getSource().addFeatures(geomPolygons[floorid] != null ? geomPolygons[floorid]:[]);
	roadLayer.getSource().clear();
	roadLayer.getSource().addFeatures(geomPolylines[floorid] != null ? geomPolylines[floorid]:[]);
	pointLayer.getSource().clear();
	pointLayer.getSource().addFeatures(geomPOIs[floorid] != null ? geomPOIs[floorid]:[]);
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
	if ( floorSelectId != floorid){
		floorUpdate(floorSelectId);
	}

}
// 切换楼层
function floorUpdate(newfloorId){
	// 取点击的楼层 赋值给floor_id   第二个字符后两位
	floorid = newfloorId;	
	$(".floorshow a").text('F' + newfloorId);
	// 刷新图层（背景，道路，poi 其他清空）
	Refreshlayer();	

	// 刷新电子围栏
	if(!electronicLayerOff){
		electronicLayerOff = true;
		electronicFence();
	}		
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

// 获取长度
formatLength = function(line) {
	var coordinates = line;
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

// 清除测距
function removeLength(){
	if (measureTooltips.length > 0){
		for ( var j=0 ; j < measureTooltips.length;j++){
			map.removeOverlay(measureTooltips[j]);
		}
	}
}