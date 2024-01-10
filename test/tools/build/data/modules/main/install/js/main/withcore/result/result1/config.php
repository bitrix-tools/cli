<?php
if (!defined('B_PROLOG_INCLUDED') || B_PROLOG_INCLUDED !== true)
{
	die();
}

return [
	'css' => 'dist/app.bundle.css',
	'js' => 'dist/app.bundle.js',
	'rel' => [
		'main.core',
	],
	'skip_core' => false,
];
