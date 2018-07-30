// 检索Flag 记录检索类型 
// 当和上一次检索类型不同时清除上一次结果并返回这次的poi；
// 当和上一次检索类型相同时清除上一次的结果
var selectinfo = null;
// 浏览器类型
var eventName = (navigator.userAgent.indexOf("MSIE")!=-1) ? "propertychange" :"input";
