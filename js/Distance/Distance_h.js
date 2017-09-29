// 测距
var lengthoff = true; // 当为FALSE时不执行加载测距图层  防止测距图层多次被加入图层组
var lengthstop = true; // 当为FALSE时不执行测距功能  防止重复开启测距功能
var formatLength; // 计算线的长度
var wgs84Sphere = new ol.Sphere(6378137); // 计算线的长度所用常量
var sketch; // 绘制的形状
var drawend = true; // 绘制结束flag 判断执行停止或者清除时绘制的状态
var helpTooltipElement; //  帮助信息
var helpTooltip;  // 帮助的overlay
var measureTooltipElement; // 显示长度
var measureTooltips = [];//显示长度的overlay 
var measureNum=0; // 长度的overlay 计数
var drawlinestring,drawpoint; // 绘制的interaction
