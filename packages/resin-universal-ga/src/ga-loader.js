// Taken verbatim from https://developers.google.com/analytics/devguides/collection/analyticsjs/
// The only change is the ability to inject the GA_CUSTOM_LIB_URL
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(
	window,
	document,
	'script',
	typeof GA_CUSTOM_LIB_URL !== 'undefined' ? GA_CUSTOM_LIB_URL : 'https://www.google-analytics.com/analytics.js',
	'ga'
);
