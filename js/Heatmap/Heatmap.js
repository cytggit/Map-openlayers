
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


