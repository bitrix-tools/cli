<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
{
	die();
}

return [
	'css' => '/bitrix/js/ui/extension/dist/app.bundle.css',
	'js' => '/bitrix/js/ui/extension/dist/app.bundle.js',
	'rel' => [
		'main.polyfill.core',
	],
];
