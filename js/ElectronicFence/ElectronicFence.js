
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










