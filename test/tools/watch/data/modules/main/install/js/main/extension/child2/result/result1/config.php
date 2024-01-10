<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
{
	die();
}

return [
	'css' => '/bitrix/js/main/extension/child2/dist/app.bundle.css',
	'js' => '/bitrix/js/main/extension/child2/dist/app.bundle.js',
	'rel' => [
		'main.polyfill.core',
	],
];
