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
		$('.control-delete').css("display","block");
	}
}
// 查找-电梯
function selectElevator(){
	if (selectinfo == 'selectElevator') {
		removeselect();
	}else {
		removeselect();
		selectinfo = 'selectElevator';
		var featureid = '30050300';	
		selectLayer.setStyle(selectStyle[featureid]);
		getselectLayerSource(featureid);	
		$('.control-delete').css("display","block");		
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
		$('.control-delete').css("display","block");
	}
}

function clearSearchText(){
	document.getElementById('work-search').value = '';
	$('#search_result').empty();
}

// 实时检索
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
			cql_filter: "place_id=" + placeid + " and name like '%"+str2Unicode(searchKey)+"%'",
			sortby: "floor_id,name"
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
						var geom = selects[i].getGeometry().getCoordinates();
						var lon = geom[0];
						var lat = geom[1];
						var name = selects[i].get('name');
						var site = selects[i].site == null ? "" : selects[i].site;
						laver += "<tr id='sel'><td class='line' id="+selects[i].id_ +" style='border-radius: 3px;'>"
						+"<img  style='float:left; margin:20px 5%;' src='images/u84.png'/>"
						+"<div  style='float:left; padding: 12px;'>"
							+"<span hidden class='lineno' style='font-size:1.2rem;line-height:2.4rem;'>"+ i+ "、"+ "</span>"+ name + "</br>"
							+"<span  style='float:left;font-size:10px;'>F"+selects[i].get('floor_id')+"</span> "
						+"</div>"
						+"<div class='line-route' style='float:right;margin:20px 5%;' onclick='plannig("+lon+","+lat+",\""+name+"\",\"" + selects[i].get('floor_id') + "\""+")'><img src='images/u85.png'/></div>"
						+"<img id='u16_img' style='float: right;width: 90%;height: 1px;' class='img ' src='images/u55.png'/>"
						+"</td></tr>"
						; 
					}
					laver += "</table>";
					$('#search_result').empty();
					$('#search_result').html(laver);
					$('.line:first').addClass('hover');
					$('.line:first').css('background' , 'rgb(22, 155, 213)' );
					$('.hover img').attr("src","images/u80.png");
					$('.hover div img').attr("src","images/u81.png");
					$('#search_result').css('display', '');

					$('.line').hover(function() {
						$('.line').removeClass('hover');
						$(this).addClass('hover');
						$('.line').css('background' , 'rgb(255, 255, 255)' );
						$('.line img').attr("src","images/u84.png");
						$('.line div img').attr("src","images/u85.png");
						$(this).css('background' , 'rgb(22, 155, 213)' );
						$('.hover img').attr("src","images/u80.png");
						$('.hover div img').attr("src","images/u81.png");
					}, function() {
						$('.hover').css('background' , 'rgb(255, 255, 255)' );
						$('.hover img').attr("src","images/u84.png");
						$('.hover div img').attr("src","images/u85.png");
						$(this).removeClass('hover');
					});
					$('.line').click(function() {
						var selectFeature = selects[$(this).text().split("、")[0]];
						showSelectDetail(selectFeature);
					})
				}				
			}
			
		}); 	
}
function showSelectDetail(selectFeature){
	$('.control-delete').css("display","block");
	console.log($('.search-input').text());
	$('.search-input').text("666");
	
	var selectGeom = selectFeature.getGeometry().getCoordinates();					
	var selectName = selectFeature.get('name');
	var selectFloor = selectFeature.get('floor_id');
	
	setFloorAndCenter(selectFloor,selectGeom[0],selectGeom[1]);
	selectLayer.setStyle(selectStyle[30050100]);
	select_wfs.clear();
	select_wfs.addFeature(selectFeature);
	selectLayer.setSource(select_wfs);		
	//$('#search_result').empty();
	selectinfo = 'select';
	
	if(!checkAPPFlag){/* 非PC端 */
		
		//计算距离
		var length = distanceFromAToB(selectGeom,locate);
		//显示div框
		var flr = "楼层：" + selectFloor + "层";
		var len = "距离：" + parseInt(length)+ "米";
		$(".div2").show();
		$(".site").html(selectName);
		$(".floor").html(flr);
		$("#length").html(len);
		$("#ms").html(null);
		$("#mark").html(null);
		
		//存放数据
		$("#gps_x").val(selectGeom[0]);
		$("#gps_y").val(selectGeom[1]);
		$("#gps_name").val(selectName);
		$("#gps_fid").val(selectFloor);
		$("#gps_lid").val(selectFeature.get('l_id'));
		
		// 判断是否收藏
		checkCollection();
	}else{
		
	}
}
//点击"去这里"规划路线
$(".walk").click(function(){
	$(".div2").hide();
	$('.control-delete').css("display","none");
	var lon = parseFloat($("#gps_x").val());
	var lat = parseFloat($("#gps_y").val());
	var name = $("#gps_name").val();
	var floorId = $("#gps_fid").val();
	plannig(lon,lat,name,floorId);
})
//直接规划路线
function plannig(lon, lat, name,floorId){
	removeselect();
	removeSelectSingleClick();
	// 清除路径规划
	clearPath();		
	// 打开路径规划功能
	pathPlanningMain();
	// 设置终点为选中的点，自动规划完路线
	LabelAction = 'endLabel';
	document.getElementById('label-end').value = name;
	var coordinate = [lon,lat];

	setlabelOnClick(LabelAction,coordinate,floorId);
	$("#search").val("");
	$('#search_result').empty();
	$('#searchPageModal').modal('hide');
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
			$('.search-input').val = '';
		}
		selectLayer.getSource().clear();
		selectinfo = null;
	}
}	

// 点击返回清空搜索狂
$("#clean").click(function() {
	$("#search").val("");
	$('#search_result').empty();
})

//清空
function removesome(){
	//隐藏
	$(".div2").hide();
	// 清除检索
	removeselect();
	// 关闭路径规划
	if (!pathPlanningOFF){
		clearPath();
	}
	$('#search_result').empty();
	$('.control-delete').css("display","none");
}