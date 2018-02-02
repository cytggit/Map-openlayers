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
function selectPoi(){
	
	removeselect();
	
	var searchKeyDummy = document.getElementById('work-search').value;
	var searchKey = searchKeyDummy.replace(/'/g, "");

	
	if(searchKey == '' ){
		$('#search_result').empty();
			//alert('请输入要搜索的关键字~');
	}else{
		requestSelect(searchKey);
	}
}
var eventName = (navigator.userAgent.indexOf("MSIE")!=-1) ? "propertychange" :"input";

$("#work-search").bind(eventName,function(){
	selectPoi();
});
function requestSelect(searchKey){
		var selectRequestParam = {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typeName: DBs + ':select', // 定位点图层
			outputFormat: 'application/json',
			cql_filter: "place_id=" + placeid + " and name like '%"+str2Unicode(searchKey)+"%'"
		};		
		$.ajax({  
			url: wfsUrl,
			data: $.param(selectRequestParam), 
			type: 'GET',
			dataType: 'json',
			success: function(response){
				var selects = new ol.format.GeoJSON().readFeatures(response);
				if(selects.length == 0){
					$('#search_result').empty();
					$('#search_result').css('display', 'none');
					//alert('未搜索到' +searchKey+ '相关信息!');
				}else{
					var laver;
					laver = "<table id='ret'>";
					for (var i = 0; i < selects.length; i++) {
						laver += "<tr id='sel'><td class='line'>" 
						+"<span hidden class='lineno'>"+i+"、</span>"
						+selects[i].get('name')
						+"<span  style='float:right'>F"+selects[i].get('floor_id')+"</span>"+ "</td></tr>";
					}
					laver += "</table>";
					$('#search_result').empty();
					$('#search_result').html(laver);
					$('.line:first').addClass('hover');
					$('#search_result').css('display', '');

					$('.line').hover(function() {
						$('.line').removeClass('hover');
						$(this).addClass('hover');
					}, function() {
						$(this).removeClass('hover');
					});
					$('.line').click(function() {
						
						$('.control-search').attr("onclick","removeselect();");
						//$('.control-search img').removeAttr("src");
						$('.control-search img').attr("src","./icon/delete.png");
						
						var selectFeature = selects[$(this).text().split("、")[0]];
						var selectGeom = selectFeature.getGeometry().getCoordinates();
						
						$('#work-search').val(selectFeature.get('name'));
						
						setFloorAndCenter(selectFeature.get('floor_id'),selectGeom[0],selectGeom[1]);
						selectLayer.setStyle(selectStyle[30050100]);
						//selectLayer.setStyle(selectStyle[selectFeature.get('feature_id')]);
						select_wfs.addFeature(selectFeature);
						selectLayer.setSource(select_wfs);		
						
						$('#search_result').empty();
						
						selectinfo = 'select';
					})
				}				
			}
			
		}); 	
}

function getselectLayerSource(featureid){
	var selectRequestParam = {
		service: 'WFS',
		version: '1.1.0',
		request: 'GetFeature',
		typeName: DBs + ':select', // 定位点图层
		outputFormat: 'application/json',
		cql_filter: "place_id=" + placeid + " and floor_id='" + floorid + "' and feature_id =" + featureid
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
		if(selectinfo == 'select'){
			$('.control-search').attr("onclick","selectPoi();");
			$('.control-search img').attr("src","./icon/search.png");
			document.getElementById('work-search').value = '';
		}
		selectLayer.getSource().clear();
		selectinfo = null;
	}
}	
