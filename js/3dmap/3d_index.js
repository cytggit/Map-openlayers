var viewer;

function load3dMap (){	
	viewer = new Cesium.Viewer('cesiumContainer',{
		animation: false,										//控制视图动画的播放(左下角)。 默认true
		// baseLayerPicker: false,							//控制底图和投影选择。默认true
		fullscreenButton: false,							//控制全屏。默认true
		// vrButton: true,										//控制VR（双屏）模式。默认false
		// geocoder: false,										//位置搜索框。默认true
		homeButton: false,									//控制viewer回到初始状态（比例尺和中心点）。默认true
		// infoBox: true,											//点击要素之后显示的信息（气泡窗口）。默认true
		sceneModePicker: false,							//控制2D,3D,2.5D。默认true
		// selectionIndicator:true,							//选中地图要素的标识控件。默认true
		timeline:false,											//指示当前时间，并允许用户跳转到特定时间。 。默认true
		navigationHelpButton:false, 					//帮助按钮(mouse or touch如何拖拽)。默认true
		// navigationInstructionsInitiallyVisible: false,	//帮助按钮相关，不懂！！！
		// scene3DOnly: true,									//3D,true时sceneModePicker为false。默认false
		// clockViewModel										//控制时间的模型
		// selectedImageryProviderViewModel		//不解释
		imageryProviderViewModels: [/*new Cesium.ProviderViewModel(
		           {
		               name : '高德地图',
		               iconUrl : '5555',//Cesium.buildModuleUrl(model.iconUrl),
		               tooltip : '6666',
		               creationFunction : function() {
		                 return cesiumAmap;
		                }
		           })*/],	/*设置自己的地图服务-影像图*/			//设置地图切换控件绑定底图数据源，跟baseLayerPicker属性设置true配合使用
		// selectedTerrainProviderViewModel			//不解释
		// terrainProviderViewModels:/*设置自己的地图服务-地形图*/,				//设置地图切换控件绑定底图数据源，跟baseLayerPicker属性设置true配合使用
		// imageryProvider:											//不解释
		// terrainProvider											//不解释
		// skyBox														//天空（星星）的渲染，3D时有效
		// skyAtmosphere										//地球周围的光芒，3D时有效
		// fullscreenElement: 'cesiumContainer',		//全屏时被放进全屏的页面元素，fullscreenButton为true时有效。默认document.body
		// useDefaultRenderLoop:true,					//控制渲染循环，false的时候不出图。默认true
		// targetFrameRate										//不懂！！！
		// showRenderLoopErrors							//渲染循环发生错误时提示error
		// automaticallyTrackDataSourceClocks		//不懂！！！
		// contextOptions										//上下文和WebGL创建属性对应options传递给Scene。不懂！！！
		sceneMode: Cesium.SceneMode.COLUMBUS_VIEW,							//控制默认3D模式，可设置默认为2D\3D\2.5D模式
		// mapProjection											//地图投影，2D、哥伦布视图有效
		// globe														//地球渲染，
		// orderIndependentTranslucency				//不懂！！！如果配置支持则使用独立的半透明
		creditContainer: 'cesiumContainer',							//底部信息展示的窗口，没有指定的话，默认在控件本身的底部
		// dataSources											//
		// terrainExaggeration:1.0,							//用来夸大地形的标量。
		// shadows: true,										//是否投下阴影。没试出来效果
		// terrainShadows										//确定地形或接收来自太阳的阴影。
		// mapMode2D:Cesium.MapMode2D.ROTATE,//控制地图缩放和旋转，默认可滚动缩放，不可旋转。2D时有效
		// projectionPicker:true,									//控制投影。默认false

	});
		
/*    var scene = viewer.scene;  
    //创建坐标  
    var coord = Cesium.Cartesian3.fromDegrees( 121.4280933,31.1680993, 0.0 );  
    //创建一个东（X，红色）北（Y，绿色）上（Z，蓝色）的本地坐标系统  
    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame( coord );  
    // 改变3D模型的模型矩阵，可以用于移动物体  
    // 物体的世界坐标 = 物体的模型坐标 * 世界矩阵  
    var model = scene.primitives.add( Cesium.Model.fromGltf( {//异步的加载模型  
        url : 'http://192.168.1.121:8080/webgis/cyt_test/3d_test/Cesium-1.38/Apps/SampleData/models/CesiumGround/Cesium_Ground.gltf',  
        modelMatrix : modelMatrix, //模型矩阵  
        scale : 2.0 //缩放  
    } ) );*/
	
	// TODO 可以设置成公司logo
    viewer._cesiumWidget._creditContainer.style.display="none";  
	//viewer._cesiumWidget._creditContainer.innerHTML = 
    
    // 去除toolbar的图层切换button
    console.log(viewer._toolbar);
    $('.cesium-viewer-toolbar button').remove(); 
    
    loaddata();
	
	//viewer.zoomTo(yellowEllipsoid);//缩放、平移视图使实体可见,放在加载background后 
}

function changeMap(mapType){
	switch (mapType){
	case 'to3d': 
		$("#map").css("width", "0%");
		$("#cesiumContainer").css("width", "100%");
		//隐藏功能button
		$(".feature-select ul li a").hide();
		$(".feature-select ul .divider").hide();
		$("#changeMap-Act a").show();
		//更改执行函数
		$("#changeMap-Act").attr("onClick","changeMap('to2d');")
		//更改图标
		$("#changeMap-Img").attr("src","./icon/2d.png");
		break;
	case 'to2d': 
		$("#map").css("width", "100%");
		$("#cesiumContainer").css("width", "0%");
		//显示功能button
		$(".feature-select ul .divider").show();
		$(".feature-select ul li a").show();
		//更改执行函数
		$("#changeMap-Act").attr("onClick","changeMap('to3d');")
		//更改图标
		$("#changeMap-Img").attr("src","./icon/3d.png");
		break;
	default: 
		break;
	}
}