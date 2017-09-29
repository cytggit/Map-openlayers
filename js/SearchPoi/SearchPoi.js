// 查找-WC
function selectToilet(){
	if (selectinfo == 'selectToilet') {
		removeselect();
	}else {
		removeselect();
		selectinfo = 'selectToilet';
		var featureid = '30050100';	
		selectLayer.setStyle(selectStyle[featureid]);
		getselectLayerSource(featureid);			
	}
}
// 查找-大门
function selectDoor(){
	if (selectinfo == 'selectDoor'){
		removeselect();		
	}else {
		removeselect();
		selectinfo = 'selectDoor';
		var featureid = '30050800';
		selectLayer.setStyle(selectStyle[featureid]);
		getselectLayerSource(featureid);	
	}
}
// 增加检索图层
function getselectLayerSource(featureid){
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
