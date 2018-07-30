
// 路径规划
var pathPlanningOFF = true; // 当为FALSE时不执行路径规划任何功能  防止路径规划功能被重复打开
var myLocate,myPoint; // 选择中心点、地图选点作为起终点
var RouteStartLayer,RouteDestLayer,RouteLayer; // 分别为起点图层、终点图层、路线图层
var startRouteStyle,destRouteStyle;// 分别为起点style、终点style
var routeFeature = []; // 跨楼层路径规划时，存放规划出来的路线
var RouteParam,sourceLabelX,sourceLabelY,targetLabelX,targetLabelY; // 取得路线的param及param下起终点的坐标值
var RouteSourceFloor,RouteTargetFloor; // 路径规划起终点所在的楼层
var LabelAction = null;  // 记录当前取点是起点或者终点
var LabelX,LabelY; // 取起点或终点时临时存储坐标值
var labelOnMap; // 点选起终点的interaction
var LabelOnMapFlag = false; // 点选起终点的Flag 当为FALSE时启动点选
var NaviFlag = false; //导航开关flag
