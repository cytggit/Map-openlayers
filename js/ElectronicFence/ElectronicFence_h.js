// 电子围栏
var electronicLayerOff = true; // 显示电子围栏的FLAG 当为true时显示电子围栏图层
var drawElectronicFlag = false;
var addElectronicFlag = false; // 第一次add后，设为true 
var updateElectronicFlag = false; // 第一次upd后，设为true 
var rmElectronicFlag = false; // 第一次rm后，设为true 
var drawtype = null;   // add or upd or rm
var DrawElectronicFence; // 绘制的interaction  draw
var ModifyElectronicFence; // 修改的interaction  select and modify
var DeleteElectronicFence; // 删除的interaction  select
// var electronicFeatureDummy = new ol.source.Vector(); // 电子围栏的feature 临时存储
var electronicFeatureDummy =[]; // 电子围栏的feature 临时存储


// 电子围栏样式设置
var electronicFenceStyleFun = function(feature){
	// var featureiiiid = feature.values_.type_id;
	var featureiiiid = '1';
	// 返回数据的style
	return electronicFenceStyle[featureiiiid];
};
