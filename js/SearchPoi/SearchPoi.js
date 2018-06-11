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
						var geom = selects[i].getGeometry().getCoordinates();
						var lon = geom[0];
						var lat = geom[1];
						var name = selects[i].get('name');
						var site = selects[i].site == null ? "" : selects[i].site;
						laver += "<tr id='sel'><td class='line' id="+selects[i].id_ +">"
						+"<img  style='float:left; margin:1rem  0.8rem;' src='icon/site.png'/>"
						+"<div  style='float:left;margin:5px; '>"
							+"<span hidden class='lineno' style='font-size:1.2rem;line-height:2.4rem;'>"+ i+ "、"+ "</span>"+ name + "</br>"
							+"<span  style='float:left;font-size:10px;'>F"+selects[i].get('floor_id')+"</span> "
						+"</div>"
						+"<div  style='float:right;margin:1rem  0.8rem;' onclick='plannig("+lon+","+lat+",\""+name+"\",\"" + selects[i].get('floor_id') + "\""+")'><img src='icon/navi.png'/></div>"
						
						+"</td></tr>";
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
						
						$('.control-delete').css("display","block");
						
						var selectFeature = selects[$(this).text().split("、")[0]];
						var selectGeom = selectFeature.getGeometry().getCoordinates();
						
						$('#work-search').val(selectFeature.get('name'));
						
						setFloorAndCenter(selectFeature.get('floor_id'),selectGeom[0],selectGeom[1]);
						selectLayer.setStyle(selectStyle[30050100]);
						select_wfs.addFeature(selectFeature);
						selectLayer.setSource(select_wfs);		
						
						//$('#search_result').empty();

						selectinfo = 'select';
						//计算距离[121.42308,31.16801]
						var length = distanceFromAToB(selectGeom,locate);
						//显示div框
						var len = "距离：" + parseInt(length)+ "米";
						$(".div2").show();
						$(".site").html(selectFeature.get('name'));
						$(".floor").html(selectFeature.get('floor_id') + "层");
						$("#length").html(len);
						$("#ms").html(null);
						$("#mark").html(null);
						
						//存放数据
						$("#gps_x").val(selectGeom[0]);
						$("#gps_y").val(selectGeom[1]);
						$("#gps_name").val(selectFeature.get('name'));
						$("#gps_fid").val(selectFeature.get('floor_id'));
					})
				}				
			}
			
		}); 	
}
//点击"去这里"规划路线
$(".walk").click(function(){
	$(".div2").hide();
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
			document.getElementById('work-search').value = '';
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
	$('.control-delete').css("display","none");
}