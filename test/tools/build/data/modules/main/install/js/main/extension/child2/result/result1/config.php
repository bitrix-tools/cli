<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
{
	die();
}

return [
	'css' => 'dist/app.bundle.css',
	'js' => 'dist/app.bundle.js',
	'rel' => [
		'main.polyfill.core',
	],
	'skip_core' => true,
];
